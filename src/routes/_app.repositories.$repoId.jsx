import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { GitPullRequest, GitBranch, ArrowLeft, ExternalLink, Clock, Plus, Minus, FolderTree, MessageSquareText, Loader2, } from "lucide-react";
import { getGitHubToken } from "@/lib/storage";
import { fetchPullRequests, fetchRepo, fetchBranches, fetchFileContent, } from "@/lib/github";
import { FileExplorer } from "@/components/FileExplorer";
import { FileViewer } from "@/components/FileViewer";
import { RepoChat } from "@/components/RepoChat";
export const Route = createFileRoute("/_app/repositories/$repoId")({
    validateSearch: (search) => ({
        tab: ["pulls", "files", "branches", "chat"].includes(search.tab) ? search.tab : "pulls",
        branch: typeof search.branch === "string" ? search.branch : undefined,
        file: typeof search.file === "string" ? search.file : undefined,
    }),
    component: RepoDetailPage,
});
function RepoDetailPage() {
    const { repoId } = Route.useParams();
    const { tab, branch, file } = Route.useSearch();
    const navigate = Route.useNavigate();
    const fullName = repoId.replace("---", "/");
    const [owner, repo] = fullName.split("/");
    const token = getGitHubToken();
    const [repoData, setRepoData] = useState(null);
    const [prs, setPrs] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [prFilter, setPrFilter] = useState("all");
    const [selectedBranch, setSelectedBranch] = useState(branch || "");
    // File viewer state
    const [viewingFile, setViewingFile] = useState(null);
    const [fileContext, setFileContext] = useState("");
    const setTab = (nextTab) => {
        setViewingFile(null);
        navigate({
            search: (prev) => ({
                ...prev,
                tab: nextTab,
                file: undefined,
                branch: nextTab === "files" ? prev.branch : undefined,
            }),
        });
    };
    useEffect(() => {
        setRepoData(null);
        setPrs([]);
        setBranches([]);
        setSelectedBranch(branch || "");
        setViewingFile(null);
        setFileContext("");
    }, [repoId, branch]);
    useEffect(() => {
        if (!token)
            return;
        setLoading(true);
        Promise.all([
            fetchRepo(token, owner, repo),
            fetchPullRequests(token, owner, repo, prFilter),
            fetchBranches(token, owner, repo),
        ])
            .then(([r, p, b]) => {
            setRepoData(r);
            setPrs(p);
            setBranches(b);
            if (branch && b.some((item) => item.name === branch)) {
                setSelectedBranch(branch);
            }
            else if (r.default_branch) {
                setSelectedBranch((current) => current || r.default_branch);
            }
        })
            .finally(() => setLoading(false));
    }, [token, owner, repo, prFilter, branch]);
    useEffect(() => {
        if (!selectedBranch || tab !== "files")
            return;
        navigate({
            search: (prev) => ({
                ...prev,
                tab: "files",
                branch: selectedBranch,
            }),
            replace: true,
        });
    }, [navigate, selectedBranch, tab]);
    useEffect(() => {
        if (!file) {
            setViewingFile(null);
            return;
        }
        if (!token || !selectedBranch)
            return;
        if (viewingFile?.path === file)
            return;
        let cancelled = false;
        fetchFileContent(token, owner, repo, file, selectedBranch)
            .then((content) => {
            if (cancelled)
                return;
            setViewingFile({ path: file, content });
            setFileContext(content);
        })
            .catch((e) => {
            if (cancelled)
                return;
            console.error("Failed to restore file:", e);
        });
        return () => {
            cancelled = true;
        };
    }, [file, token, selectedBranch, owner, repo, viewingFile?.path]);
    const handleFileSelect = (path, content) => {
        setViewingFile({ path, content });
        setFileContext(content);
        navigate({
            search: (prev) => ({
                ...prev,
                tab: "files",
                branch: selectedBranch || prev.branch,
                file: path,
            }),
        });
    };
    const handleCloseFile = () => {
        setViewingFile(null);
        navigate({
            search: (prev) => ({
                ...prev,
                file: undefined,
            }),
        });
    };
    const tabs = [
        { key: "pulls", label: "Pull Requests", icon: GitPullRequest, count: prs.length },
        { key: "files", label: "File Explorer", icon: FolderTree },
        { key: "branches", label: "Branches", icon: GitBranch, count: branches.length },
        { key: "chat", label: "AI Chat", icon: MessageSquareText },
    ];
    if (!token) {
        return (<div className="flex h-full items-center justify-center p-8">
        <p className="text-muted-foreground">
          Please configure your GitHub token in{" "}
          <Link to="/settings" className="text-primary underline">Settings</Link>
        </p>
      </div>);
    }
    // If viewing a file, show full-screen file viewer
    if (viewingFile) {
        return (<FileViewer path={viewingFile.path} content={viewingFile.content} repoFullName={fullName} onClose={handleCloseFile}/>);
    }
    return (<div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <Link to="/repositories" className="rounded-md p-1 hover:bg-accent">
          <ArrowLeft className="h-5 w-5"/>
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-bold">{fullName}</h1>
          {repoData && (<p className="text-xs text-muted-foreground">{repoData.description || "No description"}</p>)}
        </div>
        {repoData && (<a href={repoData.html_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <ExternalLink className="h-3.5 w-3.5"/> GitHub
          </a>)}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border px-5">
        {tabs.map((t) => (<button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-medium transition-colors ${tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <t.icon className="h-3.5 w-3.5"/>
            {t.label}
            {t.count != null && (<span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px]">{t.count}</span>)}
          </button>))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {loading ? (<div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-primary"/>
          </div>) : tab === "pulls" ? (<PullRequestsTab prs={prs} filter={prFilter} onFilterChange={setPrFilter} repoId={repoId}/>) : tab === "files" ? (<div className="p-5">
            {/* Branch selector */}
            <div className="mb-4 flex items-center gap-3">
              <GitBranch className="h-4 w-4 text-muted-foreground"/>
              <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} className="rounded-md border border-input bg-input px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                {branches.map((b) => (<option key={b.name} value={b.name}>{b.name}</option>))}
              </select>
            </div>
            {selectedBranch && token && (<FileExplorer token={token} owner={owner} repo={repo} branch={selectedBranch} onFileSelect={handleFileSelect}/>)}
          </div>) : tab === "branches" ? (<BranchesTab branches={branches} defaultBranch={repoData?.default_branch}/>) : tab === "chat" ? (<div className="h-full">
            <RepoChat key={fullName} repoFullName={fullName} fileContext={fileContext}/>
          </div>) : null}
      </div>
    </div>);
}
function PullRequestsTab({ prs, filter, onFilterChange, repoId, }) {
    return (<div className="p-5 space-y-4">
      {/* Filter */}
      <div className="flex gap-1 rounded-md bg-muted p-1 w-fit">
        {["all", "open", "closed"].map((f) => (<button key={f} onClick={() => onFilterChange(f)} className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${filter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {f}
          </button>))}
      </div>

      {prs.length === 0 ? (<div className="py-12 text-center">
          <GitPullRequest className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30"/>
          <p className="text-sm text-muted-foreground">No pull requests found</p>
          <p className="text-xs text-muted-foreground mt-1">
            Try the File Explorer tab to browse and review individual files
          </p>
        </div>) : (<div className="space-y-2">
          {prs.map((pr) => (<Link key={pr.id} to="/repositories/$repoId/pulls/$prNumber" params={{ repoId, prNumber: String(pr.number) }} className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30">
              <div className="flex items-start gap-3">
                <GitPullRequest className={`mt-0.5 h-4 w-4 shrink-0 ${pr.state === "open" ? "text-primary" : pr.merged_at ? "text-info" : "text-destructive"}`}/>
                <div>
                  <p className="text-sm font-medium">{pr.title}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>#{pr.number}</span>
                    <span className="flex items-center gap-1">
                      <GitBranch className="h-3 w-3"/>
                      {pr.head.ref} → {pr.base.ref}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3"/>
                      {new Date(pr.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 text-primary">
                  <Plus className="h-3 w-3"/>{pr.additions || 0}
                </span>
                <span className="flex items-center gap-1 text-destructive">
                  <Minus className="h-3 w-3"/>{pr.deletions || 0}
                </span>
              </div>
            </Link>))}
        </div>)}
    </div>);
}
function BranchesTab({ branches, defaultBranch }) {
    return (<div className="p-5 space-y-2">
      {branches.length === 0 ? (<p className="py-8 text-center text-sm text-muted-foreground">No branches found</p>) : (branches.map((b) => (<div key={b.name} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
            <div className="flex items-center gap-3">
              <GitBranch className="h-4 w-4 text-muted-foreground"/>
              <span className="text-sm font-medium">{b.name}</span>
              {b.name === defaultBranch && (<span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  default
                </span>)}
            </div>
            <span className="text-xs text-muted-foreground font-mono">{b.commit.sha.slice(0, 7)}</span>
          </div>)))}
    </div>);
}
