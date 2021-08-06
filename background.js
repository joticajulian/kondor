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

  const contract = new Contract(paramsKoinContract);
  const ope = contract.encodeOperation({
    name: "transfer",
    args: {
      from: "accountA",
      to: "accountB",
      value: "65535",
    },
  });
  //console.log(contract.decodeOperation(ope));
  const wallet = Wallet.fromSeed("my seed");
  console.log(wallet.address);
  const op = contract.encodeOperation({
    name: "transfer",
    args: {
      from: wallet.address,
      to: "16mLtpSKPfXUgTStzgrw3hwCTLB3NMUa5Y",
      value: 4,
    },
  });

  const tx = {
    active_data: {
      resource_limit: 1000000,
      nonce: 9,
      operations: [
        {
          type: abiCallContractOperation.name,
          value: op,
        },
      ],
    },
  };
  wallet.signTransaction(tx);
} catch (e) {
  console.error(e);
}
