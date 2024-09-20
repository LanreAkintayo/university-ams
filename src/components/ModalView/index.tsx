import { ethers } from "ethers";

import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { ClipLoader } from "react-spinners";
import { useContractRead } from "wagmi";
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
import {
  createFacetAbi,
  diamondAddress,
  pancakeswapRouter,
  usdtAddress,
  wbnbAddress,
} from "../../contracts";
import { IRobustPending } from "../PendingProject";
import { RootState } from "../../stores/store";
import { useSelector } from "react-redux";
import {
  convertTokenToUsd,
  formatAddress,
  inDollarFormat,
} from "../../utils/helper";
import { displayToast } from "../Toast";
import Button from "../../pages/Button";
import axios from "axios";
import { Dialog as HeadlessDialog, Transition } from "@headlessui/react";
import { Menu, Dialog } from "../../base-components/Headless";
import Input from "../Input";

function durationFormatter(seconds: number) {
  const days = Math.floor(seconds / 86400);
  seconds %= 86400;

  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds %= 60;

  let value;
  let type;

  if (days > 0) {
    value = days;
    type = "days";
  } else if (hours > 0) {
    value = hours;
    type = "hours";
  } else if (minutes > 0) {
    value = minutes;
    type = "minutes";
  } else {
    value = seconds;
    type = "seconds";
  }

  return { type, value };
}

const RewardPlan = ({
  rewardDurations,
  rewardPercentages,
}: {
  rewardDurations: bigint[];
  rewardPercentages: bigint[];
}) => {
  return (
    <div>
      {rewardDurations.map((duration, index) => {
        const { value, type } = durationFormatter(Number(duration));

        return (
          <div>
            {Number(rewardPercentages[index]) / 100}% reward for {value} {type}
          </div>
        );
      })}
    </div>
  );
};

const Path = ({
  tokenToUsdPath,
  tokenName,
}: {
  tokenToUsdPath: string[];
  tokenName: string;
}) => {
  const tokensToName: { [key: string]: string } = {
    [wbnbAddress]: "BNB",
    [usdtAddress]: "USDT",
    [tokenToUsdPath[0]]: tokenName,
  };

  return (
    <div className="flex space-x-2 divide-x-2">
      {tokenToUsdPath.map((token) => {
        return <p className="px-2">{tokensToName[token]}</p>;
      })}
    </div>
  );
};

