const KEYS = {
    githubToken: "repox_github_token",
    githubUser: "repox_github_user",
    reviews: "repox_reviews",
    learnings: "repox_learnings",
};
const LEGACY_KEYS = {
    githubToken: "rabbitreview_github_token",
    githubUser: "rabbitreview_github_user",
    reviews: "rabbitreview_reviews",
    learnings: "rabbitreview_learnings",
};
function getStoredValue(key) {
    const value = localStorage.getItem(KEYS[key]);
    if (value !== null)
        return value;
    const legacyValue = localStorage.getItem(LEGACY_KEYS[key]);
    if (legacyValue !== null) {
        localStorage.setItem(KEYS[key], legacyValue);
    }
    return legacyValue;
}
export function getGitHubToken() {
    return getStoredValue("githubToken");
}
export function setGitHubToken(token) {
    localStorage.setItem(KEYS.githubToken, token);
}
export function getGitHubUser() {
    return getStoredValue("githubUser");
}
export function setGitHubUser(user) {
    localStorage.setItem(KEYS.githubUser, user);
}
export function clearGitHubAuth() {
    localStorage.removeItem(KEYS.githubToken);
    localStorage.removeItem(KEYS.githubUser);
    localStorage.removeItem(LEGACY_KEYS.githubToken);
    localStorage.removeItem(LEGACY_KEYS.githubUser);
}
export function getReviews() {
    try {
        return JSON.parse(getStoredValue("reviews") || "[]");
    }
    catch {
        return [];
    }
}
export function saveReview(review) {
    const reviews = getReviews();
    reviews.unshift(review);
    localStorage.setItem(KEYS.reviews, JSON.stringify(reviews.slice(0, 500)));
}
export function getLearnings() {
    try {
        return JSON.parse(getStoredValue("learnings") || "[]");
    }
    catch {
        return [];
    }
}
export function saveLearning(learning) {
    const learnings = getLearnings();
    const existing = learnings.findIndex((l) => l.pattern === learning.pattern);
    if (existing >= 0) {
        learnings[existing].frequency++;
        learnings[existing].lastUsed = new Date().toISOString();
    }
    else {
        learnings.unshift(learning);
    }
    localStorage.setItem(KEYS.learnings, JSON.stringify(learnings.slice(0, 1000)));
}
export function deleteLearning(id) {
    const learnings = getLearnings().filter((l) => l.id !== id);
    localStorage.setItem(KEYS.learnings, JSON.stringify(learnings));
}
