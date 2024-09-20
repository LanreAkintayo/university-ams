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

import { resolve } from "path";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { RootState } from "../../stores/store";
import { Duration, FormattedPendingInvestment } from "../../types/general";
import { useAppDispatch } from "../../stores/hooks";
import {
  loadProjectMetrics,
  loadProjectPendingInvestments,
  loadProjectPlatformAddresses,
  loadRewardDurations,
  loadRewardPercentages,
  loadTokenToUsdPath,
} from "../../stores/insuranceSlice";
import {
  array,
  inDollarFormat,
  numberReplacer,
  sDuration,
} from "../../utils/helper";
import { ethers } from "ethers";
import { adminFacetAbi, diamondAddress } from "../../contracts";
import { displayToast } from "../../components/Toast";
import InputLabel from "../../components/InputLabel";
import PendingInvestments from "../../components/PendingInvestments";
import { ClipLoader } from "react-spinners";
import Input from "../../components/Input";
import { Minus, Plus } from "lucide-react";

const isValidTokenAddress = (tokenAddress: string) => {
  const standardAddressPattern = /^0x[0-9a-fA-F]{40}$/;
  if (!standardAddressPattern.test(tokenAddress)) {
    return false;
  } else {
    return true;
  }
};

function Main() {
  // Hooks
  const { tokenAddress } = useParams();
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
  const titleRef = useRef<HTMLDivElement>(null);
  let [isClicked, setisClicked] = useState(false);
  let [tokenAmount, setTokenAmount] = useState("");
  let [tokenAmountInUsd, setTokenAmountInUsd] = useState(0n);

  let [insuranceFee, setRewardFee] = useState(BigInt(0));

  let [setText, setCreateText] = useState("Create Investment");
  let [isCreating, setIsCreating] = useState(false);

  let [durationOptions, setDurationOptions] = useState<Duration[]>();
  let [investperiodInsured, setInvestPeriodInsured] = useState<Duration>();
  let [robustPendingInvestments, setRobustPendingInvestments] =
    useState<FormattedPendingInvestment[]>();

  // Admin useState functions
  let [iRewardPercentages, setIRewardPercentages] = useState<string>("");
  let [iRewardDurations, setIRewardDurations] = useState<string>("");
  let [investmentPlan, setInvestmentPlan] = useState({
    percentages: [] as string[],
    durations: [] as string[],
  });
  let [loadingReward, setLoadingReward] = useState<boolean>();

  let [minAmount, setMinAmount] = useState<string>("");
  let [isLoadingMin, setIsLoadingMin] = useState<boolean>(false);

  let [maxAmount, setMaxAmount] = useState<string>("");
  let [isLoadingMax, setIsLoadingMax] = useState<boolean>(false);

  let [pause, setPause] = useState<boolean>(false);
  let [isLoadingPause, setIsLoadingPause] = useState<boolean>(false);

  let [insurancePercentage, setInsurancePercentage] = useState<string>();
  let [isLoadingInsurancePercentage, setIsLoadingInsurancePercentage] =
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

  let [investmentPlanLength, setInvestmentPlanLength] = useState(2);

  // useEffect
  useEffect(() => {
    const getInvestorInvestments = async () => {
      if (tokenAddress && isValidTokenAddress(tokenAddress as string)) {
        const projectAttributes = await getTokenAttributes(
          tokenAddress as string
        );

        setProjectAttributes(projectAttributes);
      }
    };

    getInvestorInvestments();
  }, [tokenAddress]);

  useEffect(() => {
    const getInvestorInvestments = async () => {
      if (
        tokenAddress &&
        isValidTokenAddress(tokenAddress as string) &&
        signerAddress
      ) {
        dispatch(loadProjectPendingInvestments(tokenAddress as string));
        dispatch(loadProjectPlatformAddresses(tokenAddress as string));
        dispatch(loadProjectMetrics(tokenAddress as string));
        dispatch(loadRewardDurations(tokenAddress as string));
        dispatch(loadRewardPercentages(tokenAddress as string));
        dispatch(loadTokenToUsdPath(tokenAddress as string));
      }
    };

    getInvestorInvestments();
  }, [tokenAddress, signerAddress]);

  useEffect(() => {
    const updatePendingInvestments = async () => {
      if (projectPendingInvestments && projectPlatformAddresses) {
        const robustPendingInvestments = projectPendingInvestments.map(
          async (investment) => {
            const tokenAttributes = await getTokenAttributes(
              investment.projectAddress
            );

            const stableAttributes = await getTokenAttributes(
              projectPlatformAddresses.stableTokenAddress
            );

            return {
              ...investment,
              tokenAttributes,
              stableAttributes,
            };
          }
        );
        const resolved = (await Promise.all(
          robustPendingInvestments
        )) as FormattedPendingInvestment[];

        setRobustPendingInvestments(resolved);
      }
    };

    updatePendingInvestments();
  }, [projectPendingInvestments, projectPlatformAddresses]);

  useEffect(() => {
    const updateInvestmentPlanLength = () => {
      if (rewardDurations && rewardDurations.length > 0) {
        setInvestmentPlanLength(rewardDurations.length);
      }
    };

    const updateInvestmentPlan = () => {
      if (rewardDurations && rewardPercentages) {
        const formattedDurations = rewardDurations.map((duration) =>
          String(Number(duration) / 86400)
        );
        const formattedPercentages = rewardPercentages.map((percentage) =>
          String(Number(percentage) / 100)
        );
        setInvestmentPlan({
          percentages: formattedPercentages,
          durations: formattedDurations,
        });
      }
    };

    updateInvestmentPlanLength();
    updateInvestmentPlan();
  }, [rewardDurations, rewardPercentages]);

  const getTokenAttributes = async (tokenAddress: string) => {
    const name = (await readContract({
      address: tokenAddress as `0x${string}`,
      abi: erc20ABI,
      functionName: "name",
    })) as string;
    const symbol = (await readContract({
      address: tokenAddress as `0x${string}`,
      abi: erc20ABI,
      functionName: "symbol",
    })) as string;
    const decimals = (await readContract({
      address: tokenAddress as `0x${string}`,
      abi: erc20ABI,
      functionName: "decimals",
    })) as number;

    return { name, symbol, decimals };
  };

  const isProjectPresent = () => {
    if (tokenAddress && allProjects?.includes(tokenAddress)) {
      return true;
    }
    return false;
  };

  const approveToken = async (_tokenAddress: string, _amount: bigint) => {
    const name = (await readContract({
      address: _tokenAddress as `0x${string}`,
      abi: erc20ABI,
      functionName: "name",
    })) as string;
    try {
      const decimals = (await readContract({
        address: tokenAddress as `0x${string}`,
        abi: erc20ABI,
        functionName: "decimals",
      })) as number;

      const formattedAmount = inDollarFormat(
        Number(ethers.formatUnits(_amount.toString(), decimals))
      );

      setCreateText(`Approving ${formattedAmount} ${name}`);

      const approveRequest = await prepareWriteContract({
        address: _tokenAddress as `0x${string}`,
        abi: erc20ABI,
        functionName: "approve",
        args: [
          diamondAddress,
          BigInt(ethers.parseUnits(_amount.toString(), decimals).toString()),
        ],
      });

      const { hash } = await writeContract(approveRequest);

      const approveReceipt = await waitForTransaction({
        hash,
      });

      console.log("Receipt: ", approveReceipt);
      if (approveReceipt.status == "success") {
        console.log("Approved");
        displayToast("success", `${name} has been approved`);
        setCreateText("Create Investment");

        return true;
      } else {
        console.log("Failure");
        displayToast("failure", `Failed to approve ${name}`);
        setCreateText("Create Investment");

        return false;
      }
    } catch (error) {
      console.log("Error: ", error);
      displayToast("failure", `Failed to approve ${name}`);
      setCreateText("Create Investment");

      return false;
    }
  };

  const increment = () => {
    if (investmentPlanLength >= 10) {
      setInvestmentPlanLength(10);
    } else {
      setInvestmentPlanLength(investmentPlanLength + 1);
    }
  };

  const decrement = () => {
    if (investmentPlanLength <= 2) {
      setInvestmentPlanLength(2);
    } else {
      setInvestmentPlanLength(investmentPlanLength - 1);
      setInvestmentPlan((prevInvestmentPlan) => {
        const newPercentages = [...prevInvestmentPlan.percentages];
        const newDurations = [...prevInvestmentPlan.durations];

        newPercentages.pop();
        newDurations.pop();

        return {
          percentages: newPercentages,
          durations: newDurations,
        };
      });
    }
  };

  return (
    <div className="">
      {!allProjects ? (
        <div className="flex w-full items-center justify-center "> loading</div>
      ) : isProjectPresent() ? (
        projectPlatformAddresses?.creator != signerAddress ? (
          <div className="flex w-full items-center justify-center">
            Only creator can view
          </div>
        ) : (
          <div>
            <div className="p-6 ">
              <div className="item-center justify-center ">
                <div className="pb-10 text-center">
                  <h2 className="text-gray-1100 dark:text-gray-dark-1100 mb-[13px] text-[28px] font-bold capitalize leading-[35px]">
                    Admin Dashboard
                  </h2>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex flex-col justify-between gap-x-[38px] divide-y divide-slate-700">
                    <div className="flex flex-col gap-y-6 pb-[22px]">
                      <h1 className="text-xl">List of Pending Investments</h1>
                      {robustPendingInvestments && (
                        <PendingInvestments
                          projectPendingInvestments={robustPendingInvestments}
                        />
                      )}
                    </div>
                    {/* ------------------Set Reward Percentages and Durations-------------------------- */}

                    <div className="py-5 ">
                      <p className="pb-4 text-base ">
                        Update the Investment Plan
                      </p>

                      <div className="">
                        <div className="flex">
                          <div className="flex space-x-5 items-center text-md ">
                            <button
                              onClick={decrement}
                              className="bg-gray-200 p-2 px-5 rounded-md"
                            >
                              <div className="flex space-x-2">
                                <p>Remove</p>
                                <Minus className="inline" />
                              </div>
                            </button>
                            <button
                              onClick={increment}
                              className="bg-gray-200 p-2 px-5 rounded-md"
                            >
                              <div className="flex space-x-2">
                                <p>Add</p>
                                <Plus className="inline" />
                              </div>
                            </button>
                          </div>
                        </div>

                        <div className="space-y-5 my-2">
                          {array(investmentPlanLength).map((current, index) => {
                            return (
                              <div className="flex space-x-10 items-center">
                                <div className="flex space-x-2 items-center">
                                  <Input
                                    onChange={(event) => {
                                      const { value } = event.target;
                                      const valueInNumber = Number(value);
                                      setInvestmentPlan(
                                        (prevInvestmentPlan) => {
                                          const newDurations = [
                                            ...prevInvestmentPlan.durations,
                                          ] as string[];

                                          newDurations[index] = value;
                                          return {
                                            ...prevInvestmentPlan,
                                            durations: newDurations,
                                          };
                                        }
                                      );
                                    }}
                                    type="text"
                                    value={investmentPlan.durations[index]}
                                    placeholder={""}
                                    inputClassName="spin-button-hidden text-xl text-gray-800"
                                  />
                                  <p className="text-xl">days</p>
                                </div>

                                <div className="flex space-x-2 items-center">
                                  <Input
                                    onChange={(event) => {
                                      const { value } = event.target;
                                      const valueInNumber = Number(value);

                                      setInvestmentPlan(
                                        (prevInvestmentPlan) => {
                                          const newPercentages = [
                                            ...prevInvestmentPlan.percentages,
                                          ];

                                          newPercentages[index] = value;
                                          return {
                                            ...prevInvestmentPlan,
                                            percentages: newPercentages,
                                          };
                                        }
                                      );
                                    }}
                                    value={investmentPlan.percentages[index]}
                                    type="text"
                                    placeholder={""}
                                    inputClassName="spin-button-hidden text-xl text-gray-800"
                                  />
                                  <p className="text-2xl">%</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            setLoadingReward(true);

                            const validPercentages: number[] =
                              investmentPlan.percentages.map(
                                (percentage) => Number(percentage) * 100
                              );

                            const validDurations: number[] =
                              investmentPlan.durations.map((duration) =>
                                sDuration.days(Number(duration))
                              );

                            // Call the function here.
                            const setRequest = await prepareWriteContract({
                              address: diamondAddress as `0x${string}`,
                              abi: adminFacetAbi,
                              functionName: "setRewardDurationsAndPercentages",
                              args: [
                                tokenAddress,
                                validDurations,
                                validPercentages,
                              ],
                            });

                            const { hash } = await writeContract(setRequest);

                            const setReceipt = await waitForTransaction({
                              hash,
                            });

                            console.log("Receipt: ", setReceipt);
                            if (setReceipt.status == "success") {
                              console.log("Success");
                              displayToast(
                                "success",
                                "Successfully set percentages and durations"
                              );
                              await loadRewardPercentages(
                                tokenAddress as string
                              );
                              await loadRewardDurations(tokenAddress as string);
                            } else {
                              displayToast(
                                "failure",
                                "Failed to set percentages and durations"
                              );
                            }
                          } catch (error) {
                            const typedError = error as Error;
                            displayToast("failure", typedError.name);
                          } finally {
                            setLoadingReward(false);
                          }
                        }}
                        className="my-4 rounded-md disabled:cursor-not-allowed disabled:bg-theme-1/50 bg-theme-1 text-white p-2 px-4 "
                        disabled={loadingReward}
                      >
                        {loadingReward ? (
                          <div className="flex items-center">
                            <ClipLoader color="#fff" loading={true} size={30} />
                            <p className="ml-2">Updating</p>
                          </div>
                        ) : (
                          <div className="flex w-full items-center">
                            <p className="w-full">
                              Update Percentages and durations
                            </p>
                          </div>
                        )}
                      </button>
                    </div>
                    {/*-------------------------- End of Set Reward Percentages and durations-------------------------- */}

                    {/* ------------------Set minimum amount-------------------------- */}
                    <div className="flex items-center py-5 ">
                      <div className="w-[500px]">
                        <div>
                          <InputLabel title="Enter the minimum amount" />
                          <Input
                            onChange={(event) => {
                              const { value } = event.target;
                              setMinAmount(value);
                            }}
                            value={minAmount}
                            type="text"
                            inputClassName="spin-button-hidden"
                          />
                          {projectMetrics &&
                            projectAttributes &&
                            Number(projectMetrics.minAmount) >= 0 && (
                              <div className="mt-2  w-full">
                                <p className="text-[13px] dark:text-gray-400">
                                  Current Minimum Amount:{" "}
                                  {inDollarFormat(
                                    Number(
                                      ethers.formatUnits(
                                        projectMetrics.minAmount.toString(),
                                        projectAttributes.decimals
                                      )
                                    )
                                  )}{" "}
                                  {projectAttributes.symbol}
                                </p>
                              </div>
                            )}
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            setIsLoadingMin(true);

                            if (Number(minAmount) <= 0) {
                              displayToast(
                                "failure",
                                "Value should be greater than 0"
                              );
                              return;
                            }

                            // Call the function here.
                            const setRequest = await prepareWriteContract({
                              address: diamondAddress as `0x${string}`,
                              abi: adminFacetAbi,
                              functionName: "setMinAmount",
                              args: [
                                tokenAddress,
                                ethers.parseUnits(
                                  minAmount,
                                  projectAttributes?.decimals
                                ),
                              ],
                            });

                            const { hash } = await writeContract(setRequest);

                            const setReceipt = await waitForTransaction({
                              hash,
                            });

                            console.log("Receipt: ", setReceipt);
                            if (setReceipt.status == "success") {
                              console.log("Success");
                              displayToast(
                                "success",
                                "Successfully set minimum amount"
                              );
                              dispatch(
                                loadProjectMetrics(tokenAddress as string)
                              );
                            } else {
                              displayToast(
                                "failure",
                                "Failed to set min amount"
                              );
                            }
                          } catch (error) {
                            const typedError = error as Error;
                            displayToast("failure", typedError.name);
                          } finally {
                            setIsLoadingMin(false);
                          }
                        }}
                        className="ml-8 my-4 rounded-md disabled:cursor-not-allowed disabled:bg-theme-1/50 bg-theme-1 text-white p-2 px-4 "
                        disabled={isLoadingMin}
                      >
                        {isLoadingMin ? (
                          <div className="flex items-center">
                            <ClipLoader color="#fff" loading={true} size={30} />
                            <p className="ml-2">Setting Minimum Amount</p>
                          </div>
                        ) : (
                          <div className="flex w-full items-center">
                            <p className="w-full">Set Minimum Amount</p>
                          </div>
                        )}
                      </button>
                    </div>
                    {/* ------------------End of Set minimum amount-------------------------- */}

                    {/* ------------------Set maximum amount-------------------------- */}
                    <div className="flex items-center py-5 ">
                      <div className="w-[500px]">
                        <div>
                          <InputLabel title="Enter the maximum amount" />
                          <Input
                            onChange={(event) => {
                              const { value } = event.target;
                              setMaxAmount(value);
                            }}
                            value={maxAmount}
                            type="text"
                            inputClassName="spin-button-hidden"
                          />
                          {projectMetrics &&
                            projectAttributes &&
                            Number(projectMetrics.maxAmount) >= 0 && (
                              <div className="mt-2  w-full">
                                <p className="text-[13px] dark:text-gray-400">
                                  Current Maximum Amount:{" "}
                                  {inDollarFormat(
                                    Number(
                                      ethers.formatUnits(
                                        projectMetrics.maxAmount.toString(),
                                        projectAttributes.decimals
                                      )
                                    )
                                  )}{" "}
                                  {projectAttributes.symbol}
                                </p>
                              </div>
                            )}
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            setIsLoadingMax(true);

                            if (Number(maxAmount) <= 0) {
                              displayToast(
                                "failure",
                                "Value should be greater than 0"
                              );
                              return;
                            }

                            // Call the function here.
                            const setRequest = await prepareWriteContract({
                              address: diamondAddress as `0x${string}`,
                              abi: adminFacetAbi,
                              functionName: "setMaxAmount",
                              args: [
                                tokenAddress,
                                ethers.parseUnits(
                                  maxAmount,
                                  projectAttributes?.decimals
                                ),
                              ],
                            });

                            const { hash } = await writeContract(setRequest);

                            const setReceipt = await waitForTransaction({
                              hash,
                            });

                            console.log("Receipt: ", setReceipt);
                            if (setReceipt.status == "success") {
                              console.log("Success");
                              displayToast(
                                "success",
                                "Successfully set maximum amount"
                              );
                              dispatch(
                                loadProjectMetrics(tokenAddress as string)
                              );
                            } else {
                              displayToast(
                                "failure",
                                "Failed to set maximum amount"
                              );
                            }
                          } catch (error) {
                            const typedError = error as Error;
                            displayToast("failure", typedError.name);
                          } finally {
                            setIsLoadingMax(false);
                          }
                        }}
                        className="ml-8 my-4 rounded-md disabled:cursor-not-allowed disabled:bg-theme-1/50 bg-theme-1 text-white p-2 px-4 "
                        disabled={isLoadingMax}
                      >
                        {isLoadingMax ? (
                          <div className="flex items-center">
                            <ClipLoader color="#fff" loading={true} size={30} />
                            <p className="ml-2">Setting Maximum Amount</p>
                          </div>
                        ) : (
                          <div className="flex w-full items-center">
                            <p className="w-full">Set Maximum Amount</p>
                          </div>
                        )}
                      </button>
                    </div>
                    {/* ------------------End of Set maximum amount-------------------------- */}

                    {/* ------------------Set Insurance Percentage-------------------------- */}
                    <div className="flex items-center py-5 ">
                      <div className="w-[500px]">
                        <div>
                          <InputLabel title="Enter the insurance percentage" />
                          <Input
                            onChange={(event) => {
                              const { value } = event.target;
                              setInsurancePercentage(value);
                            }}
                            value={insurancePercentage}
                            type="text"
                            inputClassName="spin-button-hidden"
                          />
                          {projectMetrics &&
                            Number(projectMetrics.insuranceFeePercentage) >=
                              0 && (
                              <div className="mt-2  w-full">
                                <p className="text-[13px] dark:text-gray-400">
                                  Current Insurance Percentage:{" "}
                                  {Number(
                                    projectMetrics.insuranceFeePercentage
                                  ) / 100}
                                  %
                                </p>
                              </div>
                            )}
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            setIsLoadingInsurancePercentage(true);

                            // Call the function here.
                            const setRequest = await prepareWriteContract({
                              address: diamondAddress as `0x${string}`,
                              abi: adminFacetAbi,
                              functionName: "setInsurancePercentage",
                              args: [
                                tokenAddress,
                                Number(insurancePercentage) * 100,
                              ],
                            });

                            const { hash } = await writeContract(setRequest);

                            const setReceipt = await waitForTransaction({
                              hash,
                            });

                            console.log("Receipt: ", setReceipt);
                            if (setReceipt.status == "success") {
                              console.log("Success");
                              displayToast(
                                "success",
                                "Successfully set insurance percentage"
                              );
                              await loadProjectMetrics(tokenAddress as string);
                            } else {
                              displayToast(
                                "failure",
                                "Failed to set insurance percentage"
                              );
                            }
                          } catch (error) {
                            const typedError = error as Error;
                            displayToast("failure", typedError.name);
                          } finally {
                            setIsLoadingInsurancePercentage(false);
                          }
                        }}
                        className="ml-8 my-4 rounded-md disabled:cursor-not-allowed disabled:bg-theme-1/50 bg-theme-1 text-white p-2 px-4 "
                        disabled={isLoadingInsurancePercentage}
                      >
                        {isLoadingInsurancePercentage ? (
                          <div className="flex items-center">
                            <ClipLoader color="#fff" loading={true} size={30} />
                            <p className="ml-2">Setting Insurance Percentage</p>
                          </div>
                        ) : (
                          <div className="flex w-full items-center">
                            <p className="w-full">Set Insurance Percentage</p>
                          </div>
                        )}
                      </button>
                    </div>
                    {/* ------------------End of Set Insurance Percentage-------------------------- */}

                    {/* ------------------Set Liquidity Percentage-------------------------- */}
                    <div className="flex items-center py-5 ">
                      <div className="w-[500px]">
                        <div>
                          <InputLabel title="Enter the liquidity percentage" />
                          <Input
                            onChange={(event) => {
                              const { value } = event.target;
                              setLiquidityPercentage(value);
                            }}
                            value={liquidityPercentage}
                            type="text"
                            inputClassName="spin-button-hidden"
                          />
                          {projectMetrics &&
                            Number(projectMetrics.liquidityPercentage) >= 0 && (
                              <div className="mt-2  w-full">
                                <p className="text-[13px] dark:text-gray-400">
                                  Current liquidity Percentage:{" "}
                                  {Number(projectMetrics.liquidityPercentage) /
                                    100}
                                  %
                                </p>
                              </div>
                            )}
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            setIsLoadingLiquidityPercentage(true);

                            // Call the function here.
                            const setRequest = await prepareWriteContract({
                              address: diamondAddress as `0x${string}`,
                              abi: adminFacetAbi,
                              functionName: "setLiquidityPercentage",
                              args: [
                                tokenAddress,
                                Number(liquidityPercentage) * 100,
                              ],
                            });

                            const { hash } = await writeContract(setRequest);

                            const setReceipt = await waitForTransaction({
                              hash,
                            });

                            console.log("Receipt: ", setReceipt);
                            if (setReceipt.status == "success") {
                              console.log("Success");
                              displayToast(
                                "success",
                                "Successfully set liquidity percentage"
                              );
                              dispatch(
                                loadProjectMetrics(tokenAddress as string)
                              );
                            } else {
                              displayToast(
                                "failure",
                                "Failed to set liquidity percentage"
                              );
                            }
                          } catch (error) {
                            const typedError = error as Error;
                            displayToast("failure", typedError.name);
                          } finally {
                            setIsLoadingLiquidityPercentage(false);
                          }
                        }}
                        className="ml-8 my-4 rounded-md disabled:cursor-not-allowed disabled:bg-theme-1/50 bg-theme-1 text-white p-2 px-4 "
                        disabled={isLoadingLiquidityPercentage}
                      >
                        {isLoadingLiquidityPercentage ? (
                          <div className="flex items-center">
                            <ClipLoader color="#fff" loading={true} size={30} />
                            <p className="ml-2">Setting Liquidity Percentage</p>
                          </div>
                        ) : (
                          <div className="flex w-full items-center">
                            <p className="w-full">Set Liquidity Percentage</p>
                          </div>
                        )}
                      </button>
                    </div>
                    {/* ------------------End of Set Liquidity Percentage-------------------------- */}

                    {/* ------------------Set Penalty Percentage-------------------------- */}
                    <div className="flex items-center py-5 ">
                      <div className="w-[500px]">
                        <div>
                          <InputLabel title="Enter the penalty percentage" />
                          <Input
                            onChange={(event) => {
                              const { value } = event.target;
                              setPenaltyPercentage(value);
                            }}
                            value={penaltyPercentage}
                            type="text"
                            inputClassName="spin-button-hidden"
                          />
                          {projectMetrics &&
                            Number(projectMetrics.penaltyPercentage) >= 0 && (
                              <div className="mt-2  w-full">
                                <p className="text-[13px] dark:text-gray-400">
                                  Current penalty Percentage:{" "}
                                  {Number(projectMetrics.penaltyPercentage) /
                                    100}
                                  %
                                </p>
                              </div>
                            )}
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            setIsLoadingPenaltyPercentage(true);

                            // Call the function here.
                            const setRequest = await prepareWriteContract({
                              address: diamondAddress as `0x${string}`,
                              abi: adminFacetAbi,
                              functionName: "setPenaltyPercentage",
                              args: [
                                tokenAddress,
                                Number(penaltyPercentage) * 100,
                              ],
                            });

                            const { hash } = await writeContract(setRequest);

                            const setReceipt = await waitForTransaction({
                              hash,
                            });

                            console.log("Receipt: ", setReceipt);
                            if (setReceipt.status == "success") {
                              console.log("Success");
                              displayToast(
                                "success",
                                "Successfully set penalty percentage"
                              );
                              dispatch(
                                loadProjectMetrics(tokenAddress as string)
                              );
                            } else {
                              displayToast(
                                "failure",
                                "Failed to set penalty percentage"
                              );
                            }
                          } catch (error) {
                            const typedError = error as Error;
                            displayToast("failure", typedError.name);
                          } finally {
                            setIsLoadingPenaltyPercentage(false);
                          }
                        }}
                        className="ml-8 my-4 rounded-md disabled:cursor-not-allowed disabled:bg-theme-1/50 bg-theme-1 text-white p-2 px-4 "
                        disabled={isLoadingPenaltyPercentage}
                      >
                        {isLoadingPenaltyPercentage ? (
                          <div className="flex items-center">
                            <ClipLoader color="#fff" loading={true} size={30} />
                            <p className="ml-2">Setting Penalty Percentage</p>
                          </div>
                        ) : (
                          <div className="flex w-full items-center">
                            <p className="w-full">Set Penalty Percentage</p>
                          </div>
                        )}
                      </button>
                    </div>
                    {/* ------------------End of Set Penalty Percentage-------------------------- */}

                    {/* ------------------Set Pause state-------------------------- */}
                    <div className="flex items-center py-5">
                      <div className="w-[500px]">
                        <div>
                          <InputLabel title="Enter pause state (true or false)" />
                          <Input
                            onChange={(event) => {
                              const { value } = event.target;
                              const valueInBool =
                                value == "true" ? true : false;

                              setPause(valueInBool);
                            }}
                            type="text"
                            placeholder="Enter true or false"
                            inputClassName="spin-button-hidden"
                          />
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            setIsLoadingPause(true);

                            let pauseState = pause ? 0 : 1;

                            console.log("Pause state: ", pauseState);

                            // Call the function here.
                            const setRequest = await prepareWriteContract({
                              address: diamondAddress as `0x${string}`,
                              abi: adminFacetAbi,
                              functionName: "setPause",
                              args: [tokenAddress, pauseState],
                            });

                            const { hash } = await writeContract(setRequest);

                            const setReceipt = await waitForTransaction({
                              hash,
                            });

                            console.log("Receipt: ", setReceipt);
                            if (setReceipt.status == "success") {
                              console.log("Success");
                              displayToast(
                                "success",
                                "Successfully change pause state"
                              );
                            } else {
                              displayToast("failure", "Failed to change state");
                            }
                          } catch (error) {
                            const typedError = error as Error;
                            console.log("Error::::::", typedError);
                            displayToast("failure", typedError.name);
                          } finally {
                            setIsLoadingPause(false);
                          }
                        }}
                        className="ml-8 my-4 rounded-md disabled:cursor-not-allowed disabled:bg-theme-1/50 bg-theme-1 text-white p-2 px-4 "
                        disabled={isLoadingPause}
                      >
                        {isLoadingPause ? (
                          <div className="flex items-center">
                            <ClipLoader color="#fff" loading={true} size={30} />
                            <p className="ml-2">Updating Pause State</p>
                          </div>
                        ) : (
                          <div className="flex w-full items-center">
                            <p className="w-full">Set Pause</p>
                          </div>
                        )}
                      </button>
                    </div>
                    {/* ------------------End of set pause -------------------------- */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="flex w-full items-center justify-center ">
          Project not present
        </div>
      )}
    </div>
  );
}

export default Main;
