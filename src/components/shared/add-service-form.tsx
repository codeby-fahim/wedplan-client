"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ImagePlus,
  Loader2,
  MapPin,
  Sparkles,
  X,
} from "lucide-react";

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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  addService,
  updateService,
  type ServicePayload,
  type ServiceRecord,
} from "@/lib/api/service-api";
import { SERVICE_CATEGORIES } from "@/lib/service-categories";
import { cn } from "@/lib/utils";

type FormValues = {
  serviceName: string;
  category: string;
  description: string;
  price: string;
  location: string;
};

type FormErrors = Partial<Record<keyof FormValues | "images", string>>;

type ImageEntry = { file?: File; preview: string; isNew: boolean };

const MAX_IMAGES = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const emptyValues: FormValues = {
  serviceName: "",
  category: "",
  description: "",
  price: "",
  location: "",
};

function valuesFromService(service?: ServiceRecord): FormValues {
  if (!service) return emptyValues;
  return {
    serviceName: service.serviceName,
    category: service.category,
    description: service.description,
    price: String(service.price),
    location: service.location,
  };
}

function imagesFromService(service?: ServiceRecord): ImageEntry[] {
  if (!service) return [];
  return (service.images ?? []).map((url) => ({
    preview: url,
    isNew: false,
  }));
}

function validate(values: FormValues, images: ImageEntry[]): FormErrors {
  const errors: FormErrors = {};

  if (!values.serviceName.trim()) errors.serviceName = "Service name is required.";
  if (!values.category) errors.category = "Choose a service category.";
  if (!values.description.trim()) errors.description = "Description is required.";
  else if (values.description.trim().length < 20)
    errors.description = "Please write at least 20 characters.";

  const price = Number(values.price);
  if (!values.price.trim()) errors.price = "Price is required.";
  else if (!Number.isFinite(price) || price <= 0)
    errors.price = "Price must be a positive number.";

  if (!values.location.trim()) errors.location = "Location is required.";
  if (images.length === 0) errors.images = "Upload at least one service image.";
  else if (images.length > MAX_IMAGES)
    errors.images = `You can upload up to ${MAX_IMAGES} images.`;

  return errors;
}

function fieldErrors(message?: string) {
  return message ? [{ message }] : undefined;
}

