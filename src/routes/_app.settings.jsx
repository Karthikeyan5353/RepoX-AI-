import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Key, Check, AlertCircle, Trash2, Eye, EyeOff } from "lucide-react";
import { getGitHubToken, setGitHubToken, setGitHubUser, clearGitHubAuth, getGitHubUser } from "@/lib/storage";
import { validateToken } from "@/lib/github";
export const Route = createFileRoute("/_app/settings")({
    component: SettingsPage,
});
function SettingsPage() {
    const [token, setToken] = useState("");
    const [savedToken, setSavedToken] = useState(null);
    const [user, setUser] = useState(null);
    const [status, setStatus] = useState("idle");
    const [showToken, setShowToken] = useState(false);
    useEffect(() => {
        const t = getGitHubToken();
        const u = getGitHubUser();
        if (t) {
            setSavedToken(t);
            setToken(t);
            setStatus("valid");
        }
        if (u)
            setUser(u);
    }, []);
    const handleSave = async () => {
        if (!token.trim())
            return;
        setStatus("validating");
        const result = await validateToken(token.trim());
        if (result.valid) {
            setGitHubToken(token.trim());
            setGitHubUser(result.user);
            setSavedToken(token.trim());
            setUser(result.user);
            setStatus("valid");
        }
        else {
            setStatus("invalid");
        }
    };
    const handleDisconnect = () => {
        clearGitHubAuth();
        setSavedToken(null);
        setUser(null);
        setToken("");
        setStatus("idle");
    };
    return (<div className="mx-auto max-w-2xl p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure your GitHub connection</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
            <Key className="h-5 w-5 text-primary"/>
          </div>
          <div>
            <h3 className="text-sm font-semibold">GitHub Personal Access Token</h3>
            <p className="text-xs text-muted-foreground">
              Required scopes: repo, read:user
            </p>
          </div>
        </div>

        {status === "valid" && user && (<div className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">
            <Check className="h-4 w-4"/>
            Connected as <strong>{user}</strong>
          </div>)}

        {status === "invalid" && (<div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4"/>
            Invalid token. Please check and try again.
          </div>)}

        <div className="relative">
          <input type={showToken ? "text" : "password"} placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" value={token} onChange={(e) => {
            setToken(e.target.value);
            setStatus("idle");
        }} className="w-full rounded-md border border-input bg-input px-3 py-2 pr-10 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"/>
          <button onClick={() => setShowToken(!showToken)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
            {showToken ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
          </button>
        </div>

        <div className="flex gap-2">
          <button onClick={handleSave} disabled={!token.trim() || status === "validating"} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {status === "validating" ? "Validating..." : "Save & Validate"}
          </button>
          {savedToken && (<button onClick={handleDisconnect} className="inline-flex items-center gap-2 rounded-md border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10">
              <Trash2 className="h-4 w-4"/>
              Disconnect
            </button>)}
        </div>

        <div className="rounded-md bg-muted p-3">
          <p className="text-xs text-muted-foreground">
            <strong>How to create a PAT:</strong> Go to GitHub → Settings → Developer settings → Personal access tokens → Generate new token. Select scopes: <code className="rounded bg-background px-1">repo</code> and <code className="rounded bg-background px-1">read:user</code>.
          </p>
        </div>
      </div>
    </div>);
}
