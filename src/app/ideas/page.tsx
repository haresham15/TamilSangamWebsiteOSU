import { redirect } from "next/navigation";

/**
 * /ideas has been consolidated with /suggestions (The Ideas Hearth).
 * Redirect to preserve link equity and eliminate duplicate content indexing.
 */
export default function IdeasPage() {
  redirect("/suggestions");
}
