import { useWeb3Modal } from "@web3modal/react";
import { useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { getNetwork } from "@wagmi/core";
import { Wallet } from "lucide-react";

export default function ConnectButton({
  connectMessage,
  className,
}: {
  connectMessage?: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const { open } = useWeb3Modal();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  async function onOpen() {
    setLoading(true);
    try {
      await open();
    } catch (err) {
      console.log("Error: ", err);
    }
    setLoading(false);
  }

  function onClick() {
    try {
      if (isConnected) {
        disconnect();
      } else {
        onOpen();
      }
    } catch (err) {
      console.log("Error: ", err);
    }
  }

  return (
    <div className="flex w-full items-center">
      <button
        onClick={onClick}
        disabled={loading}
        className={`${
          className
            ? className
            : "ssm:text-sm mr-3 rounded-md bg-theme-1/80 p-2 px-10 text-lg text-white hover:scale-105"
        }`}
      >
        <div>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div>
              {connectMessage ? (
                <p>{connectMessage}</p>
              ) : (
                <div className="flex space-x-4 items-center">
                  {" "}
                  <Wallet />
                  <p>Connect Wallet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </button>
    </div>
  );
}
