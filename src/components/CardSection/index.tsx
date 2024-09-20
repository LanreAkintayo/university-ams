import { useEffect, useState } from "react";
import { GridLoader } from "react-spinners";

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
import moment from "moment";
import { diamondAddress, createFacetAbi } from "../../contracts";
import { InsuranceInvestment, FormattedInvestment } from "../../types/general";
import { inDollarFormat, fromWei } from "../../utils/helper";
import ActiveCard from "../ActiveCard";
import EndCard from "../EndCard";
import PendingCard from "../PendingCard";

export default function CardSection({
  investorInvestments,
}: {
  investorInvestments: InsuranceInvestment[];
}) {
  let [currentInvestment, setCurrentInvestment] = useState(null);
  let [openEndModal, setOpenEndModal] = useState(false);

  let [showTable, setShowTable] = useState("ACTIVE");

  let [activeInvestments, setActiveInvestments] =
    useState<FormattedInvestment[]>();
  let [pendingInvestments, setPendingInvestments] =
    useState<FormattedInvestment[]>();
  let [endedInvestments, setEndedInvestments] =
    useState<FormattedInvestment[]>();

  // console.log('Investor investmetns: ', investorInvestments);

  useEffect(() => {
    const updateInvestmentsArray = async () => {
      let _activeInvestments = [];
      let _pendingInvestments = [];
      let _endedInvestments = [];

      if (investorInvestments) {
        for (const currentInvestment of investorInvestments) {
          const accumulatedReward = (await readContract({
            address: diamondAddress as `0x${string}`,
            abi: createFacetAbi,
            functionName: "getAccumulatedReward",
            args: [
              currentInvestment.investmentId,
              currentInvestment.projectAddress,
              currentInvestment.investor,
            ],
          })) as bigint;

          // const tokenSymbol =

          const tokenDecimals = (await readContract({
            address: currentInvestment.projectAddress as `0x${string}`,
            abi: erc20ABI,
            functionName: "decimals",
          })) as number;

          const tokenSymbol = (await readContract({
            address: currentInvestment.projectAddress as `0x${string}`,
            abi: erc20ABI,
            functionName: "symbol",
          })) as string;

          const formattedInvestedAmount = inDollarFormat(
            Number(fromWei(currentInvestment.investedAmount))
          );

          const formattedStartDay = moment(
            Number(currentInvestment.startDay) * 1000,
            "x"
          ).format("lll");

          const progressPercentage =
            Number(currentInvestment.reward) > 0
              ? (Number(accumulatedReward) * 100) /
                Number(currentInvestment.reward)
              : 0;

          const endDay =
            BigInt(currentInvestment.startDay) + BigInt(currentInvestment.investingDays);

          let newInvestment = {
            ...currentInvestment,
            accumulatedReward,
            formattedInvestedAmount,
            formattedStartDay,
            progressPercentage,
            endDay,
            tokenDecimals,
            tokenSymbol,
          };
          if (
            !currentInvestment.isActive &&
            Number(currentInvestment.status) == 1 &&
            Number(currentInvestment.startDay) > 0
          ) {
            // ended investments
            _endedInvestments.push(newInvestment);
          } else if (Number(currentInvestment.status) == 0) {
            // Pending investments
            _pendingInvestments.push(newInvestment);
          } else if (
            currentInvestment.isActive &&
            Number(currentInvestment.status) == 1
          ) {
            // Active investments
            _activeInvestments.push(newInvestment);
          }
        }
      }
      setActiveInvestments(_activeInvestments);
      setPendingInvestments(_pendingInvestments);
      setEndedInvestments(_endedInvestments);
    };
    updateInvestmentsArray();
  }, [investorInvestments]);

  useEffect(() => {
    console.log("End Modal: ", openEndModal);
    // console.log('Current investment: ', currentInvestment);
  }, [openEndModal, currentInvestment]);

  return (
    <div>
      {activeInvestments != undefined &&
        endedInvestments != undefined &&
        pendingInvestments != undefined && (
          <div className="item-center flex place-items-center items-center justify-center px-8 ">
            <div className="mt-4 flex rounded-full bg-gray-100 p-1 shadow-lg dark:bg-gray-800 sm:p-2">
              <button
                className={`my-1 rounded-full px-2 py-2 text-sm  sm:text-base ${
                  showTable == "ACTIVE"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-300 text-gray-800"
                }`}
                onClick={() => {
                  setShowTable("ACTIVE");
                }}
              >
                <div className="flex items-center">
                  <p className="px-1 sm:px-2">Active</p>
                  <div
                    className={`flex h-5 w-6 items-center rounded-full  ${
                      showTable == "ACTIVE"
                        ? "bg-gray-100 text-black"
                        : "bg-gray-800 text-gray-100"
                    } justify-center text-center text-sm`}
                  >
                    <small>
                      <small>
                        {activeInvestments?.length > 0
                          ? activeInvestments.length
                          : "0"}
                      </small>
                    </small>
                  </div>
                </div>
              </button>

              <button
                className={` my-1 rounded-full px-2 py-2 text-sm sm:text-base ${
                  showTable == "ENDED"
                    ? "mx-4 bg-gray-900 text-white"
                    : " mx-4 bg-gray-300 text-gray-800"
                }`}
                onClick={() => {
                  setShowTable("ENDED");
                }}
              >
                <div className="flex items-center">
                  <p className="px-1 sm:px-2">Ended</p>
                  <div
                    className={`flex h-5 w-6 items-center rounded-full  ${
                      showTable == "ENDED"
                        ? "bg-gray-100 text-black"
                        : "bg-gray-800 text-gray-100"
                    } justify-center text-center text-sm`}
                  >
                    <small>
                      <small>
                        {endedInvestments?.length > 0
                          ? endedInvestments.length
                          : "0"}
                      </small>
                    </small>
                  </div>
                </div>
              </button>

              <button
                className={` my-1 rounded-full px-2 py-2 text-sm sm:text-base ${
                  showTable == "PENDING"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-300 text-gray-800"
                }`}
                onClick={() => {
                  setShowTable("PENDING");
                }}
              >
                <div className="flex items-center">
                  <p className="px-1 sm:px-2">Pending</p>
                  <div
                    className={`flex h-5 w-6 items-center rounded-full  ${
                      showTable == "PENDING"
                        ? "bg-gray-100 text-black"
                        : "bg-gray-800 text-gray-100"
                    } justify-center text-center text-sm`}
                  >
                    <small>
                      <small>
                        {pendingInvestments?.length > 0
                          ? pendingInvestments.length
                          : "0"}
                      </small>
                    </small>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

      <div className="retro-container xl:px-[97px]">
        <div className="mt-4">
          {activeInvestments == undefined &&
            endedInvestments == undefined &&
            pendingInvestments == undefined && (
              <div className="flex w-full flex-col items-center justify-center">
                <GridLoader color="gray" speedMultiplier={0.3} />
                <div className="my-3 flex flex-col  items-center justify-center">
                  <p>Investment is Loading..</p>
                  <p>Wait a few seconds</p>
                </div>
              </div>
            )}
        </div>
      </div>

      {showTable == "ACTIVE" && activeInvestments && (
        <div className="container mx-auto mb-12 grid grid-cols-1 gap-8 px-4 md:grid-cols-2 md:px-6 xl:grid-cols-3">
          {activeInvestments?.length == 0 && (
            <div className="col-span-full flex w-full flex-col items-center justify-center">
              <div className="justifiy-center flex h-80 w-80 flex-col items-center rounded-md">
                No Active Investments
              </div>
            </div>
          )}
          {activeInvestments?.map((investment: any) => {
            return <ActiveCard investment={investment} />;
          })}
          {/* {activeInvestments && (
                <ActivePagination
                  className="col-span-full"
                  items={activeInvestments.length}
                  currentPage={currentActivePage}
                  pageSize={pageSize}
                  onPageChange={onActivePageChange}
                />
              )} */}
        </div>
      )}

      {showTable == "ENDED" && endedInvestments && (
        <div className="container mx-auto mb-12 grid grid-cols-1 gap-8 px-4 md:grid-cols-2 md:px-6 xl:grid-cols-3">
          {endedInvestments?.length == 0 && (
            <div className="col-span-full flex w-full flex-col items-center justify-center">
              <div className="justifiy-center flex h-80 w-80 flex-col items-center rounded-md">
                No Ended Investments
              </div>
            </div>
          )}
          {endedInvestments?.map((investment: any) => {
            return <EndCard investment={investment} />;
          })}
          {/* {activeInvestments && (
                <ActivePagination
                  className="col-span-full"
                  items={activeInvestments.length}
                  currentPage={currentActivePage}
                  pageSize={pageSize}
                  onPageChange={onActivePageChange}
                />
              )} */}
        </div>
      )}
      {showTable == "PENDING" && pendingInvestments && (
        <div className="container mx-auto mb-12 grid grid-cols-1 gap-8 px-4 md:grid-cols-2 md:px-6 xl:grid-cols-3">
          {pendingInvestments?.length == 0 && (
            <div className="col-span-full flex w-full flex-col items-center justify-center">
              <div className="justifiy-center flex h-80 w-80 flex-col items-center rounded-md">
                No Pending Investments
              </div>
            </div>
          )}
          {pendingInvestments?.map((investment: any) => {
            return (
              // <InvestmentCard
              //   investment={investment}
              //   setCurrentInvestment={setCurrentInvestment}
              //   setOpenEndModal={setOpenEndModal}
              // />

              <PendingCard
                investment={investment}
                setCurrentInvestment={setCurrentInvestment}
                setOpenEndModal={setOpenEndModal}
              />
            );
          })}
          {/* {activeInvestments && (
                <ActivePagination
                  className="col-span-full"
                  items={activeInvestments.length}
                  currentPage={currentActivePage}
                  pageSize={pageSize}
                  onPageChange={onActivePageChange}
                />
              )} */}
        </div>
      )}
    </div>
  );
}
