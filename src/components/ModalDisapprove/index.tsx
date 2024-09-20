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
import { loadProjectPendingInvestments } from "../../stores/insuranceSlice";
import { displayToast } from "../Toast";

import { diamondAddress, createFacetAbi } from "../../contracts";
import { inDollarFormat } from "../../utils/helper";
import { useAppDispatch } from "../../stores/hooks";

function Main({
  setOpenDisapproveModal,
  pendingInvestment,
}: {
  setOpenDisapproveModal: Dispatch<SetStateAction<boolean>>;
  pendingInvestment: FormattedPendingInvestment;
    }) {
    
      const dispatch = useAppDispatch();
    
  const {
    allProjects,
    investorInvestments,
    rewardDurations,
    rewardPercentages,
    projectMetrics,
    tokenToUsdPath,
    projectPlatformAddresses,
    projectPendingInvestments,
  } = useSelector((state: RootState) => state.insurance);
  const { signerAddress } = useSelector((state: RootState) => state.wallet);


  let [isDisapproving, setIsDisapproving] = useState(false);
  let [disapproveText, setDisapproveText] = useState("Disapprove Investment");

  const handleDisapproveInvestment = async () => {
    // Disapprove the project
    setIsDisapproving(true);
    setDisapproveText(`Disapproving Investment`);

    try {
      const disapproveRequest = await prepareWriteContract({
        address: diamondAddress as `0x${string}`,
        abi: createFacetAbi,
        functionName: "disapproveInvestment",
        args: [
          pendingInvestment.investmentId,
          pendingInvestment.projectAddress,
          pendingInvestment.investor,
        ],
        account: signerAddress as `0x${string}`,
      });

      console.log("DisapproveRequest: ", disapproveRequest.result);

      const { hash } = await writeContract(disapproveRequest);

      const disapproveReceipt = await waitForTransaction({
        hash,
      });

      console.log("Receipt: ", disapproveReceipt);
      if (disapproveReceipt.status == "success") {
        console.log("Success");
        displayToast("success", "Investment has been disapproved");
        dispatch(loadProjectPendingInvestments(pendingInvestment.projectAddress));
      } else {
        console.log("Failure");
        console.log("Failed to disapprove");
      }

      setIsDisapproving(false);
      setDisapproveText(`Disapprove Investment`);
    } catch (error) {
      const typedError = error as Error;
      console.log("Errorrrrr: ", typedError.stack);

      displayToast("failure", typedError.name);
      setIsDisapproving(false);
      setDisapproveText(`Disapprove Investment`);
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
                  Disapprove Investment
                </div>
                <button
                  onClick={() => {
                    setOpenDisapproveModal(false);
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
                <p className="py-2 text-sm text-gray-600  dark:text-white">
                  Are you sure you want to disapprove the investment?
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
                      Disapproving the investment means that, the invested
                      amount and the insurance fee will be sent back to the
                      investor
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
                  disabled={isDisapproving}
                  onClick={handleDisapproveInvestment}
                  className="my-4 disabled:cursor-not-allowed disabled:bg-theme-1/50 bg-theme-1 text-white p-2 px-4 rounded-md hover:scale-105"
                >
                  {" "}
                  {isDisapproving ? (
                    <div className="flex items-center">
                      <ClipLoader color="#fff" loading={true} size={30} />
                      <p className="ml-2">{disapproveText}</p>
                    </div>
                  ) : (
                    <div className="flex w-full items-center">
                      <p className="w-full">{disapproveText}</p>
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


export default Main