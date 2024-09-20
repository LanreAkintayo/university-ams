import { useState, useEffect } from "react";

import {
  getAccount,
  getNetwork,
  switchNetwork,
  readContract,
  getContract,
  fetchBalance,
  erc20ABI,
} from "@wagmi/core";
import { ethers } from "ethers";
import { RootState } from "../../stores/store";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { formatAddress, inDollarFormat } from "../../utils/helper";
import { SUPPORTED_CHAIN_ID } from "../../contracts";
import { Bnb } from "../../assets/tokens/bnb";
import { Flexvis } from "../../assets/tokens/flexvis";
import ConnectButton from "../ConnectButton";

export interface TokenDetails {
  name: string;
  symbol: string;
  decimals: number;
}

export interface SignerDetails {
  tokenBalance: bigint;
  stableTokenBalance: bigint;
}

export default function AccountDetails({
  tokenDetails,
  signerDetails,
}: {
  tokenDetails: TokenDetails;
  signerDetails: SignerDetails;
}) {
  const { slug: tokenAddress } = useParams();
  const {
    signerAddress,
    balance: nativeBalance,
    chainId,
  } = useSelector((state: RootState) => state.wallet);
  const {
    allProjects,
    investorInvestments,
    investorTotalInvested,
    rewardDurations,
    rewardPercentages,
    projectMetrics,
    tokenToUsdPath,
    allInvestors,
    projectPlatformAddresses,
    projectInfo,
  } = useSelector((state: RootState) => state.insurance);

  // let [tokenDetails, setTokenDetails] = useState({
  //   name: "",
  //   symbol: "",
  //   decimals: 0,
  //   tokenBalance: BigInt(0),
  //   formattedBalance: "",
  // });

  // useEffect(() => {
  //   const updateTokenDetails = async () => {
  //     if (
  //       signerAddress &&
  //       tokenAddress &&
  //       allProjects!.includes(tokenAddress)
  //     ) {
  //       // Obtain the token name
  //       const name = (await readContract({
  //         address: tokenAddress as `0x${string}`,
  //         abi: erc20ABI,
  //         functionName: "name",
  //       })) as string;

  //       // Obtain the token symbol
  //       const symbol = (await readContract({
  //         address: tokenAddress as `0x${string}`,
  //         abi: erc20ABI,
  //         functionName: "symbol",
  //       })) as string;

  //       // Obtain the token tokenBalance,
  //       const tokenBalance = (await readContract({
  //         address: tokenAddress as `0x${string}`,
  //         abi: erc20ABI,
  //         functionName: "balanceOf",
  //         args: [signerAddress as `0x${string}`],
  //       })) as bigint;

  //       // Obtain the token decimals
  //       const decimals = (await readContract({
  //         address: tokenAddress as `0x${string}`,
  //         abi: erc20ABI,
  //         functionName: "decimals",
  //       })) as number;

  //       console.log("Balance: ", tokenBalance);
  //       console.log("Decimals: ", decimals);

  //       const formattedBalance = inDollarFormat(
  //         Number(tokenBalance) / 10 ** Number(decimals)
  //       );

  //       setTokenDetails({
  //         name,
  //         symbol,
  //         decimals,
  //         tokenBalance,
  //         formattedBalance,
  //       });
  //     }
  //   };

  //   updateTokenDetails();
  // }, [tokenAddress, signerAddress]);


  console.log("SignerDetails: ", signerDetails);

  return (
    <>
      {signerAddress && tokenDetails && nativeBalance ? (
        <div className="">
          {chainId === SUPPORTED_CHAIN_ID && (
            <div>
              <div className="px-2 py-5">
                <div className="flex items-center justify-between gap-3 ">
                  <span className="text-sm font-medium -tracking-tighter text-gray-600 dark:text-gray-400">
                    Balance
                  </span>
                  <span className="rounded-lg bg-gray-200 px-2 py-1 text-sm tracking-tighter dark:bg-gray-800">
                    {formatAddress(signerAddress)}
                  </span>
                </div>

                <div className="w-full mt-2 flex items-center justify-between gap-2 rounded-lg p-2 bg-gray-200 dark:bg-gray-800">
                  <div className="flex items-center space-x-2">
                    {" "}
                    <Bnb />
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-300">
                      Binance ({nativeBalance?.symbol})
                    </span>
                  </div>
                  <p className="text-sm">
                    {nativeBalance?.formatted
                      ? inDollarFormat(Number(nativeBalance?.formatted))
                      : "--"}{" "}
                    BNB
                  </p>
                </div>
                <div className="w-full mt-2 flex items-center justify-between gap-2 rounded-lg p-2 bg-gray-200 dark:bg-gray-800">
                  <div className="flex items-center space-x-2">
                    {" "}
                    <img
                      alt={tokenDetails.name}
                      src={projectInfo?.logo}
                      width={30}
                      height={30}
                      className="rounded-full"
                    />
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-300">
                      {tokenDetails.name} ({tokenDetails.symbol})
                    </span>
                  </div>
                  <p className="text-sm">
                    {inDollarFormat(
                      Number(
                        ethers.formatUnits(
                          signerDetails.tokenBalance,
                          tokenDetails.decimals
                        )
                      )
                    )}{" "}
                    {tokenDetails.symbol}
                  </p>
                </div>
                <div className="w-full mt-2 flex items-center justify-between gap-2 rounded-lg p-2 bg-gray-200 dark:bg-gray-800">
                  <div className="flex items-center space-x-2">
                    {" "}
                    <img
                      alt={`USDT`}
                      src={`/usdt.svg`}
                      width={30}
                      height={30}
                      className="rounded-full"
                    />
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-300">
                      {`USDT Token`} ({`USDT`})
                    </span>
                  </div>
                  <p className="text-sm">
                    {inDollarFormat(
                      Number(
                        ethers.formatUnits(signerDetails.stableTokenBalance, 18)
                      )
                    )}{" "}
                    {`USDT`}
                  </p>
                </div>

                <div className="w-full mt-2 flex items-center justify-between gap-2 rounded-lg p-2 bg-gray-200 dark:bg-gray-800">
                  <div className="flex items-center space-x-2">
                    {" "}
                    <img
                      alt={`pai`}
                      src={projectInfo?.logo}
                      width={30}
                      height={30}
                      className="rounded-full"
                    />
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-300">
                      {tokenDetails.symbol} Invested
                    </span>
                  </div>
                  <p className="text-sm">
                    {investorTotalInvested != null && (
                      <span className="text-sm">
                        {inDollarFormat(
                          Number(
                            ethers.formatUnits(
                              investorTotalInvested.toString(),
                              tokenDetails.decimals
                            )
                          )
                        )}{" "}
                      </span>
                    )}
                    {tokenDetails.symbol}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex w-full items-center justify-center gap-3 sm:gap-6 lg:gap-8">
          <div className="py-5">
            <ConnectButton connectMessage="Connect your Wallet" />
          </div>
        </div>
      )}
    </>
  );
}
