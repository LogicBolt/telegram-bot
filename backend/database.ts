interface IProposal {
  messageId: number;
  upvotes: number;
  proposer?: string;
  description?: string;
  amount?: number;
  destinationAddress?: string;

  increaseUpvote(): number;
  decreaseUpvote(): number;
}

interface IDAO {
  chatId: number;
  proposals?: Array<IProposal>;
  members: number;
  // TODO: wallet object

  createNewProposal(messageId: number): IProposal;
  findProposal(messageId: number): IProposal | undefined;
  updateMembers(newMembers: number): void;
  getApprovalThreshold(): number;
  executeProposal(proposal: IProposal): void;
}

interface IDatabase {
  daos?: Array<IDAO>;

  createNewDAO(chatId: number, members: number): IDAO;
  findDAO(chatId: number): IDAO | undefined;
}

class Proposal implements IProposal {
  messageId: number;
  upvotes: number;
  proposer?: string;
  description?: string;
  amount?: number;
  destinationAddress?: string;

  constructor(messageId: number) {
    this.messageId = messageId;
    this.upvotes = 1;
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

  constructor(chatId: number, members: number) {
    this.chatId = chatId;
    this.members = members;
    this.proposals = [];
  }

  createNewProposal(messageId: number): IProposal {
    const proposal = new Proposal(messageId);
    this.proposals.push(proposal);

    return proposal;
  }

  findProposal(messageId: number): IProposal | undefined {
    return this.proposals?.find((proposal) => proposal.messageId == messageId);
  }

  updateMembers(newMembers: number) {
    this.members = newMembers;
  }

  getApprovalThreshold(): number {
    return Math.ceil(this.members * 0.49);
  }

  executeProposal(proposal: IProposal): void {
    // TODO: use wallet to execute proposal
  }
}

export class Database implements IDatabase {
  daos: Array<IDAO>;

  constructor() {
    this.daos = [];
  }
  createNewDAO(chatId: number, members: number): IDAO {
    const dao = new DAO(chatId, members);
    this.daos.push(dao);

    return dao;
  }

  findDAO(chatId: number): IDAO | undefined {
    const dao = this.daos?.find((dao) => dao.chatId == chatId);

    return dao;
  }
}
