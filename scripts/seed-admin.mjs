import "dotenv/config";
import { MongoClient, ObjectId } from "mongodb";
import { hashPassword } from "better-auth/crypto";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME?.trim() || "WedPlan Admin";

if (!email || !password) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD before running this script.");
  process.exit(1);
}

if (password.length < 6 || !/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
  console.error(
    "ADMIN_PASSWORD must be at least 6 characters with one uppercase and one lowercase letter."
  );
  process.exit(1);
}

const client = new MongoClient(process.env.MONGODB_URL);
await client.connect();

const db = client.db("wedplan");
const users = db.collection("user");
const accounts = db.collection("account");

let user = await users.findOne({ email });
const now = new Date();

if (!user) {
  const result = await users.insertOne({
    name,
    email,
    emailVerified: true,
    image: null,
    role: "admin",
    businessName: "WedPlan",
    isBlocked: false,
    subscriptionPlan: "free",
    subscriptionExpiresAt: null,
    createdAt: now,
    updatedAt: now,
  });
  user = await users.findOne({ _id: result.insertedId });
} else if (user.role !== "admin") {
  console.error(
    `An account with ${email} already exists with role "${user.role}". Refusing to promote it.`
  );
  await client.close();
  process.exit(1);
}

const passwordHash = await hashPassword(password);

await accounts.updateOne(
  { userId: user._id, providerId: "credential" },
  {
    $set: {
      accountId: new ObjectId().toString(),
      password: passwordHash,
      updatedAt: now,
    },
    $setOnInsert: { createdAt: now },
  },
  { upsert: true }
);

console.log(`Admin ready: ${email}`);
console.log("Use ADMIN_EMAIL / ADMIN_PASSWORD from your environment to sign in.");

await client.close();
