import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, AlertTriangle, CheckCircle2, ExternalLink, FileCode, GitPullRequest, Info } from "lucide-react";
import { getReviews } from "@/lib/storage";

export const Route = createFileRoute("/_app/reports/$reviewId")({
    component: ReviewDetailPage,
});

const severityStyles = {
    critical: "border-destructive/40 bg-destructive/10 text-destructive",
    high: "border-warning/40 bg-warning/10 text-warning",
    medium: "border-info/40 bg-info/10 text-info",
    low: "border-border bg-muted/40 text-muted-foreground",
};

function ReviewDetailPage() {
    const { reviewId } = Route.useParams();
    const review = getReviews().find((item) => item.id === reviewId);

    if (!review) {
        return (<div className="p-6">
      <Link to="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4"/>
        Back to dashboard
      </Link>
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <Info className="mx-auto mb-3 h-10 w-10 text-muted-foreground"/>
        <h1 className="text-lg font-semibold">Review not found</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This saved review may have been deleted from local storage.
        </p>
      </div>
    </div>);
    }

    const repoId = review.repoFullName.replace("/", "---");
    const hasPr = Number(review.prNumber) > 0;

    return (<div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <Link to="/dashboard" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4"/>
            Back to dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileCode className="h-5 w-5"/>
            </div>
            <div>
              <h1 className="text-xl font-bold">{review.repoFullName}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {hasPr ? `Pull request #${review.prNumber}` : "Direct file review"} · {new Date(review.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to="/repositories/$repoId" params={{ repoId }} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <ExternalLink className="h-3.5 w-3.5"/>
            Open repository
          </Link>
          {hasPr && (<Link to="/repositories/$repoId/pulls/$prNumber" params={{ repoId, prNumber: String(review.prNumber) }} className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              <GitPullRequest className="h-3.5 w-3.5"/>
              Open PR review
            </Link>)}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="File" value={review.fileName} icon={<FileCode className="h-4 w-4"/>}/>
        <SummaryCard label="Issues" value={String(review.issues.length)} icon={<AlertTriangle className="h-4 w-4"/>}/>
        <SummaryCard label="Status" value={review.issues.length === 0 ? "Clean" : "Needs attention"} icon={review.issues.length === 0 ? <CheckCircle2 className="h-4 w-4"/> : <AlertTriangle className="h-4 w-4"/>}/>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">Review results</h2>
          <p className="mt-1 text-xs text-muted-foreground">{review.fileName}</p>
        </div>

        {review.issues.length === 0 ? (<div className="p-8 text-center">
            <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-primary"/>
            <p className="text-sm font-medium">No issues found in this review.</p>
            <p className="mt-1 text-xs text-muted-foreground">RepoX did not detect actionable problems for this file.</p>
          </div>) : (<div className="divide-y divide-border">
            {review.issues.map((issue, index) => (<div key={`${issue.title}-${index}`} className="p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase ${severityStyles[issue.severity] || severityStyles.low}`}>
                        {issue.severity}
                      </span>
                      <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {issue.category}
                      </span>
                      {issue.line && (<span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          Line {issue.line}
                        </span>)}
                    </div>
                    <h3 className="mt-3 text-sm font-semibold">{index + 1}. {issue.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{issue.description}</p>
                  </div>
                </div>
                {issue.suggestedFix && (<div className="mt-4 rounded-lg border border-border bg-muted/40 p-3">
                    <p className="mb-2 text-xs font-semibold text-muted-foreground">Suggested fix</p>
                    <pre className="overflow-auto whitespace-pre-wrap text-xs leading-5 text-foreground">{issue.suggestedFix}</pre>
                  </div>)}
              </div>))}
          </div>)}
      </div>
    </div>);
}

function SummaryCard({ label, value, icon }) {
    return (<div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="truncate text-sm font-medium">{value}</p>
    </div>);
}
