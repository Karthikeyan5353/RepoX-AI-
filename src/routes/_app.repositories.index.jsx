import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search, RefreshCw, Lock, Globe, Star, GitFork, ExternalLink, } from "lucide-react";
import { getGitHubToken } from "@/lib/storage";
import { fetchUserRepos } from "@/lib/github";
export const Route = createFileRoute("/_app/repositories/")({
    component: RepositoriesPage,
});
function RepositoriesPage() {
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [error, setError] = useState(null);
    const token = getGitHubToken();
    const loadRepos = async () => {
        if (!token)
            return;
        setLoading(true);
        setError(null);
        try {
            const data = await fetchUserRepos(token);
            setRepos(data);
        }
        catch (e) {
            setError(e.message);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadRepos();
    }, [token]);
    const filtered = repos.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.description?.toLowerCase().includes(search.toLowerCase()));
    if (!token) {
        return (<div className="flex h-full items-center justify-center p-8">
        <p className="text-muted-foreground">
          Please configure your GitHub token in{" "}
          <Link to="/settings" className="text-primary underline">
            Settings
          </Link>
        </p>
      </div>);
    }
    return (<div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Repositories</h1>
          <p className="text-sm text-muted-foreground">{repos.length} repositories</p>
        </div>
        <button onClick={loadRepos} disabled={loading} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}/>
          Sync Repositories
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
        <input type="text" placeholder="Search repositories..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-md border border-input bg-input px-10 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"/>
      </div>

      {error && (<div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>)}

      {/* Repo list */}
      <div className="space-y-2">
        {loading && repos.length === 0 ? (<div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (<div key={i} className="h-20 animate-pulse rounded-lg bg-muted"/>))}
          </div>) : filtered.length === 0 ? (<p className="py-8 text-center text-sm text-muted-foreground">No repositories found</p>) : (filtered.map((repo) => (<Link key={repo.id} to="/repositories/$repoId" params={{ repoId: repo.full_name.replace("/", "---") }} className="flex items-start justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-accent/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{repo.full_name}</span>
                  {repo.private ? (<span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      <Lock className="h-2.5 w-2.5"/> Private
                    </span>) : (<span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      <Globe className="h-2.5 w-2.5"/> Public
                    </span>)}
                </div>
                {repo.description && (<p className="text-xs text-muted-foreground line-clamp-1">{repo.description}</p>)}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {repo.language && <span>{repo.language}</span>}
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3"/> {repo.stargazers_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="h-3 w-3"/> {repo.forks_count}
                  </span>
                  <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
              <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-muted-foreground"/>
            </Link>)))}
      </div>
    </div>);
}
