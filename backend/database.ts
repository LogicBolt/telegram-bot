import { EmbeddedWallet } from "./embedded-wallet";
import { sendTransaction } from "./onchain";

export interface IProposal {
  messageId: number;
  upvotes: number;
  proposer?: string;
  description?: string;
  amount?: number;
  destinationAddress?: string;
  executed: boolean;

  increaseUpvote(): number;
  decreaseUpvote(): number;
}

interface IDAO {
  chatId: number;
  proposals?: Array<IProposal>;
  members: number;
  wallet: EmbeddedWallet;

  createNewProposal(messageId: number, proposalData: any): IProposal;
  findProposal(messageId: number): IProposal | undefined;
  updateMembers(newMembers: number): void;
  getApprovalThreshold(): number;
  executeProposal(proposal: IProposal): any;
}

interface IDatabase {
  daos?: Array<IDAO>;

  createNewDAO(chatId: number, members: number, wallet: EmbeddedWallet): IDAO;
  findDAO(chatId: number): IDAO | undefined;
}

class Proposal implements IProposal {
  messageId: number;
  upvotes: number;
  proposer?: string;
  description?: string;
  amount?: number;
  destinationAddress?: string;
  executed: boolean;

  constructor(messageId: number, proposalData: any) {
    this.messageId = messageId;
    this.upvotes = 0;
    this.description = proposalData.description;
    this.amount = proposalData.amount;
    this.destinationAddress = proposalData.destinationAddress;
    this.executed = false;
  }

  increaseUpvote(): number {
    return this.upvotes++;
  }

  decreaseUpvote(): number {
    return this.upvotes--;
  }
}

class DAO implements IDAO {
  chatId: number;
  proposals: Array<IProposal>;
  members: number;
  wallet: EmbeddedWallet;

  constructor(chatId: number, members: number, wallet: EmbeddedWallet) {
    this.chatId = chatId;
    this.members = members;
    this.wallet = wallet;
    this.proposals = [];
  }

  createNewProposal(messageId: number, proposalData: any): IProposal {
    const proposal = new Proposal(messageId, proposalData);
    this.proposals.push(proposal);

    return proposal;
  }

  findProposal(messageId: number): IProposal | undefined {
    return this.proposals?.find((proposal) => proposal.messageId == messageId);
  }

  updateMembers(newMembers: number) {
    this.members = newMembers - 1;
  }

  getApprovalThreshold(): number {
    return Math.ceil(this.members * 0.49);
  }

  executeProposal(proposal: IProposal): any {
    proposal.executed = true;
    return sendTransaction(proposal, this.wallet);
  }
}

export class Database implements IDatabase {
  daos: Array<IDAO>;

  constructor() {
    this.daos = [];
  }
  createNewDAO(chatId: number, members: number, wallet: EmbeddedWallet): IDAO {
    const dao = new DAO(chatId, members, wallet);
    this.daos.push(dao);

    return dao;
  }

  findDAO(chatId: number): IDAO | undefined {
    return this.daos?.find((dao) => dao.chatId == chatId);
  }
}
