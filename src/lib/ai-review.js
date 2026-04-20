import { createServerFn } from "@tanstack/react-start";
function getChatProviderConfig() {
    const geminiApiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
    if (geminiApiKey) {
        const model = process.env.GEMINI_MODEL ?? process.env.AI_MODEL ?? "gemini-2.5-flash";
        return {
            apiKey: geminiApiKey,
            provider: "gemini",
            model,
        };
    }
    if (process.env.OPENAI_API_KEY) {
        return {
            apiKey: process.env.OPENAI_API_KEY,
            provider: "openai-compatible",
            endpoint: "https://api.openai.com/v1/chat/completions",
            model: process.env.AI_MODEL ?? "gpt-4o-mini",
        };
    }
    if (process.env.OPENROUTER_API_KEY) {
        return {
            apiKey: process.env.OPENROUTER_API_KEY,
            provider: "openai-compatible",
            endpoint: "https://openrouter.ai/api/v1/chat/completions",
            model: process.env.AI_MODEL ?? "google/gemini-3-flash-preview",
        };
    }
    return null;
}
async function createChatCompletion(messages) {
    const config = getChatProviderConfig();
    if (!config) {
        throw new Error("No AI API key configured. Add GEMINI_API_KEY to .env and restart the dev server.");
    }
    if (config.provider === "gemini") {
        return createGeminiCompletion(config, messages);
    }
    if (!config.endpoint) {
        throw new Error("AI provider endpoint is not configured.");
    }
    const response = await fetch(config.endpoint, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: config.model,
            messages,
        }),
    });
    if (!response.ok) {
        const text = await response.text();
        console.error("AI provider error:", response.status, text);
        if (response.status === 429) {
            throw new Error("Rate limited. Please wait and try again.");
        }
        if (response.status === 402) {
            throw new Error("AI credits exhausted. Please add funds.");
        }
        throw new Error(`AI request failed: ${response.status}`);
    }
    const result = await response.json();
    return result.choices?.[0]?.message?.content || "";
}
async function createGeminiCompletion(config, messages) {
    const systemInstruction = messages.find((message) => message.role === "system");
    const contents = messages
        .filter((message) => message.role !== "system")
        .map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }],
    }));
    const requestBody = JSON.stringify({
        ...(systemInstruction
            ? { systemInstruction: { parts: [{ text: systemInstruction.content }] } }
            : {}),
        contents,
        generationConfig: {
            temperature: 0.2,
        },
    });
    let lastErrorText = "";
    for (let attempt = 0; attempt < 4; attempt++) {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent`, {
            method: "POST",
            headers: {
                "x-goog-api-key": config.apiKey,
                "Content-Type": "application/json",
            },
            body: requestBody,
        });
        if (response.ok) {
            const result = await response.json();
            return (result.candidates?.[0]?.content?.parts
                ?.map((part) => part.text ?? "")
                .join("") || "");
        }
        const text = await response.text();
        lastErrorText = text;
        console.error("Gemini API error:", response.status, text);
        if (response.status === 400 && text.includes("API key not valid")) {
            throw new Error("Gemini API key is invalid. Check GEMINI_API_KEY in .env and restart the dev server.");
        }
        if (response.status === 429 || response.status === 503) {
            if (attempt < 3) {
                await sleep(1000 * 2 ** attempt);
                continue;
            }
            if (response.status === 429) {
                throw new Error("Gemini rate limit reached. Please wait a minute and try again.");
            }
            throw new Error("Gemini is temporarily overloaded. Please try again in a minute, or set GEMINI_MODEL to another available Gemini model.");
        }
        throw new Error(`Gemini request failed: ${response.status}`);
    }
    throw new Error(`Gemini request failed after retries: ${lastErrorText}`);
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function localReview(filename, patch) {
    const issues = [];
    const addedLines = patch
        .split("\n")
        .map((line, index) => ({ text: line.replace(/^\+/, ""), line: index + 1 }))
        .filter(({ text }) => text.trim());
    for (const { text, line } of addedLines) {
        const trimmed = text.trim();
        if (/\bconsole\.(log|debug|trace)\s*\(/.test(trimmed)) {
            issues.push({
                title: "Debug logging left in code",
                description: "Console debug output can leak implementation details and clutter production logs.",
                suggestedFix: "Remove the debug statement or route it through a controlled logger.",
                severity: "low",
                line,
                category: "code-quality",
            });
        }
        if (/\b(eval|Function)\s*\(/.test(trimmed)) {
            issues.push({
                title: "Dynamic code execution detected",
                description: "Executing generated strings as code is risky and can introduce code injection vulnerabilities.",
                suggestedFix: "Replace dynamic execution with explicit parsing or a safe lookup table.",
                severity: "critical",
                line,
                category: "security",
            });
        }
        if (/dangerouslySetInnerHTML|\.innerHTML\s*=/.test(trimmed)) {
            issues.push({
                title: "Potential unsafe HTML injection",
                description: "Rendering raw HTML can expose the app to cross-site scripting if the content is user-controlled.",
                suggestedFix: "Render structured data instead, or sanitize trusted HTML before assigning it.",
                severity: "high",
                line,
                category: "security",
            });
        }
        if (/(api[_-]?key|secret|token|password)\s*[:=]\s*["'][^"']+["']/i.test(trimmed)) {
            issues.push({
                title: "Possible hardcoded secret",
                description: "Secrets committed in source code can be exposed to users or source control history.",
                suggestedFix: "Move the secret to environment configuration and reference it at runtime.",
                severity: "critical",
                line,
                category: "security",
            });
        }
        if (/\bTODO\b|\bFIXME\b/i.test(trimmed)) {
            issues.push({
                title: "Unresolved TODO or FIXME",
                description: "Unresolved TODO/FIXME comments can hide incomplete behavior or known defects.",
                suggestedFix: "Resolve the item now or track it in an issue with clear ownership.",
                severity: "low",
                line,
                category: "best-practice",
            });
        }
    }
    if (issues.length === 0 && filename.match(/\.(ts|tsx|js|jsx)$/)) {
        return [
            {
                title: "Local review completed",
                description: "No obvious issues were found by the built-in local checks. Configure an AI API key for deeper semantic review.",
                suggestedFix: "Add GEMINI_API_KEY to .env and restart the dev server.",
                severity: "low",
                category: "best-practice",
            },
        ];
    }
    return issues.slice(0, 12);
}
const doReview = createServerFn({ method: "POST" })
    .inputValidator((input) => input)
    .handler(async ({ data }) => {
    const systemPrompt = `You are an expert code reviewer. Analyze the given code diff and identify issues.

For each issue found, respond with a JSON array of objects with these fields:
- title: Short issue title
- description: Detailed explanation
- suggestedFix: Code suggestion to fix the issue
- severity: "low" | "medium" | "high" | "critical"
- line: approximate line number in the diff (optional)
- category: one of "bug", "security", "performance", "code-quality", "best-practice"

If no issues are found, return an empty array [].
Respond ONLY with valid JSON array, no markdown wrapping.`;
    const userPrompt = `Review this diff for file "${data.filename}":\n\n${data.patch}`;
    if (!getChatProviderConfig()) {
        return localReview(data.filename, data.patch);
    }
    const content = await createChatCompletion([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
    ]);
    try {
        // Try to parse, handling possible markdown wrapping
        let cleaned = content.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
        }
        const issues = JSON.parse(cleaned);
        return issues;
    }
    catch {
        console.error("Failed to parse AI response:", content);
        return [];
    }
});
export async function reviewCode(filename, patch) {
    return doReview({ data: { filename, patch } });
}
const doChat = createServerFn({ method: "POST" })
    .inputValidator((input) => input)
    .handler(async ({ data }) => {
    const systemPrompt = `You are an expert code assistant for a GitHub repository. You help developers understand, debug, and improve their code.

Repository context:
${data.repoContext}

You can:
- Explain code and architecture
- Find bugs and suggest fixes
- Optimize functions
- Answer questions about the codebase
- Suggest best practices

Be concise and technical. Use code blocks for examples.`;
    if (!getChatProviderConfig()) {
        return "AI chat needs an API key. Add GEMINI_API_KEY to .env and restart the dev server.";
    }
    return createChatCompletion([
        { role: "system", content: systemPrompt },
        ...data.messages,
    ]);
});
export async function chatWithCode(messages, repoContext) {
    return doChat({ data: { messages, repoContext } });
}
