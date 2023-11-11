import type { NextPage } from "next"
import styles from "../styles/Home.module.css"
import Head from "next/head"

// import { useEvmNativeBalance } from "@moralisweb3/next"
// import Header from "../compontents/ManualHeader"
import Header from "../compontents/Header"
import LotteryEntrace from "../compontents/LotteryEntrance"

const Home: NextPage = () => {
  // const address = "0xF3bFf956daB518eB87AFf46B30ecF60f5c9eb7a6"
  // const { data: nativeBalace } = useEvmNativeBalance({ address })

  return (
    <div className={styles.container}>
      <Head>
        <title>Decentralized Lottery NEW</title>
        <meta name="description" content="Decentralized Lottery" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      {/* <h3>Wallet: {address}</h3>
      <h3>Native Balance: {nativeBalace?.balance.ether}</h3> */}
      <LotteryEntrace />
    </div>
  )
}

export default Home
