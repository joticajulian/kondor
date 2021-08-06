function toUint8Array(hexString) {
  return new Uint8Array(
    hexString
      .match(/[\dA-F]{2}/gi) // separate into pairs
      .map((s) => parseInt(s, 16)) // convert to integers
  );
}

function toHexString(buffer) {
  return Array.from(buffer)
    .map((n) => `0${Number(n).toString(16)}`.slice(-2))
    .join("");
}

function bitcoinEncode(buffer, type, compressed = false) {
  let bufferCheck;
  let prefixBuffer;
  let offsetChecksum;
  if (type === "public") {
    bufferCheck = new Uint8Array(25);
    prefixBuffer = new Uint8Array(21);
    bufferCheck[0] = 0;
    prefixBuffer[0] = 0;
    offsetChecksum = 21;
  } else {
    if (compressed) {
      bufferCheck = new Uint8Array(38);
      prefixBuffer = new Uint8Array(34);
      offsetChecksum = 34;
      bufferCheck[33] = 1;
      prefixBuffer[33] = 1;
    } else {
      bufferCheck = new Uint8Array(37);
      prefixBuffer = new Uint8Array(33);
      offsetChecksum = 33;
    }
    bufferCheck[0] = 128;
    prefixBuffer[0] = 128;
  }
  prefixBuffer.set(buffer, 1);
  const firstHash = sha256(prefixBuffer);
  const doubleHash = sha256(toUint8Array(firstHash));
  const checksum = toUint8Array(doubleHash.substring(0, 8));
  bufferCheck.set(buffer, 1);
  bufferCheck.set(checksum, offsetChecksum);
  return bs58.encode(bufferCheck);
}

function bitcoinDecode(value) {
  const buffer = bs58.decode(value);
  const privateKey = new Uint8Array(32);
  const checksum = new Uint8Array(4);
  const prefix = buffer[0];
  buffer.copy(privateKey, 0, 1, 33);
  if (value[0] !== "5") {
    // compressed
    buffer.copy(checksum, 0, 34, 38);
  } else {
    buffer.copy(checksum, 0, 33, 37);
  }
  // TODO: verify prefix and checksum
  return privateKey;
}

function bitcoinAddress(publicKey) {
  const hash = sha256(publicKey);
  const hash160 = ripemd160(toUint8Array(hash));
  return bitcoinEncode(hash160, "public");
}
