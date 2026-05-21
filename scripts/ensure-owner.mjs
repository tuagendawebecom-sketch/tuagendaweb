import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;

  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] ??= value;
  }
}

function getArgValue(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return "";
  return process.argv[index + 1] ?? "";
}

function requiredValue(value, label) {
  if (!value) throw new Error(`Falta ${label}.`);
  return value;
}

loadEnvFile(resolve(process.cwd(), ".env.local"));

const slug = requiredValue(getArgValue("--slug") || process.env.OWNER_BUSINESS_SLUG, "--slug o OWNER_BUSINESS_SLUG");
const email = requiredValue(getArgValue("--email") || process.env.OWNER_EMAIL, "--email o OWNER_EMAIL");
const password = requiredValue(getArgValue("--password") || process.env.OWNER_PASSWORD, "--password o OWNER_PASSWORD");
const displayName = getArgValue("--name") || process.env.OWNER_NAME || "";

const projectId = requiredValue(process.env.FIREBASE_ADMIN_PROJECT_ID, "FIREBASE_ADMIN_PROJECT_ID");
const clientEmail = requiredValue(process.env.FIREBASE_ADMIN_CLIENT_EMAIL, "FIREBASE_ADMIN_CLIENT_EMAIL");
const privateKey = requiredValue(process.env.FIREBASE_ADMIN_PRIVATE_KEY, "FIREBASE_ADMIN_PRIVATE_KEY").replace(/\\n/g, "\n");

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey
    })
  });
}

const auth = getAuth();
const db = getFirestore();
const businessSnapshot = await db.collection("negocios").where("slug", "==", slug).limit(1).get();
const businessDoc = businessSnapshot.docs[0];

if (!businessDoc) {
  throw new Error(`No existe un negocio con slug "${slug}".`);
}

let user;
try {
  user = await auth.getUserByEmail(email);
  await auth.updateUser(user.uid, {
    email,
    password,
    displayName: displayName || undefined,
    emailVerified: true,
    disabled: false
  });
  console.log(`Usuario dueño actualizado en Firebase Auth: ${email}`);
} catch (error) {
  if (error?.code !== "auth/user-not-found") throw error;

  user = await auth.createUser({
    email,
    password,
    displayName: displayName || undefined,
    emailVerified: true,
    disabled: false
  });
  console.log(`Usuario dueño creado en Firebase Auth: ${email}`);
}

await db.collection("businessUsers").doc(user.uid).set(
  {
    negocioId: businessDoc.id,
    role: "owner",
    isActive: true,
    email,
    updatedAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp()
  },
  { merge: true }
);

await businessDoc.ref.set(
  {
    ownerEmail: email,
    ownerNombre: displayName || businessDoc.data().ownerNombre || "",
    updatedAt: FieldValue.serverTimestamp()
  },
  { merge: true }
);

console.log(`Owner listo. UID: ${user.uid}`);
console.log(`Negocio vinculado: ${businessDoc.id} (${slug})`);
