import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, jwtClient } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";

export const authClient = createAuthClient({
  // No baseURL here: BETTER_AUTH_URL is server-only and is replaced with
  // undefined in the browser. better-auth correctly infers the page origin.
  plugins: [
    inferAdditionalFields<typeof auth>(),
    jwtClient(),
  ],
});

export const { signIn, signUp, useSession } = authClient;
