import { PermitTransferFrom, SignatureTransfer } from '@uniswap/permit2-sdk'
import { MaxAllowanceTransferAmount, PERMIT2_ADDRESS } from '@uniswap/permit2-sdk'
import { useAccount, useSignTypedData } from 'wagmi'

export const usePermit2 = () => {
  const { address } = useAccount()
  const { signTypedDataAsync } = useSignTypedData()

  const getPermitSignature = async (
    token: string,
    amount: string,
    spender: string,
    deadline: number
  ) => {
    if (!address) throw new Error('No connected wallet')

    const permit: PermitTransferFrom = {
      permitted: {
        token,
        amount: BigInt(amount),
      },
      spender,
      nonce: BigInt(Math.floor(Math.random() * 1e18)),
      deadline: BigInt(deadline),
    }

    const { domain, types, values } = SignatureTransfer.getPermitData(
      permit,
      PERMIT2_ADDRESS,
      Number(await getChainId())
    )

    const signature = await signTypedDataAsync({
      domain: domain as any,
      types: types as any,
      primaryType: 'PermitTransferFrom',
      message: values as any,
    })

    return {
      permit,
      signature,
    }
  }

  const getChainId = async () => {
    const { chainId } = useAccount()
    return chainId || 1 // Default to mainnet if not connected
  }

  return {
    getPermitSignature,
  }
}
