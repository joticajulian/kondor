import { Signer } from "koilib";
import { HDKoinos } from "./HDKoinos";

export interface EncryptedWalletSigner {
  name: string;
  address: string;
  keyPath?: string;
  encryptedPrivateKey?: string;
}

export interface EncryptedWalletAccount {
  name: string;
  address: string;
  keyPath?: string;
  encryptedPrivateKey?: string;
  signers?: EncryptedWalletSigner[];
}

export interface DecryptedWalletAccount {
  name: string;
  address: string;
  keyPath?: string;
  privateKey: string;
  signers: EncryptedWalletSigner[];
}

interface DecryptAccountsOptions {
  password: string;
  encryptedMnemonic?: string | null;
  encryptedAccounts?: EncryptedWalletAccount[] | null;
  decryptText: (encrypted: string, password: string) => Promise<string>;
  requirePrivateKey?: boolean;
  errorPrefix?: string;
}

function getWalletErrorMessage(message: string, prefix?: string): string {
  if (!prefix) return message;
  return `${prefix}: ${message}`;
}

export async function decryptAccountsWithPassword(
  options: DecryptAccountsOptions
): Promise<{ mnemonic: string | null; accounts: DecryptedWalletAccount[] }> {
  const {
    password,
    encryptedMnemonic,
    encryptedAccounts,
    decryptText,
    requirePrivateKey = false,
    errorPrefix,
  } = options;
  if (!encryptedAccounts || encryptedAccounts.length === 0) {
    throw new Error(
      getWalletErrorMessage("No accounts stored in the wallet", errorPrefix)
    );
  }

  let mnemonic: string | null = null;
  let hdKoinos: HDKoinos | null = null;
  if (encryptedMnemonic) {
    mnemonic = await decryptText(encryptedMnemonic, password);
    hdKoinos = new HDKoinos(mnemonic);
  }

  const accounts = await Promise.all(
    encryptedAccounts.map(async (encryptedAccount) => {
      if (encryptedAccount.keyPath) {
        if (!hdKoinos) {
          throw new Error(
            getWalletErrorMessage(
              `Missing mnemonic for ${encryptedAccount.address}`,
              errorPrefix
            )
          );
        }
        const account = hdKoinos.deriveKey({
          name: encryptedAccount.name,
          keyPath: encryptedAccount.keyPath,
          address: encryptedAccount.address,
        });
        return {
          ...account.public,
          ...account.private,
          signers: encryptedAccount.signers || [],
        };
      }

      let privateKey = "";
      if (encryptedAccount.encryptedPrivateKey) {
        privateKey = await decryptText(encryptedAccount.encryptedPrivateKey, password);
        const signer = Signer.fromWif(privateKey);
        if (signer.getAddress() !== encryptedAccount.address) {
          throw new Error(
            getWalletErrorMessage(
              `Error in "${encryptedAccount.name}". Expected address: ${encryptedAccount.address}. Derived: ${signer.getAddress()}`,
              errorPrefix
            )
          );
        }
      }

      if (requirePrivateKey && !privateKey) {
        throw new Error(
          getWalletErrorMessage(
            `Account ${encryptedAccount.address} has no private key`,
            errorPrefix
          )
        );
      }

      return {
        name: encryptedAccount.name,
        address: encryptedAccount.address,
        privateKey,
        signers: encryptedAccount.signers || [],
      };
    })
  );

  return { mnemonic, accounts };
}
