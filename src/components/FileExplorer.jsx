import { useState, useEffect } from "react";
import { Folder, FileCode, ChevronRight, ChevronDown, Loader2, } from "lucide-react";
import { fetchRepoTree, fetchFileContent } from "@/lib/github";
function buildTree(items) {
    const root = [];
    const map = new Map();
    // Sort: folders first, then alphabetical
    const sorted = [...items].sort((a, b) => {
        if (a.type !== b.type)
            return a.type === "tree" ? -1 : 1;
        return a.path.localeCompare(b.path);
    });
    for (const item of sorted) {
        const parts = item.path.split("/");
        const name = parts[parts.length - 1];
        const node = {
            name,
            path: item.path,
            type: item.type,
            sha: item.sha,
            size: item.size,
            children: [],
        };
        map.set(item.path, node);
        if (parts.length === 1) {
            root.push(node);
        }
        else {
            const parentPath = parts.slice(0, -1).join("/");
            const parent = map.get(parentPath);
            if (parent) {
                parent.children.push(node);
            }
        }
    }
    return root;
}
export function FileExplorer({ token, owner, repo, branch, onFileSelect }) {
    const [tree, setTree] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingFile, setLoadingFile] = useState(null);
    const [error, setError] = useState(null);
    useEffect(() => {
        setLoading(true);
        setError(null);
        fetchRepoTree(token, owner, repo, branch)
            .then((items) => setTree(buildTree(items)))
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [token, owner, repo, branch]);
    const handleFileClick = async (path) => {
        setLoadingFile(path);
        try {
            const content = await fetchFileContent(token, owner, repo, path, branch);
            onFileSelect(path, content);
        }
        catch (e) {
            console.error("Failed to load file:", e);
        }
        finally {
            setLoadingFile(null);
        }
    };
    if (loading) {
        return (<div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-primary"/>
        <span className="ml-2 text-sm text-muted-foreground">Loading file tree...</span>
      </div>);
    }
    if (error) {
        return (<div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>);
    }
    return (<div className="rounded-md border border-border bg-card">
      <div className="border-b border-border px-3 py-2">
        <span className="text-xs font-semibold text-muted-foreground">FILE EXPLORER</span>
      </div>
      <div className="max-h-[600px] overflow-auto scrollbar-thin p-1">
        {tree.map((node) => (<TreeNodeView key={node.path} node={node} depth={0} onFileClick={handleFileClick} loadingFile={loadingFile}/>))}
      </div>
    </div>);
}
function TreeNodeView({ node, depth, onFileClick, loadingFile, }) {
    const [expanded, setExpanded] = useState(depth < 1);
    const isFolder = node.type === "tree";
    const isLoading = loadingFile === node.path;
    return (<div>
      <button onClick={() => (isFolder ? setExpanded(!expanded) : onFileClick(node.path))} className="flex w-full items-center gap-1.5 rounded-sm px-2 py-1 text-left text-xs hover:bg-accent/50 transition-colors" style={{ paddingLeft: `${depth * 16 + 8}px` }}>
        {isFolder ? (expanded ? (<ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground"/>) : (<ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground"/>)) : (<span className="w-3"/>)}
        {isFolder ? (<Folder className="h-3.5 w-3.5 shrink-0 text-info"/>) : isLoading ? (<Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-primary"/>) : (<FileCode className="h-3.5 w-3.5 shrink-0 text-muted-foreground"/>)}
        <span className="truncate text-foreground">{node.name}</span>
        {node.size != null && !isFolder && (<span className="ml-auto text-[10px] text-muted-foreground">
            {node.size > 1024 ? `${(node.size / 1024).toFixed(1)}KB` : `${node.size}B`}
          </span>)}
      </button>
      {isFolder && expanded && (<div>
          {node.children.map((child) => (<TreeNodeView key={child.path} node={child} depth={depth + 1} onFileClick={onFileClick} loadingFile={loadingFile}/>))}
        </div>)}
    </div>);
}
