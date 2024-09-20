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
import { FormattedPendingInvestment } from "../../types/general";
import { useSelector } from "react-redux";
import { RootState } from "../../stores/store";
import { createFacetAbi, diamondAddress } from "../../contracts";
import { displayToast } from "../Toast";
import { inDollarFormat } from "../../utils/helper";

function Main({
  setOpenApproveModal,
  pendingInvestment,
}: {
  setOpenApproveModal: Dispatch<SetStateAction<boolean>>;
  pendingInvestment: FormattedPendingInvestment;
}) {
  const { signerAddress } = useSelector((state: RootState) => state.wallet);
  const { projectMetrics, protocolDetails } = useSelector(
    (state: RootState) => state.insurance
  );

  const liqPercentage = projectMetrics
    ? BigInt(projectMetrics.liquidityPercentage) / 100n
    : 0n;

  const taxPercentage = protocolDetails
    ? BigInt(protocolDetails.taxPercentage) / 100n
    : 0n;

  const projectPercentage =
    liqPercentage && taxPercentage ? 100n - taxPercentage - liqPercentage : 0n;

  let [isApproving, setIsApproving] = useState(false);
  let [approveText, setApproveText] = useState("Approve Investment");

  const handleApproveInvestment = async () => {
    // Approve the project
    setIsApproving(true);
    setApproveText(`Approving Investment`);

    try {
      const approveRequest = await prepareWriteContract({
        address: diamondAddress as `0x${string}`,
        abi: createFacetAbi,
        functionName: "approveInvestment",
        args: [
          pendingInvestment.investmentId,
          pendingInvestment.projectAddress,
          pendingInvestment.investor,
        ],
        account: signerAddress as `0x${string}`,
      });

      console.log("ApproveRequest: ", approveRequest.result);

      const { hash } = await writeContract(approveRequest);

      const approveReceipt = await waitForTransaction({
        hash,
      });

      console.log("Receipt: ", approveReceipt);
      if (approveReceipt.status == "success") {
        console.log("Success");
        displayToast("success", "Investment has been approved");
      } else {
        console.log("Failure");
        console.log("Failed to approve");
      }

      setIsApproving(false);
      setApproveText(`Approve Investment`);
    } catch (error) {
      const typedError = error as Error;
      console.log("Errorrrrr: ", typedError.stack);

      displayToast("failure", typedError.name);
      setIsApproving(false);
      setApproveText(`Approve Investment`);
    }
  };

  return (
    <div className="fixed inset-3 z-50 bg-gray-900 bg-opacity-75 transition-opacity">
      <div
        tabIndex={-1}
        className="mt-16 inline-block h-5/6  w-full max-w-sm transform overflow-auto rounded-lg text-left align-bottom outline-none scrollbar-hide sm:max-w-lg"
      >
        <div className="relative  h-full md:h-auto">
          {/* <!-- Modal content --> */}

          <div className="relative mx-3 rounded-lg shadow dark:bg-gray-700">
            <div className="font-hand bg-white p-5 dark:bg-gray-800">
              <div className="flex items-center justify-between rounded-t">
                <div className="text-center text-3xl  text-gray-700 dark:text-white sm:text-2xl">
                  Approve Investment
                </div>
                <button
                  onClick={() => {
                    setOpenApproveModal(false);
                  }}
                  type="button"
                  className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:hover:text-white"
                  data-modal-toggle="small-modal"
                >
                  <svg
                    className="h-5 w-5  dark:text-white"
                    fill="pendingColor"
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

              <div className="my-5 flex w-full flex-col items-center ">
                <p className="py-2 text-base text-gray-600 dark:text-white">
                  Are you sure you want to approve the investment?
                </p>
              </div>
              <div className="rounded-md border p-4">
                <div className="flex justify-between text-sm">
                  <p className="font-medium">Investment ID:</p>
                  <p className="">
                    {pendingInvestment.investmentId
                      .substring(0, 5)
                      .concat("...")
                      .concat(
                        pendingInvestment.investmentId.substring(
                          pendingInvestment.investmentId.length - 5,
                          pendingInvestment.investmentId.length
                        )
                      )}
                  </p>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <p className="font-medium">Invested Amount:</p>
                  <p className="animate-pulse font-bold">
                    {" "}
                    {inDollarFormat(
                      Number(
                        ethers.formatUnits(
                          pendingInvestment.investedAmount,
                          pendingInvestment.tokenAttributes.decimals
                        )
                      )
                    )}{" "}
                    {pendingInvestment.tokenAttributes.symbol}
                  </p>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <p className="font-medium">Insurance Fee:</p>
                  <p className="">
                    {" "}
                    {inDollarFormat(
                      Number(
                        ethers.formatUnits(
                          pendingInvestment.insuranceFee,
                          pendingInvestment.stableAttributes.decimals
                        )
                      )
                    )}{" "}
                    {pendingInvestment.stableAttributes.symbol}
                  </p>
                </div>
              </div>
              <div className="mt-4 overflow-auto rounded-md border p-2 py-4 text-sm scrollbar-hide">
                <h4 className="py-2">Note:</h4>
                <ul className="text-xs">
                  <li className="text-xs leading-5">
                    <b>
                      {" "}
                      Approving the investment means that,{" "}
                      {Number(projectPercentage)}% of the insurance fee will be
                      allocated to the creator's treasury,{" "}
                      {Number(taxPercentage)}% will be directed to the flexvis
                      treasury, and {Number(liqPercentage)}% will be shared
                      among liquidity providers.
                    </b>
                  </li>
                  <br />
                </ul>
              </div>
              {false && (
                <p className="pt-2 text-xs font-medium text-red-800 dark:text-red-400">
                  <small>
                    This transaction is likely to fail. Please, try again later.
                  </small>
                </p>
              )}

              <div className="flex w-full justify-center">
                <button
                  disabled={isApproving}
                  onClick={handleApproveInvestment}
                  className="my-4 disabled:cursor-not-allowed disabled:bg-theme-1/50 bg-theme-1 text-white p-2 px-4 rounded-md hover:scale-105"
                >
                  {" "}
                  {isApproving ? (
                    <div className="flex items-center">
                      <ClipLoader color="#fff" loading={true} size={30} />
                      <p className="ml-2">{approveText}</p>
                    </div>
                  ) : (
                    <div className="flex w-full items-center">
                      <p className="w-full">{approveText}</p>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Main;
