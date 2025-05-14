import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract } from 'wagmi'
import { tokenBankContract } from './wagmi'
import { useState } from 'react'
import { usePermit2 } from './utils/permit2'

function App() {
  const account = useAccount()
  const { connectors, connect, status, error } = useConnect()
  const { disconnect } = useDisconnect()
  const [amount, setAmount] = useState('')
  const [txStatus, setTxStatus] = useState('')
  const [usePermit, setUsePermit] = useState(false)
  const { getPermitSignature } = usePermit2()

  const { data: balance } = useReadContract({
    ...tokenBankContract,
    functionName: 'balanceOf',
    args: [account.address],
    query: {
      enabled: account.status === 'connected',
    },
  })

  const { writeContract: deposit } = useWriteContract({
    mutation: {
      onSuccess: () => {
        setTxStatus('Deposit successful')
      },
      onError: (error) => {
        setTxStatus(`Deposit failed: ${error.message}`)
      },
    },
  })

  const { writeContract: withdraw } = useWriteContract({
    mutation: {
      onSuccess: () => {
        setTxStatus('Withdrawal successful')
      },
      onError: (error) => {
        setTxStatus(`Withdrawal failed: ${error.message}`)
      },
    },
  })

  const handleDeposit = async () => {
    if (!amount) return
    
    if (usePermit) {
      try {
        setTxStatus('Signing permit...')
        const deadline = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
        const { permit, signature } = await getPermitSignature(
          tokenBankContract.address,
          amount,
          tokenBankContract.address,
          deadline
        )
        
        setTxStatus('Depositing with permit...')
        deposit({
          ...tokenBankContract,
          functionName: 'depositWithPermit2',
          args: [
            permit.permitted.amount,
            permit.deadline,
            signature
          ],
        })
      } catch (error) {
        setTxStatus(`Permit failed: ${error instanceof Error ? error.message : String(error)}`)
      }
    } else {
      deposit({
        ...tokenBankContract,
        functionName: 'transfer',
        args: [tokenBankContract.address, BigInt(amount)],
      })
    }
  }

  const handleWithdraw = () => {
    if (!amount) return
    withdraw({
      ...tokenBankContract,
      functionName: 'transferFrom',
      args: [tokenBankContract.address, account.address, BigInt(amount)],
    })
  }

  return (
    <>
      <div>
        <h2>Account</h2>
        <div>
          status: {account.status}
          <br />
          address: {account.address}
          <br />
          chainId: {account.chainId}
        </div>

        {account.status === 'connected' && (
          <button type="button" onClick={() => disconnect()}>
            Disconnect
          </button>
        )}
      </div>

      <div>
        <h2>Token Bank</h2>
        {account.status === 'connected' && (
          <>
            <div>Balance: {balance?.toString() || '0'}</div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
            />
            <div>
              <label>
                <input 
                  type="checkbox" 
                  checked={usePermit} 
                  onChange={(e) => setUsePermit(e.target.checked)}
                />
                Use Permit2
              </label>
              <button onClick={handleDeposit}>Deposit</button>
            </div>
            <button onClick={handleWithdraw}>Withdraw</button>
            {txStatus && <div>{txStatus}</div>}
          </>
        )}
      </div>

      <div>
        <h2>Connect</h2>
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            type="button"
          >
            {connector.name}
          </button>
        ))}
        <div>{status}</div>
        <div>{error?.message}</div>
      </div>
    </>
  )
}

export default App
