import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { BookOpen, Search, Download, Trash2, Clock, TrendingUp, } from "lucide-react";
import { getLearnings, deleteLearning } from "@/lib/storage";
export const Route = createFileRoute("/_app/learnings")({
    component: LearningsPage,
});
function LearningsPage() {
    const [learnings, setLearnings] = useState([]);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [sortBy, setSortBy] = useState("recent");
    useEffect(() => {
        setLearnings(getLearnings());
    }, []);
    const categories = useMemo(() => {
        const cats = new Set(learnings.map((l) => l.category));
        return ["all", ...Array.from(cats)];
    }, [learnings]);
    const filtered = useMemo(() => {
        let result = learnings;
        if (search) {
            const q = search.toLowerCase();
            result = result.filter((l) => l.pattern.toLowerCase().includes(q) || l.description.toLowerCase().includes(q));
        }
        if (categoryFilter !== "all") {
            result = result.filter((l) => l.category === categoryFilter);
        }
        if (sortBy === "frequent") {
            result = [...result].sort((a, b) => b.frequency - a.frequency);
        }
        else if (sortBy === "never") {
            result = result.filter((l) => l.frequency <= 1);
        }
        else {
            result = [...result].sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime());
        }
        return result;
    }, [learnings, search, categoryFilter, sortBy]);
    const handleDelete = (id) => {
        deleteLearning(id);
        setLearnings(getLearnings());
    };
    const handleExportCSV = () => {
        const headers = ["Pattern", "Description", "Category", "Frequency", "Last Used", "Created"];
        const rows = learnings.map((l) => [
            `"${l.pattern.replace(/"/g, '""')}"`,
            `"${l.description.replace(/"/g, '""')}"`,
            l.category,
            String(l.frequency),
            l.lastUsed,
            l.createdAt,
        ]);
        const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `learnings-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };
    const totalLearnings = learnings.length;
    const recentlyUsed = learnings.filter((l) => new Date(l.lastUsed).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000).length;
    const neverUsed = learnings.filter((l) => l.frequency <= 1).length;
    return (<div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Learnings</h1>
          <p className="text-sm text-muted-foreground">Patterns and insights from AI reviews</p>
        </div>
        <button onClick={handleExportCSV} disabled={learnings.length === 0} className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50">
          <Download className="h-4 w-4"/> Export CSV
        </button>
      </div>

      {/* Stats - clickable to filter */}
      <div className="grid grid-cols-3 gap-4">
        <button onClick={() => setSortBy("recent")} className={`rounded-lg border p-4 text-center transition-colors ${sortBy === "recent" ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
          <p className="text-2xl font-bold">{totalLearnings}</p>
          <p className="text-xs text-muted-foreground">Total Learnings</p>
        </button>
        <button onClick={() => setSortBy("frequent")} className={`rounded-lg border p-4 text-center transition-colors ${sortBy === "frequent" ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
          <p className="text-2xl font-bold">{recentlyUsed}</p>
          <p className="text-xs text-muted-foreground">Recently Used (7d)</p>
        </button>
        <button onClick={() => setSortBy("never")} className={`rounded-lg border p-4 text-center transition-colors ${sortBy === "never" ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
          <p className="text-2xl font-bold">{neverUsed}</p>
          <p className="text-xs text-muted-foreground">Never Used</p>
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
          <input type="text" placeholder="Search learnings..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-md border border-input bg-input px-10 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"/>
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-md border border-input bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
          {categories.map((c) => (<option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>))}
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (<div className="py-12 text-center">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30"/>
          <p className="text-sm text-muted-foreground">
            {learnings.length === 0
                ? "No learnings yet. Review some code to start building knowledge!"
                : "No matching learnings found."}
          </p>
        </div>) : (<div className="space-y-2">
          {filtered.map((l) => (<div key={l.id} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{l.pattern}</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{l.category}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{l.description}</p>
                <div className="mt-2 flex items-center gap-4 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3"/> {l.frequency}× seen
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3"/> {new Date(l.lastUsed).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button onClick={() => handleDelete(l.id)} className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="h-3.5 w-3.5"/>
              </button>
            </div>))}
        </div>)}
    </div>);
}
