"""Utility functions for PromptLab"""

from typing import List
from app.models import Prompt



def sort_prompts_by_date(prompts, descending=True):
    """Sort prompts by their creation date.

    Args:
        prompts (List[Prompt]): A list of Prompt objects to sort.
        descending (bool): Determines if the sort should be in descending order. Defaults to True.

    Returns:
        List[Prompt]: A list of prompts sorted by the 'created_at' attribute.
    """
    # Sort based on 'created_at' attribute
    return sorted(prompts, key=lambda prompt: prompt.created_at, reverse=descending)

def filter_prompts_by_collection(prompts: List[Prompt], collection_id: str) -> List[Prompt]:
    """Filter prompts by a specific collection ID.

    Args:
        prompts (List[Prompt]): A list of Prompt objects to filter.
        collection_id (str): The collection ID to filter by.

    Returns:
        List[Prompt]: A list of prompts that belong to the specified collection.
    """
    return [p for p in prompts if p.collection_id == collection_id]

def search_prompts(prompts: List[Prompt], query: str) -> List[Prompt]:
    """Search prompts by a query string.

    Args:
        prompts (List[Prompt]): A list of Prompt objects to search within.
        query (str): The query string to search for in prompt titles and descriptions.
    Returns:
        List[Prompt]: A list of prompts where the query string is found in the title or description.
    """
    query_lower = query.lower()
    return [
        p for p in prompts
        if query_lower in p.title.lower() or
           (p.description and query_lower in p.description.lower())
    ]


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


def extract_variables(content: str) -> List[str]:
    """Extract template variables from prompt content.
    
    Variables are in the format {{variable_name}}
    """
    import re
    pattern = r'\{\{(\w+)\}\}'
    return re.findall(pattern, content)

