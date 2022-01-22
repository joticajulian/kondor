export function toUint8Array(hexString) {
  return new Uint8Array(
    hexString
      .match(/[\dA-F]{2}/gi) // separate into pairs
      .map((s) => parseInt(s, 16)) // convert to integers
  );
}

export function toHexString(buffer) {
  return Array.from(buffer)
    .map((n) => `0${Number(n).toString(16)}`.slice(-2))
    .join("");
}
