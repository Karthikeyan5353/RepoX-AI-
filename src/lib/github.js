const GITHUB_API = "https://api.github.com";
function headers(token) {
    return {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
    };
}
async function ghFetch(token, path, opts) {
    const res = await fetch(`${GITHUB_API}${path}`, {
        ...opts,
        headers: { ...headers(token), ...(opts?.headers || {}) },
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`GitHub API error ${res.status}: ${text}`);
    }
    return res.json();
}
export async function fetchUserRepos(token, page = 1) {
    return ghFetch(token, `/user/repos?per_page=100&page=${page}&sort=updated&affiliation=owner,collaborator`);
}
export async function fetchRepo(token, owner, repo) {
    return ghFetch(token, `/repos/${owner}/${repo}`);
}
export async function fetchBranches(token, owner, repo) {
    return ghFetch(token, `/repos/${owner}/${repo}/branches?per_page=100`);
}
export async function fetchPullRequests(token, owner, repo, state = "all") {
    return ghFetch(token, `/repos/${owner}/${repo}/pulls?state=${state}&per_page=30&sort=updated`);
}
export async function fetchPullRequest(token, owner, repo, prNumber) {
    return ghFetch(token, `/repos/${owner}/${repo}/pulls/${prNumber}`);
}
export async function fetchPRFiles(token, owner, repo, prNumber) {
    return ghFetch(token, `/repos/${owner}/${repo}/pulls/${prNumber}/files?per_page=100`);
}
export async function fetchFileContent(token, owner, repo, path, ref) {
    const q = ref ? `?ref=${ref}` : "";
    const data = await ghFetch(token, `/repos/${owner}/${repo}/contents/${path}${q}`);
    return atob(data.content);
}
export async function fetchRepoTree(token, owner, repo, branch) {
    const data = await ghFetch(token, `/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`);
    return data.tree;
}
export async function postPRComment(token, owner, repo, prNumber, body) {
    await ghFetch(token, `/repos/${owner}/${repo}/issues/${prNumber}/comments`, {
        method: "POST",
        body: JSON.stringify({ body }),
    });
}
export async function postPRReviewComment(token, owner, repo, prNumber, body, commitId, path, line) {
    await ghFetch(token, `/repos/${owner}/${repo}/pulls/${prNumber}/comments`, {
        method: "POST",
        body: JSON.stringify({ body, commit_id: commitId, path, line, side: "RIGHT" }),
    });
}
export async function validateToken(token) {
    try {
        const data = await ghFetch(token, "/user");
        return { valid: true, user: data.login };
    }
    catch {
        return { valid: false };
    }
}
