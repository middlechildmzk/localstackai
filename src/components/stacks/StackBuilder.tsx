"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, DollarSign, Globe, Lock, Loader2, GitFork } from "lucide-react";
import { createBrowserClient, hasSupabaseConfig } from "@/lib/supabase";
import { trackEvent } from "@/lib/analytics";
import type { Tool, DataFlowType } from "@/types";

interface StackToolEntry {
  tool: Tool;
  role_in_stack: string;
  step_order: number;
  monthly_cost: string;
  data_flow_type: DataFlowType;
  notes: string;
}

interface StackBuilderProps {
  initialTools?: Tool[];
  workflowSlug?: string;
}

export function StackBuilder({ initialTools = [] }: StackBuilderProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [entries, setEntries] = useState<StackToolEntry[]>([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Tool[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const totalCost = entries.reduce((sum, e) => {
    const n = parseFloat(e.monthly_cost);
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

  const searchTools = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    const supabase = createBrowserClient();
    const { data } = await supabase
      .from("tools")
      .select("id,slug,name,tagline,logo_url,pricing_model,starting_price,freshness")
      .eq("is_published", true)
      .ilike("name", `%${q}%`)
      .limit(8);
    setSearchResults((data as Tool[]) ?? []);
    setSearching(false);
  }, []);

  function addTool(tool: Tool) {
    if (entries.some((e) => e.tool.id === tool.id)) return;
    setEntries((prev) => [
      ...prev,
      {
        tool,
        role_in_stack: "",
        step_order: prev.length,
        monthly_cost: String(tool.starting_price ?? 0),
        data_flow_type: "unknown",
        notes: "",
      },
    ]);
    setSearch("");
    setSearchResults([]);
  }

  function removeEntry(toolId: string) {
    setEntries((prev) => prev.filter((e) => e.tool.id !== toolId));
  }

  function updateEntry(toolId: string, field: keyof StackToolEntry, value: string) {
    setEntries((prev) =>
      prev.map((e) => (e.tool.id === toolId ? { ...e, [field]: value } : e))
    );
  }

  async function handleSave() {
    if (!title.trim()) { setError("Stack title is required."); return; }
    if (entries.length === 0) { setError("Add at least one tool."); return; }
    setSaving(true);
    setError("");

    if (!hasSupabaseConfig()) {
      const slug = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `demo-stack-${Date.now()}`;
      const previewStack = {
        slug,
        title: title.trim(),
        description: description.trim(),
        visibility,
        monthly_cost: totalCost,
        tools: entries,
        created_at: new Date().toISOString(),
      };
      window.localStorage.setItem(`stackbuilder-demo-stack:${slug}`, JSON.stringify(previewStack));
      trackEvent("stack_create", { stack_id: slug, demo_mode: true });
      setError("Demo mode: stack saved locally in this browser. Connect Supabase to persist and share public stacks.");
      setSaving(false);
      return;
    }

    const res = await fetch("/api/stacks/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim(),
        visibility,
        monthly_cost: totalCost,
        tools: entries.map((e) => ({
          tool_id: e.tool.id,
          role_in_stack: e.role_in_stack,
          step_order: e.step_order,
          monthly_cost: parseFloat(e.monthly_cost) || 0,
          data_flow_type: e.data_flow_type,
          notes: e.notes,
        })),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      trackEvent("stack_create", { stack_id: data.slug });
      router.push(`/stacks/${data.slug}`);
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Failed to save stack. Sign in or connect Supabase to persist stacks.");
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {!hasSupabaseConfig() && (
        <div className="rounded-xl border border-brand-500/30 bg-brand-500/10 p-4 text-sm text-brand-100">
          <strong>Demo mode:</strong> build your stack freely. Saving is simulated locally until Supabase is connected.
        </div>
      )}
      {/* Stack meta */}
      <div className="glass p-5 space-y-4">
        <div>
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block mb-1.5">
            Stack Name *
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My Faceless YouTube Stack"
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this stack help you accomplish?"
            rows={2}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 transition-all resize-none"
          />
        </div>
        <div className="flex gap-2">
          {(["public", "private"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setVisibility(v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-all ${
                visibility === v
                  ? "bg-brand-600 border-brand-600 text-white"
                  : "border-white/10 text-zinc-400 hover:border-white/20"
              }`}
            >
              {v === "public" ? <Globe size={12} /> : <Lock size={12} />}
              {v === "public" ? "Public" : "Private"}
            </button>
          ))}
        </div>
      </div>

      {/* Tool search */}
      <div className="glass p-5">
        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block mb-3">
          Add Tools
        </label>
        <div className="relative">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              searchTools(e.target.value);
            }}
            placeholder="Search for a tool…"
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 transition-all"
          />
          {searching && (
            <Loader2
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 animate-spin"
            />
          )}
          {searchResults.length > 0 && (
            <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-[#1e1e28] border border-white/10 rounded-xl overflow-hidden shadow-xl">
              {searchResults.map((t) => (
                <button
                  key={t.id}
                  onClick={() => addTool(t)}
                  disabled={entries.some((e) => e.tool.id === t.id)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-left"
                >
                  <div className="w-7 h-7 rounded bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 shrink-0">
                    {t.name[0]}
                  </div>
                  <div>
                    <span className="text-white">{t.name}</span>
                    {t.tagline && (
                      <span className="text-zinc-600 ml-2 text-xs">{t.tagline}</span>
                    )}
                  </div>
                  {entries.some((e) => e.tool.id === t.id) && (
                    <span className="ml-auto text-xs text-zinc-600">Added</span>
                  )}
                </button>
              ))}
            </div>
          )}
          {search.trim().length > 1 && !searching && searchResults.length === 0 && (
            <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-[#1e1e28] border border-white/10 rounded-xl p-4 text-sm text-zinc-400 shadow-xl">
              Can't find it? <a href="/submit" className="text-brand-400 hover:underline">Submit a tool →</a>
            </div>
          )}
        </div>
      </div>

      {/* Entries */}
      {entries.length > 0 && (
        <div className="space-y-3">
          {entries.map((entry, i) => (
            <div key={entry.tool.id} className="glass p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-600 font-mono w-5">{i + 1}</span>
                  <span className="font-medium text-white text-sm">{entry.tool.name}</span>
                </div>
                <button
                  onClick={() => removeEntry(entry.tool.id)}
                  className="text-zinc-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-600 block mb-1">Role in stack</label>
                  <input
                    value={entry.role_in_stack}
                    onChange={(e) => updateEntry(entry.tool.id, "role_in_stack", e.target.value)}
                    placeholder="e.g. Video generation"
                    className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-brand-500/40 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-600 block mb-1">Monthly cost ($)</label>
                  <input
                    type="number"
                    value={entry.monthly_cost}
                    onChange={(e) => updateEntry(entry.tool.id, "monthly_cost", e.target.value)}
                    min="0"
                    className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500/40 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-600 block mb-1">Data flow</label>
                <select
                  value={entry.data_flow_type}
                  onChange={(e) => updateEntry(entry.tool.id, "data_flow_type", e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#1e1e28] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500/40 transition-all"
                >
                  {(["native_api", "webhook", "zapier", "make", "manual_export", "unknown"] as DataFlowType[]).map((f) => (
                    <option key={f} value={f}>
                      {f.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cost summary + save */}
      <div className="glass p-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <DollarSign size={14} className="text-brand-400" />
          <span className="text-zinc-400">Est. monthly cost:</span>
          <span className="font-bold text-white">
            {totalCost === 0 ? "Free" : `$${totalCost.toFixed(2)}/mo`}
          </span>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          Save Stack
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-400 text-center">{error}</p>
      )}
    </div>
  );
}
