const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: Request) {
  try {
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

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
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
