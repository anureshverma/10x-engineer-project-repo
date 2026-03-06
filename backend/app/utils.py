"""Utility functions for PromptLab"""

import re

from app.models import Prompt


def slug_from_name(name: str) -> str:
    """Derive a URL-friendly slug from a name (e.g. for tags)."""
    return name.strip().lower().replace(" ", "-")


def sort_prompts_by_date(
    prompts: list[Prompt], descending: bool = True
) -> list[Prompt]:
    """Sort prompts by their creation date.

    Args:
        prompts (List[Prompt]): A list of Prompt objects to sort.
        descending (bool): Determines if the sort should be in descending order. Defaults to True.

    Returns:
        List[Prompt]: A list of prompts sorted by the 'created_at' attribute.
    """
    # Sort based on 'created_at' attribute
    return sorted(prompts, key=lambda prompt: prompt.created_at, reverse=descending)


def filter_prompts_by_collection(
    prompts: list[Prompt], collection_id: str
) -> list[Prompt]:
    """Filter prompts by a specific collection ID.

    Args:
        prompts (List[Prompt]): A list of Prompt objects to filter.
        collection_id (str): The collection ID to filter by.

    Returns:
        List[Prompt]: A list of prompts that belong to the specified collection.
    """
    return [p for p in prompts if p.collection_id == collection_id]


def filter_prompts_by_tags(
    prompts: list[Prompt], tag_ids: list[str], match_all: bool = True
) -> list[Prompt]:
    """Filter prompts that have all (AND) or any (OR) of the given tag_ids.

    Args:
        prompts: List of Prompt objects (must have tag_ids attribute).
        tag_ids: Tag IDs to filter by.
        match_all: If True, prompt must have all tag_ids (AND). If False, any (OR).

    Returns:
        Filtered list of prompts.
    """
    if not tag_ids:
        return list(prompts)
    if match_all:
        return [
            p
            for p in prompts
            if all(tid in getattr(p, "tag_ids", []) for tid in tag_ids)
        ]
    return [
        p for p in prompts if any(tid in getattr(p, "tag_ids", []) for tid in tag_ids)
    ]


def search_prompts(prompts: list[Prompt], query: str) -> list[Prompt]:
    """Search prompts by a query string.

    Args:
        prompts (List[Prompt]): A list of Prompt objects to search within.
        query (str): The query string to search for in prompt titles and descriptions.
    Returns:
        List[Prompt]: A list of prompts where the query string is found in the title or description.
    """
    query_lower = query.lower()
    return [
        p
        for p in prompts
        if query_lower in p.title.lower()
        or (p.description and query_lower in p.description.lower())
    ]


# The following helpers are for future use (e.g. prompt validation or docs).
def validate_prompt_content(content: str) -> bool:
    """Check if prompt content is valid.

    A valid prompt should:
    - Not be empty
    - Not be just whitespace
    - Be at least 10 characters
    """
    if not content or not content.strip():
        return False
    return len(content.strip()) >= 10


def extract_variables(content: str) -> list[str]:
    """Extract template variables from prompt content.

    Variables are in the format {{variable_name}}
    """
    pattern = r"\{\{(\w+)\}\}"
    return re.findall(pattern, content)
