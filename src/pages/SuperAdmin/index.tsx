import { Listbox } from "@headlessui/react";
import { motion } from "framer-motion";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { ClipLoader, GridLoader } from "react-spinners";
import flexStake from "@/assets/images/flexstake.svg";


import { ethers } from "ethers";

import moment from "moment";
import { RootState } from "../../stores/store";
import { useSelector } from "react-redux";
import { FormattedPendingInvestment } from "../../types/general";
import {
  diamondAddress,
  projectOwner,
  superAdminFacetAbi,
} from "../../contracts";
import InputLabel from "../../components/InputLabel";
import PendingProjects from "../../components/PendingProject";
import Input from "../../components/Input";
import { displayToast } from "../../components/Toast";
import { useAppDispatch } from "../../stores/hooks";
import { loadProtocolDetails } from "../../stores/insuranceSlice";
import { inDollarFormat } from "../../utils/helper";

function Main() {
 


  const titleRef = useRef<HTMLDivElement>(null);
  let [isClicked, setisClicked] = useState(false);
  let [tokenAmount, setTokenAmount] = useState("");
  let [tokenAmountInUsd, setTokenAmountInUsd] = useState(0n);

  let [insuranceFee, setRewardFee] = useState(BigInt(0));

  let [setText, setCreateText] = useState("Create Investment");
  let [isCreating, setIsCreating] = useState(false);

  let [robustPendingInvestments, setRobustPendingInvestments] =
    useState<FormattedPendingInvestment[]>();

  // Admin useState functions
  let [iRewardPercentages, setIRewardPercentages] = useState<string>("");
  let [iRewardDurations, setIRewardDurations] = useState<string>("");
  let [loadingReward, setLoadingReward] = useState<boolean>();

  let [minAmount, setMinAmount] = useState<string>("");
  let [isLoadingMin, setIsLoadingMin] = useState<boolean>(false);

  let [creationFee, setCreationFee] = useState<string>("");
  let [isLoadingCreationFee, setIsLoadingCreationFee] =
    useState<boolean>(false);

  let [pause, setPause] = useState<boolean>(false);
  let [isLoadingPause, setIsLoadingPause] = useState<boolean>(false);

  let [taxPercentage, setTaxPercentage] = useState<string>();
  let [isLoadingTaxPercentage, setIsLoadingTaxPercentage] =
    useState<boolean>(false);

  let [liquidityPercentage, setLiquidityPercentage] = useState<string>();
  let [isLoadingLiquidityPercentage, setIsLoadingLiquidityPercentage] =
    useState<boolean>(false);

  let [penaltyPercentage, setPenaltyPercentage] = useState<string>();
  let [isLoadingPenaltyPercentage, setIsLoadingPenaltyPercentage] =
    useState<boolean>(false);

  let [projectAttributes, setProjectAttributes] = useState<{
    name: string;
    symbol: string;
    decimals: number;
  }>();


  const dispatch = useAppDispatch();

  return (
    <div className="">
    
        <div>
          <div className="p-6 ">
            <div className="item-center justify-center ">
              <div className="pb-10 text-center">
                <h2 className="text-gray-1100 dark:text-gray-dark-1100 mb-[13px] text-[28px] font-bold capitalize leading-[35px]">
                  Super Admin Dashboard
                </h2>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex flex-col justify-between gap-x-[38px] divide-y divide-slate-600">
                  {/* All Pending Projects */}
                  <PendingProjects />
                  {/* ------------------Set Tax Percentage-------------------------- */}
                  <div className="flex items-center py-5 ">
                    <div className="w-[500px]">
                      <div>
                        <InputLabel title="Enter the tax percentage" />
                        <Input
                          onChange={(event) => {
                            const { value } = event.target;
                            setTaxPercentage(value);
                          }}
                          value={taxPercentage}
                          type="text"
                          inputClassName="spin-button-hidden"
                        />
                       
                      </div>
                    </div>
                    <button
                      onClick={async () => {console.log("Button clicked")}}>
                    </button>
                  </div>
                  {/* ------------------End of Set Tax Percentage-------------------------- */}

                  {/* ------------------Set Creation Fee-------------------------- */}
                  <div className="flex items-center py-5 ">
                    <div className="w-[500px]">
                      <div>
                        <InputLabel title="Enter the creation fee" />
                        <Input
                          onChange={(event) => {
                            const { value } = event.target;
                            setCreationFee(value);
                          }}
                          value={creationFee}
                          type="text"
                          inputClassName="spin-button-hidden"
                        />
                      
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                       console.log("abc")
                      }}
                      className="my-4 mx-4 rounded-md disabled:cursor-not-allowed disabled:bg-theme-1/50  bg-theme-1 p-2 px-4 text-white"
                      disabled={isLoadingCreationFee}
                    >
                      {isLoadingCreationFee ? (
                        <div className="flex items-center">
                          <ClipLoader color="#fff" loading={true} size={30} />
                          <p className="ml-2">Setting Creation Fee</p>
                        </div>
                      ) : (
                        <div className="flex w-full items-center">
                          <p className="w-full">Set Creation Fee</p>
                        </div>
                      )}
                    </button>
                  </div>
                  {/* ------------------End of Set Creation Fee-------------------------- */}
                </div>
              </div>
            </div>
          </div>
        </div>
 
    </div>
  );
}

export default Main;
