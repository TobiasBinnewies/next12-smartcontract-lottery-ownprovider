import "../styles/globals.css"
import type { AppProps } from "next/app"
import { EthersProvider } from "../compontents/providers/EthersProvider"

function MyApp({ Component, pageProps }: AppProps) {
  return (
      <EthersProvider>
        <Component {...pageProps} />
      </EthersProvider>
  )
}

export default MyApp
