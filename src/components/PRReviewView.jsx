import { useState, useEffect } from "react";
import { ArrowLeft, FileCode, Send, Bot, Loader2, AlertTriangle, CheckCircle, Info, ChevronDown, ChevronRight, } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { getGitHubToken } from "@/lib/storage";
import { fetchPullRequest, fetchPRFiles, postPRComment, } from "@/lib/github";
import { saveReview, saveLearning, } from "@/lib/storage";
import { reviewCode } from "@/lib/ai-review";
export function PRReviewView({ fullName, prNumber }) {
    const [owner, repo] = fullName.split("/");
    const token = getGitHubToken();
    const [pr, setPr] = useState(null);
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviewing, setReviewing] = useState(false);
    const [reviewResults, setReviewResults] = useState({});
    const [posting, setPosting] = useState(false);
    const [postSuccess, setPostSuccess] = useState(false);
    useEffect(() => {
        if (!token)
            return;
        setLoading(true);
        Promise.all([
            fetchPullRequest(token, owner, repo, prNumber),
            fetchPRFiles(token, owner, repo, prNumber),
        ])
            .then(([prData, filesData]) => {
            setPr(prData);
            setFiles(filesData);
            if (filesData.length > 0)
                setSelectedFile(filesData[0]);
        })
            .finally(() => setLoading(false));
    }, [token, prNumber]);
    const handleReview = async () => {
        if (!token || !selectedFile?.patch)
            return;
        setReviewing(true);
        try {
            const issues = await reviewCode(selectedFile.filename, selectedFile.patch);
            setReviewResults((prev) => ({ ...prev, [selectedFile.filename]: issues }));
            // Save review
            const review = {
                id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                repoFullName: fullName,
                prNumber,
                fileName: selectedFile.filename,
                issues,
                timestamp: new Date().toISOString(),
            };
            saveReview(review);
            // Save learnings
            issues.forEach((issue) => {
                saveLearning({
                    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                    pattern: issue.title,
                    description: issue.description,
                    category: issue.category,
                    frequency: 1,
                    lastUsed: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                });
            });
        }
        catch (e) {
            console.error("Review failed:", e instanceof Error ? e.message : e);
        }
        finally {
            setReviewing(false);
        }
    };
    const handlePostComment = async () => {
        if (!token || !selectedFile)
            return;
        const issues = reviewResults[selectedFile.filename];
        if (!issues?.length)
            return;
        setPosting(true);
        try {
            const body = `## RepoX AI Code Review\n\n**File:** \`${selectedFile.filename}\`\n\n${issues
                .map((i, idx) => `### ${idx + 1}. ${severityIcon(i.severity)} ${i.title}\n\n${i.description}\n\n**Suggested fix:**\n\`\`\`\n${i.suggestedFix}\n\`\`\`\n\n**Severity:** ${i.severity} | **Category:** ${i.category}`)
                .join("\n\n---\n\n")}`;
            await postPRComment(token, owner, repo, prNumber, body);
            setPostSuccess(true);
            setTimeout(() => setPostSuccess(false), 3000);
        }
        finally {
            setPosting(false);
        }
    };
    if (loading) {
        return (<div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary"/>
      </div>);
    }
    const currentIssues = selectedFile ? reviewResults[selectedFile.filename] : null;
    return (<div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Link to="/repositories/$repoId" params={{ repoId: fullName.replace("/", "---") }} className="rounded-md p-1 hover:bg-accent">
          <ArrowLeft className="h-5 w-5"/>
        </Link>
        <div className="flex-1">
          <h2 className="text-sm font-semibold">{pr?.title}</h2>
          <p className="text-xs text-muted-foreground">
            {fullName} #{prNumber} · {files.length} files changed
          </p>
        </div>
        <button onClick={handleReview} disabled={reviewing || !selectedFile?.patch} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {reviewing ? (<>
              <Loader2 className="h-4 w-4 animate-spin"/>
              Reviewing...
            </>) : (<>
              <Bot className="h-4 w-4"/>
              Review File
            </>)}
        </button>
      </div>

      {/* Main content: 3 panels */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: file list */}
        <div className="w-60 shrink-0 overflow-auto border-r border-border bg-card scrollbar-thin">
          <div className="p-3">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">Changed Files</p>
            {files.map((f) => (<button key={f.sha} onClick={() => setSelectedFile(f)} className={`mb-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors ${selectedFile?.filename === f.filename
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent/50"}`}>
                <FileCode className="h-3.5 w-3.5 shrink-0"/>
                <span className="truncate">{f.filename.split("/").pop()}</span>
                <span className="ml-auto flex items-center gap-1 text-[10px]">
                  <span className="text-primary">+{f.additions}</span>
                  <span className="text-destructive">-{f.deletions}</span>
                </span>
              </button>))}
          </div>
        </div>

        {/* Center: diff view */}
        <div className="flex-1 overflow-auto scrollbar-thin">
          {selectedFile ? (<div className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <FileCode className="h-4 w-4 text-muted-foreground"/>
                <span className="text-sm font-medium">{selectedFile.filename}</span>
                <span className="text-xs text-muted-foreground">
                  ({selectedFile.status})
                </span>
              </div>
              {selectedFile.patch ? (<DiffView patch={selectedFile.patch} issues={currentIssues || []}/>) : (<p className="text-sm text-muted-foreground">Binary file or no diff available</p>)}
            </div>) : (<div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Select a file to view
            </div>)}
        </div>

        {/* Right: AI review panel */}
        <div className="w-72 shrink-0 overflow-auto border-l border-border bg-card scrollbar-thin">
          <div className="p-3">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold">AI Review</p>
              {currentIssues && currentIssues.length > 0 && (<button onClick={handlePostComment} disabled={posting} className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary hover:bg-primary/20 disabled:opacity-50">
                  {posting ? (<Loader2 className="h-3 w-3 animate-spin"/>) : postSuccess ? (<CheckCircle className="h-3 w-3"/>) : (<Send className="h-3 w-3"/>)}
                  {postSuccess ? "Posted!" : "Post to PR"}
                </button>)}
            </div>

            {!currentIssues ? (<div className="py-8 text-center">
                <Bot className="mx-auto mb-2 h-8 w-8 text-muted-foreground"/>
                <p className="text-xs text-muted-foreground">
                  Click "Review File" to analyze the selected file with AI
                </p>
              </div>) : currentIssues.length === 0 ? (<div className="py-8 text-center">
                <CheckCircle className="mx-auto mb-2 h-8 w-8 text-primary"/>
                <p className="text-xs text-muted-foreground">No issues found!</p>
              </div>) : (<div className="space-y-2">
                {currentIssues.map((issue, i) => (<IssueCard key={i} issue={issue} index={i}/>))}
              </div>)}
          </div>
        </div>
      </div>
    </div>);
}
function severityIcon(severity) {
    switch (severity) {
        case "critical":
            return "🔴";
        case "high":
            return "🟠";
        case "medium":
            return "🟡";
        default:
            return "🔵";
    }
}
function IssueCard({ issue, index }) {
    const [expanded, setExpanded] = useState(false);
    const SevIcon = issue.severity === "critical" || issue.severity === "high"
        ? AlertTriangle
        : issue.severity === "medium"
            ? Info
            : CheckCircle;
    const sevColor = issue.severity === "critical"
        ? "text-destructive"
        : issue.severity === "high"
            ? "text-warning"
            : issue.severity === "medium"
                ? "text-info"
                : "text-muted-foreground";
    return (<div className="rounded-md border border-border bg-background p-3">
      <button onClick={() => setExpanded(!expanded)} className="flex w-full items-start gap-2 text-left">
        <SevIcon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${sevColor}`}/>
        <div className="flex-1">
          <p className="text-xs font-medium">{issue.title}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className={`text-[10px] font-medium uppercase ${sevColor}`}>
              {issue.severity}
            </span>
            <span className="text-[10px] text-muted-foreground">{issue.category}</span>
            {issue.line && (<span className="text-[10px] text-muted-foreground">Line {issue.line}</span>)}
          </div>
        </div>
        {expanded ? (<ChevronDown className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"/>) : (<ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"/>)}
      </button>
      {expanded && (<div className="mt-2 space-y-2 border-t border-border pt-2">
          <p className="text-[11px] text-muted-foreground">{issue.description}</p>
          {issue.suggestedFix && (<div>
              <p className="text-[10px] font-semibold text-muted-foreground">Suggested Fix:</p>
              <pre className="mt-1 overflow-auto rounded bg-muted p-2 text-[10px] text-foreground scrollbar-thin">
                {issue.suggestedFix}
              </pre>
            </div>)}
        </div>)}
    </div>);
}
function DiffView({ patch, issues }) {
    const lines = patch.split("\n");
    return (<div className="overflow-auto rounded-md border border-border font-mono text-xs">
      {lines.map((line, i) => {
            const isAdd = line.startsWith("+") && !line.startsWith("+++");
            const isRemove = line.startsWith("-") && !line.startsWith("---");
            const isHunk = line.startsWith("@@");
            return (<div key={i} className={`flex border-b border-border/30 ${isAdd
                    ? "bg-diff-add-bg"
                    : isRemove
                        ? "bg-diff-remove-bg"
                        : isHunk
                            ? "bg-muted"
                            : ""}`}>
            <span className="w-10 shrink-0 select-none px-2 py-0.5 text-right text-muted-foreground/50">
              {i + 1}
            </span>
            <span className={`flex-1 px-2 py-0.5 whitespace-pre-wrap break-all ${isAdd ? "text-primary" : isRemove ? "text-destructive" : isHunk ? "text-info" : ""}`}>
              {line}
            </span>
          </div>);
        })}
    </div>);
}
