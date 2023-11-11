import { useEthers } from "./providers/EthersProvider"

export default function Header() {
  const { state, account, connect } = useEthers()

  return (
    <div className="p-5 border-b-2 flex flex-row">
      <h1 className="py-4 px-4 font-bold text-3xl">Decentralized Lottery NEW</h1>
      <div className="ml-auto py-4 px-4">
        {state === "connected" && (
          <div>
            <div>{account.address}:</div>
            <div>{account.balance}</div>
          </div>
        )}
        {state === "notconnected" && <button onClick={connect}>Connect</button>}
        {state === "loading" && <div>Loading...</div>}
        <br />
      </div>
    </div>
  )
}
