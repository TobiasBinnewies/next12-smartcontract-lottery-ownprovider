import { ethers } from "ethers"
import { useEffect, useState } from "react"
import { useEthers } from "./EthersProvider"

type UseEventParams = {
  abi: ethers.Interface | ethers.InterfaceAbi
  contractAddress: string | undefined
  eventName: string
  onEvent: () => Promise<void>
  type: "on" | "once"
}

export function useEvent({ abi, contractAddress, eventName, type, onEvent }: UseEventParams) {
  const { signer, state } = useEthers()

  useEffect(() => {
    if (contractAddress === undefined || state !== "connected") {
      return
    }

    const contract = new ethers.Contract(contractAddress, abi, signer)

    contract[type](eventName, onEvent)
    return () => {
      contract.removeAllListeners()
    }
  }, [state])
}
