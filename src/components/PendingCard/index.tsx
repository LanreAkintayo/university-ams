import { Dispatch, SetStateAction, useEffect, useState } from "react";
import moment, { now } from "moment";

import { ethers } from "ethers";
import { FormattedInvestment } from "../../types/general";
import { getTimeUnitAndValue, toMilliseconds } from "../../utils/helper";

interface PropsInterface {
  investment: FormattedInvestment;
  setCurrentInvestment: any;
  setOpenEndModal: Dispatch<SetStateAction<boolean>>;
}
export default function PendingCard(props: PropsInterface) {
  let investment: FormattedInvestment = props.investment;
  let setCurrentInvestment = props.setCurrentInvestment;
  let setOpenEndModal = props.setOpenEndModal;

  const endDay = (
    toMilliseconds(Number(investment.startDay)) +
    toMilliseconds(Number(investment.investingDays))
  ).toString();

  const timeLeft = Number(endDay) - now() <= 0 ? 0 : Number(endDay) - now();

  const { timeUnit, value } = getTimeUnitAndValue(timeLeft / 1000);

  const maturityDate = moment(Number(endDay), "x").format("lll");

  return (
    <div className="">
      <div className="my-1">
        {/* <div className="grid grid-cols-4 gap-4"> 
        overflow-hidden rounded-lg shadow-lg
        */}
        <article className="">
          <div
            data-aos="fade-up"
            data-aos-duration="1000"
            className="aos-init aos-animate"
          >
            <div className="border-secondary hover:bg-secondary dark:hover:border-gray-dark dark:hover:bg-gray-dark group rounded-3xl border-2 bg-white p-6 px-4 transition hover:drop-shadow-[-10px_30px_70px_rgba(40,38,77,0.25)] dark:border-white/10 dark:bg-transparent dark:bg-gradient-to-b dark:from-white/[0.01] dark:to-transparent dark:drop-shadow-none sm:px-6">
              <div className="text-center space-y-2">
                <div className="flex w-full justify-end">
                  <button className="animate-pulse rounded-md border border-gray-800 bg-gray-900 px-2 text-[11px] hover:bg-gray-800">
                    Pending
                  </button>
                </div>
                <div className="px-5">
                  <div className="flex items-center justify-center">
                    <div
                      className="#investment-id cursor-pointer"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            investment.investmentId
                          );
                          console.log("Text copied to clipboard");
                        } catch (err) {
                          console.error("Failed to copy text: ", err);
                        }
                      }}
                    >
                      <span className="inline-block animate-pulse rounded-md bg-[#59C378] px-[30px] pt-[3px] pb-[5px] text-white">
                        {investment.investmentId
                          .substring(0, 5)
                          .concat("...")
                          .concat(
                            investment.investmentId.substring(
                              investment.investmentId.length - 5,
                              investment.investmentId.length
                            )
                          )}
                      </span>
                    </div>
                  </div>
                  <h2 className="mt-7 mb-4 flex items-center justify-center text-[25px] font-bold uppercase text-white md:text-[20px]">
                    {investment.formattedInvestedAmount}{" "}
                    {investment.tokenSymbol}
                    <span className="ml-[2px] inline-block text-base font-medium text-[#D8D8D8] ">
                      - To Invest
                    </span>
                  </h2>
                  <p
                    className={`mx-auto max-w-[282px] border-b border-[#496451] pb-2 font-medium text-[#D8D8D8] `}
                  >
                    Reward -{" "}
                    {ethers.formatUnits(investment.reward.toString(), 18)}{" "}
                    {investment.tokenSymbol}
                  </p>
                </div>

                <div className="list-none p-2 pt-2">
                  <div className="pt-3">
                    <div className="mb-3 flex flex-col items-center justify-center sm:flex-row sm:justify-between">
                      {/* <div className="relative  text-sm ">🔒 {lockUp}</div> */}
                      <button
                        className="sm:text-md flex items-center gap-x-2 rounded-[6px] border border-orange-900 bg-black py-[7px] px-[6px] text-sm text-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-yellow-500 dark:bg-brand"
                        onClick={() => {
                          setCurrentInvestment(investment);
                          setOpenEndModal(true);
                        }}
                        disabled={true}
                      >
                        End Investment
                      </button>
                    </div>
                    <div className="mt-4 text-center text-[13px]">
                      No interest on a pending investment.{" "}
                      <div>
                        Wait for{" "}
                        <button className="rounded-md border border-gray-800 bg-gray-900 px-1 hover:bg-gray-800">
                          Admin
                        </button>{" "}
                        for Approval
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
        {/* </div> */}
      </div>
    </div>
  );
}
