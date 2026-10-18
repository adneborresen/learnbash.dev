// Cloudflare Pages Function: POST /api/feedback. The logic is in src/feedback/.
import { handleFeedback, type FeedbackEnv } from "../../src/feedback/server.ts";

export const onRequestPost = ({ request, env }: { request: Request; env: FeedbackEnv }) => handleFeedback(request, env);
