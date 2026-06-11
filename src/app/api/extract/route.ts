import { NextRequest, NextResponse } from "next/server";
import { extractLabelFields } from "@/lib/extraction";
import { allowRequest } from "@/lib/rateLimit";
import type { LabelExtraction } from "@/lib/types";

export const maxDuration = 30;

// Same payload cap as /api/verify — the client downscales before upload.
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

function badRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export interface ExtractResponse {
  extraction: LabelExtraction;
  elapsedMs: number;
}

/**
 * POST /api/extract — read a label image and return its transcribed fields,
 * with no application to compare against. Powers "scan to auto-fill": the
 * agent uploads a bottle photo, we pre-fill the form, and they review and
 * correct before the real compliance check runs. Shares the extraction layer
 * with /api/verify, so there is exactly one place that talks to the model.
 */
export async function POST(req: NextRequest) {
  const clientId = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!allowRequest(clientId)) {
    return badRequest("Too many requests — please wait a minute and try again.", 429);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return badRequest("Expected multipart form data.");
  }

  const image = form.get("image");
  if (!(image instanceof File)) {
    return badRequest("Missing label image.");
  }
  if (!ALLOWED_TYPES.has(image.type)) {
    return badRequest("Unsupported image type — please upload a PNG, JPEG, or WebP.");
  }
  if (image.size > MAX_IMAGE_BYTES) {
    return badRequest("Image is too large — please use an image under 4 MB.");
  }

  const started = Date.now();
  try {
    const bytes = Buffer.from(await image.arrayBuffer()).toString("base64");
    const extraction = await extractLabelFields(bytes, image.type);
    const body: ExtractResponse = { extraction, elapsedMs: Date.now() - started };
    return NextResponse.json(body);
  } catch (err) {
    console.error("extract failed:", err);
    return badRequest(
      "The label could not be read right now. Please try again in a moment.",
      502,
    );
  }
}
