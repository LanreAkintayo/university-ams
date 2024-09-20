import { ethers } from "ethers";

import {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { ClipLoader } from "react-spinners";
import { useContractRead } from "wagmi";
import {
  readContract,
  erc20ABI,
  prepareWriteContract,
  writeContract,
  waitForTransaction,
} from "@wagmi/core";
import { FormattedInvestment } from "../../types/general";
import { now } from "lodash";
import { useSelector } from "react-redux";
import Button from "../../base-components/Button";
import { diamondAddress, endInvestmentAbi, createFacetAbi } from "../../contracts";
import { RootState } from "../../stores/store";
import { loadBalance } from "../../stores/walletSlice";
import { inDollarFormat } from "../../utils/helper";
import { displayToast } from "../Toast";
import { loadInvestorInvestments } from "../../stores/insuranceSlice";
import { useAppDispatch } from "../../stores/hooks";


export default function EndModal({
  setOpenEndModal,
  currentInvestment,
}: {
  setOpenEndModal: Dispatch<SetStateAction<boolean>>;
  currentInvestment: FormattedInvestment;
    }) {
    
  const dispatch = useAppDispatch();
    
    
     const { signerAddress,  } = useSelector(
       (state: RootState) => state.wallet
     );
     const {
       protocolDetails,
       pendingProjects,
       allProjects,
       disapprovedProjects,
       projectInfo,
    } = useSelector((state: RootState) => state.insurance);
    
  let [expectedTotalReturn, setExpectedTotalReturn] = useState<bigint>();
  let [expectedTokenAddress, setExpectedTokenAddress] = useState<string>();
  let [expectedDecimals, setExpectedDecimals] = useState<number>();
  let [expectedSymbol, setExpectedSymbol] = useState<string>();

  let [endText, setEndText] = useState("End Investment");
  let [isEnding, setIsEnding] = useState(false);

  const totalReturn = useContractRead({
    address: diamondAddress,
    abi: endInvestmentAbi,
    functionName: "endInvestment",
    args: [currentInvestment.investmentId, currentInvestment.projectAddress],
    account: signerAddress as `0x${string}`,
    watch: true,
    onSuccess(data: any[]) {
      console.log("Success", data);
      setExpectedTotalReturn(data[0]);
      setExpectedTokenAddress(data[1]);
    },
    onError(error) {
      console.log("Error message::::: ", error.cause);
    },
  });

  const formattedTotalReturn =
    expectedTotalReturn && expectedDecimals
      ? inDollarFormat(
          Number(
            ethers.formatUnits(
              expectedTotalReturn?.toString(),
              expectedDecimals
            )
          )
        )
      : "";

  useEffect(() => {
    const getTokenDetails = async () => {
      if (expectedTokenAddress) {
        const tokenDecimals = (await readContract({
          address: expectedTokenAddress as `0x${string}`,
          abi: erc20ABI,
          functionName: "decimals",
        })) as number;

        const tokenSymbol = (await readContract({
          address: expectedTokenAddress as `0x${string}`,
          abi: erc20ABI,
          functionName: "symbol",
        })) as string;

        console.log("Token decimals: ", tokenDecimals);
        console.log("token symbol: ", tokenSymbol);

        setExpectedDecimals(tokenDecimals);
        setExpectedSymbol(tokenSymbol);
      }
    };
    getTokenDetails();
  }, [expectedTokenAddress]);

  let status =
    now() > BigInt(currentInvestment.endDay) * 1000n ? "Matured" : "Not Matured";

  const handleEndInvestment = async () => {
    // End the project
    setIsEnding(true);
    setEndText(`Ending Investment`);

    try {
      const endRequest = await prepareWriteContract({
        address: diamondAddress as `0x${string}`,
        abi: createFacetAbi,
        functionName: "endInvestment",
        args: [
          currentInvestment.investmentId,
          currentInvestment.projectAddress,
        ],
        account: signerAddress as `0x${string}`,
      });

      const { hash } = await writeContract(endRequest);

      const endReceipt = await waitForTransaction({
        hash,
      });

      console.log("Receipt: ", endReceipt);
      if (endReceipt.status == "success") {
        console.log("Success");
        displayToast("success", "Investment has been endd");
        dispatch(loadInvestorInvestments(
            {
                projectId: currentInvestment.projectAddress as string,
                investorAddress: signerAddress
            }
        ))
        dispatch(loadBalance(signerAddress as `0x${string}`));
      } else {
        console.log("Failure");
        console.log("Failed to end");
      }

      setIsEnding(false);
      setEndText(`End Investment`);
    } catch (error) {
      console.log("Errorrrrr: ", error);

      displayToast("failure", "Failed to end");
      setIsEnding(false);
      setEndText(`End Investment`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-75 transition-opacity">
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
                  End Investment
                </div>
                <button
                  onClick={() => {
                    setOpenEndModal(false);
                  }}
                  type="button"
                  className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:hover:text-white"
                  data-modal-toggle="small-modal"
                >
                  <svg
                    className="h-5 w-5  dark:text-white"
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

              {currentInvestment.isActive ? (
                <>
                  <div className="my-5 flex w-full flex-col items-center ">
                    <p className="py-2 text-sm text-gray-600  dark:text-white">
                      Are you sure you want to end your investment?
                    </p>
                  </div>
                  <div className="rounded-md border p-4">
                    <div className="flex justify-between text-sm">
                      <p className="font-medium">Investment ID:</p>
                      <p className="">
                        {currentInvestment.investmentId
                          .substring(0, 5)
                          .concat("...")
                          .concat(
                            currentInvestment.investmentId.substring(
                              currentInvestment.investmentId.length - 5,
                              currentInvestment.investmentId.length
                            )
                          )}
                      </p>
                    </div>
                    <div className="mt-2 flex justify-between text-sm">
                      <p className="font-medium">Status:</p>
                      <p className="animate-pulse font-bold">{status}</p>
                    </div>
                    <div className="mt-2 flex justify-between text-sm">
                      <p className="font-medium">Total Return:</p>
                      <p className="">
                        {expectedTotalReturn &&
                        expectedSymbol &&
                        expectedTotalReturn > 0n
                          ? `${formattedTotalReturn} ${expectedSymbol}`
                          : "--"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 overflow-auto rounded-md border p-2 py-4 text-sm scrollbar-hide">
                    <h4 className="py-2">Note:</h4>
                    <ul className="text-xs">
                      <li className="text-xs text-red-600 dark:text-red-300">
                        <b>
                          {" "}
                          If a stake is ended prematurely, only 50% of your
                          principal will be given back to you.{" "}
                        </b>
                      </li>
                      <br />
                    </ul>
                  </div>
                  {false && (
                    <p className="pt-2 text-xs font-medium text-red-800 dark:text-red-400">
                      <small>
                        This transaction is likely to fail. Please, try again
                        later.
                      </small>
                    </p>
                  )}

                  <div className="flex w-full justify-center">
                    <Button
                      disabled={isEnding}
                      onClick={handleEndInvestment}
                      className="my-4 disabled:cursor-not-allowed disabled:bg-gray-500"
                    >
                      {" "}
                      {isEnding ? (
                        <div className="flex items-center">
                          <ClipLoader color="#fff" loading={true} size={30} />
                          <p className="ml-2">{endText}</p>
                        </div>
                      ) : (
                        <div className="flex w-full items-center">
                          <p className="w-full">{endText}</p>
                        </div>
                      )}
                    </Button>
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
