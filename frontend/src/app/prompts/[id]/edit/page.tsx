"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FileQuestion } from "lucide-react";
import { getPrompt } from "@/lib/api/prompts";
import { updatePrompt } from "@/lib/api/prompts";
import { PromptForm } from "@/components/prompts/PromptForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Skeleton } from "@/components/ui/Skeleton";
import type { PromptCreateInput } from "@/lib/types";
import { ApiError } from "@/lib/api/client";

export default function EditPromptPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [prompt, setPrompt] = useState<Awaited<ReturnType<typeof getPrompt>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPrompt(id)
      .then(setPrompt)
      .catch((e) => {
        if (e instanceof ApiError && e.status === 404) {
          setError("not_found");
        } else {
          setError(e && typeof e === "object" && "detail" in e ? String((e as { detail: string }).detail) : "Failed to load prompt.");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (data: PromptCreateInput) => {
    await updatePrompt(id, data);
    router.push(`/prompts/${id}`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <Skeleton className="h-8 w-48 mb-6" rounded="sm" />
        <Skeleton className="h-10 w-full mb-4" rounded="lg" />
        <Skeleton className="h-32 w-full mb-4" rounded="lg" />
      </div>
    );
  }

  if (error === "not_found") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <EmptyState
          icon={FileQuestion}
          title="Prompt not found"
          description="This prompt may have been deleted or the link is incorrect."
          actionLabel="Back to Prompts"
          actionHref="/prompts"
        />
      </div>
    );
  }

  if (error || !prompt) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <ErrorMessage message={error || "Failed to load prompt"} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
        Edit Prompt
      </h1>
      <PromptForm
        initial={prompt}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/prompts/${id}`)}
        submitLabel="Save Changes"
      />
    </div>
  );
}
