
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
var iframe = document.getElementById('theFrame');

let koin;
let provider;
let signer;
let sandbox = {
  reqIds: [],
};

async function sendSandbox(command, args) {
  const reqId = Math.round(Math.random()*1000);
  sandbox.reqIds.push(reqId); 
  return await new Promise((resolve, reject) => {
    // prepare the listener
    const listener = (event) => {
      const { id, result, error } = event.data;
      if (!id) return;
      const i = sandbox.reqIds.findIndex(r => r === id);
      if (i < 0) return;
      sandbox.reqIds.splice(i, 1);
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
      window.removeEventListener("message", listener);
    }

    // listen
    window.addEventListener("message", listener);

    // send request
    iframe.contentWindow.postMessage({
      id: reqId,
      command,
      args,
    }, '*');
  });
}

const serializer = {
  serialize: async (...args) => {
    return sendSandbox("serialize", args);
  },
  deserialize: async (...args) => {
    return sendSandbox("deserialize", args);
  },
  setTypes: async (types) => {
    return sendSandbox("setTypes", types);
  }
}

const serializerTx = {
  serialize: async (...args) => {
    return sendSandbox("serializeTx", args);
  },
  deserialize: async (...args) => {
    return sendSandbox("deserializeTx", args);
  },
}

async function loadViewAccount(privKeyWif) {
  if (!privKeyWif) throw new Error("private key not defined");
  const rpcNode = await getRpcNode();
  provider = new Provider([rpcNode]);
  signer = Signer.fromWif(privKeyWif);
  signer.provider = provider;
  signer.serializer = serializerTx;
  await serializer.setTypes(utils.Krc20Abi.types);
  const koinContract = new Contract({
    id: "19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ",
    abi: utils.Krc20Abi,
    signer,
    serializer,
  });
  koinContract.abi.methods.balanceOf.preformatInput = (owner) =>
    ({ owner });
  koinContract.abi.methods.balanceOf.preformatOutput = (res) =>
    utils.formatUnits(res.value, 8);
  koinContract.abi.methods.transfer.preformatInput = (input) => ({
    from: signer.getAddress(),
    to: input.to,
    value: utils.parseUnits(input.value, 8),
  });
  koin = koinContract.functions;
  textAddress.innerText = signer.getAddress();
  await loadBalance();
}

function elapsedTime(iniTime) {
  return Math.round((Date.now() - iniTime)/1000);
}

async function loadBalance() {
  const balance = await koin.balanceOf(signer.getAddress());
  textBalanceValue.innerText = balance.result;
}

async function sendKoin() {
  const resTransfer = await koin.transfer({
    to: inputTransferTo.value,
    value: inputTransferAmount.value
  });
  alertSuccess("Sent. Waiting to be mined");
  const iniTime = Date.now();
  console.log("transaction sent");
  let blocknumber = 0
  while (true) {
    const { head_topology } = await provider.getHeadInfo()
    if (blocknumber !== head_topology.height) {
      blocknumber = head_topology.height;
      const [block] = await provider.getBlocks(Number(blocknumber), 1, head_topology.id);
      if (block && block.block && block.block.transactions) {
        console.log(`block ${blocknumber} has transactions`)
        const tx = block.block.transactions.find(t => t.id === resTransfer.transaction.id);
        if (tx) {
          console.log(`tx mined in block ${blocknumber}`);
          alertSuccess(`Transaction mined in block ${blocknumber}`);
          break;
        } else {
          console.log(`tx ${resTransfer.transaction.id} not found here`)
        }
      } else {
        console.log(`block ${blocknumber} without transactions`)
      }
    }
    alertSuccess(`Sent. Waiting to be mined (${elapsedTime(iniTime)}s)`);
    await new Promise(r => setTimeout(r, 1000));
  }
  await loadBalance();
}
