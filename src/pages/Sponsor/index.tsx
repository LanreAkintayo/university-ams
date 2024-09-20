import { useContext, useState, useRef, useEffect, ChangeEvent } from "react";
import { Web3Button, Web3NetworkSwitch } from "@web3modal/react";

import { ethers } from "ethers";
import { ClipLoader, GridLoader } from "react-spinners";
import { erc20ABI, useAccount, useDisconnect } from "wagmi";
import { LuCircleEqual } from "react-icons/lu";
import { IoMdArrowDropdown } from "react-icons/io";
import {
  readContract,
  signTypedData,
  prepareWriteContract,
  writeContract,
  waitForTransaction,
} from "@wagmi/core";

import {
  getProjectInfo,
  getProjectMetrics,
  loadProjectMetrics,
} from "../../stores/insuranceSlice";
import { useSelector } from "react-redux";
import ConnectButton from "../../components/ConnectButton";
import Input from "../../components/Input";
import InputLabel from "../../components/InputLabel";
import { displayToast } from "../../components/Toast";
import {
  usdtAddress,
  SUPPORTED_CHAIN_ID,
  wbnbAddress,
  pancakeswapRouter,
} from "../../contracts";
import { RootState } from "../../stores/store";
import { Metrics } from "../../types/general";
import { convertTokenToUsd, inDollarFormat } from "../../utils/helper";
import ReserveModal from "../../components/ModalReserve";
import SelectModal from "../../components/ModalSelect";
import { ArrowDownUp } from "lucide-react";

interface DetailedProject {
  name: string;
  symbol: string;
  decimals: number;
  logo: string;
  tokenAddress: string;
}

