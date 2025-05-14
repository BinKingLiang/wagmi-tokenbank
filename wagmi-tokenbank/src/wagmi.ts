import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors'
import tokenbankABI from './contracts/tokenbank.json'

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(),
    coinbaseWallet(),
    walletConnect({ projectId: import.meta.env.VITE_WC_PROJECT_ID }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})

export const tokenBankContract = {
  address: '0xE19E85816bB081116cfFb58272bF2be8bFDb79B4',
  abi: tokenbankABI,
} as const

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
