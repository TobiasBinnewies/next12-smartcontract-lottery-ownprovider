import { useMoralis } from "react-moralis"
import { useEffect } from "react"

const LOCAL_STORAGE_KEY = "connected"
const LOCAL_STORAGE_VALUE = "injected"

export default function Header() {
  const { enableWeb3, deactivateWeb3, isWeb3EnableLoading, account, isWeb3Enabled, Moralis } =
    useMoralis()

  useEffect(() => {
    if (isWeb3Enabled || typeof window === undefined) return
    const connected = window.localStorage.getItem(LOCAL_STORAGE_KEY)
    if (connected === LOCAL_STORAGE_VALUE) {
      enableWeb3()
    }
  }, [isWeb3Enabled])

  useEffect(() => {
    Moralis.onAccountChanged((account) => {
      if (account == null) {
        window.localStorage.removeItem(LOCAL_STORAGE_KEY)
        deactivateWeb3()
      }
    })
  }, [])

  const connect = async () => {
    await enableWeb3()
    window.localStorage.setItem(LOCAL_STORAGE_KEY, LOCAL_STORAGE_VALUE)
  }

  return (
    <div>
      {account ? (
        <div>
          Connected to {account.slice(0, 6)}...{account.slice(account.length - 4)}
        </div>
      ) : (
        <button onClick={connect} disabled={isWeb3EnableLoading}>
          Enable Web3
        </button>
      )}
    </div>
  )
}
