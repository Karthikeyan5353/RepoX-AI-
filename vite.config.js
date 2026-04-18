import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";

const generatedRouteTreePath = path.resolve(process.cwd(), "src/routeTree.gen.js");

function stripRouteTreeTypeFooter(code) {
    const footerStart = code.indexOf("\nimport type ");
    return footerStart === -1 ? code : code.slice(0, footerStart).trimEnd() + "\n";
}

function javaScriptRouteTreeCompatibility() {
    function cleanGeneratedRouteTree() {
        if (!fs.existsSync(generatedRouteTreePath)) {
            return;
        }
        const code = fs.readFileSync(generatedRouteTreePath, "utf8");
        const nextCode = stripRouteTreeTypeFooter(code);
        if (nextCode !== code) {
            fs.writeFileSync(generatedRouteTreePath, nextCode);
        }
    }

    return {
        name: "javascript-route-tree-compatibility",
        enforce: "pre",
        transform(code, id) {
            if (path.resolve(id.split("?")[0]) !== generatedRouteTreePath) {
                return null;
            }
            return {
                code: stripRouteTreeTypeFooter(code),
                map: null,
            };
        },
        writeBundle() {
            cleanGeneratedRouteTree();
        },
        closeBundle() {
            cleanGeneratedRouteTree();
        },
    };
}

function devHybridActionCompatibility() {
    return {
        name: "dev-hybridaction-compatibility",
        apply: "serve",
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                const url = req.url ? new URL(req.url, "http://localhost") : null;
                if (url?.pathname !== "/hybridaction/zybTrackerStatisticsAction") {
                    next();
                    return;
                }
                const callback = url.searchParams.get("__callback__");
                const isSafeCallback = callback &&
                    /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*$/.test(callback);
                res.statusCode = 200;
                res.setHeader("Cache-Control", "no-store");
                res.setHeader("Content-Type", isSafeCallback
                    ? "application/javascript; charset=utf-8"
                    : "application/json; charset=utf-8");
                res.end(isSafeCallback ? `${callback}({});` : "{}");
            });
        },
    };
}
export default defineConfig(({ command }) => ({
    server: {
        host: "::",
        port: 8080,
    },
    resolve: {
        alias: {
            "@": path.resolve(process.cwd(), "src"),
        },
        dedupe: [
            "react",
            "react-dom",
            "react/jsx-runtime",
            "react/jsx-dev-runtime",
            "@tanstack/react-query",
            "@tanstack/query-core",
        ],
    },
    plugins: [
        tailwindcss(),
        javaScriptRouteTreeCompatibility(),
        ...(command === "build" ? cloudflare({ viteEnvironment: { name: "ssr" } }) : []),
        ...tanstackStart({
            router: {
                generatedRouteTree: "routeTree.gen.js",
                disableTypes: true,
            },
        }),
        react(),
        devHybridActionCompatibility(),
    ],
}));
