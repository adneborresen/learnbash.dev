// Cloudflare Pages Function: POST /api/usage. The logic is in src/feedback/.
import { handleUsage, type FeedbackEnv } from "../../src/feedback/server.ts";

export const onRequestPost = ({ request, env }: { request: Request; env: FeedbackEnv }) => handleUsage(request, env);
