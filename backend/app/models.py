"""Pydantic models for PromptLab"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from uuid import uuid4


def generate_id() -> str:
    """Generates a unique identifier."""
    return str(uuid4())


def get_current_time() -> datetime:
    """Gets the current UTC time."""
    return datetime.utcnow()


# ============== Prompt Models ==============

class PromptBase(BaseModel):




    """Base model for Prompt.

    Attributes:
        title (str): The title of the prompt. Must be between 1 and 200 characters.
        content (str): The main content of the prompt. Cannot be empty.
        description (Optional[str]): An optional description of the prompt. Maximum of 500 characters.
        collection_id (Optional[str]): The ID of the collection this prompt belongs to.
    """
    title: str = Field(..., min_length=1, max_length=200, description="The title of the prompt.")
    content: str = Field(..., min_length=1, description="The main content of the prompt.")
    description: Optional[str] = Field(None, max_length=500, description="An optional description of the prompt.")
    collection_id: Optional[str] = Field(None, description="The ID of the collection this prompt belongs to.")
    tag_ids: List[str] = Field(default_factory=list, description="IDs of tags assigned to this prompt.")


class PromptCreate(PromptBase):
    """Model for creating a new prompt.

    Inherits all attributes from PromptBase.
    """
    pass


class PromptUpdate(PromptBase):
    """Model for updating an existing prompt.

    Inherits all attributes from PromptBase.
    """
    pass


class PromptPatch(BaseModel):




    """Model for partially updating a prompt.

    Attributes:
        title (Optional[str]): The new title for the prompt. Must be between 1 and 200 characters.
        content (Optional[str]): The new content for the prompt.
        description (Optional[str]): A new description for the prompt.
        collection_id (Optional[str]): The ID of the new collection for this prompt.
    """
    title: Optional[str] = Field(None, min_length=1, max_length=200, description="The new title for the prompt.")
    content: Optional[str] = Field(None, min_length=1, description="The new content for the prompt.")
    description: Optional[str] = Field(None, max_length=500, description="A new description for the prompt.")
    collection_id: Optional[str] = Field(None, description="The ID of the new collection for this prompt.")
    tag_ids: Optional[List[str]] = Field(None, description="Tag IDs to set on the prompt.")


class Prompt(PromptBase):



    """Full model representation of a Prompt.

    Attributes:
        id (str): The unique identifier of the prompt.
        created_at (datetime): The timestamp when the prompt was created.
        updated_at (datetime): The timestamp when the prompt was last updated.
    """
    id: str = Field(default_factory=generate_id, description="The unique identifier of the prompt.")
    created_at: datetime = Field(default_factory=get_current_time, description="The timestamp when the prompt was created.")
    updated_at: datetime = Field(default_factory=get_current_time, description="The timestamp when the prompt was last updated.")

    class Config:
        from_attributes = True


# ============== Collection Models ==============

class CollectionBase(BaseModel):


    """Base model for Collection.

    Attributes:
        name (str): The name of the collection. Must be between 1 and 100 characters.
        description (Optional[str]): An optional description of the collection. Maximum of 500 characters.
    """
    name: str = Field(..., min_length=1, max_length=100, description="The name of the collection.")
    description: Optional[str] = Field(None, max_length=500, description="An optional description of the collection.")


class CollectionCreate(CollectionBase):
    """Model for creating a new collection.

    Inherits all attributes from CollectionBase.
    """
    pass


class Collection(CollectionBase):


    """Full model representation of a Collection.

    Attributes:
        id (str): The unique identifier of the collection.
        created_at (datetime): The timestamp when the collection was created.
    """
    id: str = Field(default_factory=generate_id, description="The unique identifier of the collection.")
    created_at: datetime = Field(default_factory=get_current_time, description="The timestamp when the collection was created.")

    class Config:
        from_attributes = True


# ============== Tag Models ==============

class Tag(BaseModel):
    """First-class entity for a tag.

    Attributes:
        id (str): Unique tag id (UUID).
        name (str): Display name; 1-50 characters; unique across tags.
        slug (Optional[str]): URL-friendly unique identifier.
        description (Optional[str]): Short description; max 200 characters.
        color (Optional[str]): Hex or color name for UI.
        created_at (Optional[datetime]): When the tag was created.
    """
    id: str = Field(default_factory=generate_id, description="Unique tag id (UUID).")
    name: str = Field(..., min_length=1, max_length=50, description="Display name; unique across tags.")
    slug: Optional[str] = Field(None, max_length=50, description="URL-friendly unique identifier.")
    description: Optional[str] = Field(None, max_length=200, description="Short description.")
    color: Optional[str] = Field(None, description="Hex (e.g. #ff0000) or color name for UI.")
    created_at: Optional[datetime] = Field(default_factory=get_current_time, description="When the tag was created.")

    class Config:
        from_attributes = True


class TagCreate(BaseModel):
    """Body for creating a tag."""
    name: str = Field(..., min_length=1, max_length=50, description="Display name.")
    slug: Optional[str] = Field(None, max_length=50, description="URL-friendly identifier.")
    description: Optional[str] = Field(None, max_length=200, description="Short description.")
    color: Optional[str] = Field(None, description="Hex or color name for UI.")


class TagPatch(BaseModel):
    """Body for updating a tag (all fields optional)."""
    name: Optional[str] = Field(None, min_length=1, max_length=50, description="Display name.")
    description: Optional[str] = Field(None, max_length=200, description="Short description.")
    color: Optional[str] = Field(None, description="Hex or color name for UI.")


class TagList(BaseModel):
    """Response for list tags."""
    tags: List[Tag] = Field(..., description="List of tags.")
    total: int = Field(..., description="Total count.")


class AssignTagsRequest(BaseModel):
    """Body for set/add prompt tags."""
    tag_ids: List[str] = Field(..., description="Tag IDs to assign.")


# ============== Response Models ==============

class PromptList(BaseModel):


    """Model for a list of prompts.

    Attributes:
        prompts (List[Prompt]): A list of Prompt objects.
        total (int): The total number of prompts available.
    """
    prompts: List[Prompt] = Field(..., description="A list of Prompt objects.")
    total: int = Field(..., description="The total number of prompts available.")


class CollectionList(BaseModel):


    """Model for a list of collections.

    Attributes:
        collections (List[Collection]): A list of Collection objects.
        total (int): The total number of collections available.
    """
    collections: List[Collection] = Field(..., description="A list of Collection objects.")
    total: int = Field(..., description="The total number of collections available.")


class HealthResponse(BaseModel):


    """Model for the health status response.

    Attributes:
        status (str): The health status of the API (e.g., "ok").
        version (str): The version of the API.
    """
    status: str = Field(..., description="The health status of the API (e.g., 'ok').")
    version: str = Field(..., description="The version of the API.")
