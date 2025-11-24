'use client';

import { ConnectWallet } from '@coinbase/onchainkit/wallet';
import {
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';

export function WalletConnect() {
  return (
    <div className="flex items-center gap-4">
      <Wallet>
        <ConnectWallet className="bg-terminal-cyan text-black hover:bg-terminal-cyan/80 font-mono">
          <span>Connect Wallet</span>
        </ConnectWallet>
        <WalletDropdown>
          <WalletDropdownDisconnect />
        </WalletDropdown>
      </Wallet>
    </div>
  );
}

