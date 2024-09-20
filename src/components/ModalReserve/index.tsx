import { ethers } from "ethers";

import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
  Fragment,
} from "react";
import { Dialog as HeadlessDialog, Transition } from "@headlessui/react";
import { Menu, Dialog } from "../../base-components/Headless";
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
  openReserveModal,
  setOpenReserveModal,
  tokenDetails,
  stableDetails,
}: {
  openReserveModal: boolean;
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
    <>
      {/* <Transition show={openReserveModal} as={Fragment}> */}
      {/* <HeadlessDialog
        as="div"
        className="relative z-[60]"
        onClose={setOpenReserveModal}
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
              <HeadlessDialog.Panel className="sm:w-[500px] w-[95%] relative mx-auto transition-transform">
                <div className="relative mx-3 rounded-lg shadow bg-white">
                  <div className="font-hand p-5">
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
                        <div className="rounded-md border p-4 text-gray-700">
                          <div className="flex justify-between text-sm">
                            <p className="font-medium">
                              {tokenDetails.tokenSymbol}:
                            </p>
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
                          <ul className="text-xs text-gray-700">
                            <li>
                              A portion of the insurance fee, equivalent to 30%,
                              will be distributed among all investors, offering
                              you an opportunity to receive a share of it based
                              on your level of liquidity.
                            </li>

                            <br />
                            <li>
                              The greater your liquidity, the larger your share
                              will be.
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
                              isAdding ||
                              !isSufficientStables ||
                              !isSufficientToken
                            }
                            onClick={handleAddReserve}
                            className="my-4 w-[450px] rounded-md text-white bg-theme-1 p-3 text-sm disabled:cursor-not-allowed disabled:bg-theme-1/50 hover:scale-105"
                          >
                            {isAdding ? (
                              <div className="flex items-center justify-center">
                                <ClipLoader
                                  color="#fff"
                                  loading={true}
                                  size={30}
                                />
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
              </HeadlessDialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </HeadlessDialog> */}

      <Dialog
        staticBackdrop
        open={openReserveModal}
        onClose={() => {
          setOpenReserveModal(false);
        }}
      >
        <Dialog.Panel className="">
          <div className="">
            <div className="font-hand p-5">
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
                  <div className="rounded-md border p-4 text-gray-700">
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
                    <ul className="text-xs text-gray-700">
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
                      className="my-4 w-[450px] rounded-md text-white bg-theme-1 p-3 text-sm disabled:cursor-not-allowed disabled:bg-theme-1/50 hover:scale-105"
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
