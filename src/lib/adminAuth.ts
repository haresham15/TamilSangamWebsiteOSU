import { createHash, timingSafeEqual } from "node:crypto";

export function isKnowledgeAdmin(request: Request): boolean {
  const token = process.env.KNOWLEDGE_ADMIN_TOKEN;
  const supplied = request.headers.get("authorization");
  if (!token || !supplied?.startsWith("Bearer ")) return false;
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(token), digest(supplied.slice(7)));
}
