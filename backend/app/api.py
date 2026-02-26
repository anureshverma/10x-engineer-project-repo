"""FastAPI routes for PromptLab"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List

from app.models import (
    Prompt, PromptCreate, PromptUpdate, PromptPatch,
    Collection, CollectionCreate,
    PromptList, CollectionList, HealthResponse,
    Tag, TagCreate, TagPatch, TagList, AssignTagsRequest,
    get_current_time,
    generate_id,
)
from app.storage import storage
from app.utils import (
    sort_prompts_by_date,
    filter_prompts_by_collection,
    filter_prompts_by_tags,
    search_prompts,
)
from app import __version__


app = FastAPI(
    title="PromptLab API",
    description="AI Prompt Engineering Platform",
    version=__version__
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============== Health Check ==============

@app.get("/health", response_model=HealthResponse)
def health_check():
    """Check the health of the API service.

    Returns:
        HealthResponse: The health status and version of the API.
    """
    return HealthResponse(status="healthy", version=__version__)


# ============== Prompt Endpoints ==============

@app.get("/prompts", response_model=PromptList)
def list_prompts(
    collection_id: Optional[str] = None,
    search: Optional[str] = None,
    tag_ids: Optional[str] = None,
    tag_match: Optional[str] = None,
):
    """List prompts with optional filtering and searching.

    Args:
        collection_id: Filter prompts by this collection ID.
        search: Search in prompt titles and descriptions.
        tag_ids: Comma-separated tag IDs; filter prompts that have these tags.
        tag_match: If 'any', prompt may have any of the tags (OR). Default: all (AND).

    Returns:
        PromptList: A list of prompts and the total count.
    """
    prompts = storage.get_all_prompts()
    if collection_id:
        prompts = filter_prompts_by_collection(prompts, collection_id)
    if search:
        prompts = search_prompts(prompts, search)
    if tag_ids:
        ids = [tid.strip() for tid in tag_ids.split(",") if tid.strip()]
        if ids:
            match_all = tag_match != "any"
            prompts = filter_prompts_by_tags(prompts, ids, match_all=match_all)
    prompts = sort_prompts_by_date(prompts, descending=True)
    return PromptList(prompts=prompts, total=len(prompts))


@app.get("/prompts/{prompt_id}", response_model=Prompt)
def get_prompt(prompt_id: str):
    """Retrieve a specific prompt by its ID.

    Args:
        prompt_id (str): The ID of the prompt to retrieve.

    Returns:
        Prompt: The prompt object if found.

    Raises:
        HTTPException: If the prompt is not found.
    """
    prompt = storage.get_prompt(prompt_id)
    

    if prompt is None:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    return prompt


@app.post("/prompts", response_model=Prompt, status_code=201)
def create_prompt(prompt_data: PromptCreate):

    """Create a new prompt.

    Args:
        prompt_data (PromptCreate): The prompt data to create.

    Returns:
        Prompt: The created prompt object.

    Raises:
        HTTPException: If the collection does not exist.
    """
    if prompt_data.collection_id:
        collection = storage.get_collection(prompt_data.collection_id)
        if not collection:
            raise HTTPException(status_code=400, detail="Collection not found")
    tag_ids = getattr(prompt_data, "tag_ids", None) or []
    for tid in tag_ids:
        if not storage.get_tag(tid):
            raise HTTPException(status_code=400, detail="One or more tag ids not found")
    prompt = Prompt(**prompt_data.model_dump())
    return storage.create_prompt(prompt)


@app.put("/prompts/{prompt_id}", response_model=Prompt)
def update_prompt(prompt_id: str, prompt_data: PromptUpdate):
    """Update a prompt by its ID.

    Args:
        prompt_id (str): The ID of the prompt to update.
        prompt_data (PromptUpdate): The updated prompt data.

    Returns:
        Prompt: The updated prompt object.

    Raises:
        HTTPException: If the prompt or collection is not found.
    """
    existing = storage.get_prompt(prompt_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Prompt not found")
    

    if prompt_data.collection_id:
        collection = storage.get_collection(prompt_data.collection_id)
        if not collection:
            raise HTTPException(status_code=400, detail="Collection not found")
    

    tag_ids = getattr(prompt_data, "tag_ids", None)
    if tag_ids is not None:
        for tid in tag_ids:
            if not storage.get_tag(tid):
                raise HTTPException(status_code=400, detail="One or more tag ids not found")
    else:
        tag_ids = existing.tag_ids
    updated_prompt = Prompt(
        id=existing.id,
        title=prompt_data.title,
        content=prompt_data.content,
        description=prompt_data.description,
        collection_id=prompt_data.collection_id,
        tag_ids=tag_ids,
        created_at=existing.created_at,
        updated_at=get_current_time(),
    )
    return storage.update_prompt(prompt_id, updated_prompt)


@app.patch("/prompts/{prompt_id}", response_model=Prompt)
def patch_prompt(prompt_id: str, prompt_data: PromptPatch):
    """Partially update a prompt by its ID.

    Args:
        prompt_id (str): The ID of the prompt to patch.
        prompt_data (PromptPatch): The partial data for the prompt.

    Returns:
        Prompt: The patched prompt object.

    Raises:
        HTTPException: If the prompt or collection is not found.
    """
    existing = storage.get_prompt(prompt_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Prompt not found")

    update_data = existing.dict()


    for field in prompt_data.dict(exclude_unset=True):
        value = getattr(prompt_data, field)
        if value is not None and value != '' and field != 'collection_id':
            update_data[field] = value

        elif field == 'collection_id' and value:
            collection = storage.get_collection(value)
            if not collection:
                raise HTTPException(status_code=400, detail="Collection not found")
            update_data[field] = value
        elif field == 'tag_ids' and value is not None:
            for tid in value:
                if not storage.get_tag(tid):
                    raise HTTPException(status_code=400, detail="One or more tag ids not found")
            update_data[field] = value
    update_data['updated_at'] = get_current_time()
    updated_prompt = Prompt(**update_data)
    return storage.update_prompt(prompt_id, updated_prompt)


@app.delete("/prompts/{prompt_id}", status_code=204)
def delete_prompt(prompt_id: str):
    """Delete a prompt by its ID.

    Args:
        prompt_id (str): The ID of the prompt to delete.

    Raises:
        HTTPException: If the prompt is not found.
    """
    if not storage.delete_prompt(prompt_id):
        raise HTTPException(status_code=404, detail="Prompt not found")
    return None


# ============== Collection Endpoints ==============

@app.get("/collections", response_model=CollectionList)
def list_collections():
    """List all collections.

    Returns:
        CollectionList: A list of collections and the total count.
    """
    collections = storage.get_all_collections()
    return CollectionList(collections=collections, total=len(collections))


@app.get("/collections/{collection_id}", response_model=Collection)
def get_collection(collection_id: str):
    """Retrieve a specific collection by its ID.

    Args:
        collection_id (str): The ID of the collection to retrieve.

    Returns:
        Collection: The collection object if found.

    Raises:
        HTTPException: If the collection is not found.
    """
    collection = storage.get_collection(collection_id)
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    return collection

@app.post("/collections", response_model=Collection, status_code=201)
def create_collection(collection_data: CollectionCreate):
    """Create a new collection.

    Args:
        collection_data (CollectionCreate): The collection data to create.

    Returns:
        Collection: The created collection object.
    """
    collection = Collection(**collection_data.model_dump())
    return storage.create_collection(collection)


@app.delete("/collections/{collection_id}", status_code=204)
def delete_collection(collection_id: str):

    """Delete a collection by its ID.

    Args:
        collection_id (str): The ID of the collection to delete.

    Raises:
        HTTPException: If the collection is not found.
    """
    for prompt in storage.get_prompts_by_collection(collection_id):

        storage.delete_prompt(prompt.id)
    if not storage.delete_collection(collection_id):
        raise HTTPException(status_code=404, detail="Collection not found")

    return None


# ============== Tags ==============

@app.get("/tags", response_model=TagList)
def list_tags():
    """List all tags."""
    tags = storage.get_all_tags()
    return TagList(tags=tags, total=len(tags))


@app.get("/tags/{tag_id}", response_model=Tag)
def get_tag(tag_id: str):
    """Get a tag by ID."""
    tag = storage.get_tag(tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag


@app.post("/tags", response_model=Tag, status_code=201)
def create_tag(tag_data: TagCreate):
    """Create a new tag. Slug is derived from name if not provided."""
    if storage.get_tag_by_name(tag_data.name):
        raise HTTPException(status_code=400, detail="Tag with this name already exists")
    slug = tag_data.slug
    if not slug and tag_data.name:
        slug = tag_data.name.strip().lower().replace(" ", "-")
    tag = Tag(
        id=generate_id(),
        name=tag_data.name,
        slug=slug or "",
        description=tag_data.description or "",
        color=tag_data.color or "",
        created_at=get_current_time(),
    )
    return storage.create_tag(tag)


@app.patch("/tags/{tag_id}", response_model=Tag)
def patch_tag(tag_id: str, tag_data: TagPatch):
    """Partially update a tag."""
    existing = storage.get_tag(tag_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Tag not found")
    updates = tag_data.model_dump(exclude_unset=True)
    if "name" in updates and updates["name"]:
        other = storage.get_tag_by_name(updates["name"])
        if other and other.id != tag_id:
            raise HTTPException(status_code=400, detail="Tag with this name already exists")
    for key, value in updates.items():
        setattr(existing, key, value)
    return storage.update_tag(tag_id, existing)


@app.delete("/tags/{tag_id}", status_code=204)
def delete_tag(tag_id: str):
    """Delete a tag. Removes this tag from all prompts (cascade)."""
    if not storage.delete_tag(tag_id):
        raise HTTPException(status_code=404, detail="Tag not found")


# ============== Prompt Tags ==============

@app.get("/prompts/{prompt_id}/tags", response_model=TagList)
def get_prompt_tags(prompt_id: str):
    """List tags assigned to a prompt."""
    if not storage.get_prompt(prompt_id):
        raise HTTPException(status_code=404, detail="Prompt not found")
    tags = storage.get_tags_for_prompt(prompt_id)
    return TagList(tags=tags, total=len(tags))


@app.put("/prompts/{prompt_id}/tags")
def set_prompt_tags(prompt_id: str, body: AssignTagsRequest):
    """Set the tags on a prompt. Replaces existing tags."""
    if not storage.get_prompt(prompt_id):
        raise HTTPException(status_code=404, detail="Prompt not found")
    for tid in body.tag_ids:
        if not storage.get_tag(tid):
            raise HTTPException(status_code=400, detail="One or more tag ids not found")
    storage.set_prompt_tags(prompt_id, body.tag_ids)
    return {"tag_ids": body.tag_ids}


@app.post("/prompts/{prompt_id}/tags")
def add_prompt_tag(prompt_id: str, body: AssignTagsRequest):
    """Add one or more tags to a prompt."""
    if not storage.get_prompt(prompt_id):
        raise HTTPException(status_code=404, detail="Prompt not found")
    for tid in body.tag_ids:
        if not storage.get_tag(tid):
            raise HTTPException(status_code=400, detail="One or more tag ids not found")
    for tid in body.tag_ids:
        storage.add_prompt_tag(prompt_id, tid)
    tags = storage.get_tags_for_prompt(prompt_id)
    return {"tag_ids": [t.id for t in tags]}


@app.delete("/prompts/{prompt_id}/tags/{tag_id}", status_code=204)
def remove_prompt_tag(prompt_id: str, tag_id: str):
    """Remove a tag from a prompt."""
    if not storage.get_prompt(prompt_id):
        raise HTTPException(status_code=404, detail="Prompt not found")
    storage.remove_prompt_tag(prompt_id, tag_id)
