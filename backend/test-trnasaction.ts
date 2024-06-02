import { createWallet, sendTransaction } from './onchain';
import { IProposal } from './database';

async function main() {
   const wallet = await createWallet(1);
   const proposal: IProposal = {
     messageId: 1,
     upvotes: 1,
     description: 'hello',
     amount: 0.004,
     destinationAddress: '0QAU_9aUxN_LH5WDwvtHe_RKLDkisx2eojkkTosDV9vXZcew',
   }

   const tx = await sendTransaction(proposal, wallet);
   console.log(tx);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});