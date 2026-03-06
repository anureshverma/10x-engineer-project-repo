"""API tests for PromptLab

These tests verify the API endpoints work correctly.
Students should expand these tests significantly in Week 3.
"""

import pytest
from fastapi.testclient import TestClient


class TestHealth:
    """Tests for health endpoint."""

    def test_health_check(self, client: TestClient):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data


class TestPrompts:
    """Tests for prompt endpoints."""

    def test_create_prompt(self, client: TestClient, sample_prompt_data):
        response = client.post("/prompts", json=sample_prompt_data)
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == sample_prompt_data["title"]
        assert data["content"] == sample_prompt_data["content"]
        assert "id" in data
        assert "created_at" in data

    def test_list_prompts_empty(self, client: TestClient):
        response = client.get("/prompts")
        assert response.status_code == 200
        data = response.json()
        assert data["prompts"] == []
        assert data["total"] == 0

    def test_list_prompts_with_data(self, client: TestClient, sample_prompt_data):
        # Create a prompt first
        client.post("/prompts", json=sample_prompt_data)

        response = client.get("/prompts")
        assert response.status_code == 200
        data = response.json()
        assert len(data["prompts"]) == 1
        assert data["total"] == 1

    def test_get_prompt_success(self, client: TestClient, sample_prompt_data):
        # Create a prompt first
        create_response = client.post("/prompts", json=sample_prompt_data)
        prompt_id = create_response.json()["id"]

        response = client.get(f"/prompts/{prompt_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == prompt_id

    def test_get_prompt_not_found(self, client: TestClient):
        """Test that getting a non-existent prompt returns 404.

        NOTE: This test currently FAILS due to Bug #1!
        The API returns 500 instead of 404.
        """
        response = client.get("/prompts/nonexistent-id")
        # This should be 404, but there's a bug...
        assert response.status_code == 404  # Will fail until bug is fixed

    def test_delete_prompt(self, client: TestClient, sample_prompt_data):
        # Create a prompt first
        create_response = client.post("/prompts", json=sample_prompt_data)
        prompt_id = create_response.json()["id"]

        # Delete it
        response = client.delete(f"/prompts/{prompt_id}")
        assert response.status_code == 204

        # Verify it's gone
        get_response = client.get(f"/prompts/{prompt_id}")
        # Note: This might fail due to Bug #1
        assert get_response.status_code in [404, 500]  # 404 after fix

    def test_update_prompt(self, client: TestClient, sample_prompt_data):
        # Create a prompt first
        create_response = client.post("/prompts", json=sample_prompt_data)
        prompt_id = create_response.json()["id"]
        original_updated_at = create_response.json()["updated_at"]

        # Update it
        updated_data = {
            "title": "Updated Title",
            "content": "Updated content for the prompt",
            "description": "Updated description",
        }

        import time

        time.sleep(0.1)  # Small delay to ensure timestamp would change

        response = client.put(f"/prompts/{prompt_id}", json=updated_data)
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title"

        # NOTE: This assertion will fail due to Bug #2!
        # The updated_at should be different from original
        # assert data["updated_at"] != original_updated_at  # Uncomment after fix

    def test_sorting_order(self, client: TestClient):
        """Test that prompts are sorted newest first.

        NOTE: This test might fail due to Bug #3!
        """
        import time

        # Create prompts with delay
        prompt1 = {"title": "First", "content": "First prompt content"}
        prompt2 = {"title": "Second", "content": "Second prompt content"}

        client.post("/prompts", json=prompt1)
        time.sleep(0.1)
        client.post("/prompts", json=prompt2)

        response = client.get("/prompts")
        prompts = response.json()["prompts"]

        # Newest (Second) should be first
        assert prompts[0]["title"] == "Second"  # Will fail until Bug #3 fixed

    def test_create_prompt_invalid_collection_id_returns_400(
        self, client: TestClient, sample_prompt_data
    ):
        response = client.post(
            "/prompts",
            json={**sample_prompt_data, "collection_id": "nonexistent-collection"},
        )
        assert response.status_code == 400
        assert "collection" in response.json().get("detail", "").lower()

    def test_create_prompt_validation_missing_title_returns_422(
        self, client: TestClient, sample_prompt_data
    ):
        body = {k: v for k, v in sample_prompt_data.items() if k != "title"}
        body["content"] = sample_prompt_data["content"]
        response = client.post("/prompts", json=body)
        assert response.status_code == 422

    def test_create_prompt_validation_missing_content_returns_422(
        self, client: TestClient, sample_prompt_data
    ):
        body = {k: v for k, v in sample_prompt_data.items() if k != "content"}
        body["title"] = sample_prompt_data["title"]
        response = client.post("/prompts", json=body)
        assert response.status_code == 422

    def test_create_prompt_validation_empty_title_returns_422(
        self, client: TestClient, sample_prompt_data
    ):
        response = client.post("/prompts", json={**sample_prompt_data, "title": ""})
        assert response.status_code == 422

    def test_create_prompt_validation_empty_content_returns_422(
        self, client: TestClient, sample_prompt_data
    ):
        response = client.post("/prompts", json={**sample_prompt_data, "content": ""})
        assert response.status_code == 422

    def test_create_prompt_validation_title_too_long_returns_422(
        self, client: TestClient, sample_prompt_data
    ):
        response = client.post(
            "/prompts", json={**sample_prompt_data, "title": "x" * 201}
        )
        assert response.status_code == 422

    def test_create_prompt_validation_description_too_long_returns_422(
        self, client: TestClient, sample_prompt_data
    ):
        response = client.post(
            "/prompts", json={**sample_prompt_data, "description": "x" * 501}
        )
        assert response.status_code == 422

    def test_update_prompt_validation_title_too_long_returns_422(
        self, client: TestClient, sample_prompt_data
    ):
        create = client.post("/prompts", json=sample_prompt_data)
        prompt_id = create.json()["id"]
        response = client.put(
            f"/prompts/{prompt_id}",
            json={
                "title": "x" * 201,
                "content": sample_prompt_data["content"],
            },
        )
        assert response.status_code == 422

    def test_patch_prompt_validation_empty_title_returns_422(
        self, client: TestClient, sample_prompt_data
    ):
        create = client.post("/prompts", json=sample_prompt_data)
        prompt_id = create.json()["id"]
        response = client.patch(f"/prompts/{prompt_id}", json={"title": ""})
        assert response.status_code == 422

    def test_list_prompts_filter_by_collection_id(
        self, client: TestClient, sample_prompt_data, sample_collection_data
    ):
        c1 = client.post("/collections", json=sample_collection_data).json()["id"]
        c2 = client.post(
            "/collections", json={"name": "Other", "description": None}
        ).json()["id"]
        client.post(
            "/prompts",
            json={**sample_prompt_data, "title": "In C1", "collection_id": c1},
        )
        client.post(
            "/prompts",
            json={**sample_prompt_data, "title": "In C2", "collection_id": c2},
        )
        response = client.get("/prompts", params={"collection_id": c1})
        assert response.status_code == 200
        assert response.json()["total"] == 1
        assert response.json()["prompts"][0]["collection_id"] == c1

    def test_list_prompts_search_query(self, client: TestClient, sample_prompt_data):
        client.post(
            "/prompts",
            json={
                **sample_prompt_data,
                "title": "Python tutorial",
                "description": "Learn Python",
            },
        )
        client.post(
            "/prompts",
            json={
                **sample_prompt_data,
                "title": "JavaScript guide",
                "description": "Learn JS",
            },
        )
        response = client.get("/prompts", params={"search": "Python"})
        assert response.status_code == 200
        assert response.json()["total"] == 1
        assert "Python" in response.json()["prompts"][0]["title"]

    def test_list_prompts_tag_ids_empty_or_no_match(
        self, client: TestClient, sample_prompt_data
    ):
        client.post("/prompts", json=sample_prompt_data)
        r_empty = client.get("/prompts", params={"tag_ids": ""})
        assert r_empty.status_code == 200
        assert r_empty.json()["total"] == 1
        r_nonexistent = client.get("/prompts", params={"tag_ids": "nonexistent-tag-id"})
        assert r_nonexistent.status_code == 200
        assert r_nonexistent.json()["total"] == 0

    def test_list_prompts_nonexistent_collection_id_returns_empty(
        self, client: TestClient, sample_prompt_data
    ):
        """Filtering by non-existent collection_id returns 200 with empty list (no 404)."""
        client.post("/prompts", json=sample_prompt_data)
        response = client.get(
            "/prompts", params={"collection_id": "nonexistent-collection"}
        )
        assert response.status_code == 200
        assert response.json()["total"] == 0
        assert response.json()["prompts"] == []

    def test_update_prompt_not_found_returns_404(
        self, client: TestClient, sample_prompt_data
    ):
        response = client.put(
            "/prompts/nonexistent-id",
            json={
                "title": sample_prompt_data["title"],
                "content": sample_prompt_data["content"],
            },
        )
        assert response.status_code == 404

    def test_update_prompt_invalid_collection_id_returns_400(
        self, client: TestClient, sample_prompt_data
    ):
        create = client.post("/prompts", json=sample_prompt_data)
        prompt_id = create.json()["id"]
        response = client.put(
            f"/prompts/{prompt_id}",
            json={
                "title": sample_prompt_data["title"],
                "content": sample_prompt_data["content"],
                "collection_id": "nonexistent-collection",
            },
        )
        assert response.status_code == 400
        assert "collection" in response.json().get("detail", "").lower()

    def test_update_prompt_invalid_tag_ids_returns_400(
        self, client: TestClient, sample_prompt_data
    ):
        create = client.post("/prompts", json=sample_prompt_data)
        prompt_id = create.json()["id"]
        response = client.put(
            f"/prompts/{prompt_id}",
            json={
                "title": sample_prompt_data["title"],
                "content": sample_prompt_data["content"],
                "tag_ids": ["bad-tag-id"],
            },
        )
        assert response.status_code == 400
        assert "not found" in response.json().get("detail", "").lower()

    def test_patch_prompt_success(self, client: TestClient, sample_prompt_data):
        create = client.post("/prompts", json=sample_prompt_data)
        prompt_id = create.json()["id"]
        original_content = create.json()["content"]
        response = client.patch(
            f"/prompts/{prompt_id}", json={"title": "Patched Title Only"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Patched Title Only"
        assert data["content"] == original_content

    def test_patch_prompt_not_found_returns_404(
        self, client: TestClient, sample_prompt_data
    ):
        response = client.patch("/prompts/nonexistent-id", json={"title": "Foo"})
        assert response.status_code == 404

    def test_patch_prompt_invalid_collection_id_returns_400(
        self, client: TestClient, sample_prompt_data
    ):
        create = client.post("/prompts", json=sample_prompt_data)
        prompt_id = create.json()["id"]
        response = client.patch(
            f"/prompts/{prompt_id}", json={"collection_id": "nonexistent-collection"}
        )
        assert response.status_code == 400
        assert "collection" in response.json().get("detail", "").lower()

    def test_patch_prompt_invalid_tag_ids_returns_400(
        self, client: TestClient, sample_prompt_data
    ):
        create = client.post("/prompts", json=sample_prompt_data)
        prompt_id = create.json()["id"]
        response = client.patch(
            f"/prompts/{prompt_id}", json={"tag_ids": ["bad-tag-id"]}
        )
        assert response.status_code == 400
        assert "not found" in response.json().get("detail", "").lower()

    def test_delete_prompt_not_found_returns_404(self, client: TestClient):
        response = client.delete("/prompts/nonexistent-id")
        assert response.status_code == 404


class TestCollections:
    """Tests for collection endpoints."""

    def test_list_collections_empty(self, client: TestClient):
        response = client.get("/collections")
        assert response.status_code == 200
        assert response.json()["collections"] == []
        assert response.json()["total"] == 0

    def test_get_collection_success(self, client: TestClient, sample_collection_data):
        create = client.post("/collections", json=sample_collection_data)
        collection_id = create.json()["id"]
        response = client.get(f"/collections/{collection_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == collection_id
        assert data["name"] == sample_collection_data["name"]

    def test_delete_collection_not_found_returns_404(self, client: TestClient):
        response = client.delete("/collections/nonexistent-id")
        assert response.status_code == 404

    def test_create_collection_validation_empty_name_returns_422(
        self, client: TestClient, sample_collection_data
    ):
        response = client.post(
            "/collections",
            json={"name": "", "description": sample_collection_data["description"]},
        )
        assert response.status_code == 422

    def test_create_collection_validation_name_too_long_returns_422(
        self, client: TestClient, sample_collection_data
    ):
        response = client.post(
            "/collections", json={"name": "x" * 101, "description": None}
        )
        assert response.status_code == 422

    def test_create_collection_validation_description_too_long_returns_422(
        self, client: TestClient, sample_collection_data
    ):
        response = client.post(
            "/collections",
            json={"name": sample_collection_data["name"], "description": "x" * 501},
        )
        assert response.status_code == 422

    def test_create_collection(self, client: TestClient, sample_collection_data):
        response = client.post("/collections", json=sample_collection_data)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == sample_collection_data["name"]
        assert "id" in data

    def test_list_collections(self, client: TestClient, sample_collection_data):
        client.post("/collections", json=sample_collection_data)

        response = client.get("/collections")
        assert response.status_code == 200
        data = response.json()
        assert len(data["collections"]) == 1

    def test_get_collection_not_found(self, client: TestClient):
        response = client.get("/collections/nonexistent-id")
        assert response.status_code == 404

    def test_delete_collection_with_prompts(
        self, client: TestClient, sample_collection_data, sample_prompt_data
    ):
        """Test deleting a collection that has prompts.

        NOTE: Bug #4 - prompts become orphaned after collection deletion.
        This test documents the current (buggy) behavior.
        After fixing, update the test to verify correct behavior.
        """
        # Create collection
        col_response = client.post("/collections", json=sample_collection_data)
        collection_id = col_response.json()["id"]

        # Create prompt in collection
        prompt_data = {**sample_prompt_data, "collection_id": collection_id}
        prompt_response = client.post("/prompts", json=prompt_data)
        prompt_id = prompt_response.json()["id"]

        # Delete collection
        client.delete(f"/collections/{collection_id}")

        # The prompt still exists but has invalid collection_id
        # This is Bug #4 - should be handled properly
        prompts = client.get("/prompts").json()["prompts"]
        if prompts:
            # Prompt exists with orphaned collection_id
            assert prompts[0]["collection_id"] == collection_id
            # After fix, collection_id should be None or prompt should be deleted


class TestTags:
    """Tests for tag CRUD endpoints."""

    def test_list_tags_empty(self, client: TestClient):
        response = client.get("/tags")
        assert response.status_code == 200
        assert response.json()["tags"] == []
        assert response.json()["total"] == 0

    def test_create_tag_validation_missing_name_returns_422(self, client: TestClient):
        response = client.post("/tags", json={})
        assert response.status_code == 422

    def test_create_tag_validation_empty_name_returns_422(self, client: TestClient):
        response = client.post("/tags", json={"name": ""})
        assert response.status_code == 422

    def test_create_tag_validation_name_too_long_returns_422(self, client: TestClient):
        response = client.post("/tags", json={"name": "x" * 51})
        assert response.status_code == 422

    def test_create_tag_validation_slug_too_long_returns_422(self, client: TestClient):
        response = client.post("/tags", json={"name": "ok", "slug": "x" * 51})
        assert response.status_code == 422

    def test_create_tag(self, client: TestClient):
        response = client.post("/tags", json={"name": "backend"})
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "backend"
        assert "id" in data
        assert data.get("slug") == "backend"

    def test_create_tag_with_slug(self, client: TestClient):
        response = client.post("/tags", json={"name": "Front End", "slug": "frontend"})
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Front End"
        assert data["slug"] == "frontend"

    def test_create_tag_duplicate_name(self, client: TestClient):
        client.post("/tags", json={"name": "dup"})
        response = client.post("/tags", json={"name": "dup"})
        assert response.status_code == 400
        assert "already exists" in response.json().get("detail", "").lower()

    def test_list_tags(self, client: TestClient):
        client.post("/tags", json={"name": "a"})
        client.post("/tags", json={"name": "b"})
        response = client.get("/tags")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 2
        assert len(data["tags"]) == 2

    def test_get_tag(self, client: TestClient):
        create = client.post("/tags", json={"name": "getme"})
        tag_id = create.json()["id"]
        response = client.get(f"/tags/{tag_id}")
        assert response.status_code == 200
        assert response.json()["name"] == "getme"

    def test_get_tag_not_found(self, client: TestClient):
        response = client.get("/tags/nonexistent-id")
        assert response.status_code == 404

    def test_patch_tag(self, client: TestClient):
        create = client.post("/tags", json={"name": "original"})
        tag_id = create.json()["id"]
        response = client.patch(f"/tags/{tag_id}", json={"name": "patched"})
        assert response.status_code == 200
        assert response.json()["name"] == "patched"

    def test_delete_tag(self, client: TestClient):
        create = client.post("/tags", json={"name": "todelete"})
        tag_id = create.json()["id"]
        response = client.delete(f"/tags/{tag_id}")
        assert response.status_code == 204
        assert client.get(f"/tags/{tag_id}").status_code == 404

    def test_patch_tag_not_found_returns_404(self, client: TestClient):
        response = client.patch("/tags/nonexistent-id", json={"name": "foo"})
        assert response.status_code == 404

    def test_patch_tag_duplicate_name_returns_400(self, client: TestClient):
        client.post("/tags", json={"name": "first"})
        second = client.post("/tags", json={"name": "second"})
        tag_id = second.json()["id"]
        response = client.patch(f"/tags/{tag_id}", json={"name": "first"})
        assert response.status_code == 400
        assert "already exists" in response.json().get("detail", "").lower()

    def test_patch_tag_empty_name_returns_422(self, client: TestClient):
        create = client.post("/tags", json={"name": "original"})
        tag_id = create.json()["id"]
        response = client.patch(f"/tags/{tag_id}", json={"name": ""})
        assert response.status_code == 422

    def test_delete_tag_not_found_returns_404(self, client: TestClient):
        response = client.delete("/tags/nonexistent-id")
        assert response.status_code == 404


class TestPromptTags:
    """Tests for prompt–tag assignment and filtering."""

    def test_get_prompt_tags_prompt_not_found_returns_404(self, client: TestClient):
        response = client.get("/prompts/nonexistent-id/tags")
        assert response.status_code == 404

    def test_get_prompt_tags_empty(self, client: TestClient, sample_prompt_data):
        create = client.post("/prompts", json=sample_prompt_data)
        prompt_id = create.json()["id"]
        response = client.get(f"/prompts/{prompt_id}/tags")
        assert response.status_code == 200
        assert response.json()["tags"] == []
        assert response.json()["total"] == 0

    def test_set_prompt_tags_prompt_not_found_returns_404(self, client: TestClient):
        response = client.put("/prompts/nonexistent-id/tags", json={"tag_ids": []})
        assert response.status_code == 404

    def test_set_prompt_tags_missing_tag_ids_returns_422(
        self, client: TestClient, sample_prompt_data
    ):
        prompt_res = client.post("/prompts", json=sample_prompt_data)
        prompt_id = prompt_res.json()["id"]
        response = client.put(f"/prompts/{prompt_id}/tags", json={})
        assert response.status_code == 422

    def test_add_prompt_tag_missing_tag_ids_returns_422(
        self, client: TestClient, sample_prompt_data
    ):
        prompt_res = client.post("/prompts", json=sample_prompt_data)
        prompt_id = prompt_res.json()["id"]
        response = client.post(f"/prompts/{prompt_id}/tags", json={})
        assert response.status_code == 422

    def test_set_prompt_tags_empty_list_clears_tags(
        self, client: TestClient, sample_prompt_data
    ):
        prompt_res = client.post("/prompts", json=sample_prompt_data)
        prompt_id = prompt_res.json()["id"]
        tag_res = client.post("/tags", json={"name": "clear-me"})
        tag_id = tag_res.json()["id"]
        client.put(f"/prompts/{prompt_id}/tags", json={"tag_ids": [tag_id]})
        put_res = client.put(f"/prompts/{prompt_id}/tags", json={"tag_ids": []})
        assert put_res.status_code == 200
        tags = client.get(f"/prompts/{prompt_id}/tags").json()["tags"]
        assert len(tags) == 0

    def test_add_prompt_tag_prompt_not_found_returns_404(self, client: TestClient):
        tag_res = client.post("/tags", json={"name": "t"})
        tag_id = tag_res.json()["id"]
        response = client.post(
            "/prompts/nonexistent-id/tags", json={"tag_ids": [tag_id]}
        )
        assert response.status_code == 404

    def test_add_prompt_tag_invalid_tag_id_returns_400(
        self, client: TestClient, sample_prompt_data
    ):
        prompt_res = client.post("/prompts", json=sample_prompt_data)
        prompt_id = prompt_res.json()["id"]
        response = client.post(
            f"/prompts/{prompt_id}/tags", json={"tag_ids": ["bad-tag-id"]}
        )
        assert response.status_code == 400
        assert "not found" in response.json().get("detail", "").lower()

    def test_remove_prompt_tag_prompt_not_found_returns_404(self, client: TestClient):
        tag_res = client.post("/tags", json={"name": "t"})
        tag_id = tag_res.json()["id"]
        response = client.delete(f"/prompts/nonexistent-id/tags/{tag_id}")
        assert response.status_code == 404

    def test_remove_prompt_tag_idempotent_when_tag_not_assigned(
        self, client: TestClient, sample_prompt_data
    ):
        prompt_res = client.post("/prompts", json=sample_prompt_data)
        prompt_id = prompt_res.json()["id"]
        tag_res = client.post("/tags", json={"name": "unassigned"})
        tag_id = tag_res.json()["id"]
        response = client.delete(f"/prompts/{prompt_id}/tags/{tag_id}")
        assert response.status_code == 204
        tags = client.get(f"/prompts/{prompt_id}/tags").json()["tags"]
        assert len(tags) == 0

    def test_set_and_get_prompt_tags(self, client: TestClient, sample_prompt_data):
        prompt_res = client.post("/prompts", json=sample_prompt_data)
        prompt_id = prompt_res.json()["id"]
        tag_res = client.post("/tags", json={"name": "t1"})
        tag_id = tag_res.json()["id"]
        client.put(f"/prompts/{prompt_id}/tags", json={"tag_ids": [tag_id]})
        response = client.get(f"/prompts/{prompt_id}/tags")
        assert response.status_code == 200
        assert response.json()["total"] == 1
        assert response.json()["tags"][0]["id"] == tag_id

    def test_add_prompt_tag(self, client: TestClient, sample_prompt_data):
        prompt_res = client.post("/prompts", json=sample_prompt_data)
        prompt_id = prompt_res.json()["id"]
        t1 = client.post("/tags", json={"name": "a"}).json()["id"]
        t2 = client.post("/tags", json={"name": "b"}).json()["id"]
        client.put(f"/prompts/{prompt_id}/tags", json={"tag_ids": [t1]})
        client.post(f"/prompts/{prompt_id}/tags", json={"tag_ids": [t2]})
        tags = client.get(f"/prompts/{prompt_id}/tags").json()["tags"]
        assert len(tags) == 2

    def test_remove_prompt_tag(self, client: TestClient, sample_prompt_data):
        prompt_res = client.post("/prompts", json=sample_prompt_data)
        prompt_id = prompt_res.json()["id"]
        tag_res = client.post("/tags", json={"name": "r1"})
        tag_id = tag_res.json()["id"]
        client.put(f"/prompts/{prompt_id}/tags", json={"tag_ids": [tag_id]})
        client.delete(f"/prompts/{prompt_id}/tags/{tag_id}")
        tags = client.get(f"/prompts/{prompt_id}/tags").json()["tags"]
        assert len(tags) == 0

    def test_filter_prompts_by_tag_and(self, client: TestClient, sample_prompt_data):
        t1 = client.post("/tags", json={"name": "x"}).json()["id"]
        t2 = client.post("/tags", json={"name": "y"}).json()["id"]
        p1 = client.post(
            "/prompts", json={**sample_prompt_data, "title": "P1", "tag_ids": [t1, t2]}
        ).json()["id"]
        client.post(
            "/prompts", json={**sample_prompt_data, "title": "P2", "tag_ids": [t1]}
        )
        response = client.get(
            "/prompts", params={"tag_ids": f"{t1},{t2}", "tag_match": "all"}
        )
        assert response.status_code == 200
        assert response.json()["total"] == 1
        assert response.json()["prompts"][0]["id"] == p1

    def test_filter_prompts_by_tag_any(self, client: TestClient, sample_prompt_data):
        t1 = client.post("/tags", json={"name": "a"}).json()["id"]
        t2 = client.post("/tags", json={"name": "b"}).json()["id"]
        client.post(
            "/prompts", json={**sample_prompt_data, "title": "P1", "tag_ids": [t1]}
        )
        client.post(
            "/prompts", json={**sample_prompt_data, "title": "P2", "tag_ids": [t2]}
        )
        response = client.get(
            "/prompts", params={"tag_ids": f"{t1},{t2}", "tag_match": "any"}
        )
        assert response.status_code == 200
        assert response.json()["total"] == 2

    def test_delete_tag_cascades(self, client: TestClient, sample_prompt_data):
        tag_res = client.post("/tags", json={"name": "cascade"})
        tag_id = tag_res.json()["id"]
        prompt_res = client.post(
            "/prompts", json={**sample_prompt_data, "tag_ids": [tag_id]}
        )
        prompt_id = prompt_res.json()["id"]
        client.delete(f"/tags/{tag_id}")
        prompt = client.get(f"/prompts/{prompt_id}").json()
        assert tag_id not in prompt.get("tag_ids", [])

    def test_invalid_tag_id_on_create_prompt(
        self, client: TestClient, sample_prompt_data
    ):
        response = client.post(
            "/prompts", json={**sample_prompt_data, "tag_ids": ["bad-tag-id"]}
        )
        assert response.status_code == 400
        assert "not found" in response.json().get("detail", "").lower()

    def test_invalid_tag_id_on_set_tags(self, client: TestClient, sample_prompt_data):
        prompt_res = client.post("/prompts", json=sample_prompt_data)
        prompt_id = prompt_res.json()["id"]
        response = client.put(
            f"/prompts/{prompt_id}/tags", json={"tag_ids": ["bad-tag-id"]}
        )
        assert response.status_code == 400
        assert "not found" in response.json().get("detail", "").lower()
