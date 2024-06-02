import 'dotenv/config';
import * as TonMnemonic from "tonweb-mnemonic";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import TonWeb from "tonweb";
import type { EmbeddedWallet } from './embedded-wallet';
import type { IProposal } from './database';

async function getProvider() {
  const endpoint = await getHttpEndpoint({
    network: "testnet"
  });

  return new TonWeb(new TonWeb.HttpProvider(endpoint));
}

export async function createWallet(chatId: number): Promise<EmbeddedWallet> {
  const walletId = chatId | 0xffffffff;
  // const mnemonic = await TonMnemonic.generateMnemonic();
  const mnemonic = String(process.env.MASTER_SEED_PHRASE).split(' ');
  const { publicKey, secretKey } = await TonMnemonic.mnemonicToKeyPair(mnemonic);

  const tonweb = await getProvider();

  const wallet = tonweb.wallet.create({ publicKey, walletId });

  const address = await wallet.getAddress();
  console.log(`Deployed new wallet ${address.toString(true, true, false, true)}`);

  return {
    wallet,
    address,
    publicKey,
    secretKey,
  };
}

export async function sendTransaction(proposal: IProposal, sender: EmbeddedWallet) {
  const seqno = await sender.wallet.methods.seqno().call();
  return sender.wallet.methods.transfer({
    secretKey: sender.secretKey,
    toAddress: proposal.destinationAddress ?? '',
    amount: TonWeb.utils.toNano(proposal.amount?.toString()),
    seqno: seqno ?? 0,
    payload: proposal.description,
    sendMode: 3,
  }).send();
}

export function getWalletAddress(wallet: EmbeddedWallet): string {
  return wallet.address.toString(true, true, false, true);
}

export async function predictAddress(walletId: number) {
  const mnemonic = String(process.env.MASTER_SEED_PHRASE).split(' ');
  const { publicKey, secretKey } = await TonMnemonic.mnemonicToKeyPair(mnemonic);

  const wallet = tonweb.wallet.create({ publicKey, walletId });

  const address = await wallet.getAddress();
  return address.toString(true, true, false, true);
}