function Main() {
  const { signerAddress, balance, chainId } = useSelector(
    (state: RootState) => state.wallet
  );
  const {
    protocolDetails,
    pendingProjects,
    allProjects,
    disapprovedProjects,
    projectInfo,
  } = useSelector((state: RootState) => state.insurance);

  const { isConnected } = useAccount();

  const [isvalidTokenAddress, setIsValidTokenAddress] = useState(true);
  let [detailedProjects, setDetailedProjects] = useState<DetailedProject[]>([]);

  const [tokenDetails, setTokenDetails] = useState({
    tokenBalance: 0n,
    tokenSymbol: "",
    tokenDecimal: 0,
    tokenAmount: "",
    tokenLogo: "",
    tokenAddress: "",
  });

  const [stableDetails, setStableDetails] = useState({
    stableAddress: usdtAddress,
    stableBalance: 0n,
    stableSymbol: "",
    stableDecimal: 0,
    stableAmount: 0n,
  });

  const [openReserveModal, setOpenReserveModal] = useState(false);
  let [openSelectModal, setOpenSelectModal] = useState(false);
  let [currentProjectMetrics, setCurrentProjectMetrics] = useState<Metrics>();

  // Use Effects
  useEffect(() => {
    const updateTokenMetrics = async () => {
      if (tokenDetails.tokenAddress) {
        const currentMetrics = await getProjectMetrics(
          tokenDetails.tokenAddress
        );
        setCurrentProjectMetrics(currentMetrics!);
      }
    };

    const updateTokenBalance = async () => {
      if (
        isvalidTokenAddress &&
        signerAddress &&
        tokenDetails.tokenAddress != ""
      ) {
        // Determine the balance of the token
        const tokenBalance = (await readContract({
          address: tokenDetails.tokenAddress as `0x${string}`,
          abi: erc20ABI,
          functionName: "balanceOf",
          args: [signerAddress as `0x${string}`],
          chainId: SUPPORTED_CHAIN_ID,
        })) as bigint;
        const tokenSymbol = (await readContract({
          address: tokenDetails.tokenAddress as `0x${string}`,
          abi: erc20ABI,
          functionName: "symbol",
          chainId: SUPPORTED_CHAIN_ID,
        })) as string;
        const tokenDecimal = (await readContract({
          address: tokenDetails.tokenAddress as `0x${string}`,
          abi: erc20ABI,
          functionName: "decimals",
          chainId: SUPPORTED_CHAIN_ID,
        })) as number;

        const projectInfo = await getProjectInfo(tokenDetails.tokenAddress);

        setTokenDetails((prevTokenDetails) => ({
          ...prevTokenDetails,
          tokenBalance: tokenBalance,
          tokenSymbol: tokenSymbol,
          tokenDecimal: tokenDecimal,
          tokenLogo: projectInfo.logo,
        }));
      } else {
        setTokenDetails((prevTokenDetails) => ({
          ...prevTokenDetails,
          tokenBalance: 0n,
          tokenSymbol: "",
          tokenDecimal: 0,
        }));
      }
    };
    updateTokenMetrics();
    updateTokenBalance();
  }, [tokenDetails.tokenAddress, signerAddress]);

  // For token amount
  useEffect(() => {
    const updateStable = async () => {
      if (signerAddress) {
        const stableBalance = (await readContract({
          address: stableDetails.stableAddress as `0x${string}`,
          abi: erc20ABI,
          functionName: "balanceOf",
          args: [signerAddress as `0x${string}`],
          chainId: SUPPORTED_CHAIN_ID,
        })) as bigint;
        const stableSymbol = (await readContract({
          address: stableDetails.stableAddress as `0x${string}`,
          abi: erc20ABI,
          functionName: "symbol",
          chainId: SUPPORTED_CHAIN_ID,
        })) as string;
        const stableDecimal = (await readContract({
          address: stableDetails.stableAddress as `0x${string}`,
          abi: erc20ABI,
          functionName: "decimals",
          chainId: SUPPORTED_CHAIN_ID,
        })) as number;

        // setStableBalance(stableBalance);
        // setStableSymbol(stableSymbol);
        // setStableDecimal(stableDecimal);

        setStableDetails((prevStableDetails) => ({
          ...prevStableDetails,
          stableBalance: stableBalance,
          stableSymbol: stableSymbol,
          stableDecimal: stableDecimal,
        }));
      }
    };

    updateStable();
  }, [signerAddress]);

  useEffect(() => {
    const updateStableAmount = async () => {
      if (tokenDetails.tokenAmount) {
        // Conver the token amount to usd
        const tokenPath = [tokenDetails.tokenAddress, wbnbAddress, usdtAddress];
        const parsedTokenAmount = ethers.parseUnits(
          tokenDetails.tokenAmount,
          tokenDetails.tokenDecimal
        );

        const stableAmount = await convertTokenToUsd(
          pancakeswapRouter,
          parsedTokenAmount,
          tokenPath
        );

        setStableDetails((prevStableDetails) => ({
          ...prevStableDetails,
          stableAmount: stableAmount,
        }));

        // setStableAmount(stableAmount);
      }
    };

    updateStableAmount();
  }, [tokenDetails.tokenAmount]);

  useEffect(() => {
    const updateToken = async () => {
      if (allProjects) {
        const robustProjects = allProjects.map(
          async (currentProject: string) => {
            // Name, symbols, decimals, token address
            const name = (await readContract({
              address: currentProject as `0x${string}`,
              abi: erc20ABI,
              functionName: "name",
              chainId: SUPPORTED_CHAIN_ID,
            })) as string;

            const symbol = (await readContract({
              address: currentProject as `0x${string}`,
              abi: erc20ABI,
              functionName: "symbol",
              chainId: SUPPORTED_CHAIN_ID,
            })) as string;

            const decimals = (await readContract({
              address: currentProject as `0x${string}`,
              abi: erc20ABI,
              functionName: "decimals",
              chainId: SUPPORTED_CHAIN_ID,
            })) as number;

            const currentProjectInfo = await getProjectInfo(currentProject);

            return {
              name,
              symbol,
              decimals,
              tokenAddress: currentProject,
              logo: currentProjectInfo.logo,
            };
          }
        );

        const resolved = (await Promise.all(
          robustProjects
        )) as DetailedProject[];

        setDetailedProjects(resolved);
      }
    };

    updateToken();
  }, [allProjects]);

  // Arrow functions
  const isValidDetails = () => {
    if (
      Object.values(tokenDetails).some(
        (value) => value === "" || value === 0
      ) ||
      Object.values(stableDetails).some((value) => value === "" || value === 0)
    ) {
      return false;
    } else {
      return true;
    }
  };


  return (
    <>
      {!chainId ? (
        <ConnectButton />
      ) : (
        <div className="container relative mx-auto h-full ">
          {signerAddress ? (
            <div className="flex w-full flex-col items-center justify-center gap-4">
              <h1 className="text-gray-800 text-3xl font-bold">
                Add To Reserve
              </h1>
              <div className="bg-gray-50 px-8 py-8 rounded-md shadow-md">
                <div className="flex flex-col items-center space-y-8">
                  <div className="w-[450px] space-y-3">
                    <div>
                      <InputLabel title="Select Token:" />
                      <button
                        onClick={() => {
                          setOpenSelectModal(true);
                        }}
                        className="my-4 flex w-[450px] items-center justify-between rounded-md border  p-3 px-4 text-sm"
                      >
                        {tokenDetails.tokenSymbol ? (
                          <div className="flex items-center space-x-2">
                            <div>
                              <img
                                src={tokenDetails.tokenLogo}
                                width={30}
                                height={30}
                              />
                            </div>
                            <p className="text-base">
                              {tokenDetails.tokenSymbol}
                            </p>
                          </div>
                        ) : (
                          <p>Select a Token</p>
                        )}
                        <IoMdArrowDropdown className="text-3xl" />
                      </button>
                    </div>
                    <div className="text-gray-400">
                      <InputLabel title="" subTitle="Enter the token amount:" />
                      <div className="flex items-center space-x-3 rounded-md border p-3">
                        <div>
                          <button className="w-auto rounded-md bg-gray-200 p-1 px-3 text-sm hover:bg-gray-700">
                            MAX
                          </button>
                        </div>

                        <input
                          disabled={!tokenDetails.tokenAddress}
                          onChange={(event) => {
                            const { value } = event.target;

                            if (Number(value) < 0) {
                              return;
                            }

                            const formattedTokenBalance = Number(
                              ethers.formatUnits(
                                tokenDetails.tokenBalance!.toString(),
                                tokenDetails.tokenDecimal
                              )
                            );

                            // console.log(
                            //   'Formatted token balance: ',
                            //   formattedTokenBalance
                            // );

                            // console.log('Value: ', Number(value));

                            if (Number(value) > formattedTokenBalance) {
                              setTokenDetails((prevTokenDetails) => ({
                                ...prevTokenDetails,
                                tokenAmount: formattedTokenBalance.toString(),
                              }));
                              // setTokenAmount(formattedTokenBalance.toString());
                              return;
                            }
                            setTokenDetails((prevTokenDetails) => ({
                              ...prevTokenDetails,
                              tokenAmount: value,
                            }));
                            // setTokenAmount(value);
                          }}
                          type="number"
                          placeholder={"0"}
                          className="w-auto border-none focus:outline-none"
                          value={tokenDetails.tokenAmount}
                        />

                        <div className="flex flex-col  text-[12px]">
                          <p className="text-gray-600">Balance</p>
                          <p className="text-gray-800">
                            {tokenDetails.tokenBalance
                              ? inDollarFormat(
                                  Number(
                                    ethers.formatUnits(
                                      tokenDetails.tokenBalance.toString(),
                                      tokenDetails.tokenDecimal
                                    )
                                  )
                                )
                              : "--"}{" "}
                            {tokenDetails.tokenSymbol
                              ? tokenDetails.tokenSymbol
                              : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-gray-600">
                    <ArrowDownUp />
                    {/* <LuCircleEqual className="h-[35px] w-[35px]" /> */}
                  </div>

                  <div className="w-[450px] space-y-3">
                    <div>
                      <InputLabel title="USDT Address:" />
                      <Input
                        type="text"
                        disabled={true}
                        placeholder={stableDetails.stableAddress}
                        inputClassName="spin-button-hidden text-gray-700"
                      />
                    </div>

                    <div className="text-gray-700">
                      <InputLabel title="Equivalent USDT Amount:" />
                      <div className="flex items-center justify-between space-x-3 rounded-md p-3 border">
                        <input
                          disabled={true}
                          type="number"
                          placeholder={"0"}
                          value={
                            stableDetails.stableAmount
                              ? inDollarFormat(
                                  Number(
                                    ethers.formatUnits(
                                      stableDetails.stableAmount.toString(),
                                      stableDetails.stableDecimal
                                    )
                                  )
                                )
                              : "0"
                          }
                          className="w-auto border-none focus:outline-none"
                        />

                        <div className="flex flex-col  text-[12px]">
                          <p className="text-gray-700">Balance</p>
                          <p className="text-gray-800">
                            {stableDetails.stableBalance
                              ? inDollarFormat(
                                  Number(
                                    ethers.formatUnits(
                                      stableDetails.stableBalance.toString(),
                                      stableDetails.stableDecimal
                                    )
                                  )
                                )
                              : "--"}{" "}
                            {stableDetails.stableSymbol
                              ? stableDetails.stableSymbol
                              : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {currentProjectMetrics && (
                    <div className="w-[450px] self-start ">
                      <p>Note: </p>
                      <ul className="text-xs text-gray-700">
                        <li>
                          A portion of the insurance fee, equivalent to{" "}
                          {Number(currentProjectMetrics.liquidityPercentage) /
                            100}
                          %, will be distributed among all investors, offering
                          you an opportunity to receive a share of it based on
                          your level of liquidity.
                        </li>

                        <br />
                        <li>
                          The greater your liquidity, the larger your share will
                          be.
                        </li>

                        <br />
                      </ul>
                    </div>
                  )}
                </div>
                <button
                  className="my-4 w-[450px] rounded-md bg-theme-1 p-3 text-base text-white"
                  onClick={() => {
                    if (isValidDetails()) {
                      setOpenReserveModal(true);
                    } else {
                      displayToast("failure", "All fields must be filled up");
                    }
                  }}
                >
                  Add to Reserve
                </button>
                {openReserveModal && (
                  <div className="mt-2 flex justify-center text-center scrollbar-hide sm:block sm:p-0">
                    <ReserveModal
                      openReserveModal={openReserveModal}
                      setOpenReserveModal={setOpenReserveModal}
                      tokenDetails={tokenDetails}
                      stableDetails={stableDetails}
                    />
                  </div>
                )}
                {openSelectModal && detailedProjects?.length >= 1 && (
                  <div className="mt-2 flex justify-center text-center scrollbar-hide sm:block sm:p-0">
                    <SelectModal
                      openSelectModal={openSelectModal}
                      setOpenSelectModal={setOpenSelectModal}
                      detailedProjects={detailedProjects}
                      setTokenDetails={setTokenDetails}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex w-full items-center justify-center">
              <div className="flex flex-col items-center justify-center">
                <p>No account is detected</p>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default Main;
