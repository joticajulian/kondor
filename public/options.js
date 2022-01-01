const inputRpcNode = document.getElementById("rpc-node");
const buttonSetRpcNode = document.getElementById("set-rpc-node");
const textAlert = document.getElementById("text-alert");

(async () => {
  const rpcNode = await getRpcNode();
  inputRpcNode.value = rpcNode;
})();

buttonSetRpcNode.onclick = async () => {
  await setRpcNode(inputRpcNode.value);
  textAlert.innerText = "Data saved!";
};
