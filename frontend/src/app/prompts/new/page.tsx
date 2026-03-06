"use client";

import { useRouter } from "next/navigation";
import { createPrompt } from "@/lib/api/prompts";
import { PromptForm } from "@/components/prompts/PromptForm";
import type { PromptCreateInput } from "@/lib/types";

export default function NewPromptPage() {
  const router = useRouter();

  const handleSubmit = async (data: PromptCreateInput) => {
    await createPrompt(data);
    router.push("/prompts");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
        Create Prompt
      </h1>
      <PromptForm
        onSubmit={handleSubmit}
        onCancel={() => router.push("/prompts")}
        submitLabel="Create Prompt"
      />
    </div>
  );
}
