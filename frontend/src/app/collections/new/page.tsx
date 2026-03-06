"use client";

import { useRouter } from "next/navigation";
import { createCollection } from "@/lib/api/collections";
import { CollectionForm } from "@/components/collections/CollectionForm";
import type { CollectionCreateInput } from "@/lib/types";

export default function NewCollectionPage() {
  const router = useRouter();

  const handleSubmit = async (data: CollectionCreateInput) => {
    await createCollection(data);
    router.push("/collections");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
        Create Collection
      </h1>
      <CollectionForm
        onSubmit={handleSubmit}
        onCancel={() => router.push("/collections")}
      />
    </div>
  );
}
