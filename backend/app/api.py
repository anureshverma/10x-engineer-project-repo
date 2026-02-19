"""FastAPI routes for PromptLab"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from app.models import (
    Prompt, PromptCreate, PromptUpdate, PromptPatch,
    Collection, CollectionCreate,
    PromptList, CollectionList, HealthResponse,
    get_current_time
)
from app.storage import storage
from app.utils import sort_prompts_by_date, filter_prompts_by_collection, search_prompts
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
    search: Optional[str] = None
):
    """List prompts with optional filtering and searching.

    Args:
        collection_id (Optional[str]): Filter prompts by this collection ID.
        search (Optional[str]): Search in prompt titles and descriptions.

    Returns:
        PromptList: A list of prompts and the total count.
    """
    prompts = storage.get_all_prompts()
    
    # Filter by collection if specified
    if collection_id:
        prompts = filter_prompts_by_collection(prompts, collection_id)
    
    # Search if query provided
    if search:
        prompts = search_prompts(prompts, search)
    
    # Sort by date (newest first)

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
    

    updated_prompt = Prompt(
        id=existing.id,
        title=prompt_data.title,
        content=prompt_data.content,
        description=prompt_data.description,
        collection_id=prompt_data.collection_id,
        created_at=existing.created_at,

        updated_at=get_current_time()
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
