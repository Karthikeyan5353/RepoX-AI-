import { useState } from "react";
import { FileCode, Bot, Loader2, CheckCircle, AlertTriangle, Info, ChevronDown, ChevronRight, X, } from "lucide-react";
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from "react-resizable-panels";
import { reviewCode } from "@/lib/ai-review";
import { saveReview, saveLearning, } from "@/lib/storage";
export function FileViewer({ path, content, repoFullName, onClose }) {
    const [reviewing, setReviewing] = useState(false);
    const [issues, setIssues] = useState(null);
    const [reviewError, setReviewError] = useState("");
    const lines = content.split("\n");
    const getLanguage = (filename) => {
        const ext = filename.split(".").pop()?.toLowerCase();
        const map = {
            ts: "typescript", tsx: "typescript", js: "javascript", jsx: "javascript",
            py: "python", rb: "ruby", go: "go", rs: "rust", java: "java",
            css: "css", html: "html", json: "json", md: "markdown", yml: "yaml", yaml: "yaml",
        };
        return map[ext || ""] || "text";
    };
    const handleReview = async () => {
        setReviewing(true);
        setReviewError("");
        try {
            // Create a pseudo-patch from the full file for review
            const patch = content
                .split("\n")
                .map((line) => `+${line}`)
                .join("\n");
            const result = await reviewCode(path, patch);
            setIssues(result);
            // Save review
            const review = {
                id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                repoFullName,
                prNumber: 0,
                fileName: path,
                issues: result,
                timestamp: new Date().toISOString(),
            };
            saveReview(review);
            result.forEach((issue) => {
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
            const message = e instanceof Error ? e.message : "Review failed. Please try again.";
            setReviewError(message);
            console.error("Review failed:", message);
        }
        finally {
            setReviewing(false);
        }
    };
    return (<div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <FileCode className="h-4 w-4 text-muted-foreground"/>
        <span className="flex-1 text-sm font-medium truncate">{path}</span>
        <button onClick={handleReview} disabled={reviewing} className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {reviewing ? (<>
              <Loader2 className="h-3.5 w-3.5 animate-spin"/> Reviewing...
            </>) : (<>
              <Bot className="h-3.5 w-3.5"/> AI Review File
            </>)}
        </button>
        <button onClick={onClose} className="rounded-md p-1 hover:bg-accent">
          <X className="h-4 w-4 text-muted-foreground"/>
        </button>
      </div>

      <PanelGroup orientation="horizontal" className="flex-1 overflow-hidden">
        {/* Code view */}
        <Panel defaultSize={issues !== null || reviewError ? "68%" : "100%"} minSize="42%" className="overflow-auto scrollbar-thin">
          <div className="font-mono text-xs">
            {lines.map((line, i) => {
            const lineIssues = issues?.filter((iss) => iss.line === i + 1) || [];
            return (<div key={i}>
                  <div className={`flex border-b border-border/20 ${lineIssues.length > 0 ? "bg-warning/10" : ""}`}>
                    <span className="w-12 shrink-0 select-none px-2 py-0.5 text-right text-muted-foreground/50">
                      {i + 1}
                    </span>
                    <pre className="flex-1 px-3 py-0.5 whitespace-pre-wrap break-all text-foreground">
                      {line || " "}
                    </pre>
                  </div>
                  {lineIssues.map((iss, j) => (<div key={j} className="flex border-b border-border/20 bg-warning/5 px-12 py-1">
                      <span className="text-[11px] text-warning">
                        ⚠️ {iss.title}: {iss.description}
                      </span>
                    </div>))}
                </div>);
        })}
          </div>
        </Panel>

        {/* AI review panel */}
        {(issues !== null || reviewError) && (<>
          <ReviewResizeHandle />
          <Panel defaultSize="32%" minSize="380px" maxSize="50%" className="min-w-96 overflow-auto border-l border-border bg-card scrollbar-thin p-3">
            <p className="mb-3 text-xs font-semibold">AI Review Results</p>
            {reviewError ? (<div className="rounded-md border border-destructive/30 bg-destructive/10 p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive"/>
                  <div>
                    <p className="text-xs font-semibold text-destructive">Review unavailable</p>
                    <p className="mt-1 text-xs text-muted-foreground">{reviewError}</p>
                  </div>
                </div>
              </div>) : issues.length === 0 ? (<div className="py-8 text-center">
                <CheckCircle className="mx-auto mb-2 h-8 w-8 text-primary"/>
                <p className="text-xs text-muted-foreground">No issues found!</p>
              </div>) : (<div className="space-y-2">
                {issues.map((issue, i) => (<FileIssueCard key={i} issue={issue}/>))}
              </div>)}
          </Panel>
        </>)}
      </PanelGroup>
    </div>);
}
function ReviewResizeHandle() {
    return (<PanelResizeHandle className="group relative w-2 shrink-0 bg-border/40 transition-colors hover:bg-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <span className="absolute left-1/2 top-1/2 h-10 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-border transition-colors group-hover:bg-primary/70"/>
    </PanelResizeHandle>);
}
function FileIssueCard({ issue }) {
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
    return (<div className="rounded-md border border-border bg-background p-2.5">
      <button onClick={() => setExpanded(!expanded)} className="flex w-full items-start gap-2 text-left">
        <SevIcon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${sevColor}`}/>
        <div className="flex-1">
          <p className="text-xs font-medium">{issue.title}</p>
          <div className="mt-0.5 flex items-center gap-2">
            <span className={`text-[10px] font-medium uppercase ${sevColor}`}>{issue.severity}</span>
            <span className="text-[10px] text-muted-foreground">{issue.category}</span>
            {issue.line && <span className="text-[10px] text-muted-foreground">L{issue.line}</span>}
          </div>
        </div>
        {expanded ? <ChevronDown className="h-3 w-3 text-muted-foreground"/> : <ChevronRight className="h-3 w-3 text-muted-foreground"/>}
      </button>
      {expanded && (<div className="mt-2 space-y-2 border-t border-border pt-2">
          <p className="text-[11px] text-muted-foreground">{issue.description}</p>
          {issue.suggestedFix && (<div>
              <p className="text-[10px] font-semibold text-muted-foreground">Fix:</p>
              <pre className="mt-1 overflow-auto rounded bg-muted p-2 text-[10px] text-foreground scrollbar-thin">
                {issue.suggestedFix}
              </pre>
            </div>)}
        </div>)}
    </div>);
}
