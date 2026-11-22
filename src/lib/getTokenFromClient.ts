import { authClient } from "./auth-client";

/** Get a JWT for the Express API. A single failed token call must not be
 *  treated as "signed out" — retry once after confirming the session. */
export const getTokenFromClient = async (): Promise<string | undefined> => {
  const first = await authClient.token();
  if (first.data?.token) return first.data.token;

  const session = await authClient.getSession();
  if (!session.data) return undefined;

  const retry = await authClient.token();
  return retry.data?.token ?? undefined;
};
