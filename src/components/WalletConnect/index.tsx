import { useState } from "react";

import { useAccount, useDisconnect } from "wagmi";
import { getAccount, getNetwork, switchNetwork } from "@wagmi/core";
import { useWeb3Modal } from "@web3modal/react";

// import useWeb3 from "@/hooks/useWeb3";
// import { SUPPORTED_CHAIN_ID } from "@/contracts";
// import { displayToast } from "./ui/Toast";
import ConnectButton from "../ConnectButton";

export default function WalletConnect() {
  const { open } = useWeb3Modal();
  const { isConnected, status } = useAccount();
  const { disconnect } = useDisconnect();
  const [loading, setLoading] = useState(false);
  const label = isConnected ? "Disconnect" : "Connect Wallet";
//   const { chainId } = useWeb3();
  const chainId  = 97;

  // console.log('Is it connected: ', isConnected);

  //   const { account?.address, chainId, switchToAppNetwork, loadBalance } = useWeb3();
  const account = getAccount();
  const { chain, chains } = getNetwork();

  // console.log('Chain: ', chain);

  async function onOpen() {
    setLoading(true);
    await open();
    setLoading(false);
  }

  function onClick() {
    if (isConnected) {
      disconnect();
    } else {
      onOpen();
    }
  }

  return (
    <>
      <div>{status == "connected"}</div>
      {status == "connected" && account.address ? (
        true ? (
          <div className="flex items-center gap-3 sm:gap-6 lg:gap-8">
            {isConnected ? (
              <div className="mr-5  rounded-md bg-theme-1/80 p-2 px-10 text-lg text-white hover:scale-105 ">
                <div
                  className="flex cursor-pointer items-center gap-3 rounded-md py-1.5 px-2 text-[12px] font-medium text-white transition sm:text-sm"
                  onClick={() => {
                    disconnect();
                  }}
                >
                  <span className="grow uppercase">
                    {account?.address.slice(0, 6)}
                    {"...."}
                    {account?.address.slice(account?.address.length - 4)}
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <button
                  onClick={onClick}
                  disabled={loading}
                  className="rounded-md border p-1  px-2 text-amber-100 hover:text-amber-800"
                >
                  {loading ? "Loading..." : label}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <button
              className="mr-3 rounded-md bg-theme-1/80 p-2 px-10 text-lg text-white hover:scale-105"
              onClick={async () => {
                try {
                  await switchNetwork({
                    chainId: 97,
                  });
                } catch (error) {
                  //   displayToast(
                  //     "failure",
                  //     "Error encountered. If the error persists, you can try connecting to Mumbai manually."
                  //   );
                }
              }}
            >
              Switch to BSC Testnet
            </button>
          </div>
        )
      ) : (
        <div>
          <ConnectButton />
        </div>
      )}
    </>
  );
}

