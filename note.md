





import { ethers } from "ethers";

import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { ClipLoader } from "react-spinners";
import {
  readContract,
  prepareWriteContract,
  writeContract,
  waitForTransaction,
} from "@wagmi/core";
import { erc20ABI } from "wagmi";
import { diamondAddress, adminFacetAbi } from "../../contracts";
import { inDollarFormat } from "../../utils/helper";
import { displayToast } from "../Toast";

interface ITokenDetails {
  tokenBalance: bigint;
  tokenSymbol: string;
  tokenDecimal: number;
  tokenAmount: string;
  tokenAddress: string;
}

interface IStableDetails {
  stableAddress: string;
  stableBalance: bigint;
  stableSymbol: string;
  stableDecimal: number;
  stableAmount: bigint;
}

export default function ReserveModal({
  setOpenReserveModal,
  tokenDetails,
  stableDetails,
}: {
  setOpenReserveModal: Dispatch<SetStateAction<boolean>>;
  tokenDetails: ITokenDetails;
  stableDetails: IStableDetails;
}) {

  const [isSufficientToken, setIsSufficientToken] = useState(true);
  const [isSufficientStables, setIsSufficientStables] = useState(true);

  const [isAdding, setIsAdding] = useState(false);
  const [addText, setAddText] = useState("Add to Reserve");

  // Check balance
  useEffect(() => {
    const updateStates = () => {
      const parsedTokenAmount = ethers.parseUnits(
        tokenDetails.tokenAmount,
        tokenDetails.tokenDecimal
      );

      if (parsedTokenAmount > tokenDetails.tokenBalance) {
        setIsSufficientToken(false);
      }
      if (stableDetails.stableAmount > stableDetails.stableBalance) {
        setIsSufficientStables(false);
      }
    };

    updateStates();
  }, [tokenDetails, stableDetails]);

  const approveToken = async (
    tokenAddress: string,
    tokenSymbol: string,
    tokenDecimal: number,
    tokenAmount: bigint
  ) => {
    const formattedAmount = inDollarFormat(
      Number(ethers.formatUnits(tokenAmount.toString(), tokenDecimal))
    );

    setAddText(`Approving ${formattedAmount} ${tokenSymbol}`);

    try {
      const approveRequest = await prepareWriteContract({
        address: tokenAddress as `0x${string}`,
        abi: erc20ABI,
        functionName: "approve",
        args: [diamondAddress, tokenAmount],
      });

      const { hash } = await writeContract(approveRequest);

      const approveReceipt = await waitForTransaction({
        hash,
      });

      console.log("Receipt: ", approveReceipt);
      if (approveReceipt.status == "success") {
        console.log("Approved");
        displayToast("success", `${tokenSymbol} has been approved`);
        return true;
      } else {
        console.log("Failure");
        displayToast("failure", `Failed to approve ${tokenSymbol}`);
        return false;
      }
    } catch (error) {
      console.log("Reason is that : ", error);
      displayToast("failure", `Failed to approve ${tokenSymbol}`);
      return false;
    }
  };

  const handleAddReserve = async () => {
    const parsedTokenAmount = ethers.parseUnits(
      tokenDetails.tokenAmount,
      tokenDetails.tokenDecimal
    );
    try {
      setAddText("Adding to Reserver");
      setIsAdding(true);

      // Approve the token
      const hasApprovedToken = await approveToken(
        tokenDetails.tokenAddress,
        tokenDetails.tokenSymbol,
        tokenDetails.tokenDecimal,
        parsedTokenAmount
      );

      if (!hasApprovedToken) {
        setAddText("Add To Reserve");
        setIsAdding(false);

        return;
      }

      // Approve the stables
      const hasApprovedStables = await approveToken(
        stableDetails.stableAddress,
        stableDetails.stableSymbol,
        stableDetails.stableDecimal,
        stableDetails.stableAmount
      );
      if (!hasApprovedStables) {
        setAddText("Add To Reserve");
        setIsAdding(false);
        return;
      }

      setAddText("Adding to Reserve");

      // Add to Reserve
      const addRequest = await prepareWriteContract({
        address: diamondAddress as `0x${string}`,
        abi: adminFacetAbi,
        functionName: "addToReserve",
        args: [
          tokenDetails.tokenAddress,
          parsedTokenAmount,
          stableDetails.stableAmount,
        ],
      });

      const { hash } = await writeContract(addRequest);

      const addReceipt = await waitForTransaction({
        hash,
      });

      console.log("Receipt: ", addReceipt);
      if (addReceipt.status == "success") {
        displayToast("success", "Added to Reserve");
        console.log("Success");
      } else {
        console.log("Failure");
        console.log("Failed to Add");
      }

      setIsAdding(false);
      setAddText(`Add to Reserve`);
    } catch (error) {
      console.log("Error: ", error);
      displayToast("failure", "An error occured. Try again later.");
      setIsAdding(false);
      setAddText(`Add to Reserve`);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-gray-900 bg-opacity-75 transition-opacity">
      <div
        tabIndex={-1}
        className="mt-16 inline-block h-5/6  w-full max-w-sm transform overflow-auto rounded-lg text-left align-bottom outline-none scrollbar-hide sm:max-w-lg"
      >
        <div className="relative  h-full md:h-auto">
          {/* <!-- Modal content --> */}

          <div className="relative mx-3 rounded-lg bg-gray-800 shadow">
            <div className="font-hand bg-gray-800 p-5">
              <div className="flex items-center justify-between rounded-t">
                <div className="text-center text-3xl  text-gray-700 dark:text-gray-400 sm:text-2xl">
                  Add to Reserve
                </div>
                <button
                  onClick={() => {
                    setOpenReserveModal(false);
                  }}
                  type="button"
                  className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:hover:text-gray-400"
                  data-modal-toggle="small-modal"
                >
                  <svg
                    className="h-5 w-5  dark:text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </button>
              </div>

              {true ? (
                <>
                  <div className="my-5 flex w-full flex-col items-center  ">
                    <p className="py-2 text-sm text-gray-600  dark:text-gray-400">
                      Are you sure you want to add to the reserve?
                    </p>
                  </div>
                  <div className="rounded-md border p-4 text-gray-300">
                    <div className="flex justify-between text-sm">
                      <p className="font-medium">{tokenDetails.tokenSymbol}:</p>
                      <p className="">
                        {inDollarFormat(Number(tokenDetails.tokenAmount))}
                      </p>
                    </div>
                    <div className="mt-2 flex justify-between text-sm">
                      <p className="font-medium">
                        {stableDetails.stableSymbol}:
                      </p>
                      <p className="">
                        {ethers.formatUnits(
                          stableDetails.stableAmount,
                          stableDetails.stableDecimal
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3 overflow-auto rounded-md border p-2 py-4 px-4 text-sm scrollbar-hide">
                    <h4 className="">Note:</h4>
                    <ul className="text-xs text-gray-300">
                      <li>
                        A portion of the insurance fee, equivalent to 30%, will
                        be distributed among all investors, offering you an
                        opportunity to receive a share of it based on your level
                        of liquidity.
                      </li>

                      <br />
                      <li>
                        The greater your liquidity, the larger your share will
                        be.
                      </li>

                      <br />
                    </ul>
                  </div>
                  {!isSufficientStables && (
                    <p className="mt-1 pt-2 text-[11px] text-red-500">
                      Insufficient {stableDetails.stableSymbol} balance
                    </p>
                  )}
                  {!isSufficientToken && (
                    <p className="mt-1 pt-2 text-[11px] text-red-500">
                      Insufficient {tokenDetails.tokenSymbol} balance
                    </p>
                  )}

                  <div className="flex w-full justify-center">
                    <button
                      disabled={
                        isAdding || !isSufficientStables || !isSufficientToken
                      }
                      onClick={handleAddReserve}
                      className="my-4 w-[450px] rounded-md border border-gray-600 bg-gray-700 p-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isAdding ? (
                        <div className="flex items-center justify-center">
                          <ClipLoader color="#fff" loading={true} size={30} />
                          <p className="ml-2">{addText}</p>
                        </div>
                      ) : (
                        <div className="flex w-full items-center">
                          <p className="w-full">{addText}</p>
                        </div>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <> Investment has Ended</>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}






--------------------------------------------------------------------------------------
import users from "../../fakers/users";
import departments from "../../fakers/departments";
import products from "../../fakers/products";
import { Menu } from "../../base-components/Headless";
import Lucide from "../../base-components/Lucide";
import { FormInput } from "../../base-components/Form";
import { Dialog as HeadlessDialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import _ from "lodash";
import { RootState } from "../../stores/store";
import { readContract, multicall } from "@wagmi/core";
import { useSelector } from "react-redux";
import { erc20ABI } from "wagmi";
import { SUPPORTED_CHAIN_ID } from "../../contracts";
import { getProjectInfo, getProjectMetrics } from "../../stores/insuranceSlice";
import { AiOutlineArrowRight } from "react-icons/ai";
import { Link } from "react-router-dom";

interface MainProps {
  quickSearch: boolean;
  setQuickSearch: (val: boolean) => void;
}

interface DetailedProject {
  name: string;
  symbol: string;
  decimals: number;
  logo: string;
  tokenAddress: string;
}

const searchTokens = (tokens: DetailedProject[], input: string) => {
  input = input.toLowerCase(); // Convert input to lowercase for case-insensitive search

  return tokens.filter((token) => {
    const { name, symbol, tokenAddress } = token;
    return (
      name.toLowerCase().includes(input) ||
      symbol.toLowerCase().includes(input) ||
      input.toLowerCase() == tokenAddress.toLowerCase()
    );
  });
};

function Main(props: MainProps) {
  const [detailedProjects, setDetailedProjects] = useState<DetailedProject[]>(
    []
  );
  const { allProjects } = useSelector((state: RootState) => state.insurance);
  const [loadedProjects, setLoadedProjects] =
    useState<DetailedProject[]>(detailedProjects);
  let [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    document.onkeydown = function (evt) {
      if (evt.key === "Escape" || evt.key === "Esc") {
        props.setQuickSearch(false);
      } else if ((evt.ctrlKey || evt.metaKey) && evt.key === "k") {
        props.setQuickSearch(true);
      }
    };
  }, []);

  useEffect(() => {
    const updateToken = async () => {
      if (allProjects) {
        const robustProjects = allProjects.map(
          async (currentProject: string) => {
            // Name, symbols, decimals, token address

            const data = await multicall({
              chainId: SUPPORTED_CHAIN_ID,
              contracts: [
                {
                  address: currentProject as `0x${string}`,
                  abi: erc20ABI,
                  functionName: "name",
                },
                {
                  address: currentProject as `0x${string}`,
                  abi: erc20ABI,
                  functionName: "symbol",
                },
                {
                  address: currentProject as `0x${string}`,
                  abi: erc20ABI,
                  functionName: "decimals",
                },
              ],
            });

            console.log("Data inside project: ", data);

            const currentProjectInfo = await getProjectInfo(currentProject);

            return {
              name: data[0].result || "",
              symbol: data[1].result || "",
              decimals: data[2].result || 0,
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

  useEffect(() => {
    const loadProjects = async () => {
      //const input = "flx";
      const matchingTokens = searchTokens(detailedProjects, searchInput);

      setLoadedProjects(matchingTokens);
    };
    loadProjects();
  }, [searchInput]);

  return (
    <>
      <Transition appear show={props.quickSearch} as={Fragment}>
        <HeadlessDialog
          as="div"
          className="relative z-[60]"
          onClose={props.setQuickSearch}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-50"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gradient-to-b from-theme-1/50 via-theme-2/50 to-black/50 backdrop-blur-sm" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex justify-center my-2 sm:mt-40">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-50"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-100"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <HeadlessDialog.Panel className="sm:w-[600px] lg:w-[700px] w-[95%] relative mx-auto transition-transform">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center justify-center w-12">
                      <Lucide
                        icon="Search"
                        className="w-5 h-5 -mr-1.5 text-slate-500 stroke-[1]"
                      />
                    </div>
                    <FormInput
                      className="pl-12 pr-14 py-3.5 text-base rounded-lg focus:ring-0 border-0 shadow-lg"
                      type="text"
                      placeholder="Quick search..."
                      onChange={(e) => {
                        setSearchInput(e.target.value);
                      }}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center w-14">
                      <div className="px-2 py-1 mr-auto text-xs border rounded-[0.4rem] bg-slate-100 text-slate-500/80">
                        ESC
                      </div>
                    </div>
                  </div>
                  <div className="relative z-10 pb-1 mt-1 bg-white rounded-lg shadow-lg max-h-[468px] sm:max-h-[615px] overflow-y-auto">
                    {detailedProjects && detailedProjects.length == 0 ? (
                      <div className="flex flex-col items-center justify-center pt-20 pb-28">
                        <Lucide
                          icon="SearchX"
                          className="w-20 h-20 text-theme-1/20 fill-theme-1/5 stroke-[0.5]"
                        />
                        <div className="mt-5 text-xl font-medium">
                          No result found
                        </div>
                        <div className="w-2/3 mt-3 leading-relaxed text-center text-slate-500">
                          No results found for{" "}
                          <span className="italic font-medium">
                            "{searchInput}
                          </span>
                          ". Please try a different search term or check your
                          spelling.
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="px-5 py-4 border-t border-dashed">
                          <div className="flex items-center">
                            <div className="text-xs uppercase text-slate-500">
                              Products
                            </div>
                            <a
                              className="ml-auto text-xs text-slate-500"
                              href=""
                            >
                              See All
                            </a>
                          </div>
                          <div className="my-2 rounded-md border">
                            {loadedProjects && loadedProjects.length > 0 ? (
                              loadedProjects.map(
                                (currentProject: DetailedProject, index) => {
                                  return (
                                    <Link
                                      className="flex cursor-pointer items-center justify-between py-2 px-3 hover:bg-gray-100"
                                      key={index}
                                      to={`/project/${currentProject.tokenAddress}`}
                                    >
                                      <div className="flex items-center space-x-2">
                                        <div>
                                          <img
                                            src={currentProject.logo}
                                            width={30}
                                            height={30}
                                          />
                                        </div>

                                        <div>
                                          <p className="text-base">
                                            {currentProject.symbol}
                                          </p>
                                          <p className=" text-sm text-gray-400">
                                            {currentProject.name}
                                          </p>
                                        </div>
                                      </div>
                                      <AiOutlineArrowRight className="text-lg" />
                                    </Link>
                                  );
                                }
                              )
                            ) : (
                              <div className="flex w-full justify-center py-3">
                                <p className="text-sm">No results found</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </HeadlessDialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </HeadlessDialog>
      </Transition>
    </>
  );
}

export default Main;










When the page loads,
1. Check if project's investment page has been created. 
2. If it has, load all the project details. We do not care if the user has connected his/her wallet at this moment.
3. When you are done loading, show the user. Otherwise, show a loader when you are currently loading.
4. If after loading, you were not able to load any data, stop the loader and tell the user that Something is wrong. They should try loading again.



DATABASE


When you click on the Next/Previous Button, It has to check if you've inputed some data. 
If you have, a modal will appear asking you whether you want to save or not.
TO save data, It will map the current data with your wallet address meaning that you have to connect your wallet first.
Otherwise, It will just go to the next page directly.

When you come back to the page, we will query the database immediately to retrieve the data that was initially stored. and the data will occupy their respective input field.






// Form to Create Project
import { useContext, useState, useRef, useEffect, ChangeEvent } from "react";

import { Web3Button, Web3NetworkSwitch } from "@web3modal/react";



import { ethers } from "ethers";
import { ClipLoader, GridLoader } from "react-spinners";
import { erc20ABI, useAccount, useDisconnect } from "wagmi";


import {
  readContract,
  prepareWriteContract,
  writeContract,
  waitForTransaction,
} from "@wagmi/core";


import { useAppDispatch } from "../../stores/hooks";
import { RootState } from "../../stores/store";
import { useSelector } from "react-redux";
import { createFacetAbi, diamondAddress, pancakeswapRouter, usdtAddress, wbnbAddress } from "../../contracts";
import { displayToast } from "../../components/Toast";
import { inDollarFormat, sDuration } from "../../utils/helper";
import InputLabel from "../../components/InputLabel";
import Input from "../../components/Input";
import Moralis from "moralis/.";

// const Moralis = require("moralis").default;

function Main() {

    const dispatch = useAppDispatch();

    const { signerAddress, balance, chainId } = useSelector(
      (state: RootState) => state.wallet
    );
    const {
      protocolDetails,
   
    } = useSelector((state: RootState) => state.insurance);
  
  const { isConnected } = useAccount();


  let [selectedDuration, setSelectedDuration] = useState(100);

  let [insuranceFeePercentage, setInsuranceFeePercentage] = useState("");
  let [liquidityFeePercentage, setLiquidityFeePercentage] = useState("");
  let [penaltyFeePercentage, setPenaltyFeePercentage] = useState("");
  let [minAmount, setMinAmount] = useState("");
  let [maxAmount, setMaxAmount] = useState("");
  let [tokenAddress, setTokenAddress] = useState("");
  let [treasuryAddress, setTreasuryAddress] = useState("");
  let [router, setRouter] = useState("");
  let [rewardPercentages, setRewardPercentages] = useState("");
  let [rewardDurations, setRewardDurations] = useState("");
  let [twitterHandle, setTwitterHandle] = useState("");
  let [telegramHandle, setTelegramHandle] = useState("");
  let [discordHandle, setDiscordHandle] = useState("");

  const [isCreating, setIsCreating] = useState(false);
  const [createText, setCreateText] = useState("Create Project");

  const [isvalidTokenAddress, setIsValidTokenAddress] = useState(false);
  const [isValidThresholdPercentage, setIsValidThresholdPercentage] =
    useState(true);
  const [isValidMinAmount, setIsValidMinAmount] = useState(true);
  const [isValidMaxAmount, setIsValidMaxAmount] = useState(true);
  const [isValidTreasuryAddress, setIsValidTreasuryAddress] = useState(true);
  const [isValidInsuranceFeePercentage, setIsValidInsuranceFeePercentage] =
    useState(true);
  const [isValidLiquidityFeePercentage, setIsValidLiquidityFeePercentage] =
    useState(true);
  const [isValidPenaltyFeePercentage, setIsValidPenaltyFeePercentage] =
    useState(true);

  // For the image
  const hiddenFileInput = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File>();
  const [imageSrc, setImageSrc] = useState("");
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [base64Data, setBase64Data] = useState<string | null>(null);

  const validWidth: number = 500;
  const validHeight: number = 500;

  const checkValidity = () => {
    if (
      !isvalidTokenAddress ||
      !isValidThresholdPercentage ||
      !isValidMinAmount ||
      !isValidMaxAmount ||
      !isValidTreasuryAddress ||
      !isValidInsuranceFeePercentage ||
      !isValidPenaltyFeePercentage ||
      !isValidInsuranceFeePercentage
    ) {
      return false;
    }

    return true;
  };

  const approveToken = async () => {
    if (protocolDetails) {
      setCreateText(
        `Approving to withdraw ${ethers.formatUnits(
          protocolDetails.creationFee.toString(),
          18
        )} USDT`
      );

      try {
        const decimals = (await readContract({
          address: tokenAddress as `0x${string}`,
          abi: erc20ABI,
          functionName: "decimals",
        })) as number;

        const approveRequest = await prepareWriteContract({
          address: usdtAddress as `0x${string}`,
          abi: erc20ABI,
          functionName: "approve",
          args: [diamondAddress, (protocolDetails?.creationFee as bigint)],
        });

        const { hash } = await writeContract(approveRequest);

        const approveReceipt = await waitForTransaction({
          hash,
        });

        console.log("Receipt: ", approveReceipt);
        if (approveReceipt.status == "success") {
          console.log("Approved");
          displayToast("success", `USDT has been approved`);
          setCreateText(`Creating Project`);
          return true;
        } else {
          console.log("Failure");
          displayToast("failure", `Failed to approve USDT`);
          setCreateText(`Create Project`);
          return false;
        }
      } catch (error) {
        console.log("Error: ", error);
        displayToast("failure", `Failed to approve USDT`);
        setCreateText(`Create Project`);

        return false;
      }
    }
  };

  const getImageUrl = async () => {
    try {
      if (!Moralis.Core.isStarted) {
        await Moralis.start({
          apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
        });
        }
        if (imageFile) {
             const uploadArray = [
               {
                 path: imageFile?.name,
                 content: base64Data!,
               },
             ];

             const response = await Moralis.EvmApi.ipfs.uploadFolder({
               abi: uploadArray,
             });

             const imageUrl = response.result[0].path as string;

             return imageUrl;

        }

         } catch (error) {
      return "";
    }
  };

  const handleCreateProject = async () => {
    const allValid = checkValidity();

    console.log("We are here");

    if (!allValid) {
      displayToast("failure", "All Fields must be filled correctly");
      return;
    }

    const validPercentages: number[] = JSON.parse(rewardPercentages).map(
      (percentage: string) => {
        return Number(percentage) * 100;
      }
    );
    const validDurations: number[] = JSON.parse(rewardDurations).map(
      (duration: string) => {
        return sDuration.days(Number(duration));
      }
    );

    // Create the project
    setIsCreating(true);
    setCreateText(`Creating Project`);

    try {
      // Upload image to IPFS
      setCreateText("Uploading Data");

      const logoUrl = await getImageUrl();

      if (!logoUrl) {
        displayToast("failure", "Error encountered while uploading data..");
        return;
      }

      setCreateText("Creating Project");

      const decimals = (await readContract({
        address: tokenAddress as `0x${string}`,
        abi: erc20ABI,
        functionName: "decimals",
      })) as number;

      // Your USDT has to be approved first
      const result = await approveToken();

      if (!result) {
        return;
      }

      const tokenToUsd = [tokenAddress, wbnbAddress, usdtAddress];

      const createRequest = await prepareWriteContract({
        address: diamondAddress as `0x${string}`,
        abi: createFacetAbi,
        functionName: "createProject",
        args: [
          ethers.parseUnits(minAmount, decimals),
          ethers.parseUnits(maxAmount, decimals),
          Number(insuranceFeePercentage) * 100,
          Number(liquidityFeePercentage) * 100,
          Number(penaltyFeePercentage) * 100,
          tokenAddress,
          treasuryAddress,
          pancakeswapRouter,
          usdtAddress,
          wbnbAddress,
          logoUrl,
          discordHandle,
          twitterHandle,
          telegramHandle,
          tokenToUsd,
          validPercentages,
          validDurations,
        ],
      });

      const { hash } = await writeContract(createRequest);

      const createReceipt = await waitForTransaction({
        hash,
      });

      console.log("Receipt: ", createReceipt);
      if (createReceipt.status == "success") {
        console.log("Success");
        displayToast("success", "Project has been created");
      } else {
        console.log("Failure");
        console.log("Failed to Supply");
      }
    } catch (error) {
      console.log("Errorrrrr: ", error);

      displayToast("failure", "Failed to create");
      setIsCreating(false);
      setCreateText(`Create Project`);
    } finally {
      setIsCreating(false);
      setCreateText(`Create Project`);
    }
  };



  /*


  Reward percentages in array
  Corresponding days in array
  
  */ 


  
  return (
    <>
    

      {!chainId ? (
        <></>
      ) : (
        <div className="container relative mx-auto h-full ">
          {signerAddress ? (
            <div className="flex w-full flex-col items-center justify-center gap-4">
              <h1>Launch your Insurance Protocol</h1>
              <div className="flex flex-col items-center space-y-8">
                <div className="flex flex-col items-center space-y-8">
                  <div className="w-[450px]">
                    <InputLabel
                      title=""
                      subTitle="Enter the token address:"
                      note={
                        <p className="text-[12px]">
                          This is the address of the token to which you wish to
                          incorporate utility within the insurance protocol.
                          <br />
                          <br />
                          Input should be a token address, For example: <br />
                          <br />
                          <span className="text-[13px]">
                            0x1234567890123456789012345678901234567890
                          </span>{" "}
                          <br />
                          <br />
                          The example shows how a token address should look
                          like.
                        </p>
                      }
                    />
                    <Input
                      onChange={(event) => {
                        const { value } = event.target;
                        setTokenAddress(value);

                        const standardAddressPattern = /^0x[0-9a-fA-F]{40}$/;
                        if (!standardAddressPattern.test(value)) {
                          setIsValidTokenAddress(false);
                        } else {
                          setIsValidTokenAddress(true);
                        }
                      }}
                      type="text"
                      placeholder={""}
                      inputClassName="spin-button-hidden"
                    />
                    {!isvalidTokenAddress && (
                      <p className="mt-1 text-[11px] text-red-700">
                        Invalid Token Address
                      </p>
                    )}
                  </div>
                  <div className="w-[450px]">
                    <InputLabel
                      title=""
                      subTitle="Enter the minimum amount"
                      note={
                        <p className="text-[12px]">
                          This indicates the minimum amount an investor can
                          invest with.
                          <br />
                          <br />
                          Input should be a number, for example -{" "}
                          <span className="text-[13px]">100</span> <br />
                          <br />
                          The example implies that the minimum amount that can
                          be invested is 100 TOKEN.
                        </p>
                      }
                    />

                    <Input
                      onChange={(event) => {
                        const { value } = event.target;
                        setMinAmount(value);

                        if (Number(value) < 0) {
                          setIsValidMinAmount(false);
                        } else {
                          setIsValidMinAmount(true);
                        }
                      }}
                      type="number"
                      inputClassName="spin-button-hidden"
                    />
                    {!isValidMinAmount && (
                      <p className="mt-1 text-[11px] text-red-700">
                        Min amount has to be greater than 0
                      </p>
                    )}
                  </div>
                  <div className="w-[450px]">
                    <InputLabel
                      title=""
                      subTitle="Enter the maximum amount"
                      note={
                        <p className="text-[12px]">
                          This indicates the maximum amount an investor can
                          invest with.
                          <br />
                          <br />
                          Input should be a number, for example -{" "}
                          <span className="text-[13px]">500000</span> <br />
                          <br />
                          The example implies that the maximum amount that can
                          be invested is 500,000 TOKEN.
                        </p>
                      }
                    />
                    <Input
                      onChange={(event) => {
                        const { value } = event.target;
                        setMaxAmount(value);

                        if (Number(value) < 0) {
                          setIsValidMaxAmount(false);
                        } else {
                          setIsValidMaxAmount(true);
                        }
                      }}
                      type="number"
                      inputClassName="spin-button-hidden"
                    />
                    {!isValidMaxAmount && (
                      <p className="mt-1 text-[11px] text-red-700">
                        Max amount has to be greater than 0
                      </p>
                    )}
                  </div>
                  <div className="w-[450px]">
                    <InputLabel
                      title=""
                      subTitle="Enter Treasury Address:"
                      note={
                        <p className="text-[12px]">
                          This is the wallet address that funds will be sent to.
                          <br />
                          <br />
                          (1) Funds will be sent when an investor ends an
                          investment before it reaches the specified duration{" "}
                          <br />
                          <br />
                          (2) Funds will be sent when an investor creates an
                          investment.
                          <br />
                          <br />
                          Input should be a wallet address, For example: <br />
                          <br />
                          <span className="text-[13px]">
                            0x1234567890123456789012345678901234567890
                          </span>{" "}
                          <br />
                          <br />
                          The example shows how a wallet address should look
                          like.
                        </p>
                      }
                    />
                    <Input
                      onChange={(event) => {
                        const { value } = event.target;
                        setTreasuryAddress(value);

                        const standardAddressPattern = /^0x[0-9a-fA-F]{40}$/;
                        if (!standardAddressPattern.test(value)) {
                          setIsValidTreasuryAddress(false);
                        } else {
                          setIsValidTreasuryAddress(true);
                        }
                      }}
                      type="text"
                      placeholder={""}
                      inputClassName="spin-button-hidden"
                    />
                    {!isValidTreasuryAddress && (
                      <p className="mt-1 text-[11px] text-red-700">
                        Invalid treasury address
                      </p>
                    )}
                  </div>
                  <div className="w-[450px]">
                    <InputLabel
                      title=""
                      subTitle="Enter Insurance Fee Percentage:"
                      note={
                        <p className="text-[12px]">
                          This specifies the fee an investor has to pay when
                          creating an investment.
                          <br />
                          <br />
                          Input should be a number within 1 to 100, for example
                          - <span className="text-[13px]">10</span> <br />
                          <br />
                          The example illustrates that when an investor intends
                          to create an investment with, let's say, 1000 TOKEN,
                          the platform will perform a conversion of these 1000
                          TOKEN into USD. In this example, suppose that 1000
                          TOKEN is equivalent to $1000. Consequently, the user
                          is required to make a payment equal to 50% of $1000,
                          which amounts to $500 as an insurance fee. This fee
                          will be collected from the user in USDT.
                        </p>
                      }
                    />
                    <Input
                      onChange={(event) => {
                        const { value } = event.target;
                        setInsuranceFeePercentage(value);

                        if (Number(value) < 0 || Number(value) > 100) {
                          setIsValidInsuranceFeePercentage(false);
                        } else {
                          setIsValidInsuranceFeePercentage(true);
                        }
                      }}
                      type="number"
                      inputClassName="spin-button-hidden"
                    />
                    {!isValidInsuranceFeePercentage && (
                      <p className="mt-1 text-[11px] text-red-700">
                        Insurance fee percentage has to be within 1 and 100
                      </p>
                    )}
                  </div>
                  <div className="w-[450px]">
                    <InputLabel
                      title=""
                      subTitle="Enter Liquidity Percentage:"
                      note={
                        <p className="text-[12px]">
                          This indicates the portion of the insurance fee that
                          will be distributed among all liquidity providers for
                          your token.
                          <br />
                          <br />
                          Input should be a number within 1 to 100, for example
                          - <span className="text-[13px]">30</span> <br />
                          <br />
                          This example demonstrates that when a user pays an
                          insurance fee of 500 USDT, 30% of this amount, which
                          equals 150 USDT, will be distributed among all
                          liquidity providers based on the amount of liquidity
                          they contributed
                        </p>
                      }
                    />
                    <Input
                      onChange={(event) => {
                        const { value } = event.target;
                        setLiquidityFeePercentage(value);

                        if (Number(value) < 0 || Number(value) > 100) {
                          setIsValidLiquidityFeePercentage(false);
                        } else {
                          setIsValidLiquidityFeePercentage(true);
                        }
                      }}
                      type="number"
                      inputClassName="spin-button-hidden"
                    />
                    {!isValidLiquidityFeePercentage && (
                      <p className="mt-1 text-[11px] text-red-700">
                        Liquidity fee percentage has to be within 1 and 100
                      </p>
                    )}
                  </div>
                  <div className="w-[450px]">
                    <InputLabel
                      title=""
                      subTitle="Enter Penalty Percentage:"
                      note={
                        <p className="text-[12px]">
                          This represents the fraction of the investor's initial
                          investment that will be directed to the treasury if
                          the investor decides to terminate the investment
                          prematurely, prior to the duration initially specified
                          by the investor.
                          <br />
                          <br />
                          Input should be a number within 1 to 100, for example
                          - <span className="text-[13px]">50</span> <br />
                          <br />
                          This example demonstrates that when a user commits
                          1000 TOKEN to an investment lasting one year, and
                          subsequently opts to terminate the investment prior to
                          the full year's duration, 50% of the initial
                          investment, specifically 50% of the 1000 TOKEN amount,
                          totaling 500 TOKEN, will be directed to the previously
                          mentioned treasury. The remaining 500 TOKEN will be
                          returned to the investor.
                        </p>
                      }
                    />
                    <Input
                      onChange={(event) => {
                        const { value } = event.target;
                        setPenaltyFeePercentage(value);

                        if (Number(value) < 0 || Number(value) > 100) {
                          setIsValidPenaltyFeePercentage(false);
                        } else {
                          setIsValidPenaltyFeePercentage(true);
                        }
                      }}
                      type="number"
                      inputClassName="spin-button-hidden"
                    />
                    {!isValidPenaltyFeePercentage && (
                      <p className="mt-1 text-[11px] text-red-700">
                        Penalty fee percentage has to be within 1 and 100
                      </p>
                    )}
                  </div>
                  <div className="w-[450px]">
                    <InputLabel
                      title=""
                      subTitle="Input the percentage interest in an array"
                    />
                    <Input
                      onChange={(event) => {
                        const { value } = event.target;
                        setRewardPercentages(value);
                      }}
                      type="text"
                      placeholder="[10, 30, 60] in percentages"
                      inputClassName="spin-button-hidden"
                    />
                  </div>
                  <div className="w-[450px]">
                    <InputLabel
                      title=""
                      subTitle="Input the corresponding days in an array:"
                    />

                    <Input
                      onChange={(event) => {
                        const { value } = event.target;
                        setRewardDurations(value);
                      }}
                      type="text"
                      placeholder="[300, 600, 1200] in days"
                      inputClassName="spin-button-hidden"
                    />
                    {rewardDurations && (
                      <div className="mt-2  w-full ">
                        <p className="text-[13px] dark:text-gray-400">
                          Current Days: {JSON.stringify(rewardDurations)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="  w-[450px]">
                    <InputLabel
                      title=""
                      subTitle="Select a logo for your project:"
                    />
                    <div className="h-[500px] w-[500px] border border-gray-700 hover:bg-gray-800">
                      <button
                        className="h-full w-full"
                        id="image"
                        onClick={() => {
                          if (hiddenFileInput.current) {
                            hiddenFileInput.current.click();
                          }
                        }}
                      >
                        {imageSrc &&
                        imageDimensions.width == validWidth &&
                        imageDimensions.height == validHeight ? (
                          <div className="h-full w-full">
                            <img
                              alt="logo"
                              src={imageSrc}
                              width={500}
                              height={500}
                              className=""
                            />
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm">Select a File</p>
                            <p className="px-2 text-sm text-gray-500">
                              <small>
                                It must be a JPG, PNG, GIF, TIFF, or BMP
                              </small>
                            </p>
                            <p className="px-2 text-sm text-gray-500">
                              <small>
                                Image dimension must be {validWidth} x{" "}
                                {validHeight}
                              </small>
                            </p>
                          </div>
                        )}
                      </button>
                      <input
                        type="file"
                        id="imageSrc"
                        ref={hiddenFileInput}
                        style={{ display: "none" }}
                        onChange={(event) => {
                          const { value } = event.target;
                          console.log("Thread is here");

                          console.log("Event: ", event.target.files);

                          if (event.target.id == "imageSrc") {
                            const files = event.target.files;

                            let width: number;
                            let height: number;

                            console.log(files);

                            if (files && files.length > 0) {
                              const imageFile = files[0];
                              const reader = new FileReader();

                              reader.onload = (e) => {
                                // Get the file content as a base64-encoded string

                                const img = new Image();
                                img.onload = () => {
                                  width = img.width;
                                  height = img.height;

                                  console.log(
                                    `Width is ${width} and height is ${height}`
                                  );

                                  console.log("Width: ", width);
                                  console.log("Height: ", height);

                                  if (
                                    width != validWidth ||
                                    height != validHeight
                                  ) {
                                    displayToast(
                                      "failure",
                                      `Image dimension should be ${validWidth} x ${validHeight} `
                                    );
                                  }

                                  setImageDimensions({ width, height });
                                };

                                img.src = reader.result as string;

                                const base64String = (
                                  e.target?.result as string
                                )
                                  ?.toString()
                                  ?.split(",")[1];

                                if (base64String) {
                                  // Do something with base64String
                                  setBase64Data(base64String);
                                } else {
                                  // Handle the case when base64String is null or undefined
                                  console.error(
                                    "Error: Unable to read base64String from the file."
                                  );
                                }
                              };

                              // Read the file as a data URL (base64 encoded)
                              reader.readAsDataURL(imageFile);

                              if (imageFile) {
                                setImageFile(imageFile);

                                setImageSrc(URL.createObjectURL(imageFile));
                              }
                            }
                          }
                        }}
                        className="mt-1 block w-80 rounded-md border border-gray-300 p-2 text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="w-[450px]">
                    <InputLabel
                      title=""
                      subTitle="Enter your twitter handle:"
                      note={
                        <p className="text-[12px]">
                          This is the address of the token to which you wish to
                          incorporate utility within the insurance protocol.
                          <br />
                          <br />
                          Input should be a token address, For example: <br />
                          <br />
                          <span className="text-[13px]">
                            0x1234567890123456789012345678901234567890
                          </span>{" "}
                          <br />
                          <br />
                          The example shows how a token address should look
                          like.
                        </p>
                      }
                    />
                    <Input
                      onChange={(event) => {
                        const { value } = event.target;
                        setTwitterHandle(value);
                      }}
                      type="text"
                      placeholder={""}
                      inputClassName="spin-button-hidden"
                    />
                  </div>
                  <div className="w-[450px]">
                    <InputLabel
                      title=""
                      subTitle="Enter your Discord handle:"
                      note={
                        <p className="text-[12px]">
                          This is the address of the token to which you wish to
                          incorporate utility within the insurance protocol.
                          <br />
                          <br />
                          Input should be a token address, For example: <br />
                          <br />
                          <span className="text-[13px]">
                            0x1234567890123456789012345678901234567890
                          </span>{" "}
                          <br />
                          <br />
                          The example shows how a token address should look
                          like.
                        </p>
                      }
                    />
                    <Input
                      onChange={(event) => {
                        const { value } = event.target;
                        setDiscordHandle(value);
                      }}
                      type="text"
                      placeholder={""}
                      inputClassName="spin-button-hidden"
                    />
                  </div>
                  <div className="w-[450px]">
                    <InputLabel
                      title=""
                      subTitle="Enter your telegram handle:"
                      note={
                        <p className="text-[12px]">
                          This is the address of the token to which you wish to
                          incorporate utility within the insurance protocol.
                          <br />
                          <br />
                          Input should be a token address, For example: <br />
                          <br />
                          <span className="text-[13px]">
                            0x1234567890123456789012345678901234567890
                          </span>{" "}
                          <br />
                          <br />
                          The example shows how a token address should look
                          like.
                        </p>
                      }
                    />
                    <Input
                      onChange={(event) => {
                        const { value } = event.target;
                        setTelegramHandle(value);
                      }}
                      type="text"
                      placeholder={""}
                      inputClassName="spin-button-hidden"
                    />
                  </div>
                  {protocolDetails && BigInt(protocolDetails.taxPercentage) > 0n && (
                    <p className="mt-2 w-full text-[12px]">
                      NB:{" "}
                      {inDollarFormat(
                        Number(
                          ethers.formatUnits(protocolDetails.creationFee, 18)
                        )
                      )}{" "}
                      USDT should be in your wallet address.
                    </p>
                  )}
                </div>

                <button
                  disabled={isCreating}
                  onClick={handleCreateProject}
                  className={`${
                    isCreating && "cursor-not-allowed opacity-50"
                  } mx-4 w-full rounded-full bg-gray-800 p-2 `}
                >
                  {isCreating ? (
                    <div className="flex w-full items-center justify-center space-x-4">
                      <ClipLoader color="#fff" loading={true} size={30} />
                      <p className="ml-2">{createText}</p>
                    </div>
                  ) : (
                    <div className="flex w-full items-center">
                      <p className="w-full">{createText}</p>
                    </div>
                  )}
                  {/*  */}
                </button>

                {/* <button onClick={upload}>Upload File</button> */}
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
};


export default Main;






Copy and paste the code below into src/components/HomeProject/index.tsx

import { EtherSymbol, ethers } from "ethers";
import { useEffect, useState } from "react";
import { LiquidityProviders, Metrics, ProjectInfo } from "../../types/general";
import {
  getLiquidityProviders,
  getProjectInfo,
  getProjectMetrics,
  loadLiquidityProviders,
  loadProjectInfo,
  loadProjectMetrics,
} from "../../stores/insuranceSlice";
import { Link } from "react-router-dom";
import { IDetailedProject } from "../../pages/Home";
import { inDollarFormat } from "../../utils/helper";

interface IHomeProject {
  project: IDetailedProject;
}
export default function HomeProject({ project }: IHomeProject) {
  let [liquidityProviders, setLiquidityProviders] =
    useState<LiquidityProviders[]>();
  let [projectMetrics, setProjectMetrics] = useState<Metrics>();
  let [projectInfo, setProjectInfo] = useState<ProjectInfo>();

  let [totalStableLiquidity, setTotalStableLiquidity] = useState<bigint>();


  useEffect(() => {
    const fetchLiquidityProviders = async () => {
      const liquidityProviders = await getLiquidityProviders(
        project.projectAddress
      );

      const projectMetrics = await getProjectMetrics(project.projectAddress);
      const projectInfo = await getProjectInfo(project.projectAddress);

      if (projectMetrics) {
        setProjectMetrics(projectMetrics);
      }
      if (projectInfo) {
        setProjectInfo(projectInfo);
      }

      if (liquidityProviders) {
        const totalStableLiquidity = liquidityProviders.reduce(
          (accumulator, currentLiquidityProvider) =>
            accumulator + currentLiquidityProvider.stableAmount,
          0n
        );
        setTotalStableLiquidity(totalStableLiquidity);
        setLiquidityProviders(liquidityProviders);
      }
    };
    fetchLiquidityProviders();
  }, [project]);

  console.log("Total stable liquidity: ", totalStableLiquidity);
  console.log(
    "Total number of liquidity providers: ",
    liquidityProviders?.length
  );
  return (
    <Link to={`/project/${project.projectAddress}`}>
      <div className="border border-slate-500 p-3 text-sm leading-normal">
        <img
          alt={project.name}
          src={projectInfo?.logo}
          width={30}
          height={30}
        />
        <button className="my-3 rounded-md bg-gray-700 p-2">
          {project.name}
        </button>
        <p>Total number of liquidity providers: {liquidityProviders?.length}</p>
        <p>
          Total {project.symbol} in the reserve:{" "}
          {projectMetrics
            ? inDollarFormat(
                Number(
                  ethers.formatUnits(
                    projectMetrics?.investmentReserveBalance,
                    project.decimals
                  )
                )
              )
            : "--"}{" "}
          {project.symbol}
        </p>
        <p>
          Available {project.symbol} in the reserve:{" "}
          {projectMetrics
            ? inDollarFormat(
                Number(
                  ethers.formatUnits(
                    projectMetrics?.investmentReserveBalance,
                    project.decimals
                  )
                ) -
                  Number(
                    ethers.formatUnits(
                      projectMetrics?.totalAccumulatedReward,
                      project.decimals
                    )
                  )
              )
            : "--"}{" "}
          {project.symbol}
        </p>
        <p>
          Total USDT in the reserve:{" "}
          {projectMetrics
            ? inDollarFormat(
                Number(
                  ethers.formatUnits(projectMetrics?.stableReserveBalance, 18)
                )
              )
            : "--"}{" "}
          USDT
        </p>
        <p>
          Available USDT:{" "}
          {projectMetrics
            ? inDollarFormat(
                Number(
                  ethers.formatUnits(projectMetrics?.stableReserveBalance, 18)
                ) -
                  Number(
                    ethers.formatUnits(
                      projectMetrics?.totalAccumulatedStables,
                      18
                    )
                  )
              )
            : "--"}{" "}
          USDT
        </p>
      </div>
    </Link>
  );
}





















//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
This is for Project/index.ts

import { Listbox, Transition } from "@headlessui/react";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { ClipLoader, GridLoader } from "react-spinners";
import flexStake from "@/assets/images/flexstake.svg";
import clsx from "clsx";
import {
  getAccount,
  getNetwork,
  switchNetwork,
  readContract,
  getContract,
  fetchBalance,
  erc20ABI,
  signTypedData,
  prepareWriteContract,
  writeContract,
  waitForTransaction,
} from "@wagmi/core";

import { ethers } from "ethers";
import { Link, useParams } from "react-router-dom";
import { ChevronDown, Globe } from "lucide-react";
import { useSelector } from "react-redux";
import ConnectButton from "../../components/ConnectButton";
import Input from "../../components/Input";
import InputLabel from "../../components/InputLabel";
import { displayToast } from "../../components/Toast";
import { diamondAddress, usdtAddress, createFacetAbi } from "../../contracts";
import router from "../../router";
import {
  loadAllInvestors,
  loadProjectMetrics,
  loadRewardDurations,
  loadRewardPercentages,
  loadTokenToUsdPath,
  loadProjectPlatformAddresses,
  loadInvestorInvestments,
  loadInvestorTotalInvested,
} from "../../stores/insuranceSlice";
import { RootState } from "../../stores/store";
import { loadBalance } from "../../stores/walletSlice";
import {
  convertTokenToUsd,
  fromWei,
  getTimeUnitAndValue,
  inDollarFormat,
  percent,
  toWei,
} from "../../utils/helper";
import Button from "../Button";
import { useAppDispatch } from "../../stores/hooks";
import { Duration } from "../../types/general";
import { motion } from "framer-motion";
import FlexvisReward from "../../components/FlexvisReward";
import AccountDetails from "../../components/AccountDetails";

function Main() {
  // Hooks
  // const router = useRouter();
  const { slug: tokenAddress } = useParams();
  //   const tokenAddress = router?.query?.tokenAddress;

  const { signerAddress, balance, chainId } = useSelector(
    (state: RootState) => state.wallet
  );
  const dispatch = useAppDispatch();

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
  } = useSelector((state: RootState) => state.insurance);

  const titleRef = useRef<HTMLDivElement>(null);
  let [isClicked, setisClicked] = useState(false);
  let [tokenAmount, setTokenAmount] = useState("");
  let [tokenAmountInUsd, setTokenAmountInUsd] = useState(0n);

  let [insuranceFee, setInsuranceFee] = useState(BigInt(0));

  let [createText, setCreateText] = useState("Create Investment");
  let [isCreating, setIsCreating] = useState(false);

  let [durationOptions, setDurationOptions] = useState<Duration[]>();
  let [investperiodInsured, setInvestPeriodInsured] = useState<Duration>();

  // useEffect
  useEffect(() => {
    const getInvestorInvestments = async () => {
      if (tokenAddress) {
        dispatch(loadAllInvestors(tokenAddress as string));
        dispatch(loadProjectMetrics(tokenAddress as string));
        dispatch(loadRewardDurations(tokenAddress as string));
        dispatch(loadRewardPercentages(tokenAddress as string));
        dispatch(loadTokenToUsdPath(tokenAddress as string));
        dispatch(loadProjectPlatformAddresses(tokenAddress as string));
      }
    };

    getInvestorInvestments();
  }, [tokenAddress]);
  // useEffect
  useEffect(() => {
    const getInvestorInvestments = async () => {
      if (signerAddress && tokenAddress) {
        console.log("Signer address:::::: ", signerAddress);
        dispatch(
          loadInvestorInvestments({
            projectId: tokenAddress,
            investorAddress: signerAddress,
          })
        );
        dispatch(
          loadInvestorTotalInvested({
            projectId: tokenAddress,
            investorAddress: signerAddress,
          })
        );
      }
    };

    getInvestorInvestments();
  }, [signerAddress, tokenAddress]);

  useEffect(() => {
    const determineInsuranceFee = async () => {
      if (projectMetrics && tokenToUsdPath && projectPlatformAddresses) {
        // Convert token amount to USDT

        let amountInUsd = 0n;

        if (Number(tokenAmount) > 0) {
          const parsedTokenAmount = ethers.parseUnits(tokenAmount, 18);

          amountInUsd = await convertTokenToUsd(
            projectPlatformAddresses.router,
            parsedTokenAmount,
            tokenToUsdPath
          );
        }

        console.log("Amount In USD: ", amountInUsd);

        // Calculate 1% of token amount
        const insuranceFee =
          (BigInt(projectMetrics.insuranceFeePercentage) * amountInUsd) /
          10000n;
        setInsuranceFee(insuranceFee);
        setTokenAmountInUsd(amountInUsd);
      }
    };

    determineInsuranceFee();
  }, [tokenAmount, projectMetrics]);

  useEffect(() => {
    const updateRewards = () => {
      if (rewardDurations && rewardPercentages) {
        const formattedDurations = rewardDurations?.map(
          (eachDuration, index) => {
            const { timeUnit, value } = getTimeUnitAndValue(
              Number(eachDuration)
            );
            return {
              id: index + 1,
              name: `Invest (Lock) for ${value} ${timeUnit}`,
              value: Number(eachDuration),
              percentage: Number(rewardPercentages[index]) / 100,
            };
          }
        );
        setDurationOptions(formattedDurations);
        setInvestPeriodInsured(formattedDurations[0]);
      }
    };

    updateRewards();
  }, [rewardDurations, rewardPercentages]);

  // Functions

  const handleInvestmentChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    setTokenAmount(value);
  };

  const isValidTokenAmount = (tokenAmount: any) => {
    try {
      return (
        Number(toWei(tokenAmount)) >= Number(toWei(4000)) &&
        Number(toWei(tokenAmount)) <= Number(toWei(40000))
      );
    } catch (error) {
      return false;
    }
  };

  const totalAmount = () => {
    if (tokenAmount) {
      const amount = BigInt(toWei(tokenAmount));
      const insuredAmount = percent(BigInt(1000), amount);

      const total = inDollarFormat(Number(fromWei(amount + insuredAmount)));

      return total;
    } else {
      return "0";
    }
  };

  const isProjectPresent = () => {
    // console.log('Token address: ', tokenAddress);
    // console.log('All Projects: ', allProjects);
    if (tokenAddress && allProjects?.includes(tokenAddress)) {
      return true;
    }
    return false;
  };

  const approveToken = async (_tokenAddress: string, _amount: bigint) => {
    const name = (await readContract({
      address: _tokenAddress as `0x${string}`,
      abi: erc20ABI,
      functionName: "name",
    })) as string;
    try {
      const decimals = (await readContract({
        address: tokenAddress as `0x${string}`,
        abi: erc20ABI,
        functionName: "decimals",
      })) as number;

      const formattedAmount = inDollarFormat(
        Number(ethers.formatUnits(_amount.toString(), decimals))
      );

      setCreateText(`Approving ${formattedAmount} ${name}`);

      const approveRequest = await prepareWriteContract({
        address: _tokenAddress as `0x${string}`,
        abi: erc20ABI,
        functionName: "approve",
        args: [
          diamondAddress,
          BigInt(ethers.parseUnits(_amount.toString(), decimals).toString()),
        ],
      });

      const { hash } = await writeContract(approveRequest);

      const approveReceipt = await waitForTransaction({
        hash,
      });

      console.log("Receipt: ", approveReceipt);
      if (approveReceipt.status == "success") {
        console.log("Approved");
        displayToast("success", `${name} has been approved`);
        setCreateText("Create Investment");

        return true;
      } else {
        console.log("Failure");
        displayToast("failure", `Failed to approve ${name}`);
        setCreateText("Create Investment");

        return false;
      }
    } catch (error) {
      console.log("Error: ", error);
      displayToast("failure", `Failed to approve ${name}`);
      setCreateText("Create Investment");

      return false;
    }
  };

  function CreateInsuredButton({}: {}) {
    return (
      <div className="mt-2 flex items-center gap-3 xs:mt-2 xs:inline-flex md:mt-2">
        <button
          className="disable:opacity-50 flex-1 disabled:cursor-not-allowed disabled:bg-green-700 xs:flex-auto bg-green-800 text-white py-2"
          disabled={isCreating}
          onClick={async () => {
            try {
              setIsCreating(true);
              const parsedTokenAmount = ethers.parseUnits(tokenAmount, 18);

              // Approve USDT
              let isApproved1 = await approveToken(usdtAddress, insuranceFee);
              if (!isApproved1) {
                setIsCreating(false);
                return;
              }
              // Approve Token
              let isApproved2 = await approveToken(
                tokenAddress as string,
                parsedTokenAmount
              );
              if (!isApproved2) {
                setIsCreating(false);

                return;
              }

              // Create the investment
              const createRequest = await prepareWriteContract({
                address: diamondAddress as `0x${string}`,
                abi: createFacetAbi,
                functionName: "createInsuredInvestment",
                args: [
                  tokenAddress,
                  parsedTokenAmount,
                  investperiodInsured?.value,
                  insuranceFee,
                ],
              });

              const { hash } = await writeContract(createRequest);

              const createReceipt = await waitForTransaction({
                hash,
              });

              console.log("Receipt: ", createReceipt);
              if (createReceipt.status == "success") {
                console.log("Success");
                displayToast("success", "Investment has been created");
                await loadInvestorInvestments({
                  projectId: tokenAddress as string,
                  investorAddress: signerAddress,
                });
                await loadBalance(signerAddress as `0x${string}`);
              } else {
                console.log("Failure");
                console.log("Failed to create investment");
                displayToast("success", "Failed to create investment");
              }

              setIsCreating(false);
              setCreateText(`Create Investment`);
            } catch (error) {
              console.log("Errorrrrr: ", error);

              displayToast("failure", "Failed to create Investment");
              setIsCreating(false);
              setCreateText(`Create Investment`);
            }
          }}
        >
          {isCreating ? (
            <div className="flex w-full items-center justify-center space-x-4">
              <ClipLoader color="#fff" loading={true} size={30} />
              <p className="ml-2">{createText}</p>
            </div>
          ) : (
            <div className="flex w-full items-center">
              <p className="w-full">{createText}</p>
            </div>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="">
      {isProjectPresent() ? (
        <div>
          <div className="relative p-6 ">
            <div className="item-center flex justify-center "></div>
            <div className="flex flex-col justify-between gap-x-[38px] xl:flex-row xl:px-[97px]">
              <div className="flex flex-col gap-y-6 pb-[22px]">
                {/* {projectMetrics && (
                  <div>
                    <p>
                      Total Invested:{" "}
                      {ethers.formatUnits(projectMetrics.totalInvested, 18)} {}
                    </p>
                    <p>
                      USDT Locked:{" "}
                      {ethers.formatUnits(
                        projectMetrics.stableReserveBalance,
                        18
                      )}{" "}
                      {}
                    </p>
                    <p>
                      Token Locked:{" "}
                      {ethers.formatUnits(
                        projectMetrics.investmentReserveBalance,
                        18
                      )}{" "}
                      {}
                    </p>
                    <p>
                      Total number of investors: {allInvestors?.length} {}
                    </p>
                  </div>
                )} */}
                <div className="text-xl border-neutral dark:border-dark-neutral-border rounded-2xl border bg-gray-100 px-[30px] pb-[20px] dark:bg-gray-900 md:mx-auto md:w-[80%] xl:mx-0 xl:w-full">
                  <div>
                    <h1 className="item-center flex  font-bold border-b border-gray-300 py-4 text-4xl">
                      Project Details
                    </h1>
                    <div>
                      <div className="flex items-center mt-8 mb-6">
                        <img
                          alt={`ABCD Token`}
                          src={`/vite.svg`}
                          width={60}
                          height={60}
                          className="mb-3 rounded-full"
                        />
                        <p className="text-4xl text-theme-2 font-semibold">
                          {`ABCD Token`} ({`ABCD`})
                        </p>
                      </div>
                      <p className="leading-10">
                        ABCD Token is a cutting-edge cryptocurrency designed to
                        provide users with a secure, decentralized, and
                        efficient means of conducting transactions within the
                        blockchain ecosystem. Leveraging advanced blockchain
                        technology, ABCD aims to offer a range of features that
                        empower users while maintaining a focus on transparency
                        and decentralization
                      </p>
                      <div className="flex items-center mt-8 mb-6 space-x-4">
                        <p className="text-3xl font-medium">Socials</p>
                        <div className="flex items-center justify-center">
                          <div className="inline-flex items-center justify-center space-x-4">
                            <div className="">
                              <a
                                href="https://web.telegram.org/a/#-1933316011"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={`/telegram.svg`}
                                  alt="Telegram Logo"
                                  className="h-8 w-8" // Adjust the height and width as needed
                                />
                              </a>
                            </div>
                            <div className="">
                              <a
                                href="https://example.com"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={`/x.svg`}
                                  alt="X Logo"
                                  className="h-8 w-8" // Adjust the height and width as needed
                                />
                              </a>
                            </div>
                            <div className="">
                              <a
                                href="https://discord.com"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={`/discord.svg`}
                                  alt="Discord Logo"
                                  className="h-8 w-8" // Adjust the height and width as needed
                                />
                              </a>
                            </div>
                            <div className="">
                              <a
                                href="https://example.com"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Globe />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-300 mt-16">
                    <h1 className="item-center flex  font-bold  py-4 text-4xl">
                      Key Metrics
                    </h1>
                    <div className="grid grid-cols-2 gap-y-5 gap-x-12 pt-8">
                      <div className="flex justify-between">
                        <p className="text-[18px]">Total ABC Invested</p>
                        <p className="font-medium">300,000 ABC</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-[18px]">Total USDT Locked</p>
                        <p className="font-medium">257,000 USDT</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-[18px]">Total ABC Locked</p>
                        <p className="font-medium">193,000 ABC</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-[18px]">Investors</p>
                        <p className="font-medium">5,000</p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-300 mt-16">
                    <h1 className="item-center flex  font-bold  py-4 text-4xl">
                      ABCD Investment Plans
                    </h1>
                    <p className="leading-10">
                      ABCD provides an enticing investment opportunity where
                      users can invest a specified amount of money for a
                      predetermined duration, receiving both their principal and
                      accrued interest within the designated timeframe. The
                      magnitude of the reward increases proportionally with the
                      length of the investment period.
                    </p>
                    <p className="pt-4">
                      You won't incur losses regardless of the market
                      conditions.
                    </p>
                    <div className="pt-4 underline underline-offset-1 cursor-pointer text-theme-1 hover:text-theme-2">Click to know more on how your investment is insured
                    </div>
                    <div className="pt-8">
                      <table className="min-w-full bg-white border border-gray-300 shadow-lg">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="py-3 px-4 border-b text-left">Duration</th>
                            <th className="py-3 px-4 border-b text-left">Reward</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Sample Row 1 */}
                          <tr className="hover:bg-gray-50">
                            <td className="py-3 px-4 border-b">7 days</td>
                            <td className="py-3 px-4 border-b">30%</td>
                          </tr>

                          {/* Sample Row 2 */}
                          <tr className="hover:bg-gray-50">
                            <td className="py-3 px-4 border-b">14 days</td>
                            <td className="py-3 px-4 border-b">50%</td>
                          </tr>

                          {/* Add more rows as needed */}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              {/* <AccountDetails /> */}

              <div ref={titleRef} className="flex-1  ">
                <motion.div
                  layout
                  initial={{ borderRadius: 20 }}
                  className={clsx(
                    "border-neutral mb-3 rounded-lg  border bg-gray-100 p-5 px-[20px] pt-[30px] pb-[20px] transition-shadow duration-200 dark:bg-light-dark xs:p-6"
                  )}
                >
                  <motion.div
                    layout
                    className="flex w-full flex-col-reverse justify-between md:grid md:grid-cols-3"
                  >
                    <div className="self-start md:col-span-2">
                      <h3 className="cursor-pointer text-base font-medium leading-normal dark:text-gray-100 2xl:text-lg">
                        Create an Insured Investment
                      </h3>
                      <p className="my-4 text-sm">
                        Make sure you have USDT in your wallet as insurance fee
                      </p>

                      <div className="mt-3 flex items-center gap-4 xs:mt-6 xs:inline-flex md:mt-10"></div>
                    </div>
                  </motion.div>

                  <div className="pt-4">
                    <div className="mb-4 ">
                      <InputLabel title="Token Amount" important />
                      <Input
                        min={0}
                        onChange={handleInvestmentChange}
                        type="number"
                        placeholder="Enter Amount to Invest "
                        inputClassName="spin-button-hidden"
                      />
                      {/* {!isValidTokenAmount(tokenAmount) && (
                        <div>
                          <p className="py-1 text-[11px] text-red-500 ">
                            Investment amount should be within 4,000 FLX and
                            40,000 FLX
                          </p>
                        </div>
                      )} */}
                    </div>

                    {/* Investment Period */}
                    <div className="mb-8">
                      <InputLabel title="Investment Period" />
                      <div className="relative">
                        {/* Investment Period for Creating Insured Investments */}

                        {!isClicked && (
                          <Listbox
                            value={investperiodInsured}
                            onChange={setInvestPeriodInsured}
                          >
                            <Listbox.Button className="text-case-inherit letter-space-inherit flex h-10 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 outline-none transition-shadow duration-200 hover:border-gray-900 hover:ring-1 hover:ring-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-gray-600 dark:hover:ring-gray-600 sm:h-12 sm:px-5">
                              <div className="flex items-center">
                                {investperiodInsured?.name}
                              </div>
                              <ChevronDown />
                            </Listbox.Button>
                            <Transition
                              leave="transition ease-in duration-100"
                              leaveFrom="opacity-100"
                              leaveTo="opacity-0"
                            >
                              <Listbox.Options className="absolute left-0 z-10 mt-1 grid w-full origin-top-right gap-0.5 rounded-lg border border-gray-200 bg-white p-1 shadow-large outline-none dark:border-gray-700 dark:bg-gray-800 xs:p-2">
                                {durationOptions &&
                                  durationOptions.map((option) => (
                                    <Listbox.Option
                                      key={option.id}
                                      value={option}
                                    >
                                      {({ selected }) => (
                                        <div
                                          className={`flex cursor-pointer items-center rounded-md px-3 py-2 text-sm text-gray-900 transition dark:text-gray-100  ${
                                            selected
                                              ? "bg-gray-200/70 font-medium dark:bg-gray-600/60"
                                              : "hover:bg-gray-100 dark:hover:bg-gray-700/70"
                                          }`}
                                        >
                                          <span className="ltr:mr-2 rtl:ml-2"></span>
                                          {option.name}
                                        </div>
                                      )}
                                    </Listbox.Option>
                                  ))}
                              </Listbox.Options>
                            </Transition>
                          </Listbox>
                        )}
                      </div>
                    </div>

                    {/* Modify this and handle calculations */}

                    {!isClicked && (
                      // <p className="mt-4 mb-4 animate-pulse text-center text-slate-800 dark:text-white">
                      //   Token Amount: {} <br />
                      //   <span className="font-semibold text-dark dark:text-white">
                      //     = {totalAmount()} FLEXVIS
                      //   </span>
                      // </p>
                      <div className="w-full py-4 text-sm">
                        <p>
                          Token Amount In USDT:{" "}
                          {inDollarFormat(
                            Number(
                              ethers.formatUnits(
                                tokenAmountInUsd.toString(),
                                18n
                              )
                            )
                          )}
                        </p>
                        {projectMetrics && (
                          <p>
                            Insurance Fee (
                            {(
                              BigInt(projectMetrics.insuranceFeePercentage) /
                              100n
                            ).toString()}
                            % of token amount):{" "}
                            {inDollarFormat(
                              Number(
                                ethers.formatUnits(insuranceFee.toString(), 18n)
                              )
                            )}
                          </p>
                        )}
                        <p className="pt-4 text-[12px]">
                          NB: Minimum of{" "}
                          {inDollarFormat(
                            Number(
                              ethers.formatUnits(insuranceFee.toString(), 18n)
                            )
                          )}{" "}
                          USDT is required to be in your wallet to be able to
                          create an investment
                        </p>
                      </div>
                    )}
                  </div>

                  {!isClicked && signerAddress ? (
                    <CreateInsuredButton />
                  ) : (
                    <ConnectButton />
                  )}

                  {!isClicked && (
                    <div className="mb-2 pt-5">
                      <InputLabel
                        title=""
                        subTitle="Investing for longer period earns your more reward"
                      />
                    </div>
                  )}

                  {durationOptions && (
                    <FlexvisReward durationOptions={durationOptions} />
                  )}
                </motion.div>
              </div>
            </div>
          </div>

          {investorInvestments && (
            <div className="flex items-center justify-center">
              <Link
                to={`/investments/${tokenAddress}`}
                className="text-md my-3 text-blue-500 flex w-6/12 justify-center rounded-md border border-slate-700 bg-gray-900 p-2 cursor-pointer hover:bg-gray-700"
              >
                Track your Investments {"-->"}
              </Link>

              {/* <CardSection investorInvestments={investorInvestments} /> */}
            </div>
          )}
        </div>
      ) : (
        <div className="flex w-full items-center justify-center">
          <h1>Project has not been registered</h1>
        </div>
      )}
    </div>
  );
}

export default Main;
