"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Crown, ImagePlus, Loader2, X } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function getInitials(name?: string | null) {
  if (!name?.trim()) return "WP";
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export default function VendorProfileForm() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const [businessError, setBusinessError] = useState<string | undefined>(
    undefined
  );
  const [submitting, setSubmitting] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!session || initialized) return;

    queueMicrotask(() => {
      const user = session.user as typeof session.user & {
        businessName?: string | null;
      };
      setName(user.name ?? "");
      setBusinessName(user.businessName ?? "");
      setInitialized(true);
    });
  }, [session, initialized]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const handleFile = (file: File | null) => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (!file) {
      setImageFile(null);
      setPreview(null);
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Only JPG, PNG, WEBP or GIF images are supported.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image must be 5 MB or smaller.");
      return;
    }

    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setImageFile(file);
    setPreview(url);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let valid = true;
    if (!name.trim()) {
      setNameError("Full name is required.");
      valid = false;
    }
    if (!businessName.trim()) {
      setBusinessError("Business name is required.");
      valid = false;
    }
    if (!valid) return;

    setSubmitting(true);

    try {
      let image: string | undefined;

      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append("file", imageFile);

        const response = await fetch("/api/upload-image", {
          method: "POST",
          body: uploadData,
        });
        const result = (await response.json().catch(() => null)) as {
          url?: string;
          error?: string;
        } | null;

        if (!response.ok || !result?.url) {
          throw new Error(result?.error ?? "Could not upload your photo.");
        }

        image = result.url;
      }

      const update = await authClient.updateUser({
        name: name.trim(),
        businessName: businessName.trim(),
        ...(image ? { image } : {}),
      });

      if (update.error) {
        throw new Error(update.error.message ?? "Could not update your profile.");
      }

      toast.success("Profile updated", {
        description: "Your information has been saved.",
      });
      setImageFile(null);
      setPreview(null);
      router.refresh();
    } catch (error) {
      toast.error("Could not update profile", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (isPending || !session) {
    return <div className="theme-card h-64 animate-pulse" />;
  }

  const currentImage = preview ?? session.user.image ?? undefined;
  const plan = (session.user as typeof session.user & {
    subscriptionPlan?: string;
  }).subscriptionPlan;

  return (
    <Card className="mx-auto w-full max-w-2xl border-(--brand)/15 bg-(--surface)">
      <CardHeader>
        <CardTitle className="font-heading text-xl text-(--text-primary)">
          Business & profile information
        </CardTitle>
        <CardDescription>
          Update the details couples see on your services. Your role and
          subscription can&apos;t be changed here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <FieldGroup>
            <Field>
              <FieldLabel>Profile photo</FieldLabel>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="sr-only"
                onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
              />
              <div className="flex items-center gap-4">
                <Avatar className="size-16">
                  <AvatarImage src={currentImage} alt={name || "Vendor"} />
                  <AvatarFallback>{getInitials(name)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-full"
                  >
                    <ImagePlus /> Choose photo
                  </Button>
                  {preview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (fileInputRef.current) fileInputRef.current.value = "";
                        handleFile(null);
                      }}
                      className="rounded-full"
                    >
                      <X /> Clear
                    </Button>
                  )}
                </div>
              </div>
              {preview && (
                <div className="relative mt-3 size-20 overflow-hidden rounded-lg border border-border">
                  <Image
                    src={preview}
                    alt="New profile preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              )}
            </Field>

            <Field data-invalid={Boolean(nameError)}>
              <FieldLabel htmlFor="vendor-name">Full Name *</FieldLabel>
              <Input
                id="vendor-name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setNameError(undefined);
                }}
                aria-invalid={Boolean(nameError)}
              />
              <FieldError errors={nameError ? [{ message: nameError }] : undefined} />
            </Field>

            <Field data-invalid={Boolean(businessError)}>
              <FieldLabel htmlFor="vendor-business">Business Name *</FieldLabel>
              <Input
                id="vendor-business"
                value={businessName}
                onChange={(event) => {
                  setBusinessName(event.target.value);
                  setBusinessError(undefined);
                }}
                aria-invalid={Boolean(businessError)}
              />
              <FieldError
                errors={businessError ? [{ message: businessError }] : undefined}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="vendor-email">Email</FieldLabel>
              <Input
                id="vendor-email"
                value={session.user.email ?? ""}
                disabled
                className="opacity-70"
              />
            </Field>

            <Field>
              <FieldLabel>Subscription</FieldLabel>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  {plan === "premium" ? <Crown size={13} /> : null}
                  {plan ?? "free"}
                </Badge>
                <span className="muted-text text-xs">Managed in Subscription</span>
              </div>
            </Field>
          </FieldGroup>

          <Button type="submit" disabled={submitting} className="rounded-full">
            {submitting ? (
              <>
                <Loader2 className="animate-spin" /> Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
