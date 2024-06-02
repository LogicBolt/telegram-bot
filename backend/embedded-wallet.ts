import type { WalletV3ContractR1 } from 'tonweb/dist/types/contract/wallet/v3/wallet-v3-contract-r1';
import type { Address } from 'tonweb/dist/types/utils/address';

export interface EmbeddedWallet {
  wallet: WalletV3ContractR1;
  address: Address;
  publicKey: Uint8Array;
  secretKey: Uint8Array;
  deployment: any;
}