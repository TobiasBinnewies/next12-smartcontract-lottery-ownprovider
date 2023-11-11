import { useState } from "react"
import { ethers } from "ethers"
import { useEthers } from "./EthersProvider"

type UseContractParams = {
  abi: ethers.Interface | ethers.InterfaceAbi
  contractAddress: string | undefined
  functionName: string
  params: object
  msgValue?: string | number | undefined
}

type UseContractFunctionParams<T> = {
  onSuccess?: (result: T) => void
  onError?: (error: string) => void
  onFetching?: () => void
}

type UseContractResultError = {
  funcState: "error"
  error: string
  result: undefined
}

type UseContractResultSuccess<T> = {
  funcState: "success"
  error: null
  result: T
}

type UseContractResultLoadingFetching = {
  funcState: "fetching" | "loading"
  error: null
  result: undefined
}

type UseContractResultUnused = {
  funcState: "unused"
  error: null
  result: undefined
}

type UseContractResultNull = {
  funcState: "undefined"
  error: null
  result: undefined
  runContractFunction: undefined
}

type UseContractResult<T> = (
  | UseContractResultError
  | UseContractResultSuccess<T>
  | UseContractResultLoadingFetching
  | UseContractResultUnused
) & {
  runContractFunction: (params?: UseContractFunctionParams<T>) => Promise<T | undefined>
}

export function useContract<T>({
  abi,
  contractAddress,
  functionName,
  params: functionParams,
  msgValue,
}: UseContractParams): UseContractResult<T> {
  const { state, signer } = useEthers()
  const [funcState, setFuncState] = useState<
    "unused" | "loading" | "fetching" | "error" | "success"
  >("unused")
  const [result, setResult] = useState<T | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  if (contractAddress === undefined || state !== "connected") {
    return {
      funcState: "error",
      error: "Contract address is undefined or not connected",
      result: undefined,
      runContractFunction: async (params?: UseContractFunctionParams<T>) => {
        throw "Contract address is undefined or not connected"
      },
    }
  }

  const contract: ethers.Contract = new ethers.Contract(contractAddress, abi, signer)
  const contractWithSigner = contract.connect(signer)

  if (!contractWithSigner.interface.getFunction(functionName)) {
    throw new Error(`No function ${functionName} in contract`)
  }

  const isConstant = contractWithSigner.interface.getFunction(functionName)?.constant

  const handleResult = (result: T, onSuccess: ((result: T) => void) | undefined) => {
    if (onSuccess) {
      onSuccess(result)
    }
    setResult(result)
    setFuncState("success")
    return result
  }

  const handleError = (error: string, onError: ((error: string) => void) | undefined) => {
    if (onError) {
      onError(error)
    }
    setError(error)
    setFuncState("error")
  }

  const handleFetching = (onFetching: (() => void) | undefined) => {
    if (onFetching) {
      onFetching()
    }
    setFuncState("fetching")
  }

  const runContractFunction = async (
    params?: UseContractFunctionParams<T> | undefined
  ): Promise<T | undefined> => {
    isConstant ? handleFetching(params?.onFetching) : setFuncState("loading")
    try {
      const result = await (contractWithSigner as any)[functionName](
        ...Object.values(functionParams),
        {
          value: msgValue,
        }
      )
      if (isConstant) return handleResult(result, params?.onSuccess)

      // TODO: Überlegen, welcher Returnwert hier sinnvoll wäre
      handleFetching(params?.onFetching)
      const receipt = await result.wait()
      return handleResult(receipt, params?.onSuccess)
    } catch (e) {
      handleError(e as string, params?.onError)
      return undefined
    }
  }

  if (funcState === "success") {
    return {
      funcState: "success",
      error: null,
      result: result!,
      runContractFunction,
    }
  }
  if (funcState === "error") {
    return {
      funcState: "error",
      error: error!,
      result: undefined,
      runContractFunction,
    }
  }
  return {
    funcState: funcState,
    error: null,
    result: undefined,
    runContractFunction,
  }
}
