const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Anonymous uploads are needed during sign-up, so this endpoint cannot
// require a session. Bound abuse with a small in-memory per-IP limiter.
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 12;
const buckets = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isRateLimited(key: string) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  bucket.count += 1;
  return bucket.count > RATE_LIMIT;
}

function hasValidImageSignature(bytes: Uint8Array, mime: string) {
  if (mime === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mime === "image/png") {
    return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
      (byte, index) => bytes[index] === byte
    );
  }
  if (mime === "image/gif") {
    return (
      bytes[0] === 0x47 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      (bytes[3] === 0x38 || bytes[3] === 0x39)
    );
  }
  if (mime === "image/webp") {
    return (
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  }
  return false;
}

export async function POST(request: Request) {
  try {
    if (isRateLimited(clientKey(request))) {
      return Response.json(
        { error: "Too many uploads. Please try again in a few minutes." },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json({ error: "Please choose an image file." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json(
        { error: "Only JPG, PNG, WEBP or GIF images are supported." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        { error: "Image must be 5 MB or smaller." },
        { status: 400 }
      );
    }

    const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    if (!hasValidImageSignature(header, file.type)) {
      return Response.json(
        { error: "The file does not appear to be a valid image." },
        { status: 400 }
      );
    }

    // Server-only secret — never expose this with a NEXT_PUBLIC_ prefix.
    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Image upload is not configured." },
        { status: 500 }
      );
    }

    const uploadBody = new FormData();
    uploadBody.append("image", file);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
      { method: "POST", body: uploadBody }
    );

    const result = (await response.json()) as {
      data?: { url?: string };
      error?: { message?: string };
    };

    if (!response.ok || !result.data?.url) {
      return Response.json(
        { error: result.error?.message ?? "Image upload failed. Please try again." },
        { status: 502 }
      );
    }

    return Response.json({ url: result.data.url });
  } catch {
    return Response.json(
      { error: "Image upload failed. Please try again." },
      { status: 500 }
    );
  }
}
