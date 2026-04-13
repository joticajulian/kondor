import * as storage from "./storage";
import { toHexString, toUint8Array } from "./utils";

export async function getOptsEncryption(): Promise<{
  salt: ArrayBufferLike;
  iv: ArrayBufferLike;
}> {
  let saltString = await storage.read<string>("salt", false);
  let ivString = await storage.read<string>("iv", false);
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi) throw new Error("Crypto API not available");
  if (!saltString || !ivString) {
    saltString = toHexString(cryptoApi.getRandomValues(new Uint8Array(16)));
    ivString = toHexString(cryptoApi.getRandomValues(new Uint8Array(12)));
    await storage.write("salt", saltString);
    await storage.write("iv", ivString);
  }
  const salt = toUint8Array(saltString).buffer;
  const iv = toUint8Array(ivString).buffer;
  return { salt, iv };
}

export async function getKeyMaterial(password: string) {
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi) throw new Error("Crypto API not available");
  let enc = new TextEncoder();
  return cryptoApi.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
}

export async function getKey(password: string, salt: ArrayBufferLike) {
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi) throw new Error("Crypto API not available");
  const keyMaterial = await getKeyMaterial(password);
  return cryptoApi.subtle.deriveKey(
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

export async function encryptText(
  data: string,
  password: string
): Promise<string> {
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi) throw new Error("Crypto API not available");
  const { salt, iv } = await getOptsEncryption();
  const key = await getKey(password, salt);
  const encoded = new TextEncoder().encode(data);
  const bufferEncrypted = await cryptoApi.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );
  return toHexString(new Uint8Array(bufferEncrypted));
}

export async function decryptText(
  encrypted: string,
  password: string
): Promise<string> {
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi) throw new Error("Crypto API not available");
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
    decrypted = await cryptoApi.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      bufferEncrypted
    );
  } catch (error) {
    throw new Error("Invalid password");
  }
  return new TextDecoder().decode(decrypted);
}

export async function encrypt(
  data: Record<string, unknown>,
  password: string
): Promise<string> {
  const message = JSON.stringify(data);
  return encryptText(message, password);
}

export async function decrypt(
  encrypted: string,
  password: string
): Promise<Record<string, unknown>> {
  try {
    const message = await decryptText(encrypted, password);
    return JSON.parse(message);
  } catch (error) {
    throw new Error("Decrypted value cannot be decoded and parsed to JSON");
  }
}
