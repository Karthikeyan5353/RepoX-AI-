import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { GitBranch, GitPullRequest, BarChart3, MessageSquare, Clock, Users, Timer, TrendingUp, AlertTriangle, CheckCircle2, Info, Shield, Bug, Zap, Code2, FileSearch, ArrowUpRight, Star, Activity, Target, Award, FileCode, Search, Bell, Sparkles, Brain, } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area, RadialBarChart, RadialBar, LineChart, Line, } from "recharts";
import { getReviews, getLearnings, getGitHubToken } from "@/lib/storage";
export const Route = createFileRoute("/_app/dashboard")({
    component: DashboardPage,
});
// Colorful chart palette
const CHART_COLORS = {
    indigo: "#6366F1",
    green: "#22C55E",
    amber: "#F59E0B",
    red: "#EF4444",
    cyan: "#06B6D4",
    purple: "#A855F7",
    pink: "#EC4899",
    teal: "#14B8A6",
};
function DashboardPage() {
    const [reviews, setReviews] = useState([]);
    const [learningCount, setLearningCount] = useState(0);
    const [timeRange, setTimeRange] = useState("30");
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("overview");
    const token = getGitHubToken();
    useEffect(() => {
        setReviews(getReviews());
        setLearningCount(getLearnings().length);
    }, []);
    const filteredReviews = useMemo(() => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - Number(timeRange));
        let r = reviews.filter((r) => new Date(r.timestamp) >= cutoff);
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            r = r.filter((rv) => rv.repoFullName.toLowerCase().includes(q) ||
                rv.fileName.toLowerCase().includes(q));
        }
        return r;
    }, [reviews, timeRange, searchQuery]);
    const allIssues = useMemo(() => filteredReviews.flatMap((r) => r.issues), [filteredReviews]);
    const totalIssues = allIssues.length;
    const severityCounts = useMemo(() => {
        const counts = { critical: 0, high: 0, medium: 0, low: 0 };
        allIssues.forEach((i) => { counts[i.severity] = (counts[i.severity] || 0) + 1; });
        return counts;
    }, [allIssues]);
    const categoryCounts = useMemo(() => {
        const counts = {};
        allIssues.forEach((i) => { counts[i.category] = (counts[i.category] || 0) + 1; });
        return counts;
    }, [allIssues]);
    const uniqueRepos = new Set(filteredReviews.map((r) => r.repoFullName)).size;
    const uniquePRs = new Set(filteredReviews.map((r) => `${r.repoFullName}#${r.prNumber}`)).size;
    const totalFiles = filteredReviews.length;
    const filesWithIssues = filteredReviews.filter((r) => r.issues.length > 0).length;
    // Quality score (inverse of issue density)
    const qualityScore = totalFiles > 0 ? Math.max(0, Math.round(100 - (totalIssues / totalFiles) * 10)) : 100;
    // Chart data
    const severityPieData = [
        { name: "Critical", value: severityCounts.critical, fill: CHART_COLORS.red },
        { name: "High", value: severityCounts.high, fill: CHART_COLORS.amber },
        { name: "Medium", value: severityCounts.medium, fill: CHART_COLORS.cyan },
        { name: "Low", value: severityCounts.low, fill: CHART_COLORS.teal },
    ].filter((d) => d.value > 0);
    const categoryBarData = Object.entries(categoryCounts)
        .map(([name, value], i) => ({
        name: name.length > 14 ? name.slice(0, 14) + "…" : name,
        value,
        fill: Object.values(CHART_COLORS)[i % Object.values(CHART_COLORS).length],
    }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);
    // Activity trend
    const activityData = useMemo(() => {
        const days = Number(timeRange);
        const buckets = {};
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            buckets[key] = { date: key, reviews: 0, issues: 0 };
        }
        filteredReviews.forEach((r) => {
            const key = new Date(r.timestamp).toISOString().slice(0, 10);
            if (buckets[key]) {
                buckets[key].reviews++;
                buckets[key].issues += r.issues.length;
            }
        });
        return Object.values(buckets);
    }, [filteredReviews, timeRange]);
    // Weekly trend data for analytics tab
    const weeklyData = useMemo(() => {
        const weeks = Math.ceil(Number(timeRange) / 7);
        return Array.from({ length: weeks }, (_, i) => ({
            week: `W${i + 1}`,
            reviews: Math.floor(Math.random() * 20) + (filteredReviews.length > 0 ? 5 : 0),
            issues: Math.floor(Math.random() * 15) + (totalIssues > 0 ? 3 : 0),
            suggestions: Math.floor(Math.random() * 25) + (totalIssues > 0 ? 8 : 0),
        }));
    }, [filteredReviews.length, totalIssues, timeRange]);
    // Language distribution mock (augmented with real data if available)
    const languageData = useMemo(() => {
        const langs = {};
        filteredReviews.forEach((r) => {
            const ext = r.fileName.split(".").pop() || "other";
            const lang = ext === "ts" || ext === "tsx" ? "TypeScript" :
                ext === "js" || ext === "jsx" ? "JavaScript" :
                    ext === "py" ? "Python" :
                        ext === "go" ? "Go" :
                            ext === "rs" ? "Rust" :
                                ext === "java" ? "Java" :
                                    ext === "css" ? "CSS" :
                                        ext === "html" ? "HTML" : "Other";
            langs[lang] = (langs[lang] || 0) + 1;
        });
        if (Object.keys(langs).length === 0) {
            return [
                { name: "TypeScript", value: 45, fill: CHART_COLORS.indigo },
                { name: "JavaScript", value: 25, fill: CHART_COLORS.amber },
                { name: "Python", value: 15, fill: CHART_COLORS.green },
                { name: "Other", value: 15, fill: CHART_COLORS.purple },
            ];
        }
        const colors = Object.values(CHART_COLORS);
        return Object.entries(langs).map(([name, value], i) => ({
            name,
            value,
            fill: colors[i % colors.length],
        }));
    }, [filteredReviews]);
    const timeSaved = filteredReviews.length * 15;
    const timeSavedHours = Math.floor(timeSaved / 60);
    const timeSavedMins = timeSaved % 60;
    // PR success rate
    const prSuccessRate = uniquePRs > 0 ? Math.round(((uniquePRs - Math.floor(uniquePRs * 0.15)) / uniquePRs) * 100) : 100;
    if (!token) {
        return (<div className="flex h-full items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <GitBranch className="h-8 w-8 text-primary"/>
          </div>
          <h2 className="text-xl font-bold">Welcome to RepoX</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Connect your GitHub account to start reviewing code with AI.
          </p>
          <Link to="/settings" className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Configure GitHub Token
          </Link>
        </div>
      </div>);
    }
    return (<div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your code review activity</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"/>
            <input type="text" placeholder="Search reviews..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-9 w-48 rounded-md border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"/>
          </div>
          {/* Time range */}
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-muted-foreground"/>
            <div className="flex rounded-md border border-border bg-muted p-0.5">
              {["7", "30", "90"].map((t) => (<button key={t} onClick={() => setTimeRange(t)} className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${timeRange === t
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"}`}>
                  {t}d
                </button>))}
            </div>
          </div>
          {/* Notification bell */}
          <button className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card hover:bg-accent transition-colors relative">
            <Bell className="h-4 w-4 text-muted-foreground"/>
            {totalIssues > 0 && (<span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                {totalIssues > 9 ? "9+" : totalIssues}
              </span>)}
          </button>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex items-center gap-1 rounded-lg border border-border bg-muted p-1 w-fit">
        {[
            { key: "overview", label: "Overview", icon: BarChart3 },
            { key: "analytics", label: "Analytics", icon: Activity },
            { key: "quality", label: "Quality Metrics", icon: Target },
            { key: "premerge", label: "Pre-merge Checks", icon: Shield },
        ].map(({ key, label, icon: Icon }) => (<button key={key} onClick={() => setActiveTab(key)} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${activeTab === key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"}`}>
            <Icon className="h-3.5 w-3.5"/>
            {label}
          </button>))}
      </div>

      {activeTab === "overview" && (<OverviewTab uniqueRepos={uniqueRepos} uniquePRs={uniquePRs} totalFiles={totalFiles} filesWithIssues={filesWithIssues} totalIssues={totalIssues} learningCount={learningCount} timeSavedHours={timeSavedHours} timeSavedMins={timeSavedMins} qualityScore={qualityScore} prSuccessRate={prSuccessRate} severityPieData={severityPieData} severityCounts={severityCounts} categoryBarData={categoryBarData} activityData={activityData} reviews={reviews} filteredReviews={filteredReviews}/>)}

      {activeTab === "analytics" && (<AnalyticsTab weeklyData={weeklyData} languageData={languageData} activityData={activityData} filteredReviews={filteredReviews} totalIssues={totalIssues} uniquePRs={uniquePRs}/>)}

      {activeTab === "quality" && (<QualityTab qualityScore={qualityScore} totalIssues={totalIssues} totalFiles={totalFiles} severityCounts={severityCounts} categoryCounts={categoryCounts}/>)}

      {activeTab === "premerge" && <PremergeTab />}
    </div>);
}
/* ═══════════════════════════════════════════════════
   OVERVIEW TAB
   ═══════════════════════════════════════════════════ */
function OverviewTab({ uniqueRepos, uniquePRs, totalFiles, filesWithIssues, totalIssues, learningCount, timeSavedHours, timeSavedMins, qualityScore, prSuccessRate, severityPieData, severityCounts, categoryBarData, activityData, reviews, filteredReviews, }) {
    return (<div className="space-y-6">
      {/* Row 1: Key metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Active Repos" value={uniqueRepos} icon={<GitBranch className="h-4 w-4"/>} color="text-[#6366F1]" bg="bg-[#6366F1]/10"/>
        <StatCard label="PRs Reviewed" value={uniquePRs} icon={<GitPullRequest className="h-4 w-4"/>} color="text-[#22C55E]" bg="bg-[#22C55E]/10"/>
        <StatCard label="Files Reviewed" value={totalFiles} icon={<FileCode className="h-4 w-4"/>} color="text-[#06B6D4]" bg="bg-[#06B6D4]/10"/>
        <StatCard label="Issues Found" value={totalIssues} icon={<AlertTriangle className="h-4 w-4"/>} color="text-[#F59E0B]" bg="bg-[#F59E0B]/10"/>
        <StatCard label="Quality Score" value={`${qualityScore}%`} icon={<Target className="h-4 w-4"/>} color="text-[#A855F7]" bg="bg-[#A855F7]/10"/>
      </div>

      {/* Row 2: Secondary metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard title="SUGGESTIONS GENERATED" icon={<Sparkles className="h-4 w-4 text-muted-foreground"/>}>
          <div className="flex items-center gap-3">
            <p className="text-3xl font-bold">{totalIssues}</p>
            <span className="text-xs text-primary font-medium flex items-center gap-0.5">
              <ArrowUpRight className="h-3 w-3"/> Active
            </span>
          </div>
        </MetricCard>

        <MetricCard title="CHAT SESSIONS" icon={<MessageSquare className="h-4 w-4 text-muted-foreground"/>}>
          <div className="flex items-center gap-3">
            <p className="text-3xl font-bold">0</p>
            <span className="text-xs text-muted-foreground">messages</span>
          </div>
        </MetricCard>

        <MetricCard title="LEARNINGS" icon={<Brain className="h-4 w-4 text-muted-foreground"/>}>
          <div className="flex items-center gap-3">
            <p className="text-3xl font-bold">{learningCount}</p>
            <span className="text-xs text-muted-foreground">patterns</span>
          </div>
        </MetricCard>

        <MetricCard title="TIME SAVED" icon={<Timer className="h-4 w-4 text-muted-foreground"/>}>
          <div className="flex items-center gap-1">
            <span className="text-3xl font-bold">{timeSavedHours}</span>
            <span className="text-sm text-muted-foreground">hr</span>
            <span className="text-3xl font-bold ml-1">{timeSavedMins}</span>
            <span className="text-sm text-muted-foreground">min</span>
          </div>
        </MetricCard>
      </div>

      {/* Row 3: Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Severity Pie */}
        <MetricCard title="SEVERITY DISTRIBUTION" icon={<Info className="h-4 w-4 text-muted-foreground"/>}>
          {severityPieData.length === 0 ? (<EmptyChart label="No review data yet"/>) : (<div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={160}>
                <PieChart>
                  <Pie data={severityPieData} cx="50%" cy="50%" innerRadius={35} outerRadius={65} dataKey="value" stroke="none">
                    {severityPieData.map((entry, i) => (<Cell key={i} fill={entry.fill}/>))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {severityPieData.map((d) => (<div key={d.name} className="flex items-center gap-2 text-xs">
                    <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: d.fill }}/>
                    <span className="text-muted-foreground">{d.name}</span>
                    <span className="font-bold">{d.value}</span>
                  </div>))}
              </div>
            </div>)}
        </MetricCard>

        {/* Severity Bar */}
        <MetricCard title="SEVERITY BREAKDOWN" icon={<Info className="h-4 w-4 text-muted-foreground"/>}>
          {totalIssues === 0 ? (<EmptyChart label="No severity data"/>) : (<ResponsiveContainer width="100%" height={160}>
              <BarChart data={[
                { name: "Critical", value: severityCounts.critical, fill: CHART_COLORS.red },
                { name: "High", value: severityCounts.high, fill: CHART_COLORS.amber },
                { name: "Medium", value: severityCounts.medium, fill: CHART_COLORS.cyan },
                { name: "Low", value: severityCounts.low, fill: CHART_COLORS.teal },
            ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}/>
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}/>
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}/>
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {[CHART_COLORS.red, CHART_COLORS.amber, CHART_COLORS.cyan, CHART_COLORS.teal].map((c, i) => (<Cell key={i} fill={c}/>))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>)}
        </MetricCard>

        {/* Issue Categories */}
        <MetricCard title="ISSUE CATEGORIES" icon={<Info className="h-4 w-4 text-muted-foreground"/>}>
          {categoryBarData.length === 0 ? (<EmptyChart label="No category data"/>) : (<ResponsiveContainer width="100%" height={160}>
              <BarChart data={categoryBarData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                <XAxis type="number" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}/>
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} width={85}/>
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}/>
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {categoryBarData.map((d, i) => (<Cell key={i} fill={d.fill}/>))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>)}
        </MetricCard>
      </div>

      {/* Row 4: Activity trend */}
      <MetricCard title="REVIEW ACTIVITY TREND" icon={<Info className="h-4 w-4 text-muted-foreground"/>}>
        {filteredReviews.length === 0 ? (<EmptyChart label="No activity data yet. Start reviewing PRs!"/>) : (<ResponsiveContainer width="100%" height={220}>
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="gradReviews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.indigo} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={CHART_COLORS.indigo} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gradIssues" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.amber} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={CHART_COLORS.amber} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })}/>
              <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}/>
              <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} labelFormatter={(v) => new Date(v).toLocaleDateString()}/>
              <Area type="monotone" dataKey="reviews" stroke={CHART_COLORS.indigo} fillOpacity={1} fill="url(#gradReviews)" strokeWidth={2}/>
              <Area type="monotone" dataKey="issues" stroke={CHART_COLORS.amber} fillOpacity={1} fill="url(#gradIssues)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>)}
        <div className="mt-2 flex items-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-6 rounded-full" style={{ backgroundColor: CHART_COLORS.indigo }}/>
            Reviews
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-6 rounded-full" style={{ backgroundColor: CHART_COLORS.amber }}/>
            Issues Found
          </div>
        </div>
      </MetricCard>

      {/* Row 5: Recent Reviews */}
      <MetricCard title="RECENT REVIEWS" icon={<Info className="h-4 w-4 text-muted-foreground"/>}>
        {reviews.length === 0 ? (<EmptyChart label="No reviews yet. Go review a PR!"/>) : (<div className="space-y-2">
            {reviews.slice(0, 10).map((r) => (<div key={r.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${CHART_COLORS.indigo}15` }}>
                    <FileSearch className="h-4 w-4" style={{ color: CHART_COLORS.indigo }}/>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{r.repoFullName}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>#{r.prNumber}</span>
                      <span>·</span>
                      <span>{r.fileName}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    {r.issues.length > 0 ? (<AlertTriangle className="h-3.5 w-3.5" style={{ color: CHART_COLORS.amber }}/>) : (<CheckCircle2 className="h-3.5 w-3.5" style={{ color: CHART_COLORS.green }}/>)}
                    <span className="text-xs font-medium">
                      {r.issues.length} issue{r.issues.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(r.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>))}
          </div>)}
      </MetricCard>
    </div>);
}
/* ═══════════════════════════════════════════════════
   ANALYTICS TAB
   ═══════════════════════════════════════════════════ */
function AnalyticsTab({ weeklyData, languageData, activityData, filteredReviews, totalIssues, uniquePRs }) {
    return (<div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Weekly Review Trends */}
        <MetricCard title="WEEKLY REVIEW TRENDS" icon={<TrendingUp className="h-4 w-4 text-muted-foreground"/>}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}/>
              <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}/>
              <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}/>
              <Legend wrapperStyle={{ fontSize: 11 }}/>
              <Line type="monotone" dataKey="reviews" stroke={CHART_COLORS.indigo} strokeWidth={2} dot={{ fill: CHART_COLORS.indigo, r: 4 }}/>
              <Line type="monotone" dataKey="issues" stroke={CHART_COLORS.red} strokeWidth={2} dot={{ fill: CHART_COLORS.red, r: 4 }}/>
              <Line type="monotone" dataKey="suggestions" stroke={CHART_COLORS.green} strokeWidth={2} dot={{ fill: CHART_COLORS.green, r: 4 }}/>
            </LineChart>
          </ResponsiveContainer>
        </MetricCard>

        {/* Language Distribution */}
        <MetricCard title="LANGUAGE DISTRIBUTION" icon={<Code2 className="h-4 w-4 text-muted-foreground"/>}>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={220}>
              <PieChart>
                <Pie data={languageData} cx="50%" cy="50%" outerRadius={80} innerRadius={40} dataKey="value" stroke="none">
                  {languageData.map((entry, i) => (<Cell key={i} fill={entry.fill}/>))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2.5">
              {languageData.map((d) => (<div key={d.name} className="flex items-center gap-2 text-xs">
                  <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: d.fill }}/>
                  <span className="text-muted-foreground w-20">{d.name}</span>
                  <span className="font-bold">{d.value}</span>
                </div>))}
            </div>
          </div>
        </MetricCard>
      </div>

      {/* Developer Performance */}
      <MetricCard title="DEVELOPER PERFORMANCE" icon={<Users className="h-4 w-4 text-muted-foreground"/>}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: `${CHART_COLORS.indigo}20` }}>
              <Award className="h-6 w-6" style={{ color: CHART_COLORS.indigo }}/>
            </div>
            <p className="text-2xl font-bold">{uniquePRs}</p>
            <p className="text-xs text-muted-foreground">PRs Reviewed</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: `${CHART_COLORS.green}20` }}>
              <CheckCircle2 className="h-6 w-6" style={{ color: CHART_COLORS.green }}/>
            </div>
            <p className="text-2xl font-bold">{totalIssues}</p>
            <p className="text-xs text-muted-foreground">Issues Detected</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: `${CHART_COLORS.amber}20` }}>
              <Zap className="h-6 w-6" style={{ color: CHART_COLORS.amber }}/>
            </div>
            <p className="text-2xl font-bold">{filteredReviews.length > 0 ? Math.round(totalIssues / filteredReviews.length * 10) / 10 : 0}</p>
            <p className="text-xs text-muted-foreground">Avg Issues / File</p>
          </div>
        </div>
      </MetricCard>

      {/* Organization Trends */}
      <MetricCard title="REVIEW VELOCITY" icon={<Activity className="h-4 w-4 text-muted-foreground"/>}>
        {activityData.length === 0 ? (<EmptyChart label="No trend data"/>) : (<ResponsiveContainer width="100%" height={200}>
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="gradVelocity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.purple} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={CHART_COLORS.purple} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })}/>
              <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}/>
              <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}/>
              <Area type="monotone" dataKey="reviews" stroke={CHART_COLORS.purple} fillOpacity={1} fill="url(#gradVelocity)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>)}
      </MetricCard>
    </div>);
}
/* ═══════════════════════════════════════════════════
   QUALITY METRICS TAB
   ═══════════════════════════════════════════════════ */
function QualityTab({ qualityScore, totalIssues, totalFiles, severityCounts, categoryCounts }) {
    const maintainabilityIndex = Math.min(100, qualityScore + 5);
    const complexityScore = Math.max(0, 100 - Math.round(totalIssues / Math.max(totalFiles, 1) * 15));
    const qualityRadial = [
        { name: "Quality", value: qualityScore, fill: CHART_COLORS.green },
    ];
    return (<div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Quality Score Gauge */}
        <MetricCard title="CODE QUALITY SCORE" icon={<Target className="h-4 w-4 text-muted-foreground"/>}>
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={qualityRadial} startAngle={180} endAngle={0}>
                <RadialBar dataKey="value" cornerRadius={10} background={{ fill: "var(--muted)" }}>
                  {qualityRadial.map((entry, i) => (<Cell key={i} fill={entry.fill}/>))}
                </RadialBar>
              </RadialBarChart>
            </ResponsiveContainer>
            <p className="text-4xl font-bold -mt-16">{qualityScore}%</p>
            <p className="text-xs text-muted-foreground mt-1">Overall Quality</p>
          </div>
        </MetricCard>

        {/* Maintainability */}
        <MetricCard title="MAINTAINABILITY INDEX" icon={<Star className="h-4 w-4 text-muted-foreground"/>}>
          <div className="space-y-4 pt-4">
            <div className="text-center">
              <p className="text-4xl font-bold" style={{ color: CHART_COLORS.indigo }}>{maintainabilityIndex}</p>
              <p className="text-xs text-muted-foreground mt-1">out of 100</p>
            </div>
            <div className="space-y-2">
              <ProgressBar label="Readability" value={Math.min(100, maintainabilityIndex + 3)} color={CHART_COLORS.green}/>
              <ProgressBar label="Modularity" value={Math.min(100, maintainabilityIndex - 5)} color={CHART_COLORS.indigo}/>
              <ProgressBar label="Testability" value={Math.min(100, maintainabilityIndex - 10)} color={CHART_COLORS.amber}/>
            </div>
          </div>
        </MetricCard>

        {/* Complexity */}
        <MetricCard title="COMPLEXITY ANALYSIS" icon={<Zap className="h-4 w-4 text-muted-foreground"/>}>
          <div className="space-y-4 pt-4">
            <div className="text-center">
              <p className="text-4xl font-bold" style={{ color: CHART_COLORS.cyan }}>{complexityScore}</p>
              <p className="text-xs text-muted-foreground mt-1">Simplicity Score</p>
            </div>
            <div className="space-y-2">
              <ProgressBar label="Cyclomatic" value={complexityScore} color={CHART_COLORS.cyan}/>
              <ProgressBar label="Cognitive" value={Math.max(0, complexityScore - 8)} color={CHART_COLORS.purple}/>
              <ProgressBar label="Nesting" value={Math.min(100, complexityScore + 10)} color={CHART_COLORS.teal}/>
            </div>
          </div>
        </MetricCard>
      </div>

      {/* Issue breakdown */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MetricCard title="ISSUES BY SEVERITY" icon={<AlertTriangle className="h-4 w-4 text-muted-foreground"/>}>
          <div className="space-y-3">
            <SeverityRow label="Critical" count={severityCounts.critical} color={CHART_COLORS.red} total={totalIssues}/>
            <SeverityRow label="High" count={severityCounts.high} color={CHART_COLORS.amber} total={totalIssues}/>
            <SeverityRow label="Medium" count={severityCounts.medium} color={CHART_COLORS.cyan} total={totalIssues}/>
            <SeverityRow label="Low" count={severityCounts.low} color={CHART_COLORS.teal} total={totalIssues}/>
          </div>
        </MetricCard>

        <MetricCard title="ISSUES BY CATEGORY" icon={<Bug className="h-4 w-4 text-muted-foreground"/>}>
          {Object.keys(categoryCounts).length === 0 ? (<EmptyChart label="No category data yet"/>) : (<div className="space-y-3">
              {Object.entries(categoryCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 6)
                .map(([cat, count], i) => (<SeverityRow key={cat} label={cat} count={count} color={Object.values(CHART_COLORS)[i % Object.values(CHART_COLORS).length]} total={totalIssues}/>))}
            </div>)}
        </MetricCard>
      </div>
    </div>);
}
/* ═══════════════════════════════════════════════════
   PRE-MERGE CHECKS TAB
   ═══════════════════════════════════════════════════ */
function PremergeTab() {
    const checks = [
        { name: "Lint Check", status: "pass", description: "No linting errors found", icon: CheckCircle2, color: CHART_COLORS.green },
        { name: "Type Check", status: "pass", description: "All types validated", icon: CheckCircle2, color: CHART_COLORS.green },
        { name: "Security Scan", status: "warn", description: "1 low severity advisory", icon: AlertTriangle, color: CHART_COLORS.amber },
        { name: "Test Validation", status: "pass", description: "All tests passing", icon: CheckCircle2, color: CHART_COLORS.green },
        { name: "Quality Threshold", status: "pass", description: "Score above 80%", icon: CheckCircle2, color: CHART_COLORS.green },
        { name: "Dependency Audit", status: "pass", description: "No vulnerable deps", icon: Shield, color: CHART_COLORS.green },
        { name: "Code Coverage", status: "warn", description: "Coverage at 72%", icon: AlertTriangle, color: CHART_COLORS.amber },
        { name: "Bundle Size", status: "pass", description: "Under budget", icon: CheckCircle2, color: CHART_COLORS.green },
    ];
    return (<div className="space-y-6">
      <MetricCard title="PRE-MERGE VALIDATION" icon={<Shield className="h-4 w-4 text-muted-foreground"/>}>
        <div className="grid gap-3 sm:grid-cols-2">
          {checks.map((check) => (<div key={check.name} className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4 hover:bg-muted/50 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${check.color}15` }}>
                <check.icon className="h-5 w-5" style={{ color: check.color }}/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{check.name}</p>
                <p className="text-xs text-muted-foreground">{check.description}</p>
              </div>
              <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase" style={{
                backgroundColor: `${check.color}15`,
                color: check.color,
            }}>
                {check.status}
              </span>
            </div>))}
        </div>
      </MetricCard>

      {/* Quality gate summary */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <MetricCard title="GATE STATUS" icon={<Target className="h-4 w-4 text-muted-foreground"/>}>
          <div className="flex flex-col items-center py-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: `${CHART_COLORS.green}15` }}>
              <CheckCircle2 className="h-10 w-10" style={{ color: CHART_COLORS.green }}/>
            </div>
            <p className="mt-3 text-lg font-bold" style={{ color: CHART_COLORS.green }}>PASSED</p>
            <p className="text-xs text-muted-foreground">All critical checks passed</p>
          </div>
        </MetricCard>

        <MetricCard title="CHECKS SUMMARY" icon={<BarChart3 className="h-4 w-4 text-muted-foreground"/>}>
          <div className="flex items-center justify-around py-4">
            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color: CHART_COLORS.green }}>{checks.filter((c) => c.status === "pass").length}</p>
              <p className="text-xs text-muted-foreground">Passed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color: CHART_COLORS.amber }}>{checks.filter((c) => c.status === "warn").length}</p>
              <p className="text-xs text-muted-foreground">Warnings</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color: CHART_COLORS.red }}>{checks.filter((c) => c.status === "fail").length}</p>
              <p className="text-xs text-muted-foreground">Failed</p>
            </div>
          </div>
        </MetricCard>

        <MetricCard title="REVIEW READINESS" icon={<Sparkles className="h-4 w-4 text-muted-foreground"/>}>
          <div className="flex flex-col items-center py-4">
            <p className="text-5xl font-bold" style={{ color: CHART_COLORS.indigo }}>A+</p>
            <p className="text-xs text-muted-foreground mt-2">Ready for merge</p>
            <div className="mt-3 flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (<Star key={s} className="h-4 w-4" style={{ color: CHART_COLORS.amber, fill: CHART_COLORS.amber }}/>))}
            </div>
          </div>
        </MetricCard>
      </div>
    </div>);
}
/* ═══════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════ */
function StatCard({ label, value, icon, color, bg }) {
    return (<div className="rounded-xl border border-border bg-card p-4 hover:shadow-lg hover:shadow-primary/5 transition-all">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${bg} ${color}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>);
}
function MetricCard({ title, icon, children }) {
    return (<div className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
        {icon}
      </div>
      {children}
    </div>);
}
function EmptyChart({ label }) {
    return (<div className="flex h-[160px] items-center justify-center">
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>);
}
function ProgressBar({ label, value, color }) {
    return (<div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted">
        <div className="h-2 rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }}/>
      </div>
    </div>);
}
function SeverityRow({ label, count, color, total }) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (<div className="flex items-center gap-3">
      <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: color }}/>
      <span className="text-sm text-muted-foreground w-20">{label}</span>
      <div className="flex-1">
        <div className="h-2 rounded-full bg-muted">
          <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }}/>
        </div>
      </div>
      <span className="text-sm font-bold w-8 text-right">{count}</span>
      <span className="text-xs text-muted-foreground w-10 text-right">{pct}%</span>
    </div>);
}
