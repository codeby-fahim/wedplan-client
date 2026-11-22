import { MongoClient } from "mongodb";

export async function GET(request: Request) {
  // Reading the request keeps this endpoint dynamic under Cache Components.
  void request.headers.get("host");
  const checks = {
    mongodbUrlSet: Boolean(process.env.MONGODB_URL),
    betterAuthSecretSet: Boolean(process.env.BETTER_AUTH_SECRET),
    betterAuthUrl: process.env.BETTER_AUTH_URL ?? null,
    mongoReachable: false as boolean,
    mongoError: null as string | null,
  };

  if (checks.mongodbUrlSet) {
    const client = new MongoClient(process.env.MONGODB_URL as string, {
      serverSelectionTimeoutMS: 5000,
    });

    try {
      await client.connect();
      await client.db("wedplan").command({ ping: 1 });
      checks.mongoReachable = true;
    } catch (error) {
      checks.mongoError = error instanceof Error ? error.message : "Unknown error";
    } finally {
      await client.close().catch(() => undefined);
    }
  }

  const healthy =
    checks.mongodbUrlSet &&
    checks.betterAuthSecretSet &&
    checks.mongoReachable;

  return Response.json(
    { healthy, checks },
    { status: healthy ? 200 : 503 }
  );
}
