import { APIError, betterAuth } from "better-auth";
import { createAuthMiddleware, getOAuthState } from "better-auth/api";
import { jwt } from "better-auth/plugins";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const client = new MongoClient(process.env.MONGODB_URL as string);
const db = client.db("wedplan");

/** The only roles public registration is allowed to create. */
const PUBLIC_ROLES = ["vendor", "customer"] as const;
type PublicRole = (typeof PUBLIC_ROLES)[number];

function isPublicRole(value: unknown): value is PublicRole {
  return (
    typeof value === "string" &&
    (PUBLIC_ROLES as readonly string[]).includes(value)
  );
}

/** Never let a public request create an admin (or any unknown) role. */
function toPublicRole(value: unknown): PublicRole {
  return isPublicRole(value) ? value : "customer";
}

function assertValidPassword(value: unknown): void {
  const password = typeof value === "string" ? value : "";
  const valid =
    password.length >= 6 && /[A-Z]/.test(password) && /[a-z]/.test(password);

  if (!valid) {
    throw new APIError("BAD_REQUEST", {
      code: "WEAK_PASSWORD",
      message:
        "Password must be at least 6 characters and include one uppercase and one lowercase letter.",
    });
  }
}

export const auth = betterAuth({
  // Be explicit on Vercel — never rely on framework origin inference.
  baseURL: process.env.BETTER_AUTH_URL,

  // better-auth validates the request Origin header (CSRF protection). On
  // Vercel the preview/production hostname is provided in VERCEL_URL, which
  // may differ from BETTER_AUTH_URL. Trust every known client origin.
  trustedOrigins: [
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    "http://localhost:3000",
  ].filter((value): value is string => Boolean(value)),

  database: mongodbAdapter(db, { client }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  // These must match JWT_ISSUER / JWT_AUDIENCE on the API server — it
  // verifies both claims on every authenticated request.
  plugins: [
    jwt({
      jwt: {
        issuer: process.env.JWT_ISSUER ?? "wedplan-server",
        audience: process.env.JWT_AUDIENCE ?? "wedplan-client",
      },
    }),
  ],

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "customer",
        input: true,
      },
      businessName: {
        type: "string",
        required: false,
        defaultValue: null,
        input: true,
      },
      isBlocked: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
      subscriptionPlan: {
        type: "string",
        required: false,
        defaultValue: "free",
        input: false,
      },
      subscriptionExpiresAt: {
        type: "date",
        required: false,
        defaultValue: null,
        input: false,
      },
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        const body = (ctx.body ?? {}) as {
          password?: unknown;
          role?: unknown;
          businessName?: unknown;
        };

        assertValidPassword(body.password);

        if (body.role !== undefined && !isPublicRole(body.role)) {
          throw new APIError("BAD_REQUEST", {
            code: "INVALID_ROLE",
            message: "Invalid account role. Only vendor and customer are allowed.",
          });
        }

        if (
          body.role === "vendor" &&
          (typeof body.businessName !== "string" || !body.businessName.trim())
        ) {
          throw new APIError("BAD_REQUEST", {
            code: "BUSINESS_NAME_REQUIRED",
            message: "A business name is required for vendor accounts.",
          });
        }
      }

      // Profile updates must never be able to escalate a role or flip
      // platform-managed fields. Admin access is assigned out of band.
      if (ctx.path === "/update-user" && ctx.body) {
        const body = ctx.body as Record<string, unknown>;
        delete body.role;
        delete body.isBlocked;
        delete body.subscriptionPlan;
        delete body.subscriptionExpiresAt;
      }
    }),
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // `additionalData` sent through the OAuth flow is available on the
          // callback state. Treat it as untrusted and whitelist it again.
          let role = toPublicRole(user.role);

          try {
            const state = await getOAuthState();
            const oauthRole = state
              ? (state as Record<string, unknown>).role
              : undefined;
            if (isPublicRole(oauthRole)) role = oauthRole;
          } catch {
            // No OAuth state for email/password sign-ups — keep the role above.
          }

          return {
            data: {
              ...user,
              role,
              businessName:
                role === "vendor"
                  ? (typeof user.businessName === "string"
                      ? user.businessName.trim()
                      : "") ||
                    user.name ||
                    "Wedding Vendor"
                  : null,
              // Platform-managed fields are always forced server-side.
              isBlocked: false,
              subscriptionPlan: "free",
              subscriptionExpiresAt: null,
            },
          };
        },
      },
    },
  },
});
