import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/server/auth";
import { uploadToStorage } from "@/lib/storage";
import { AuthorizationError, ValidationError, withErrorHandler } from "@/lib/api/error-handler";
import { ImageUploadSchema } from "@/lib/validation/schemas";

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

const postHandler = async (request: NextRequest) => {
  const user = await verifyAdmin(request);
  if (!user) {
    throw new AuthorizationError("Admin access required");
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new ValidationError("Missing file", { file: "Required field" });
  }

  const parsed = ImageUploadSchema.safeParse({
    filename: file.name,
    contentType: file.type,
  });

  if (!parsed.success) {
    throw new ValidationError("Invalid image upload", {
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    throw new ValidationError("Image is too large", {
      maxSize: MAX_UPLOAD_SIZE,
    });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const result = await uploadToStorage(buffer, safeName);

  return NextResponse.json({
    url: result.url,
    public_id: result.public_id,
    filename: file.name,
  });
};

export const POST = withErrorHandler(postHandler);
