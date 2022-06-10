import { Signer } from "koilib";
import { ethers } from "ethers";

export class HDKoinos {
  hdNode: ethers.utils.HDNode;

  constructor(mnemonic: string) {
    this.hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic);
  }

  static randomMnemonic() {
    return ethers.utils.entropyToMnemonic(
      window.crypto.getRandomValues(new Uint8Array(16))
    );
  }

  deriveKey(path: string): {
    privateKey: string;
    address: string;
  } {
    const key = this.hdNode.derivePath(path);
    const signer = new Signer({
      privateKey: key.privateKey.slice(2),
    });
    return {
      privateKey: signer.getPrivateKey("wif", false),
      address: signer.getAddress(),
    };
  }

  deriveKeyAccount(accIndex: number) {
    return this.deriveKey(`m/44'/659'/${accIndex}'/0/0`);
  }

  deriveKeySigner(accIndex: number, signerIndex: number) {
    return this.deriveKey(`m/44'/659'/${accIndex}'/1/${signerIndex}`);
  }
}

export default HDKoinos;
