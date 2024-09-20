
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import moment, { now } from "moment";

import { ethers } from "ethers";
import { FormattedInvestment } from "../../types/general";
import { toMilliseconds, getTimeUnitAndValue, inDollarFormat, fromWei, toDp } from "../../utils/helper";
import EndModal from "../ModalEnd";


interface PropsInterface {
  investment: FormattedInvestment;
}
export default function ActiveCard(props: PropsInterface) {
  let investment: FormattedInvestment = props.investment;
  let [openEndModal, setOpenEndModal] = useState(false);

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
              <div className="  text-center">
                <div className="px-5">
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
                    <span className="inline-block rounded-b-[10px] bg-[#59C378] px-[30px] pt-[3px] pb-[5px] text-white">
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
                  <h2 className="mt-7 mb-4 flex items-center justify-center text-[25px] font-bold uppercase text-white md:text-[20px]">
                    {investment.formattedInvestedAmount}{" "}
                    {investment.tokenSymbol}
                    <span className="ml-[2px] inline-block text-base font-medium text-[#D8D8D8] ">
                      - Invested
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

                {true && (
                  <div className="flex flex-col">
                    <p className="py-2 text-right text-[12px]">
                      Reward (APY):{" "}
                      {inDollarFormat(
                        Number(fromWei(investment.accumulatedReward))
                      )}{" "}
                      {investment.tokenSymbol}
                    </p>
                    <div className=" h-full w-full bg-gray-200 transition-all duration-1000 ease-out dark:bg-slate-500">
                      <div
                        className="h-4 bg-[#59C378]"
                        style={{
                          width: `${investment.progressPercentage}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between">
                      {" "}
                      <p className="text-center text-[12px]">
                        {toDp(Number(investment.progressPercentage), 2)}%
                      </p>
                      <p className="self-end text-[12px]">
                        {value > 0 ? `${value} ${timeUnit} left ` : `Matured!!`}{" "}
                      </p>
                    </div>
                  </div>
                )}
                <div className="list-none p-2 pt-2">
                  <div className="pt-3">
                    <div className="mb-3 flex flex-col items-center justify-center sm:flex-row sm:justify-between">
                      {/* <div className="relative  text-sm ">🔒 {lockUp}</div> */}
                      <button
                        className="sm:text-md flex items-center gap-x-2 rounded-[6px] border border-orange-900 bg-black py-[7px] px-[6px] text-sm text-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-yellow-500 dark:bg-brand"
                        onClick={() => {
                          setOpenEndModal(true);
                        }}
                      >
                        End Investment
                      </button>
                    </div>
                    <span className="block text-[12px] font-bold text-black dark:text-white ">
                      Start Date: {investment.formattedStartDay}
                    </span>
                    <span className="block text-[12px] font-bold text-black dark:text-white ">
                      Maturity Date: {maturityDate}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
        {/* </div> */}
      </div>

      {openEndModal && investment && (
        <div className="mt-2 flex justify-center text-center scrollbar-hide sm:block sm:p-0">
          <EndModal
            setOpenEndModal={setOpenEndModal}
            currentInvestment={investment}
          />
        </div>
      )}
    </div>
  );
}
