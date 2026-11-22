"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Mail,
  Store,
  UserRound,
  X,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { authClient } from "@/lib/auth-client";
import { getDashboardHref } from "@/lib/dashboard-routes";
import { cn } from "@/lib/utils";

type Role = "vendor" | "customer";

type FormValues = {
  name: string;
  email: string;
  password: string;
  businessName: string;
  role: Role;
};

type Notice = {
  type: "success" | "error";
  title: string;
  message: string;
};

type FieldErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  name: "",
  email: "",
  password: "",
  businessName: "",
  role: "customer",
};

function validate(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.name.trim()) errors.name = "Full name is required.";

  if (!values.email.trim()) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
    errors.email = "Enter a valid email address.";

  if (values.password.length < 6)
    errors.password = "Password must be at least 6 characters.";
  else if (!/[A-Z]/.test(values.password) || !/[a-z]/.test(values.password))
    errors.password = "Include one uppercase and one lowercase letter.";

  if (values.role === "vendor" && !values.businessName.trim())
    errors.businessName = "Business name is required for vendor accounts.";

  return errors;
}

export default function SignUpForm({
  oauthError,
}: {
  oauthError?: string;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<Notice | null>(() =>
    oauthError
      ? {
          type: "error",
          title: "Google sign-in failed",
          message:
            "We couldn't complete your Google sign-in. Please try again or use email registration.",
        }
      : null
  );
  const [showPassword, setShowPassword] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<"email" | "google" | null>(null);

  // Reset any stale credentials/notices when this form is mounted again.
  useEffect(() => {
    queueMicrotask(() => {
      setValues(initialValues);
      setErrors({});
      setShowPassword(false);
      setNotice(
        oauthError
          ? {
              type: "error",
              title: "Google sign-in failed",
              message:
                "We couldn't complete your Google sign-in. Please try again or use email registration.",
            }
          : null
      );
    });
  }, [oauthError]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const setValue = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const passwordChecks = [
    { label: "At least 6 characters", valid: values.password.length >= 6 },
    { label: "One uppercase letter", valid: /[A-Z]/.test(values.password) },
    { label: "One lowercase letter", valid: /[a-z]/.test(values.password) },
  ];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting("email");

    try {
      let image: string | undefined;

      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append("file", imageFile);

        const uploadResponse = await fetch("/api/upload-image", {
          method: "POST",
          body: uploadData,
        });
        const uploadResult = (await uploadResponse.json()) as {
          url?: string;
          error?: string;
        };

        if (!uploadResponse.ok || !uploadResult.url) {
          throw new Error(
            uploadResult.error ?? "Could not upload your profile image."
          );
        }

        image = uploadResult.url;
      }

      const result = await authClient.signUp.email({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        image,
        role: values.role,
        businessName:
          values.role === "vendor" ? values.businessName.trim() : undefined,
      });

      if (result.error) {
        setNotice({
          type: "error",
          title: "Registration failed",
          message:
            result.error.message ??
            "We couldn't create your account. Please try again.",
        });
        return;
      }

      const destination = getDashboardHref(values.role);

      setValues(initialValues);
      setImageFile(null);
      setImagePreview(null);
      setShowPassword(false);
      setNotice({
        type: "success",
        title: "Welcome to WedPlan!",
        message: "Your account is ready. Taking you to your dashboard...",
      });

      window.setTimeout(() => {
        router.replace(destination);
      }, 1200);
    } catch (error) {
      setNotice({
        type: "error",
        title: "Something went wrong",
        message:
          error instanceof Error
            ? error.message
            : "Please try again in a moment.",
      });
    } finally {
      setSubmitting(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setNotice(null);

    if (values.role === "vendor" && !values.businessName.trim()) {
      setErrors((current) => ({
        ...current,
        businessName: "Business name is required for vendor accounts.",
      }));
      toast.error("Business name is required for vendor accounts.");
      return;
    }

    setSubmitting("google");

    try {
      const destination = getDashboardHref(values.role);
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: destination,
        newUserCallbackURL: destination,
        errorCallbackURL: "/sign-up?error=google",
        additionalData: {
          role: values.role,
          businessName:
            values.role === "vendor" ? values.businessName.trim() : undefined,
        },
      });

      if (result.error) {
        setNotice({
          type: "error",
          title: "Google sign-in failed",
          message:
            result.error.message ?? "Please try again in a moment.",
        });
        setSubmitting(null);
      }
      // On success better-auth redirects the browser to the callback URL.
    } catch {
      setNotice({
        type: "error",
        title: "Google sign-in failed",
        message: "Please try again in a moment.",
      });
      setSubmitting(null);
    }
  };

  const isBusy = submitting !== null;

  return (
    <Card className="w-full border-(--brand)/15 bg-(--surface) shadow-[0_24px_70px_-30px_rgba(0,0,0,0.28)]">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-(--text-primary)">
          Create your account
        </CardTitle>
        <CardDescription>
          Join WedPlan and start planning something beautiful.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {notice && (
          <Alert
            variant={notice.type === "error" ? "destructive" : "default"}
            className={cn(
              "mb-5",
              notice.type === "success" &&
                "border-(--brand)/30 bg-(--brand-soft) text-(--text-primary)"
            )}
          >
            {notice.type === "error" ? (
              <AlertCircle />
            ) : (
              <Check className="text-(--brand)" />
            )}
            <AlertTitle>{notice.title}</AlertTitle>
            <AlertDescription>{notice.message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <FieldGroup>
            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                id="name"
                name="name"
                autoComplete="name"
                placeholder="Rakibul Islam"
                value={values.name}
                onChange={(event) => setValue("name", event.target.value)}
                aria-invalid={Boolean(errors.name)}
              />
              <FieldError errors={errors.name ? [{ message: errors.name }] : undefined} />
            </Field>

            <Field data-invalid={Boolean(errors.email)}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="off"
                placeholder="you@example.com"
                value={values.email}
                onChange={(event) => setValue("email", event.target.value)}
                aria-invalid={Boolean(errors.email)}
              />
              <FieldError errors={errors.email ? [{ message: errors.email }] : undefined} />
            </Field>

            <Field data-invalid={Boolean(errors.password)}>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="text-xs font-normal text-(--brand) hover:underline"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Create a password"
                  className="pr-10"
                  value={values.password}
                  onChange={(event) => setValue("password", event.target.value)}
                  aria-invalid={Boolean(errors.password)}
                />
                {showPassword ? (
                  <EyeOff
                    size={16}
                    className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-(--text-secondary)"
                  />
                ) : (
                  <Eye
                    size={16}
                    className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-(--text-secondary)"
                  />
                )}
              </div>

              <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                {passwordChecks.map((check) => (
                  <li
                    key={check.label}
                    className={cn(
                      "flex items-center gap-1 text-xs",
                      check.valid
                        ? "text-(--brand)"
                        : "muted-text"
                    )}
                  >
                    {check.valid ? <Check size={13} /> : <X size={13} />}
                    {check.label}
                  </li>
                ))}
              </ul>
              <FieldError
                errors={errors.password ? [{ message: errors.password }] : undefined}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="profile-image">
                Profile Image <span className="muted-text font-normal">(optional)</span>
              </FieldLabel>
              <input
                ref={fileInputRef}
                id="profile-image"
                name="profileImage"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="sr-only"
                onChange={handleImageChange}
              />
              <div className="relative">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center gap-3 rounded-lg border border-dashed border-(--brand)/40 bg-(--brand-soft)/40 px-3 py-3 pr-10 text-left transition-colors hover:bg-(--brand-soft)"
                >
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Profile preview"
                      width={40}
                      height={40}
                      unoptimized
                      className="size-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex size-10 items-center justify-center rounded-full bg-(--brand)/10 text-(--brand)">
                      <ImagePlus size={18} />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-(--text-primary)">
                      {imageFile ? imageFile.name : "Upload a photo"}
                    </span>
                    <span className="muted-text block text-xs">
                      JPG, PNG, WEBP or GIF · max 5 MB
                    </span>
                  </span>
                </button>
                {imageFile && (
                  <button
                    type="button"
                    aria-label="Remove image"
                    onClick={() => {
                      if (fileInputRef.current) fileInputRef.current.value = "";
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-(--text-secondary) transition-colors hover:bg-(--brand)/10 hover:text-(--brand)"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </Field>

            <Field data-invalid={Boolean(errors.role)}>
              <FieldLabel>Account Role</FieldLabel>
              <RadioGroup
                value={values.role}
                onValueChange={(value) => setValue("role", value as Role)}
                className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                aria-label="Account role"
              >
                <FieldLabel
                  htmlFor="role-vendor"
                  className={cn(
                    "cursor-pointer items-start rounded-xl border p-3 transition-colors",
                    values.role === "vendor"
                      ? "border-(--brand) bg-(--brand-soft)"
                      : "border-border hover:border-(--brand)/50"
                  )}
                >
                  <RadioGroupItem value="vendor" id="role-vendor" className="mt-0.5" />
                  <FieldContent>
                    <FieldTitle className="flex items-center gap-1.5">
                      <Store size={15} className="text-(--brand)" />
                      Vendor
                    </FieldTitle>
                    <FieldDescription>
                      Publish services and manage bookings.
                    </FieldDescription>
                  </FieldContent>
                </FieldLabel>

                <FieldLabel
                  htmlFor="role-customer"
                  className={cn(
                    "cursor-pointer items-start rounded-xl border p-3 transition-colors",
                    values.role === "customer"
                      ? "border-(--brand) bg-(--brand-soft)"
                      : "border-border hover:border-(--brand)/50"
                  )}
                >
                  <RadioGroupItem value="customer" id="role-customer" className="mt-0.5" />
                  <FieldContent>
                    <FieldTitle className="flex items-center gap-1.5">
                      <UserRound size={15} className="text-(--brand)" />
                      Customer
                    </FieldTitle>
                    <FieldDescription>
                      Discover vendors and plan your day.
                    </FieldDescription>
                  </FieldContent>
                </FieldLabel>
              </RadioGroup>
              <FieldDescription>
                Admin accounts are never created through public registration.
              </FieldDescription>
            </Field>

            {values.role === "vendor" && (
              <Field data-invalid={Boolean(errors.businessName)}>
                <FieldLabel htmlFor="businessName">Business Name</FieldLabel>
                <Input
                  id="businessName"
                  name="businessName"
                  autoComplete="organization"
                  placeholder="Dream Wedding Studio"
                  value={values.businessName}
                  onChange={(event) =>
                    setValue("businessName", event.target.value)
                  }
                  aria-invalid={Boolean(errors.businessName)}
                />
                <FieldError
                  errors={
                    errors.businessName
                      ? [{ message: errors.businessName }]
                      : undefined
                  }
                />
              </Field>
            )}
          </FieldGroup>

          <Button type="submit" disabled={isBusy} className="h-11 w-full rounded-full">
            {submitting === "email" ? (
              <>
                <Loader2 className="animate-spin" /> Creating account...
              </>
            ) : (
              <>
                Create account <Mail className="ml-1" />
              </>
            )}
          </Button>

          <FieldSeparator>or</FieldSeparator>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isBusy}
            className="h-11 w-full rounded-full border-(--brand)! text-(--text-primary)! hover:bg-(--brand-soft)!"
          >
            {submitting === "google" ? (
              <Loader2 className="animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
                />
              </svg>
            )}
            Continue with Google
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="muted-text text-sm">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-(--brand) hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
