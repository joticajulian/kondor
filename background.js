var exports = {};
try {
  importScripts(
    "vendor/base64-binary.js",
    "vendor/bs58.bundle.js",
    "vendor/noble-ripemd160.js",
    "vendor/noble-secp256k1.js",
    "vendor/sha256.min.js",
    "js/background/utils.js",
    "js/background/variableblob.js",
    "js/background/serializer.js",
    "js/background/contract.js",
    "js/background/baseAbis.js",
    "js/background/wallet.js"
  );

  const contract = new Contract(abiKoin);
  const ope = contract.encodeOperation({
    name: "transfer",
    args: {
      from: "accountA",
      to: "accountB",
      value: "65535",
    },
  });
  console.log(contract.decodeOperation(ope));
  const w = Wallet.fromSeed("my seed");
  console.log(w);
} catch (e) {
  console.error(e);
}
