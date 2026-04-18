import fs from "node:fs";
import path from "node:path";

const routeTreePath = path.resolve(process.cwd(), "src/routeTree.gen.js");

if (fs.existsSync(routeTreePath)) {
    const code = fs.readFileSync(routeTreePath, "utf8");
    const footerStart = code.indexOf("import type ");
    if (footerStart !== -1) {
        fs.writeFileSync(routeTreePath, code.slice(0, footerStart).trimEnd() + "\n");
    }
}
