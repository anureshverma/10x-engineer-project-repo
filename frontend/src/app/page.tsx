"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, FolderOpen, Tag, LayoutDashboard, ArrowRight } from "lucide-react";
import { getPrompts } from "@/lib/api/prompts";
import { getCollections } from "@/lib/api/collections";
import { getTags } from "@/lib/api/tags";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";
import type { Prompt } from "@/lib/types";

function StatCard({
  label,
  value,
  icon: Icon,
  href,
  loading,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  href: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <Skeleton className="h-8 w-16 mb-2" rounded="sm" />
        <Skeleton className="h-4 w-24" rounded="sm" />
      </div>
    );
  }
  return (
    <Link
      href={href}
      className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow duration-200 block"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [promptsTotal, setPromptsTotal] = useState(0);
  const [collectionsTotal, setCollectionsTotal] = useState(0);
  const [tagsTotal, setTagsTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const loadData = async () => {
    setError(null);
    setLoading(true);
    setStatsLoading(true);
    try {
      const [promptsRes, collectionsRes, tagsRes] = await Promise.all([
        getPrompts(),
        getCollections(),
        getTags(),
      ]);
      setPrompts(promptsRes.prompts.slice(0, 5));
      setPromptsTotal(promptsRes.total);
      setCollectionsTotal(collectionsRes.total);
      setTagsTotal(tagsRes.total);
    } catch (e: unknown) {
      const msg = e && typeof e === "object" && "detail" in e ? String((e as { detail: string }).detail) : "Failed to load dashboard.";
      setError(msg);
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (error && !loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorMessage
          message={error}
          onRetry={loadData}
        />
      </div>
    );
  }

  const isEmpty = !statsLoading && promptsTotal === 0 && collectionsTotal === 0 && tagsTotal === 0;

  if (isEmpty) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EmptyState
          icon={LayoutDashboard}
          title="Welcome to PromptLab"
          description="Get started by creating your first prompt, collection, or tag."
          actionLabel="Create a Prompt"
          actionHref="/prompts/new"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
        <StatCard
          label="Prompts"
          value={promptsTotal}
          icon={FileText}
          href="/prompts"
          loading={statsLoading}
        />
        <StatCard
          label="Collections"
          value={collectionsTotal}
          icon={FolderOpen}
          href="/collections"
          loading={statsLoading}
        />
        <StatCard
          label="Tags"
          value={tagsTotal}
          icon={Tag}
          href="/tags"
          loading={statsLoading}
        />
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Recent Prompts</h2>
          <Button href="/prompts" variant="ghost" size="sm">
            View all
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} lines={2} />
            ))}
          </div>
        ) : prompts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
            <p className="text-sm text-slate-500 mb-4">No prompts yet.</p>
            <Button href="/prompts/new" variant="primary">
              Create your first prompt
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prompts.map((p) => (
              <Link
                key={p.id}
                href={`/prompts/${p.id}`}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow duration-200 block"
              >
                <h3 className="font-semibold text-slate-900 truncate">{p.title}</h3>
                <p className="text-sm text-slate-600 line-clamp-2 mt-1">
                  {p.description || p.content.slice(0, 100)}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Updated {new Date(p.updated_at).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
