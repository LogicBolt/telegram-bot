import "dotenv/config";
import * as TonMnemonic from "tonweb-mnemonic";
import TonWeb from "tonweb";
import type { EmbeddedWallet } from "./embedded-wallet";
import type { IProposal } from "./database";

const provider = new TonWeb.HttpProvider(
  "https://testnet.toncenter.com/api/v2/jsonRPC",
  { apiKey: "" }
);
const tonweb = new TonWeb(provider);

export async function createWallet(chatId: number): Promise<EmbeddedWallet> {
  const walletId = chatId | 0xffffffff;
  // const mnemonic = await TonMnemonic.generateMnemonic();
  const mnemonic = String(process.env.MASTER_SEED_PHRASE).split(" ");
  const { publicKey, secretKey } = await TonMnemonic.mnemonicToKeyPair(
    mnemonic
  );

  const wallet = tonweb.wallet.create({ publicKey, walletId });

  const address = await wallet.getAddress();
  // const nonBounceableAddress = address.toString(true, true, false, true);
  // const seqno = await wallet.methods.seqno().call();
  console.log(
    `Deployed new wallet ${address.toString(true, true, false, true)}`
  );

  return {
    wallet,
    address,
    publicKey,
    secretKey,
  };
}

export async function sendTransaction(
  proposal: IProposal,
  sender: EmbeddedWallet
) {
  const seqno = await sender.wallet.methods.seqno().call();
  console.log(proposal.amount);
  const fee = await sender.wallet.methods.transfer({
    secretKey: sender.secretKey,
    toAddress: proposal.destinationAddress ?? "",
    amount: TonWeb.utils.toNano(proposal.amount?.toString()), // 0.01 TON
    seqno: seqno ?? 0,
    payload: proposal.description ?? "",
    sendMode: 3,
  });

  const Cell = TonWeb.boc.Cell;
  const cell = new Cell();
  cell.bits.writeUint(0, 32);
  cell.bits.writeAddress(sender.address);
  cell.bits.writeGrams(1);
  console.log(cell.print()); // print cell data like Fift
  const bocBytes = await cell.toBoc();

  const history = await tonweb.getTransactions(sender.address);

  const balance = await tonweb.getBalance(sender.address);

  const tx = await tonweb.sendBoc(bocBytes);

  return {
    history,
    balance,
    tx,
  };
}

export function getWalletAddress(wallet: EmbeddedWallet): string {
  return wallet.address.toString(true, true, false, true);
}

export async function predictAddress(walletId: number) {
  const mnemonic = String(process.env.MASTER_SEED_PHRASE).split(" ");
  const { publicKey, secretKey } = await TonMnemonic.mnemonicToKeyPair(
    mnemonic
  );

  const wallet = tonweb.wallet.create({ publicKey, walletId });

  const address = await wallet.getAddress();
  return address.toString(true, true, false, true);
}
