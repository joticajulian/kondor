var exports = {};
try {
  importScripts(
    "vendor/noble-secp256k1.js",
    "vendor/base64-binary.js",
    "js/background/variableblob.js",
    "js/background/serializer.js",
    "js/background/contract.js",
    "js/background/wallet.js"
  );

  const abi = {
    id: "Mkw96mR+Hh71IWwJoT/2lJXBDl5Q=",
    entries: {
      name: {
        id: 0x76ea4297,
      },
      symbol: {
        id: 0x7e794b24,
      },
      decimals: {
        id: 0x59dc15ce,
      },
      total_supply: {
        id: 0xcf2e8212,
      },
      balance_of: {
        id: 0x15619248,
        args: Type.accountType,
      },
      transfer: {
        id: 0x62efa292,
        args: {
          from: Type.accountType,
          to: Type.accountType,
          value: Type.uint64,
        },
      },
      mint: {
        id: 0xc2f82bdc,
        args: {
          to: Type.accountType,
          value: Type.uint64,
        },
      },
    },
  };

  const contract = new Contract(abi);
  const ope = contract.encodeOperation({
    name: "transfer",
    args: {
      from: "accountA",
      to: "accountB",
      value: "65535",
    },
  });
  console.log(contract.decodeOperation(ope));
} catch (e) {
  console.error(e);
}
