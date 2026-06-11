import type { ExtractResponse } from "@/app/api/extract/route";
import { prepareImage } from "./clientImage";
import type { ApplicationData, BeverageType, LabelExtraction } from "./types";

/**
 * Send a label image to the extraction-only endpoint and return what the
 * vision model read. Large images are downscaled client-side first.
 */
export async function extractFromImage(image: File): Promise<LabelExtraction> {
  const form = new FormData();
  form.append("image", await prepareImage(image));
  let res: Response;
  try {
    res = await fetch("/api/extract", { method: "POST", body: form });
  } catch {
    throw new Error("Could not reach the server — check your connection and try again.");
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.error ?? "Something went wrong while reading the label.");
  }
  return (body as ExtractResponse).extraction;
}

/** Application fields that a label scan can suggest a value for. */
const APP_FIELDS = [
  "brandName", "classType", "alcoholContent", "netContents",
  "bottlerInfo", "countryOfOrigin",
] as const;

export interface AutofillResult {
  /** Form values read off the label (only fields the model could read). */
  values: Partial<ApplicationData>;
  /** Which keys were actually filled — used to highlight drafts for review. */
  filled: (keyof ApplicationData)[];
}

/**
 * Turn a label transcription into a *draft* application the agent reviews.
 *
 * This is a data-entry assist, not a verdict: it copies what is physically on
 * the label into the form so the agent doesn't retype it, then they correct
 * any misread and check it against the real COLA application. Only legible,
 * present fields are suggested; absent/unreadable ones are left blank.
 */
export function autofillFromExtraction(ex: LabelExtraction): AutofillResult {
  const values: Partial<ApplicationData> = {};
  const filled: (keyof ApplicationData)[] = [];

  if (ex.apparentBeverageType !== "unknown") {
    values.beverageType = ex.apparentBeverageType as BeverageType;
    filled.push("beverageType");
  }

  for (const key of APP_FIELDS) {
    const field = ex[key];
    const text = field?.text?.trim();
    if (text && field.legibility !== "absent" && field.legibility !== "unreadable") {
      values[key] = text;
      filled.push(key);
    }
  }

  return { values, filled };
}
