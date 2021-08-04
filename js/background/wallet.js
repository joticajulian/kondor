class Wallet {
  constructor(privateKey, compressed = true) {
    this.compressed = compressed;
    this.privateKey = privateKey;
    this.publicKey = getPublicKey(privateKey, this.compressed);
    this.address = bitcoinAddress(
      toUint8Array(this.publicKey),
      this.compressed
    );
  }

  static fromWif(wif) {
    const privateKey = bitcoinDecode(wif);
    return new Wallet(toHexString(privateKey));
  }

  static fromSeed(seed) {
    const privateKey = sha256(seed);
    return new Wallet(privateKey);
  }
}
