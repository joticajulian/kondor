
const viewUnlock = document.getElementById("view-unlock");
const viewImport = document.getElementById("view-import");
const viewTransfer = document.getElementById("view-transfer");
const inputPrivateKey = document.getElementById("private-key");
const inputPassword = document.getElementById("password");
const buttonImport = document.getElementById("route-pkey");
const buttonGotoImport = document.getElementById("goto-import");
const textBalanceValue = document.getElementById("balance-value");
const textAddress = document.getElementById("address");
const inputTransferTo = document.getElementById("send-address");
const inputTransferAmount = document.getElementById("send-amount");
const textAlert = document.getElementById("text-alert");

let wallet;

async function loadViewAccount(privateKey) {
  if (!privateKey) throw new Error("private key not defined");
  const rpcNode = await getRpcNode();
  wallet = new Wallet({
    signer: Signer.fromWif(privateKey),
    provider: new Provider(rpcNode),
    contract: new Contract({
      id: "Mkw96mR+Hh71IWwJoT/2lJXBDl5Q=",
      entries: {
        transfer: {
          id: 0x62efa292,
          inputs: {
            type: [
              {
                name: "from",
                type: "string",
              },
              {
                name: "to",
                type: "string",
              },
              {
                name: "value",
                type: "uint64",
              },
            ],
          },
        },
        balance_of: {
          id: 0x15619248,
          inputs: { type: "string" },
          outputs: { type: "uint64" },
        },
      },
    }),
  });
  textAddress.innerText = wallet.getAddress();
  const balance = await wallet.readContract({
    name: "balance_of",
    args: wallet.getAddress(),
  });
  let numberBalance =  Number(balance) / 1e8;
  textBalanceValue.innerText = numberBalance.toLocaleString('en');
}

function getSatoshis(value, decimals) {
  if (isNaN(Number(value))) throw new Error(`Invalid value ${value}`);
  let [i, d] = value.replace(",", ".").split(".");
  d = d ? d : "";
  d = d.padEnd(decimals, "0");
  return (
    BigInt(i) * BigInt("1".padEnd(decimals + 1, "0")) +
    BigInt(d)
  ).toString();
}

async function sendKoin() {
  const from = wallet.getAddress();
  const to = inputTransferTo.value;
  const value = getSatoshis(inputTransferAmount.value, 8);
  const tx = await wallet.newTransaction({
    getNonce: true,
    operations: [
      wallet.encodeOperation({
        name: "transfer",
        args: { from, to, value },
      }),
    ],
  });
  await wallet.signTransaction(tx);
  await wallet.sendTransaction(tx);
  textAlert.innerText = "Sent";
  console.log("transaction sent")
}