export default function AddServiceForm({
  initialService,
  onSaved,
}: {
  initialService?: ServiceRecord;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const isEdit = Boolean(initialService);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<string[]>([]);
  const submittingRef = useRef(false);

  const [values, setValues] = useState<FormValues>(() =>
    valuesFromService(initialService)
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [images, setImages] = useState<ImageEntry[]>(() =>
    imagesFromService(initialService)
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const setValue = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;

    const incoming = Array.from(files);
    const valid: File[] = [];
    let message: string | undefined;

    for (const file of incoming) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        message = "Only JPG, PNG, WEBP or GIF images are supported.";
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        message = "Each image must be 5 MB or smaller.";
        continue;
      }
      valid.push(file);
    }

    const available = MAX_IMAGES - images.length;
    if (valid.length > available) {
      message = `You can upload up to ${MAX_IMAGES} images.`;
    }

    const accepted = valid.slice(0, Math.max(available, 0));
    if (accepted.length > 0) {
      const entries = accepted.map((file) => {
        const preview = URL.createObjectURL(file);
        objectUrlsRef.current.push(preview);
        return { file, preview, isNew: true };
      });
      setImages((current) => [...current, ...entries]);
    }

    setErrors((current) => ({ ...current, images: message }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (preview: string) => {
    const entry = images.find((item) => item.preview === preview);
    if (entry?.isNew) {
      URL.revokeObjectURL(preview);
      objectUrlsRef.current = objectUrlsRef.current.filter((url) => url !== preview);
    }
    setImages((current) => current.filter((item) => item.preview !== preview));
    setErrors((current) => ({ ...current, images: undefined }));
  };

  const resetForm = () => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current = [];
    setImages(imagesFromService(initialService));
    setValues(valuesFromService(initialService));
    setErrors({});
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate(values, images);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please check the highlighted fields.");
      return;
    }

    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);

    try {
      const uploadedImages: string[] = [];

      for (const entry of images) {
        if (!entry.isNew) {
          uploadedImages.push(entry.preview);
          continue;
        }

        const uploadData = new FormData();
        uploadData.append("file", entry.file as File);

        const response = await fetch("/api/upload-image", {
          method: "POST",
          body: uploadData,
        });
        const result = (await response.json().catch(() => null)) as {
          url?: string;
          error?: string;
        } | null;

        if (!response.ok || !result?.url) {
          throw new Error(result?.error ?? "Could not upload your images.");
        }

        uploadedImages.push(result.url);
      }

      const payload: ServicePayload = {
        serviceName: values.serviceName.trim(),
        category: values.category,
        description: values.description.trim(),
        price: Number(values.price),
        location: values.location.trim(),
        images: uploadedImages,
      };

      if (isEdit && initialService) {
        await updateService(initialService.id, payload);
        toast.success("Service updated!", {
          description: "Your changes have been saved.",
        });
        router.refresh();
        onSaved?.();
      } else {
        await addService(payload);
        toast.success("Service submitted!", {
          description:
            "It is now pending admin approval. You can track the status in My Services.",
        });
        resetForm();
        router.push("/dashboard/vendor/services");
        router.refresh();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Please try again in a moment.";

      if (/upload|image/i.test(message)) {
        setErrors((current) => ({ ...current, images: message }));
      }

      toast.error(isEdit ? "Could not update service" : "Submission failed", {
        description: message,
      });
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-3xl border-(--brand)/15 bg-(--surface)">
      <CardHeader>
        <CardTitle className="font-heading text-xl text-(--text-primary)">
          {isEdit ? "Edit service" : "Service details"}
        </CardTitle>
        <CardDescription>
          {isEdit
            ? "Update the details couples see. Fields marked with * are required."
            : "Tell couples what you offer. Fields marked with * are required."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.serviceName)}>
                <FieldLabel htmlFor="serviceName">Service Name *</FieldLabel>
                <Input
                  id="serviceName"
                  name="serviceName"
                  placeholder="Luxury Wedding Photography"
                  value={values.serviceName}
                  onChange={(event) => setValue("serviceName", event.target.value)}
                  aria-invalid={Boolean(errors.serviceName)}
                />
                <FieldError errors={fieldErrors(errors.serviceName)} />
              </Field>

              <Field data-invalid={Boolean(errors.category)}>
                <FieldLabel htmlFor="category">Service Category *</FieldLabel>
                <Select
                  value={values.category}
                  onValueChange={(value) => setValue("category", value ?? "")}
                >
                  <SelectTrigger id="category" aria-invalid={Boolean(errors.category)}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={fieldErrors(errors.category)} />
              </Field>
            </div>

            <Field data-invalid={Boolean(errors.description)}>
              <FieldLabel htmlFor="description">Description *</FieldLabel>
              <Textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Describe your service, what is included, and your approach..."
                value={values.description}
                onChange={(event) => setValue("description", event.target.value)}
                aria-invalid={Boolean(errors.description)}
              />
              <FieldDescription>
                A clear description helps couples decide if you are the right fit.
              </FieldDescription>
              <FieldError errors={fieldErrors(errors.description)} />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.price)}>
                <FieldLabel htmlFor="price">Price (USD) *</FieldLabel>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  placeholder="25000"
                  value={values.price}
                  onChange={(event) => setValue("price", event.target.value)}
                  aria-invalid={Boolean(errors.price)}
                />
                <FieldError errors={fieldErrors(errors.price)} />
              </Field>

              <Field data-invalid={Boolean(errors.location)}>
                <FieldLabel htmlFor="location">Location *</FieldLabel>
                <div className="relative">
                  <MapPin
                    size={16}
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-(--text-secondary)"
                  />
                  <Input
                    id="location"
                    name="location"
                    className="pl-9"
                    placeholder="Dhaka, Bangladesh"
                    value={values.location}
                    onChange={(event) => setValue("location", event.target.value)}
                    aria-invalid={Boolean(errors.location)}
                  />
                </div>
                <FieldError errors={fieldErrors(errors.location)} />
              </Field>
            </div>

            <Field data-invalid={Boolean(errors.images)}>
              <FieldLabel htmlFor="service-images">
                Service Images * <span className="muted-text font-normal">(up to 3)</span>
              </FieldLabel>
              <input
                ref={fileInputRef}
                id="service-images"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                multiple
                className="sr-only"
                onChange={(event) => handleFiles(event.target.files)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={images.length >= MAX_IMAGES}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-(--brand)/40 bg-(--brand-soft)/40 px-4 py-8 text-center transition-colors hover:bg-(--brand-soft) disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="flex size-11 items-center justify-center rounded-full bg-(--brand)/10 text-(--brand)">
                  <ImagePlus size={20} />
                </span>
                <span className="text-sm font-medium text-(--text-primary)">
                  {images.length >= MAX_IMAGES
                    ? "Maximum images reached"
                    : "Click to upload service images"}
                </span>
                <span className="muted-text text-xs">
                  JPG, PNG, WEBP or GIF · max 5 MB each · {images.length}/{MAX_IMAGES} selected
                </span>
              </button>

              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-3 pt-1 min-[360px]:grid-cols-3 sm:grid-cols-4">
                  {images.map((entry, index) => (
                    <div
                      key={`${entry.preview}-${index}`}
                      className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-(--surface-muted)"
                    >
                      <Image
                        src={entry.preview}
                        alt={`Service image ${index + 1}`}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      <button
                        type="button"
                        aria-label={`Remove image ${index + 1}`}
                        onClick={() => removeImage(entry.preview)}
                        className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <FieldError errors={fieldErrors(errors.images)} />
            </Field>
          </FieldGroup>

          {!isEdit && (
            <div
              className={cn(
                "flex items-start gap-2 rounded-lg border border-(--brand)/20",
                "bg-(--brand-soft)/50 px-3 py-2.5 text-xs text-(--text-secondary)"
              )}
            >
              <Sparkles size={15} className="mt-0.5 shrink-0 text-(--brand)" />
              <p>
                New services start with <strong className="text-(--text-primary)">Pending</strong>{" "}
                status and go live after an admin approves them. You can follow the
                approval status in My Services.
              </p>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={resetForm}
              className="rounded-full sm:min-w-28"
            >
              {isEdit ? "Reset" : "Clear"}
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="rounded-full sm:min-w-40"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" /> Saving...
                </>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Submit Service"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
