'use client';

import { ConnectWallet, Wallet, WalletDropdown, WalletDropdownDisconnect } from '@coinbase/onchainkit/wallet';

export function WalletConnect() {
  return (
    <Wallet>
      <ConnectWallet />
      <WalletDropdown />
    </Wallet>
  );
}
