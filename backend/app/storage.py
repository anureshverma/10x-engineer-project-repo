"""In-memory storage for PromptLab

This module provides simple in-memory storage for prompts and collections.
In a production environment, this would be replaced with a database.
"""

from typing import Dict, List, Optional
from app.models import Prompt, Collection, Tag


class Storage:
    def __init__(self):
        """Initializes the Storage with empty dictionaries for prompts, collections, and tags."""
        self._prompts: Dict[str, Prompt] = {}
        self._collections: Dict[str, Collection] = {}
        self._tags: Dict[str, Tag] = {}
    
    # ============== Prompt Operations ==============
    
    def create_prompt(self, prompt: Prompt) -> Prompt:
        """Stores a new prompt in the storage.

        Args:
            prompt (Prompt): The prompt to be stored.

        Returns:
            Prompt: The stored prompt object.
        """
        self._prompts[prompt.id] = prompt
        return prompt
    
    def get_prompt(self, prompt_id: str) -> Optional[Prompt]:
        """Retrieves a prompt by ID.

        Args:
            prompt_id (str): The ID of the prompt to retrieve.

        Returns:
            Optional[Prompt]: The prompt object if found, otherwise None.
        """
        return self._prompts.get(prompt_id)
    
    def get_all_prompts(self) -> List[Prompt]:
        """Retrieves all stored prompts.

        Returns:
            List[Prompt]: A list of all prompt objects.
        """
        return list(self._prompts.values())
    
    def update_prompt(self, prompt_id: str, prompt: Prompt) -> Optional[Prompt]:
        """Updates an existing prompt.

        Args:
            prompt_id (str): The ID of the prompt to update.
            prompt (Prompt): The updated prompt object.

        Returns:
            Optional[Prompt]: The updated prompt if successful, otherwise None.
        """
        if prompt_id not in self._prompts:
            return None
        self._prompts[prompt_id] = prompt
        return prompt
    
    def delete_prompt(self, prompt_id: str) -> bool:
        """Deletes a prompt by ID.

        Args:
            prompt_id (str): The ID of the prompt to delete.

        Returns:
            bool: True if the prompt was deleted, otherwise False.
        """
        if prompt_id in self._prompts:
            del self._prompts[prompt_id]
            return True
        return False
    
    # ============== Collection Operations ==============
    
    def create_collection(self, collection: Collection) -> Collection:
        """Stores a new collection in the storage.

        Args:
            collection (Collection): The collection to be stored.

        Returns:
            Collection: The stored collection object.
        """
        self._collections[collection.id] = collection
        return collection
    
    def get_collection(self, collection_id: str) -> Optional[Collection]:
        """Retrieves a collection by ID.

        Args:
            collection_id (str): The ID of the collection to retrieve.

        Returns:
            Optional[Collection]: The collection object if found, otherwise None.
        """
        return self._collections.get(collection_id)
    
    def get_all_collections(self) -> List[Collection]:
        """Retrieves all stored collections.

        Returns:
            List[Collection]: A list of all collection objects.
        """
        return list(self._collections.values())
    
    def delete_collection(self, collection_id: str) -> bool:
        """Deletes a collection by ID.

        Args:
            collection_id (str): The ID of the collection to delete.

        Returns:
            bool: True if the collection was deleted, otherwise False.
        """
        if collection_id in self._collections:
            del self._collections[collection_id]
            return True
        return False
    
    def get_prompts_by_collection(self, collection_id: str) -> List[Prompt]:
        """Retrieves all prompts that belong to a specified collection.

        Args:
            collection_id (str): The ID of the collection whose prompts are to be retrieved.

        Returns:
            List[Prompt]: A list of prompts that belong to the specified collection.
        """
        return [p for p in self._prompts.values() if p.collection_id == collection_id]

    # ============== Tag Operations ==============

    def create_tag(self, tag: Tag) -> Tag:
        """Stores a new tag. Enforces unique name."""
        self._tags[tag.id] = tag
        return tag

    def get_tag(self, tag_id: str) -> Optional[Tag]:
        """Returns tag by id."""
        return self._tags.get(tag_id)

    def get_tag_by_name(self, name: str) -> Optional[Tag]:
        """Returns tag by name (for uniqueness check)."""
        name_lower = name.strip().lower()
        for tag in self._tags.values():
            if tag.name and tag.name.strip().lower() == name_lower:
                return tag
        return None

    def get_all_tags(self) -> List[Tag]:
        """Returns all tags."""
        return list(self._tags.values())

    def update_tag(self, tag_id: str, tag: Tag) -> Optional[Tag]:
        """Updates an existing tag."""
        if tag_id not in self._tags:
            return None
        self._tags[tag_id] = tag
        return tag

    def delete_tag(self, tag_id: str) -> bool:
        """Removes tag and removes tag_id from every prompt's tag_ids."""
        if tag_id not in self._tags:
            return False
        for prompt in self._prompts.values():
            if tag_id in prompt.tag_ids:
                new_ids = [tid for tid in prompt.tag_ids if tid != tag_id]
                updated = _prompt_with(prompt, tag_ids=new_ids)
                self._prompts[prompt.id] = updated
        del self._tags[tag_id]
        return True

    def get_tags_for_prompt(self, prompt_id: str) -> List[Tag]:
        """Resolves prompt's tag_ids to Tag objects."""
        prompt = self._prompts.get(prompt_id)
        if not prompt or not prompt.tag_ids:
            return []
        return [self._tags[tid] for tid in prompt.tag_ids if tid in self._tags]

    def set_prompt_tags(self, prompt_id: str, tag_ids: List[str]) -> None:
        """Sets prompt's tag_ids. Caller must validate tag_ids exist."""
        prompt = self._prompts.get(prompt_id)
        if not prompt:
            return
        updated = _prompt_with(prompt, tag_ids=list(tag_ids))
        self._prompts[prompt_id] = updated

    def add_prompt_tag(self, prompt_id: str, tag_id: str) -> bool:
        """Adds one tag to prompt. Returns False if prompt or tag not found."""
        if prompt_id not in self._prompts or tag_id not in self._tags:
            return False
        prompt = self._prompts[prompt_id]
        if tag_id in prompt.tag_ids:
            return True
        new_ids = list(prompt.tag_ids) + [tag_id]
        self.set_prompt_tags(prompt_id, new_ids)
        return True

    def remove_prompt_tag(self, prompt_id: str, tag_id: str) -> bool:
        """Removes one tag from prompt. Returns True if removed or already absent."""
        prompt = self._prompts.get(prompt_id)
        if not prompt:
            return False
        if tag_id not in prompt.tag_ids:
            return True
        new_ids = [tid for tid in prompt.tag_ids if tid != tag_id]
        self.set_prompt_tags(prompt_id, new_ids)
        return True

    def get_prompts_by_tag(self, tag_id: str) -> List[Prompt]:
        """Returns all prompts that have this tag_id in their tag_ids."""
        return [p for p in self._prompts.values() if tag_id in p.tag_ids]

    # ============== Utility ==============

    def clear(self) -> None:
        """Clears all stored prompts, collections, and tags."""
        self._prompts.clear()
        self._collections.clear()
        self._tags.clear()


def _prompt_with(prompt: Prompt, **overrides: object) -> Prompt:
    """Return a new Prompt with the same fields as prompt and optional overrides."""
    data = prompt.model_dump()
    data.update(overrides)
    return Prompt(**data)


# Global storage instance
storage = Storage()
