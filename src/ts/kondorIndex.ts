import { provider } from "./kondorProvider";
import { signer } from "./kondorSigner";
import { getAccounts } from "./kondorAccount";

declare const window: { [x: string]: unknown };

window.kondor = { provider, signer, getAccounts };
