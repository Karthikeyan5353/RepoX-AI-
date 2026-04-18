import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { BarChart3, TrendingUp, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, } from "recharts";
import { getReviews } from "@/lib/storage";
export const Route = createFileRoute("/_app/reports")({
    component: ReportsPage,
});
function ReportsPage() {
    const [reviews, setReviews] = useState([]);
    const [period, setPeriod] = useState(7);
    useEffect(() => {
        setReviews(getReviews());
    }, []);
    const filteredReviews = useMemo(() => {
        const cutoff = Date.now() - period * 24 * 60 * 60 * 1000;
        return reviews.filter((r) => new Date(r.timestamp).getTime() > cutoff);
    }, [reviews, period]);
    const totalReviews = filteredReviews.length;
    const totalIssues = filteredReviews.reduce((s, r) => s + r.issues.length, 0);
    const avgIssues = totalReviews > 0 ? (totalIssues / totalReviews).toFixed(1) : "0";
    const severityData = useMemo(() => {
        const counts = { critical: 0, high: 0, medium: 0, low: 0 };
        filteredReviews.forEach((r) => r.issues.forEach((i) => {
            counts[i.severity] = (counts[i.severity] || 0) + 1;
        }));
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [filteredReviews]);
    const categoryData = useMemo(() => {
        const counts = {};
        filteredReviews.forEach((r) => r.issues.forEach((i) => {
            counts[i.category] = (counts[i.category] || 0) + 1;
        }));
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [filteredReviews]);
    const trendData = useMemo(() => {
        const days = {};
        for (let i = period - 1; i >= 0; i--) {
            const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const key = d.toISOString().slice(5, 10);
            days[key] = { reviews: 0, issues: 0 };
        }
        filteredReviews.forEach((r) => {
            const key = r.timestamp.slice(5, 10);
            if (days[key]) {
                days[key].reviews++;
                days[key].issues += r.issues.length;
            }
        });
        return Object.entries(days).map(([date, data]) => ({ date, ...data }));
    }, [filteredReviews, period]);
    const COLORS = ["hsl(0 84% 60%)", "hsl(38 92% 50%)", "hsl(217 91% 60%)", "hsl(215 20% 65%)"];
    const CAT_COLORS = ["hsl(142 71% 45%)", "hsl(217 91% 60%)", "hsl(38 92% 50%)", "hsl(0 84% 60%)", "hsl(215 20% 65%)"];
    return (<div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports & Trends</h1>
          <p className="text-sm text-muted-foreground">Code quality insights over time</p>
        </div>
        <div className="flex gap-1 rounded-md bg-muted p-1">
          {[7, 30].map((p) => (<button key={p} onClick={() => setPeriod(p)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${period === p ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {p} days
            </button>))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BarChart3 className="h-4 w-4"/> Reviews
          </div>
          <p className="mt-1 text-2xl font-bold">{totalReviews}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4"/> Issues Found
          </div>
          <p className="mt-1 text-2xl font-bold">{totalIssues}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4"/> Avg Issues/Review
          </div>
          <p className="mt-1 text-2xl font-bold">{avgIssues}</p>
        </div>
      </div>

      {totalReviews === 0 ? (<div className="py-12 text-center">
          <BarChart3 className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30"/>
          <p className="text-sm text-muted-foreground">No activity for this period</p>
          <p className="text-xs text-muted-foreground mt-1">Review some code to see trends here</p>
        </div>) : (<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Review trend line chart */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold">Review Activity</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 25%)"/>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(215 20% 65%)" }}/>
                <YAxis tick={{ fontSize: 10, fill: "hsl(215 20% 65%)" }}/>
                <Tooltip contentStyle={{
                backgroundColor: "hsl(222 47% 11%)",
                border: "1px solid hsl(215 20% 25%)",
                borderRadius: "6px",
                fontSize: "12px",
                color: "hsl(210 40% 98%)",
            }}/>
                <Line type="monotone" dataKey="reviews" stroke="hsl(142 71% 45%)" strokeWidth={2} dot={false} name="Reviews"/>
                <Line type="monotone" dataKey="issues" stroke="hsl(38 92% 50%)" strokeWidth={2} dot={false} name="Issues"/>
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Severity pie chart */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold">Severity Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={severityData.filter((d) => d.value > 0)} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {severityData.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]}/>))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category bar chart */}
          <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
            <h3 className="mb-4 text-sm font-semibold">Issues by Category</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 25%)"/>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215 20% 65%)" }}/>
                <YAxis tick={{ fontSize: 10, fill: "hsl(215 20% 65%)" }}/>
                <Tooltip contentStyle={{
                backgroundColor: "hsl(222 47% 11%)",
                border: "1px solid hsl(215 20% 25%)",
                borderRadius: "6px",
                fontSize: "12px",
                color: "hsl(210 40% 98%)",
            }}/>
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {categoryData.map((_, i) => (<Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]}/>))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>)}
    </div>);
}
