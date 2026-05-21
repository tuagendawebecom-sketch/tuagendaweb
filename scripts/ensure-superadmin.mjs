import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;

  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
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

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta ${name}. Cargalo en .env.local o como variable de entorno antes de ejecutar el script.`);
  }
  return value;
}

function getArgValue(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return "";
  return process.argv[index + 1] ?? "";
}

loadEnvFile(resolve(process.cwd(), ".env.local"));

const email = getArgValue("--email") || process.env.ADMIN_SEED_EMAIL;
const password = getArgValue("--password") || process.env.ADMIN_SEED_PASSWORD;

if (!email || !password) {
  throw new Error("Falta ADMIN_SEED_EMAIL/ADMIN_SEED_PASSWORD o los argumentos --email y --password.");
}

const projectId = requiredEnv("FIREBASE_ADMIN_PROJECT_ID");
const clientEmail = requiredEnv("FIREBASE_ADMIN_CLIENT_EMAIL");
const privateKey = requiredEnv("FIREBASE_ADMIN_PRIVATE_KEY").replace(/\\n/g, "\n");

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

let user;
try {
  user = await auth.getUserByEmail(email);
  await auth.updateUser(user.uid, {
    email,
    password,
    emailVerified: true,
    disabled: false
  });
  console.log(`Usuario actualizado en Firebase Auth: ${email}`);
} catch (error) {
  if (error?.code !== "auth/user-not-found") {
    throw error;
  }

  user = await auth.createUser({
    email,
    password,
    emailVerified: true,
    disabled: false
  });
  console.log(`Usuario creado en Firebase Auth: ${email}`);
}

try {
  await db.collection("businessUsers").doc(user.uid).set(
    {
      role: "superadmin",
      isActive: true,
      email,
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );
} catch (error) {
  if (error?.code === 5) {
    throw new Error(
      "Firebase Auth quedó configurado, pero Firestore respondió NOT_FOUND. Activá Firestore Database en el proyecto Firebase y volvé a ejecutar este script."
    );
  }

  throw error;
}

console.log(`Super Admin listo. UID: ${user.uid}`);
