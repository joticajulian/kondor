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

  async signTransaction(tx) {
    const blobActiveData = serialize(tx.active_data, abiActiveData);
    const hash = sha256(blobActiveData.buffer);
    console.log("tx id is " + hash);
    const [hex, recovery] = await sign(hash, this.privateKey, {
      recovered: true,
      canonical: true,
    });
    //
    //console.log(ss)

    // compact signature
    const { r, s } = Signature.fromHex(hex);
    const rHex = r.toString(16).padStart(64, "0");
    const sHex = s.toString(16).padStart(64, "0");
    const recId = (recovery + 31).toString(16).padStart(2, "0");
    tx.signature_data = multibase64(toUint8Array(recId + rHex + sHex));
    tx.id = new Multihash(toUint8Array(hash)).toString();
    return tx;
  }
}
