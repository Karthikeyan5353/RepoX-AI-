import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, BarChart3, Brain, FileCode, GitBranch, GitPullRequest, Lock, MessageSquareText, Search, Shield, Sparkles, } from "lucide-react";
export const Route = createFileRoute("/")({
    head: () => ({
        meta: [
            { title: "RepoX - AI-Powered Repository Review" },
            {
                name: "description",
                content: "Review repositories, inspect pull requests, and surface code risks with Gemini-powered AI.",
            },
            { property: "og:title", content: "RepoX - AI-Powered Repository Review" },
            {
                property: "og:description",
                content: "A focused AI review cockpit for GitHub repositories and pull requests.",
            },
        ],
    }),
    component: LandingPage,
});
function LandingPage() {
    return (<div className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,color-mix(in_oklab,var(--primary)_22%,transparent),transparent_28%),radial-gradient(circle_at_80%_0%,color-mix(in_oklab,var(--info)_18%,transparent),transparent_30%),linear-gradient(135deg,color-mix(in_oklab,var(--background)_92%,black),var(--background))]"/>
        <div className="absolute left-1/2 top-0 h-px w-[80vw] -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/60 to-transparent"/>
      </div>

      <nav className="sticky top-0 z-50 border-b border-border/70 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <BrandMark />
          <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#workflow" className="transition-colors hover:text-foreground">Workflow</a>
            <a href="#stack" className="transition-colors hover:text-foreground">Stack</a>
          </div>
          <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-[0_0_28px_color-mix(in_oklab,var(--primary)_28%,transparent)] transition-all hover:-translate-y-0.5 hover:bg-primary/90">
            Open RepoX
          </Link>
        </div>
      </nav>

      <section className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-28">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-primary">
            <Sparkles className="h-3.5 w-3.5"/>
            Gemini powered review cockpit
          </div>
          <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.06em] sm:text-6xl lg:text-7xl">
            Own every repo review with{" "}
            <span className="bg-gradient-to-r from-primary via-info to-warning bg-clip-text text-transparent">
              RepoX
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Connect GitHub, inspect pull requests, review diffs with AI, and keep a local memory of the
            patterns your codebase should avoid.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link to="/dashboard" className="group inline-flex items-center justify-center gap-2.5 rounded-2xl bg-primary px-7 py-3.5 text-base font-black text-primary-foreground shadow-[0_18px_60px_color-mix(in_oklab,var(--primary)_22%,transparent)] transition-all hover:-translate-y-1 hover:bg-primary/90">
              Start Reviewing
            </Link>
            <a href="#features" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border/80 bg-card/60 px-7 py-3.5 text-base font-bold text-foreground transition-all hover:-translate-y-1 hover:bg-accent/70">
              See Features
            </a>
          </div>

          <div className="mt-12 grid max-w-2xl grid-cols-3 gap-3">
            <StatPill value="PR" label="diff review"/>
            <StatPill value="AI" label="risk hints"/>
            <StatPill value="PAT" label="GitHub access"/>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-primary/25 via-info/10 to-warning/15 blur-2xl"/>
          <div className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-card/80 p-4 shadow-2xl backdrop-blur">
            <div className="mb-4 flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <GitBranch className="h-5 w-5"/>
                </div>
                <div>
                  <p className="text-sm font-black">repo-x/core</p>
                  <p className="text-xs text-muted-foreground">Pull request review queue</p>
                </div>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">Live</span>
            </div>
            <div className="grid gap-3">
              <ReviewRow icon={<GitPullRequest />} title="Authentication refactor" meta="8 files changed" score="92"/>
              <ReviewRow icon={<Shield />} title="Payment webhook hardening" meta="3 security notes" score="76"/>
              <ReviewRow icon={<Brain />} title="Gemini review summary" meta="12 suggestions found" score="88"/>
            </div>
            <div className="mt-4 rounded-2xl border border-border/70 bg-background/70 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">Signal Map</p>
                <Activity className="h-4 w-4 text-primary"/>
              </div>
              <div className="flex h-28 items-end gap-2">
                {[44, 72, 58, 86, 65, 92, 74, 98, 81].map((height, index) => (<div key={index} className="flex-1 rounded-t-lg bg-gradient-to-t from-primary/90 to-info/70" style={{ height: `${height}%` }}/>))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-y border-border/70 bg-card/30 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading eyebrow="Feature set" title="Built for repository review, not generic chat"/>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard icon={<Search />} title="Repository explorer" text="Browse repositories, branches, files, and pull requests through a GitHub PAT workflow."/>
            <FeatureCard icon={<Brain />} title="Gemini AI review" text="Analyze diffs and full files with structured issue output, severity, category, and suggested fixes."/>
            <FeatureCard icon={<MessageSquareText />} title="Repo-aware chat" text="Ask targeted questions against the selected repository and file context."/>
            <FeatureCard icon={<BarChart3 />} title="Review analytics" text="Track review activity, issue categories, severity mix, and saved findings over time."/>
            <FeatureCard icon={<FileCode />} title="Inline file inspection" text="Open files, inspect code, and trigger review without leaving the workspace."/>
            <FeatureCard icon={<Lock />} title="Local-first settings" text="Keep GitHub connection and review history in browser storage for a lightweight setup."/>
          </div>
        </div>
      </section>

      <section id="workflow" className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeading eyebrow="Workflow" title="From token to review in four moves"/>
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          <StepCard step="01" title="Connect" text="Add your GitHub personal access token in Settings."/>
          <StepCard step="02" title="Choose" text="Pick a repository, branch, file, or pull request."/>
          <StepCard step="03" title="Review" text="Run Gemini-powered AI review on selected changes."/>
          <StepCard step="04" title="Improve" text="Save learnings or post a review summary back to GitHub."/>
        </div>
      </section>

      <section id="stack" className="border-t border-border/70 py-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-primary">Modern stack</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">React, TanStack, Gemini, GitHub</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {["React", "TanStack", "Gemini", "GitHub API", "Supabase", "Cloudflare"].map((label) => (<span key={label} className="rounded-full border border-border bg-card px-4 py-2 text-sm font-bold text-muted-foreground">
                {label}
              </span>))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border/70 bg-card/30 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <BrandMark compact/>
          <span>© 2026 RepoX. Built for focused code review.</span>
        </div>
      </footer>
    </div>);
}
function BrandMark({ compact = false }) {
    return (<div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 shadow-[0_0_30px_color-mix(in_oklab,var(--primary)_24%,transparent)]">
        <GitBranch className="h-5 w-5 text-primary"/>
      </div>
      {!compact && <span className="text-xl font-black tracking-[-0.04em]">RepoX</span>}
    </div>);
}
function SectionHeading({ eyebrow, title }) {
    return (<div className="max-w-2xl">
      <p className="text-sm font-black uppercase tracking-[0.25em] text-primary">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">{title}</h2>
    </div>);
}
function StatPill({ value, label }) {
    return (<div className="rounded-2xl border border-border/70 bg-card/60 p-4">
      <p className="text-2xl font-black text-primary">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>);
}
function ReviewRow({ icon, title, meta, score }) {
    return (<div className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
          <span className="[&>svg]:h-5 [&>svg]:w-5">{icon}</span>
        </div>
        <div>
          <p className="text-sm font-bold">{title}</p>
          <p className="text-xs text-muted-foreground">{meta}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-lg font-black text-primary">{score}</p>
        <p className="text-[10px] font-bold uppercase text-muted-foreground">score</p>
      </div>
    </div>);
}
function FeatureCard({ icon, title, text }) {
    return (<div className="group rounded-3xl border border-border/70 bg-background/55 p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:bg-card">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
        <span className="[&>svg]:h-6 [&>svg]:w-6">{icon}</span>
      </div>
      <h3 className="text-lg font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>);
}
function StepCard({ step, title, text }) {
    return (<div className="rounded-3xl border border-border/70 bg-card/70 p-6">
      <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm font-black text-primary-foreground">
        {step}
      </div>
      <h3 className="text-lg font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>);
}
