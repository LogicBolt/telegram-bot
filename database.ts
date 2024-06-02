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
  proposals?: IProposal[];
  members: number;
  // TODO: wallet object

  createNewProposal(messageId: number): IProposal;
  findProposal(messageId: number): IProposal | undefined;
  updateMembers(newMembers: number): void;
  getApprovalThreshold(): number;
  executeProposal(proposal: IProposal): void;
}

interface IDatabase {
  daos?: IDAO[];

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
  proposals?: IProposal[];
  members: number;

  constructor(chatId: number, members: number) {
    this.chatId = chatId;
    this.members = members;
  }

  createNewProposal(messageId: number): IProposal {
    return new Proposal(messageId);
  }

  findProposal(messageId: number): IProposal | undefined {
    return this.proposals?.find((proposal) => proposal.messageId == messageId);
  }

  updateMembers(newMembers: number) {
    this.members = newMembers;
  }

  getApprovalThreshold(): number {
    return Math.ceil(this.members * 0.51);
  }

  executeProposal(proposal: IProposal): void {
    // TODO: use wallet to execute proposal
  }
}

export class Database implements IDatabase {
  daos?: IDAO[];

  createNewDAO(chatId: number, members: number): IDAO {
    return new DAO(chatId, members);
  }

  findDAO(chatId: number): IDAO | undefined {
    return this.daos?.find((dao) => dao.chatId == chatId);
  }
}
