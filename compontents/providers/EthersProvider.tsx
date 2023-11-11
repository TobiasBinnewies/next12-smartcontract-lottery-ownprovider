import { createContext, useContext, useEffect, useState } from "react"
import { ethers } from "ethers"

const LOCAL_STORAGE_KEY = "connected"
const LOCAL_STORAGE_VALUE = "injected"

declare let window: typeof globalThis.window & {
  ethereum: ethers.Eip1193Provider & ethers.BrowserProvider
}

type EthersContextNotConnected = {
  state: "notconnected" | "loading"
  chainId: null
  provider: null
  account: null
  signer: null
  connect: () => Promise<void>
  ethers: typeof ethers
}

type EthersContextConnected = {
  state: "connected"
  chainId: number
  provider: ethers.BrowserProvider
  account: Account
  signer: ethers.JsonRpcSigner
  ethers: typeof ethers
  connect: () => Promise<void>
}

type EthersContext = EthersContextConnected | EthersContextNotConnected

interface Account {
  address: string
  balance: string
}

const EthersContext = createContext<EthersContext>({} as EthersContext)

export function EthersProvider({ children }: { children: React.ReactNode }) {
  //   const [isEnabled, setEnabled] = useState(false)
  const [state, setState] = useState<"notconnected" | "loading" | "connected">("notconnected")
  const [chainId, setChainId] = useState(0)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [account, setAccount] = useState<Account | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)

  useEffect(() => {
    if (!window.ethereum) {
      return
    }
    window.ethereum.on("accountsChanged", (accounts: string[]) => {
      console.log("New accounts", accounts)

      if (accounts.length === 0) {
        reset()
        return
      }
      connect()
    })

    // TODO: Update balance

    // TODO: Find correct event name
    // window.ethereum.on("chainChanged", (_chainId: number) => {
    //     console.log("New ChainID", _chainId)

    //   if (!isEnabled) return
    //   connect()
    // })

    return () => {
      window.ethereum.removeAllListeners()
    }
  }, [])

  useEffect(() => {
    if (state === "connected" || typeof window === undefined) return
    const connected = window.localStorage.getItem(LOCAL_STORAGE_KEY)
    if (connected === LOCAL_STORAGE_VALUE) {
      connect()
    }
  }, [state])

  const reset = () => {
    // setEnabled(false)
    setState("notconnected")
    setProvider(null)
    setAccount(null)
    setSigner(null)
    window.localStorage.removeItem(LOCAL_STORAGE_KEY)
  }

  const connect = async () => {
    if (!window.ethereum) {
      alert("Install Metamask")
    }
    try {
      setState("loading")
      const addresses = await window.ethereum.request({ method: "eth_requestAccounts" })
      const provider = new ethers.BrowserProvider(window.ethereum)
      const balance = await provider.getBalance(addresses[0])
      const network = await provider.getNetwork()
      const signer = await provider.getSigner()
      setChainId(Number(network.chainId))
      setProvider(provider)
      setAccount({
        address: addresses[0],
        balance: ethers.formatEther(balance) + "ETH",
      })
      setSigner(signer)
      setState("connected")

      window.localStorage.setItem(LOCAL_STORAGE_KEY, LOCAL_STORAGE_VALUE)
    } catch {
      reset()
    }
  }

  //   const value: EthersContext = {
  //     isEnabled,
  //     chainId,
  //     provider,
  //     account,
  //     connect,
  //     useContract,
  //     ethers,
  //   }
  const value: EthersContext =
    state === "connected"
      ? {
          state,
          chainId,
          provider: provider!,
          account: account!,
          signer: signer!,
          connect,
          ethers,
        }
      : {
          state,
          chainId: null,
          provider: null,
          account: null,
          signer: null,
          connect,
          ethers,
        }

  return <EthersContext.Provider value={value}>{children}</EthersContext.Provider>
}

export function useEthers(): EthersContext {
  const context = useContext(EthersContext)
  if (context === undefined) {
    throw new Error("useEthers must be used within a EthersProvider")
  }
  return context
}
