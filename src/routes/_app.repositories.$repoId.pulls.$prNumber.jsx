import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/_app/repositories/$repoId/pulls/$prNumber")({
    component: PRReviewPage,
});
// The PR review page is the core feature - imported separately
import { PRReviewView } from "@/components/PRReviewView";
function PRReviewPage() {
    const { repoId, prNumber } = Route.useParams();
    const fullName = repoId.replace("---", "/");
    return <PRReviewView fullName={fullName} prNumber={Number(prNumber)}/>;
}
