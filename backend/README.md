# PromptLab API

This project is a FastAPI-based application designed for managing AI prompts and their collections within an organization. It provides endpoints to perform CRUD operations on both prompts and collections, enabling efficient management and retrieval of AI-generated content.

## Project Overview

The PromptLab API is built to facilitate the management and engineering of AI prompts within various collections. It provides a versatile REST API to perform operations on prompts and collections, ensuring efficient and scalable management of AI-generated content. This system leverages FastAPI to deliver high performance and scalability, making it suitable for diverse use cases in AI prompt management.

## Setup Instructions

To set up the project locally, follow these steps:

1. **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

2. **Create a virtual environment**:
    ```bash
    python -m venv venv
    ```

3. **Activate the virtual environment**:
    - On macOS/Linux:
        ```bash
        source venv/bin/activate
        ```
    - On Windows:
        ```bash
        .\venv\Scripts\activate
        ```

4. **Install the required packages**:
    ```bash
    pip install -r requirements.txt
    ```

5. **Run the application**:
    ```bash
    uvicorn backend.app.api:app --reload
    ```

## API Endpoints

### Health Check
#### Checks the health status of the API, ensuring it's operational.
- **GET** `/health`: Check the health status of the API.

### Prompts
#### Managing prompts within the system, including creation, retrieval, updating, and deletion.
- **GET** `/prompts`: List all prompts with optional filters for collection and search. Users can filter prompts based on `collection_id` and search through prompt content.
- **GET** `/prompts/{prompt_id}`: Retrieve a specific prompt by its `prompt_id`.
- **POST** `/prompts`: Create a new prompt. Users need to provide information such as the title, content, description, and can optionally include a `collection_id`.
- **PUT** `/prompts/{prompt_id}`: Update an existing prompt. This requires specifying the `prompt_id` and providing the updated data for the prompt.
- **PATCH** `/prompts/{prompt_id}`: Partially update fields of a specified prompt using its `prompt_id`. This is useful for altering specific parts of the prompt without affecting the entire record.
- **DELETE** `/prompts/{prompt_id}`: Remove a prompt using its `prompt_id`. This deletes the prompt from the system.

### Collections
#### Managing collections of prompts, allowing for organization and retrieval of grouped prompts. Includes capabilities for CRUD operations.
- **GET** `/collections`: Retrieve a list of all collections. This endpoint provides a comprehensive list of all available collections.
- **GET** `/collections/{collection_id}`: Fetch details of a specific collection using its `collection_id`. This provides detailed information about a particular collection.
- **POST** `/collections`: Create a new collection. Users specify the collection's name and description to categorize prompts effectively.
- **DELETE** `/collections/{collection_id}`: Delete a collection using its `collection_id`. This action also removes any associated prompts linked to the collection.

## Usage Examples

Below are some usage examples for the API endpoints provided by the PromptLab API.

### Health Check
#### Check the health status of the API.
Example with `curl`:
```bash
curl -X GET http://localhost:8000/health
```
This will return the health status of the API.

### Prompts
#### List all prompts with optional filters.
Example with `curl`:
```bash
curl -X GET "http://localhost:8000/prompts?collection_id=1&search=example"
```

#### Retrieve a specific prompt.
Example with `curl`:
```bash
curl -X GET http://localhost:8000/prompts/1
```

#### Create a new prompt.
Example with `curl`:
```bash
curl -X POST http://localhost:8000/prompts \
-H "Content-Type: application/json" \
-d '{
  "title": "New Prompt",
  "content": "Prompt content here",
  "description": "A description for the prompt",
  "collection_id": 1
}'
```

#### Update an existing prompt.
Example with `curl`:
```bash
curl -X PUT http://localhost:8000/prompts/1 \
-H "Content-Type: application/json" \
-d '{
  "title": "Updated Prompt",
  "content": "Updated content here",
  "description": "Updated description",
  "collection_id": 1
}'
```

#### Partially update a prompt.
Example with `curl`:
```bash
curl -X PATCH http://localhost:8000/prompts/1 \
-H "Content-Type: application/json" \
-d '{
  "content": "Partially updated content"
}'
```

#### Delete a prompt.
Example with `curl`:
```bash
curl -X DELETE http://localhost:8000/prompts/1
```

### Collections
#### Retrieve a list of all collections.
Example with `curl`:
```bash
curl -X GET http://localhost:8000/collections
```

#### Fetch details of a specific collection.
Example with `curl`:
```bash
curl -X GET http://localhost:8000/collections/1
```

#### Create a new collection.
Example with `curl`:
```bash
curl -X POST http://localhost:8000/collections \
-H "Content-Type: application/json" \
-d '{
  "name": "New Collection",
  "description": "Description of the new collection"
}'
```

#### Delete a collection.
Example with `curl`:
```bash
curl -X DELETE http://localhost:8000/collections/1
```