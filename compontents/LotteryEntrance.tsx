import { abi, contractAddresses } from "../constants"
import { useEffect, useState } from "react"
import { ContractTransactionResponse, ethers } from "ethers"
// import { useNotification } from "web3uikit"
import { BigNumber } from "moralis/common-core"
import { useEthers } from "./providers/EthersProvider"
import { useContract } from "./providers/EthersContract"
import { useEvent } from "./providers/EthersEvent"

export default function LotteryEntrace() {
  const { state, chainId } = useEthers()
  // const web3 = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:8545")) // gives warning: NOTE: web3.js is running without provider. You need to pass a provider in order to interact with the network!
  const [entranceFee, setEntranceFee] = useState<BigInt | undefined>()
  const [numberOfPlayers, setNumberOfPlayers] = useState<BigInt | undefined>()
  const [recentWinner, setRecentWinner] = useState<string | undefined>()
  // const dispatch = useNotification()
  const raffleAddress =
    chainId! in contractAddresses ? contractAddresses[chainId!]["Raffle"] : undefined

  const { runContractFunction: enterRaffle, funcState } = useContract<void>({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "enterRaffle",
    params: {},
    msgValue: entranceFee?.toString(),
  })

  const { runContractFunction: getEntranceFee } = useContract<BigInt>({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getEntranceFee",
    params: {},
  })

  const { runContractFunction: getNumberOfPlayers } = useContract<BigInt>({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getNumberOfPlayers",
    params: {},
  })

  const { runContractFunction: getRecentWinner } = useContract<string>({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getRecentWinner",
    params: {},
  })

  useEvent({
    abi,
    contractAddress: raffleAddress,
    eventName: "RaffleEnter",
    type: "on",
    onEvent: async () => {
      console.log("RaffleEnter fired")
      updateUI()
    },
  })

  useEvent({
    abi,
    contractAddress: raffleAddress,
    eventName: "WinnerPicked",
    type: "on",
    onEvent: async () => {
      console.log("WinnerPicked fired")
      updateUI()
    },
  })

  useEffect(() => {
    if (state === "connected") {
      updateUI()
    }
  }, [state])

  const updateUI = async () => {
    console.log("Updating UI..")

    const entranceFee = await getEntranceFee({
      onError(error) {
        console.log(error)
      },
    })
    const numberOfPlayers = await getNumberOfPlayers({
      onError(error) {
        console.log(error)
      },
    })
    const recentWinner = await getRecentWinner({
      onError(error) {
        console.log(error)
      },
    })
    console.log(numberOfPlayers)

    setEntranceFee(entranceFee)
    setNumberOfPlayers(numberOfPlayers)
    setRecentWinner(recentWinner)
    console.log("UI updated!", numberOfPlayers)
  }

  // TODO: Anpassen
  // const handleSuccess = async (tx: ContractTransactionResponse) => {
  //   // updateUI()
  // }

  const enter = async () => {
    // console.log("Before", await web3.eth.getBlockNumber())
    const result = await enterRaffle({
      // onSuccess: (tx) => handleSuccess(tx as ContractTransactionResponse),
      onSuccess: () => console.log("success"),
      onError: (e) => {
        console.log(e)
      },
    })
    console.log(result)
  }

  return (
    <div className="p-5">
      Lottery Entrance
      {raffleAddress ? (
        <div className="">
          <div>
            {entranceFee
              ? `Entrace Fee: ${ethers.formatUnits(entranceFee.toString(), "ether")}`
              : "getting entranceFee..."}
          </div>
          <div>
            {numberOfPlayers !== undefined
              ? `Number of Players: ${numberOfPlayers}`
              : "getting numberOfPlayers..."}
          </div>
          <div>{recentWinner ? `Recent Winner: ${recentWinner}` : "getting recentWinner..."}</div>
          <div>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={enter}
              disabled={funcState === "loading" || funcState === "fetching"}
            >
              {funcState === "loading" || funcState === "fetching" ? (
                <div className="w-[6rem] justify-center flex">
                  <div className="animate-spin h-8 w-8 border-b-2 rounded-full"></div>
                </div>
              ) : (
                <div className="h-8 items-center flex">
                  <div className="w-[6rem] h-min">Enter Raffle</div>
                </div>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div>
          No Raffle Address detected
          <button
            onClick={() => {
              console.log("CLICKED")
            }}
          >
            Test
          </button>
        </div>
      )}
    </div>
  )
}

// bubble unaware physical crew exact release menu exercise rebuild antique boil flame
