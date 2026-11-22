"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  Loader2,
  LogIn,
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
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { getSafeCallbackHref } from "@/lib/dashboard-routes";
import { cn } from "@/lib/utils";

type Notice = {
  type: "success" | "error";
  title: string;
  message: string;
};

type FieldErrors = {
  email?: string;
  password?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function oauthNotice(error?: string): Notice | null {
  if (!error) return null;

  if (error === "blocked") {
    return {
      type: "error",
      title: "Account blocked",
      message:
        "Your account has been blocked. Please contact WedPlan support for help.",
    };
  }

  return {
    type: "error",
    title: error === "session" ? "Session expired" : "Google sign-in failed",
    message:
      error === "session"
        ? "Your session could not be found. Please sign in again."
        : "We couldn't complete your Google sign-in. Please try again.",
  };
}

export default function SignInForm({
  oauthError,
  callbackUrl,
}: {
  oauthError?: string;
  callbackUrl?: string;
}) {
  const router = useRouter();

  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<Notice | null>(() =>
    oauthNotice(oauthError)
  );
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState<"email" | "google" | null>(null);

  // Never show credentials or a stale "signed in" message when this form
  // is mounted again (e.g. after sign-out or a client-side back navigation).
  useEffect(() => {
    queueMicrotask(() => {
      setValues({ email: "", password: "" });
      setErrors({});
      setShowPassword(false);
      setNotice(oauthNotice(oauthError));
    });
  }, [oauthError]);

  const setValue = (key: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);

    const nextErrors: FieldErrors = {};
    if (!values.email.trim()) nextErrors.email = "Email is required.";
    else if (!EMAIL_PATTERN.test(values.email.trim()))
      nextErrors.email = "Enter a valid email address.";
    if (!values.password) nextErrors.password = "Password is required.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting("email");

    try {
      const result = await authClient.signIn.email({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });

      if (result.error) {
        setNotice({
          type: "error",
          title: "Sign in failed",
          message:
            result.error.message ?? "Invalid email or password. Please try again.",
        });
        return;
      }

      // The sign-in response includes the user's additional fields (role).
      const role = (result.data?.user as { role?: string } | undefined)?.role;
      const destination = getSafeCallbackHref(callbackUrl, role);

      // Drop the credentials as soon as they are no longer needed.
      setValues({ email: "", password: "" });

      setNotice({
        type: "success",
        title: "Welcome back!",
        message: `Signed in successfully. Redirecting you to your dashboard...`,
      });

      window.setTimeout(() => {
        // replace() avoids a back-button loop to /sign-in. Do NOT call
        // refresh() here — it can cancel the in-flight navigation.
        router.replace(destination);
      }, 900);
    } catch {
      setNotice({
        type: "error",
        title: "Something went wrong",
        message: "Please try again in a moment.",
      });
    } finally {
      setSubmitting(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setNotice(null);
    setSubmitting("google");

    try {
      // A shared server endpoint reads the session, then honours a safe
      // dashboard deep link if the proxy supplied one.
      const postLogin = callbackUrl
        ? `/api/post-login?callbackUrl=${encodeURIComponent(callbackUrl)}`
        : "/api/post-login";

      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: postLogin,
        newUserCallbackURL: postLogin,
        errorCallbackURL: "/sign-in?error=google",
      });

      if (result.error) {
        setNotice({
          type: "error",
          title: "Google sign-in failed",
          message: result.error.message ?? "Please try again in a moment.",
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
          Welcome back
        </CardTitle>
        <CardDescription>Sign in to continue planning your big day.</CardDescription>
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

        <form onSubmit={handleSubmit} noValidate autoComplete="off" className="space-y-5">
          <FieldGroup>
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
              <FieldError
                errors={errors.email ? [{ message: errors.email }] : undefined}
              />
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
                  placeholder="Enter your password"
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
              <FieldError
                errors={
                  errors.password ? [{ message: errors.password }] : undefined
                }
              />
            </Field>
          </FieldGroup>

          <Button type="submit" disabled={isBusy} className="h-11 w-full rounded-full">
            {submitting === "email" ? (
              <>
                <Loader2 className="animate-spin" /> Signing in...
              </>
            ) : (
              <>
                <LogIn /> Sign in
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
          New to WedPlan?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-(--brand) hover:underline"
          >
            Create an account
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
