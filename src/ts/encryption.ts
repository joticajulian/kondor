import * as storage from "./storage";
import { toHexString, toUint8Array } from "./utils";

async function getOptsEncryption(): Promise<{
  salt: ArrayBufferLike;
  iv: ArrayBufferLike;
}> {
  let saltString = await storage.read<string>("salt", false);
  let ivString = await storage.read<string>("iv", false);
  if (!saltString || !ivString) {
    saltString = toHexString(window.crypto.getRandomValues(new Uint8Array(16)));
    ivString = toHexString(window.crypto.getRandomValues(new Uint8Array(12)));
    await storage.write("salt", saltString);
    await storage.write("iv", ivString);
  }
  const salt = toUint8Array(saltString).buffer;
  const iv = toUint8Array(ivString).buffer;
  return { salt, iv };
}

async function getKeyMaterial(password: string) {
  let enc = new TextEncoder();
  return window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
}

async function getKey(password: string, salt: ArrayBufferLike) {
  const keyMaterial = await getKeyMaterial(password);
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function encrypt(
  data: Record<string, unknown>,
  password: string
): Promise<string> {
  const { salt, iv } = await getOptsEncryption();
  const key = await getKey(password, salt);
  const message = JSON.stringify(data);
  const encoded = new TextEncoder().encode(message);

  const bufferEncrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );
  return toHexString(new Uint8Array(bufferEncrypted));
}

export async function decrypt(
  encrypted: string,
  password: string
): Promise<Record<string, unknown>> {
  const { salt, iv } = await getOptsEncryption();
  const key = await getKey(password, salt);
  let bufferEncrypted;
  try {
    bufferEncrypted = toUint8Array(encrypted);
  } catch (error) {
    throw new Error(`Invalid encryted value (${encrypted})`);
  }

  let decrypted;
  try {
    decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      bufferEncrypted
    );
  } catch (error) {
    throw new Error("Invalid password");
  }

  try {
    const message = new TextDecoder().decode(decrypted);
    return JSON.parse(message);
  } catch (error) {
    throw new Error("Decrypted value cannot be decoded and parsed to JSON");
  }
}