export default function ViewModal({
  openViewModal,
  setOpenViewModal,
  pendingProject,
}: {
  openViewModal: boolean;
  setOpenViewModal: Dispatch<SetStateAction<boolean>>;
  pendingProject: IRobustPending;
}) {
  const { signerAddress } = useSelector((state: RootState) => state.wallet);

  let [isApproving, setIsApproving] = useState(false);
  let [isDisapproving, setIsDisapproving] = useState(false);

  let [accepted, setAccepted] = useState(false);
  let [message, setMessage] = useState("");
  let [tokenToUsdPath, setTokenToUsdPath] = useState("");
  let [isTokenPathError, setIsTokenPathError] = useState<boolean>(false);
  let [stableAmount, setStableAmount] = useState<bigint | undefined>(undefined);
  let [isConfirming, setIsConfirming] = useState<boolean>(false);

  console.log("isTokenPath Error: ", isTokenPathError);
  console.log("Set Stable Amount: ", stableAmount);

  let statusToFormat: { [key: string]: string } = {
    0: "Pending",
    1: "Approved",
    2: "Disapproved",
    3: "Paused",
    4: "Active",
  };

  const setStatus = async (newStatus: number) => {
    // 0 means pending, 1 means approved, 2 means disapproved.

    const api = `https://safu-finance-online.vercel.app/projects/updateStatus/${pendingProject.creator}/${pendingProject.tokenAddress}/${newStatus}`;

    try {
      const response = await axios.post(api);

      console.log("Post request successful:", response.data);

      if (response.data) {
        console.log("Success");
      }
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const getFormattedAmount = (amount: bigint) => {
    return inDollarFormat(
      Number(ethers.formatUnits(amount.toString(), pendingProject.decimals))
    );
  };

  const getFormattedPercentage = (percentage: bigint) => {
    return Number(percentage) / 100;
  };

  const getPathArray = (pathString: string) => {
    const stringWithoutBrackets = pathString.slice(1, -1);
    const pathArray = stringWithoutBrackets
      .split(",")
      .map((item) => item.trim());
    return pathArray;
  };

  const handleApproveProject = async () => {
    // Approve the project
    setIsApproving(true);

    const pathArray = getPathArray(tokenToUsdPath);

    try {
      const approveRequest = await prepareWriteContract({
        address: diamondAddress as `0x${string}`,
        abi: createFacetAbi,
        functionName: "approveProject",
        args: [pendingProject.tokenAddress, pathArray],
        account: signerAddress as `0x${string}`,
      });

      const { hash } = await writeContract(approveRequest);

      const approveReceipt = await waitForTransaction({
        hash,
      });

      console.log("Receipt: ", approveReceipt);
      if (approveReceipt.status == "success") {
        console.log("Success");
        setStatus(1); // 0 means pending, 1 means approved, 2 means disapproved.
        displayToast("success", "Project has been approved");
      } else {
        console.log("Failure");
        console.log("Failed to approve");
        displayToast("failure", "An error was encountered.");
      }
    } catch (error) {
      const typedError = error as Error;
      console.log("Error: ", error);
      displayToast("failure", typedError.message);
    } finally {
      setOpenViewModal(false);
      setIsApproving(false);
    }
  };

  const handleDisapproveProject = async () => {
    // Disapprove the project
    setIsDisapproving(true);

    try {
      const disapproveRequest = await prepareWriteContract({
        address: diamondAddress as `0x${string}`,
        abi: createFacetAbi,
        functionName: "disapproveProject",
        args: [pendingProject.tokenAddress, accepted, message],
        account: signerAddress as `0x${string}`,
      });

      const { hash } = await writeContract(disapproveRequest);

      const disapproveReceipt = await waitForTransaction({
        hash,
      });

      console.log("Receipt: ", disapproveReceipt);
      if (disapproveReceipt.status == "success") {
        console.log("Success");
        setStatus(2); // 0 means pending, 2 means disapproved, 2 means disapproved.

        displayToast("success", "Project has been disapproved");
      } else {
        console.log("Failure");
        console.log("Failed to disapprove");
        displayToast("failure", "Failed to disapprove project");
      }
    } catch (error) {
      const typedError = error as Error;
      console.log("Error: ", error);
      displayToast("failure", typedError.message);
    } finally {
      setOpenViewModal(false);
      setIsDisapproving(false);
    }
  };

  return (
    <>
      <Dialog
        staticBackdrop
        open={openViewModal}
        onClose={() => {
          setOpenViewModal(false);
        }}
        size="lg"
      >
        <Dialog.Panel className="">
          <div className="">
            <div className="font-hand p-5">
              <div className="flex items-center justify-between rounded-t">
                <div className="text-center text-3xl  text-gray-700 dark:text-gray-400 sm:text-2xl">
                  Evaluate Project
                </div>
                <button
                  onClick={() => {
                    setOpenViewModal(false);
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

              <div>
                <div className="my-5 flex w-full flex-col items-center gap-y-3 "></div>
                <div className="space-y-3 rounded-md border p-4">
                  <div className="flex justify-between text-sm">
                    <p className="font-medium">Project ID:</p>
                    <p className="">
                      {formatAddress(pendingProject.tokenAddress)}
                    </p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <p className="font-medium">Project Name:</p>
                    <p className="">{pendingProject.name}</p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <p className="font-medium">Project Decimals:</p>
                    <p className="">{pendingProject.decimals}</p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <p className="font-medium">Current Status:</p>
                    <p className="animate-pulse">
                      {statusToFormat[pendingProject.status]}
                    </p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <p className="font-medium">Creator:</p>
                    <p className="">{formatAddress(pendingProject.creator)}</p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <p className="w-7/12 font-medium">View Contract:</p>
                    <a
                      className="word-wrap truncate text-blue-700"
                      href={`https://testnet.bscscan.com/token/${pendingProject.tokenAddress}#code`}
                      target="_blank"
                    >
                      {`https://testnet.bscscan.com/token/${pendingProject.tokenAddress}#code`}
                    </a>
                  </div>
                  <div className="flex justify-between text-sm">
                    <p className="w-5/12 font-medium">Discord Handle:</p>
                    <a
                      className="word-wrap truncate text-blue-700"
                      href={pendingProject.discordHandle}
                      target="_blank"
                    >
                      {pendingProject.discordHandle}
                    </a>
                  </div>
                  <div className="flex justify-between text-sm">
                    <p className="w-5/12 font-medium">Twitter Handle:</p>
                    <a
                      className="word-wrap truncate text-blue-700"
                      href={pendingProject.twitterHandle}
                      target="_blank"
                    >
                      {pendingProject.twitterHandle}
                    </a>
                  </div>
                  <div className="flex justify-between text-sm">
                    <p className="w-5/12 font-medium">Telegram Handle:</p>
                    <a
                      className="word-wrap truncate text-blue-700"
                      href={pendingProject.telegramHandle}
                      target="_blank"
                    >
                      {pendingProject.telegramHandle}
                    </a>
                  </div>

                  <div className="flex justify-between text-sm">
                    <p className="font-medium">Treasury Address:</p>
                    <p className="">{formatAddress(pendingProject.treasury)}</p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <p className="font-medium">Minimum Amount:</p>
                    <p className="">
                      {getFormattedAmount(pendingProject.minAmount)}{" "}
                      {pendingProject.name}
                    </p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <p className="font-medium">Maximum Amount:</p>
                    <p className="">
                      {getFormattedAmount(pendingProject.maxAmount)}{" "}
                      {pendingProject.name}
                    </p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <p className="font-medium">Insurance Fee Percentage:</p>
                    <p className="">
                      {getFormattedPercentage(
                        pendingProject.insuranceFeePercentage
                      )}
                      %
                    </p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <p className="font-medium">Penalty Percentage:</p>
                    <p className="">
                      {getFormattedPercentage(pendingProject.penaltyPercentage)}
                      %
                    </p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <p className="font-medium">Liquidity Percentage:</p>
                    <p className="">
                      {getFormattedPercentage(
                        pendingProject.liquidityPercentage
                      )}
                      %
                    </p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <p className="font-medium">Reward Plan:</p>
                    <RewardPlan
                      rewardDurations={pendingProject.rewardDurations}
                      rewardPercentages={pendingProject.rewardPercentages}
                    />
                  </div>
                  <div className="flex justify-between items-center text-sm space-x-3">
                    <p className="font-medium whitespace-nowrap">
                      {pendingProject.name} to USD Path:
                    </p>
                    <Input
                      onChange={(event) => {
                        const { value } = event.target;

                        setTokenToUsdPath(value);
                      }}
                      type="text"
                      placeholder={"Enter address path"}
                      inputClassName="spin-button-hidden text-base text-gray-800"
                      className="w-full"
                    />
                    {/* <Path
                      tokenToUsdPath={pendingProject.tokenToUsdPath}
                      tokenName={pendingProject.name}
                    /> */}
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      className="my-4 disabled:cursor-not-allowed disabled:opacity-50 bg-gray-300 p-2 px-4 text-black rounded-md"
                      disabled={isConfirming}
                      onClick={async () => {
                        // [0xb15d1B2F03E4100d8Bb936264f5090962f8159A4, 0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd, 0x337610d27c682E347C9cD60BD4b3b107C9d34dDd]

                        // Obtain an array of address from the string tokenToUsd
                        setIsConfirming(true);

                        const pathArray = getPathArray(tokenToUsdPath);

                        try {
                          const stableAmount = await convertTokenToUsd(
                            pancakeswapRouter,
                            BigInt(1e18),
                            pathArray
                          );

                          setStableAmount(stableAmount);

                          setIsTokenPathError(false);
                          setIsConfirming(false);
                        } catch (error) {
                          setIsTokenPathError(true);
                          setStableAmount(undefined);
                          setIsConfirming(false);
                        }
                      }}
                    >
                      {isConfirming ? (
                        <div className="flex items-center">
                          <ClipLoader color="#000" loading={true} size={30} />
                          <p className="ml-2">
                            Confirming {pendingProject.name} price
                          </p>
                        </div>
                      ) : (
                        <div className="flex w-full items-center">
                          <p className="w-full">
                            {" "}
                            Confirm {pendingProject.name} price
                          </p>
                        </div>
                      )}
                    </button>
                    <div>
                      {isTokenPathError && (
                        <p className="text-red-600">Invalid Path</p>
                      )}
                      {stableAmount !== undefined && (
                        <p>
                          {ethers.formatUnits(stableAmount, 18).concat(" USDT")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  {/* <button className="rounded-full bg-theme-1 text-white p-2 px-4 text-[12px]">
                    Click to check Project Verification
                  </button> */}
                  <div className="mt-5 flex space-x-4 text-[12px]">
                    <input
                      type="checkbox"
                      checked={accepted}
                      className="form-checkbox h-4 w-4  text-gray-600 outline-none"
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => {
                        setAccepted(event.target.checked);
                      }}
                    />
                    <p>
                      Check the box to send back creation fee to the creator
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="py-1 text-[12px] text-gray-600">
                    Give a reason for diapproval. Ignore if you are approving.
                  </p>
                  <textarea
                    className="h-40 w-full resize-none rounded-md border  p-2 focus:border-none focus:border-gray-700 focus:outline-none"
                    placeholder="Enter your text here"
                    onChange={(event) => {
                      const { value } = event.target;
                      setMessage(value);
                    }}
                  ></textarea>
                </div>

                <div className="flex w-full  justify-center space-x-2">
                  <button
                    disabled={
                      isApproving ||
                      stableAmount === undefined ||
                      isTokenPathError
                    }
                    onClick={handleApproveProject}
                    className="my-4 disabled:cursor-not-allowed disabled:bg-theme-1/50  bg-theme-1 p-2 px-4 text-white rounded-md"
                  >
                    {isApproving ? (
                      <div className="flex items-center">
                        <ClipLoader color="#fff" loading={true} size={30} />
                        <p className="ml-2">Approving Project</p>
                      </div>
                    ) : (
                      <div className="flex w-full items-center">
                        <p className="w-full">Approve Project</p>
                      </div>
                    )}
                  </button>
                  <button
                    disabled={isDisapproving}
                    onClick={handleDisapproveProject}
                    className="my-4 disabled:cursor-not-allowed disabled:bg-theme-1/50  bg-theme-1 p-2 px-4 text-white rounded-md"
                  >
                    {isDisapproving ? (
                      <div className="flex items-center">
                        <ClipLoader color="#fff" loading={true} size={30} />
                        <p className="ml-2">Disapproving Project</p>
                      </div>
                    ) : (
                      <div className="flex w-full items-center">
                        <p className="w-full">Disapprove Project</p>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
            {/* <Button
                type="button"
                variant="primary"
                onClick={() => {
                  setStaticBackdropModalPreview(false);
                }}
                className="w-24"
              >
                Ok
              </Button> */}
          </div>
        </Dialog.Panel>
      </Dialog>
    </>
  );
}
