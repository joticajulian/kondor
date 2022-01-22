import { provider } from "./kondorProvider";
import { signer } from "./kondorSigner";

declare const window: { [x: string]: unknown };

window.kondor = { provider, signer };
