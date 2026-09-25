import { redirect } from "next/navigation";

/**
 * FAQ has been unified with the main User Guide page (/guide).
 * Redirect all incoming traffic to the canonical unified destination.
 */
export default function FaqPage() {
  redirect("/guide");
}
