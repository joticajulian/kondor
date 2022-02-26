import { Messenger } from "./Messenger";

const messenger = new Messenger();

export async function getAccounts(): Promise<string[]> {
  return messenger.sendDomMessage("popup", "getAccounts", {});
}

export default getAccounts;
