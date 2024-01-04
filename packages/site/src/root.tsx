import {type FunctionComponent, PropsWithChildren} from "react";
import {RampClientProvider} from "@/hooks/useRpc.tsx";
import {MetaMaskProvider} from "@/hooks/useMetaMask.tsx";
import App from "@/app";

export const Root: FunctionComponent<PropsWithChildren> = () => {
  return (
    <div className="container">
      <section
        className="mx-auto flex max-w-[980px] flex-col items-center gap-2 py-8 md:py-12 md:pb-8 lg:py-10 lg:pb-10">
        <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1] hidden md:block">
          Ramp it!</h1>
      </section>

        <MetaMaskProvider>
          <RampClientProvider>
            <App/>
          </RampClientProvider>
        </MetaMaskProvider>
        </div>
  )
}
