import { ChangeEvent, useEffect, useRef, useState } from "react";

import { ethers } from "ethers";

import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useAppDispatch } from "../../stores/hooks";
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
import { convertTokenToUsd, getTimeUnitAndValue } from "../../utils/helper";
import { Duration } from "../../types/general";
import CardSection from "../../components/CardSection";

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
            projectId: tokenAddress as string,
            investorAddress: signerAddress,
          })
        );
        dispatch(
          loadInvestorTotalInvested({
            projectId: tokenAddress as string,
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

  const isProjectPresent = () => {
    console.log("Token Address: ", tokenAddress);
    console.log("All projects include ", allProjects?.includes(tokenAddress!));
    if (tokenAddress && allProjects?.includes(tokenAddress)) {
      return true;
    }
    return false;
  };

  return (
    <div className="">

      {isProjectPresent() ? (
        <div>
          <div className="relative p-6 ">
            <div className="item-center flex justify-center ">
              <div className="text-center">
                <h2 className="text-gray-1100 dark:text-gray-dark-1100 mb-[1px] text-[28px] font-bold capitalize leading-[35px]">
                  View all Investments
                </h2>
              </div>
            </div>
            <div className="flex flex-col justify-between gap-x-[38px] xl:flex-row xl:px-[97px]">
              <div className="flex flex-col gap-y-6 pb-[22px]"></div>
            </div>

            {investorInvestments && (
              <CardSection investorInvestments={investorInvestments} />
            )}
          </div>
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
