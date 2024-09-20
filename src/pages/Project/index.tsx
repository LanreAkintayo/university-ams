import { Listbox, Transition } from "@headlessui/react";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { ClipLoader, GridLoader } from "react-spinners";
import flexStake from "@/assets/images/flexstake.svg";
import clsx from "clsx";
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
  multicall,
} from "@wagmi/core";

import { ethers } from "ethers";
import { Link, useParams } from "react-router-dom";
import { ChevronDown, Globe, MoveRight } from "lucide-react";
import { useSelector } from "react-redux";
import ConnectButton from "../../components/ConnectButton";
import Input from "../../components/Input";
import InputLabel from "../../components/InputLabel";
import { displayToast } from "../../components/Toast";
import {
  diamondAddress,
  usdtAddress,
  createFacetAbi,
  SUPPORTED_CHAIN_ID,
  chainIdToAddress,
} from "../../contracts";
import router from "../../router";
import {
  loadAllInvestors,
  loadProjectMetrics,
  loadRewardDurations,
  loadRewardPercentages,
  loadTokenToUsdPath,
  loadProjectPlatformAddresses,
  loadInvestorInvestments,
  loadInvestorTotalInvested,
  loadProjectInfo,
} from "../../stores/insuranceSlice";
import { RootState } from "../../stores/store";
import { loadBalance } from "../../stores/walletSlice";
import {
  convertTokenToUsd,
  fromWei,
  getTimeUnitAndValue,
  inDollarFormat,
  percent,
  toWei,
} from "../../utils/helper";
import Button from "../Button";
import { useAppDispatch } from "../../stores/hooks";
import { Duration } from "../../types/general";
import { motion } from "framer-motion";
import FlexvisReward from "../../components/FlexvisReward";
import AccountDetails from "../../components/AccountDetails";

function Main() {
  // Hooks
  const { slug: tokenAddress } = useParams();

  const { signerAddress, balance, chainId } = useSelector(
    (state: RootState) => state.wallet
  );
  const dispatch = useAppDispatch();

  const {
    allProjects,
    projectInfo,
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

  let [tokenDetails, setTokenDetails] = useState({
    name: "",
    symbol: "",
    decimals: 0,
  });
  let [signerDetails, setSignerDetails] = useState({
    tokenBalance: BigInt(0),
    stableTokenBalance: BigInt(0),
  });

  // console.log("Project Metrics: ", projectMetrics);
  // console.log("All Investors: ", allInvestors)
  // console.log("Project info: ", projectInfo);

  console.log("Reward durations", rewardDurations)
  console.log("Reward percentages", rewardPercentages)

  // useEffect
  useEffect(() => {
    const updateTokenDetails = async () => {
      if (tokenAddress) {
        const data = await multicall({
          chainId: SUPPORTED_CHAIN_ID,
          contracts: [
            {
              address: tokenAddress as `0x${string}`,
              abi: erc20ABI,
              functionName: "name",
            },
            {
              address: tokenAddress as `0x${string}`,
              abi: erc20ABI,
              functionName: "symbol",
            },
            {
              address: tokenAddress as `0x${string}`,
              abi: erc20ABI,
              functionName: "decimals",
            },
          ],
        });

        console.log("Data inside project: ", data);

        setTokenDetails({
          name: data[0].result || "",
          symbol: data[1].result || "",
          decimals: data[2].result || 0,
        });
      }
    };

    const getInvestorInvestments = async () => {
      if (tokenAddress) {
        dispatch(loadAllInvestors(tokenAddress as string));
        dispatch(loadProjectMetrics(tokenAddress as string));
        dispatch(loadRewardDurations(tokenAddress as string));
        dispatch(loadRewardPercentages(tokenAddress as string));
        dispatch(loadTokenToUsdPath(tokenAddress as string));
        dispatch(loadProjectPlatformAddresses(tokenAddress as string));
        dispatch(loadProjectInfo(tokenAddress as string));
      }
    };

    updateTokenDetails();
    getInvestorInvestments();
  }, [tokenAddress]);

  // useEffect
  useEffect(() => {
    const getSignerDetails = async () => {
      if (tokenAddress && signerAddress) {
        // Signer USDT Balance

        const data = await multicall({
          chainId: SUPPORTED_CHAIN_ID,
          contracts: [
            {
              address: tokenAddress as `0x${string}`,
              abi: erc20ABI,
              functionName: "balanceOf",
              args: [signerAddress as `0x${string}`],
            },
            {
              address: chainIdToAddress[SUPPORTED_CHAIN_ID]
                .usdtAddress as `0x${string}`,
              abi: erc20ABI,
              functionName: "balanceOf",
              args: [signerAddress as `0x${string}`],
            },
          ],
        });

        setSignerDetails({
          tokenBalance: data[0].result || BigInt(0),
          stableTokenBalance: data[1].result || BigInt(0),
        });
      }
    };
    const getInvestorInvestments = async () => {
      if (signerAddress && tokenAddress) {
        console.log("Signer address:::::: ", signerAddress);
        dispatch(
          loadInvestorInvestments({
            projectId: tokenAddress,
            investorAddress: signerAddress,
          })
        );
        dispatch(
          loadInvestorTotalInvested({
            projectId: tokenAddress,
            investorAddress: signerAddress,
          })
        );
      }
    };

    getSignerDetails();
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
              name: `${value} ${timeUnit}`,
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

  const handleInvestmentChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    setTokenAmount(value);
  };

  const isValidTokenAmount = (tokenAmount: any) => {
    try {
      return (
        Number(toWei(tokenAmount)) >= Number(toWei(4000)) &&
        Number(toWei(tokenAmount)) <= Number(toWei(40000))
      );
    } catch (error) {
      return false;
    }
  };

  const totalAmount = () => {
    if (tokenAmount) {
      const amount = BigInt(toWei(tokenAmount));
      const insuredAmount = percent(BigInt(1000), amount);

      const total = inDollarFormat(Number(fromWei(amount + insuredAmount)));

      return total;
    } else {
      return "0";
    }
  };

  const isProjectPresent = () => {
    // console.log('Token address: ', tokenAddress);
    // console.log('All Projects: ', allProjects);
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

  function CreateInsuredButton({}: {}) {
    return (
      <div className="mt-2 flex items-center gap-3 xs:mt-2 xs:inline-flex md:mt-2 hover:scale-105">
        <button
          className="disable:opacity-50 flex-1 disabled:cursor-not-allowed disabled:bg-theme-1/50 text-md  xs:flex-auto bg-theme-1/80 rounded-md text-white py-2 px-4"
          disabled={isCreating}
          onClick={async () => {
            try {
              setIsCreating(true);
              const parsedTokenAmount = ethers.parseUnits(tokenAmount, 18);

              // Approve USDT
              let isApproved1 = await approveToken(usdtAddress, insuranceFee);
              if (!isApproved1) {
                setIsCreating(false);
                return;
              }
              // Approve Token
              let isApproved2 = await approveToken(
                tokenAddress as string,
                parsedTokenAmount
              );
              if (!isApproved2) {
                setIsCreating(false);

                return;
              }

              // Create the investment
              const createRequest = await prepareWriteContract({
                address: diamondAddress as `0x${string}`,
                abi: createFacetAbi,
                functionName: "createInsuredInvestment",
                args: [
                  tokenAddress,
                  parsedTokenAmount,
                  investperiodInsured?.value,
                  insuranceFee,
                ],
              });

              const { hash } = await writeContract(createRequest);

              const createReceipt = await waitForTransaction({
                hash,
              });

              console.log("Receipt: ", createReceipt);
              if (createReceipt.status == "success") {
                console.log("Success");
                displayToast("success", "Investment has been created");
                await loadInvestorInvestments({
                  projectId: tokenAddress as string,
                  investorAddress: signerAddress,
                });
                await loadBalance(signerAddress as `0x${string}`);
              } else {
                console.log("Failure");
                console.log("Failed to create investment");
                displayToast("success", "Failed to create investment");
              }

              setIsCreating(false);
              setCreateText(`Create Investment`);
            } catch (error) {
              console.log("Errorrrrr: ", error);

              displayToast("failure", "Failed to create Investment");
              setIsCreating(false);
              setCreateText(`Create Investment`);
            }
          }}
        >
          {isCreating ? (
            <div className="flex w-full items-center justify-center space-x-4">
              <ClipLoader color="#fff" loading={true} size={30} />
              <p className="ml-2">{createText}</p>
            </div>
          ) : (
            <div className="flex w-full items-center">
              <p className="w-full">{createText}</p>
            </div>
          )}
        </button>
      </div>
    );
  }

  function pageSetForDisplay() {
    // Start with a loader
    // Stop the loader
  }

  console.log("Token details: ", tokenDetails);

  return (
    <div className="">
      {isProjectPresent() ? (
        <div>
          <div className="relative p-6 ">
            <div className="item-center flex justify-center "></div>
            <div className="flex flex-col justify-between gap-x-[38px] xl:flex-row">
              <div className="flex flex-col gap-y-6 pb-[22px] xl:w-8/12">
                {/* {projectMetrics && (
                  <div>
                    <p>
                      Total Invested:{" "}
                      {ethers.formatUnits(projectMetrics.totalInvested, 18)} {}
                    </p>
                    <p>
                      USDT Locked:{" "}
                      {ethers.formatUnits(
                        projectMetrics.stableReserveBalance,
                        18
                      )}{" "}
                      {}
                    </p>
                    <p>
                      Token Locked:{" "}
                      {ethers.formatUnits(
                        projectMetrics.investmentReserveBalance,
                        18
                      )}{" "}
                      {}
                    </p>
                    <p>
                      Total number of investors: {allInvestors?.length} {}
                    </p>
                  </div>
                )} */}
                <div className="text-xl border-neutral dark:border-dark-neutral-border rounded-2xl border bg-gray-100 px-[30px] pb-[20px] dark:bg-gray-900 md:mx-auto md:w-[60%] xl:mx-0 xl:w-full">
                  <div>
                    <h1 className="item-center flex  font-bold border-b border-gray-300 py-4 text-4xl">
                      Project Details
                    </h1>
                    <div>
                      <div className="flex items-center space-x-4 mt-8 mb-6">
                        <img
                          alt={tokenDetails.name}
                          src={projectInfo?.logo}
                          width={60}
                          height={60}
                          className="mb-3 rounded-full"
                        />
                        <p className="text-4xl text-theme-1/80 font-semibold">
                          {tokenDetails.name} ({tokenDetails.symbol})
                        </p>
                      </div>
                      <p className="leading-10">
                        {tokenDetails.name} is a cutting-edge cryptocurrency
                        designed to provide users with a secure, decentralized,
                        and efficient means of conducting transactions within
                        the blockchain ecosystem. Leveraging advanced blockchain
                        technology, {tokenDetails.name} aims to offer a range of
                        features that empower users while maintaining a focus on
                        transparency and decentralization
                      </p>
                      <div className="flex items-center mt-8 mb-6 space-x-4">
                        <p className="text-3xl font-medium">Socials</p>
                        <div className="flex items-center justify-center">
                          <div className="inline-flex items-center justify-center space-x-4">
                            <div className="">
                              <a
                                href={projectInfo?.telegramHandle}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={`/telegram.svg`}
                                  alt="Telegram Logo"
                                  className="h-8 w-8" // Adjust the height and width as needed
                                />
                              </a>
                            </div>
                            <div className="">
                              <a
                                href={projectInfo?.twitterHandle}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={`/x.svg`}
                                  alt="X Logo"
                                  className="h-8 w-8" // Adjust the height and width as needed
                                />
                              </a>
                            </div>
                            <div className="">
                              <a
                                href={projectInfo?.discordHandle}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={`/discord.svg`}
                                  alt="Discord Logo"
                                  className="h-8 w-8" // Adjust the height and width as needed
                                />
                              </a>
                            </div>
                            <div className="">
                              <a
                                href="https://example.com"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Globe />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-300 mt-16">
                    <h1 className="item-center flex  font-bold  py-4 text-4xl">
                      Key Metrics
                    </h1>
                    {projectMetrics && (
                      <div className="grid grid-cols-2 gap-y-5 gap-x-12 pt-8">
                        <div className="flex justify-between">
                          <p className="text-[18px]">
                            Total {tokenDetails.symbol} Invested
                          </p>
                          <p className="font-medium">
                            {inDollarFormat(
                              Number(
                                ethers.formatUnits(
                                  projectMetrics.totalInvested,
                                  18
                                )
                              )
                            )}{" "}
                            {} {tokenDetails.symbol}
                          </p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-[18px]">Total USDT Locked</p>
                          <p className="font-medium">
                            {inDollarFormat(
                              Number(
                                ethers.formatUnits(
                                  projectMetrics.stableReserveBalance,
                                  18
                                )
                              )
                            )}{" "}
                            USDT
                          </p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-[18px]">
                            Total {tokenDetails.symbol} Locked
                          </p>
                          <p className="font-medium">
                            {inDollarFormat(
                              Number(
                                ethers.formatUnits(
                                  projectMetrics.investmentReserveBalance,
                                  18
                                )
                              )
                            )}{" "}
                            {tokenDetails.symbol}
                          </p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-[18px]">Investors</p>
                          <p className="font-medium">{allInvestors?.length} </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-gray-300 mt-16">
                    <h1 className="item-center flex  font-bold  py-4 text-4xl">
                      {tokenDetails.name} Investment Plans
                    </h1>
                    <p className="leading-10">
                      {tokenDetails.name} provides an enticing investment
                      opportunity where users can invest a specified amount of
                      money for a predetermined duration, receiving both their
                      principal and accrued interest within the designated
                      timeframe. The magnitude of the reward increases
                      proportionally with the length of the investment period.
                    </p>
                    <p className="pt-4">
                      You won't incur losses regardless of the market
                      conditions.
                    </p>
                    <div className="pt-4 underline underline-offset-1 cursor-pointer text-theme-1 hover:text-theme-2">
                      Click to know more on how your investment is insured
                    </div>
                    <div className="pt-8">
                      <table className="min-w-full bg-white border border-gray-300 shadow-lg">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="py-3 px-4 border-b text-left">
                              Duration
                            </th>
                            <th className="py-3 px-4 border-b text-left">
                              Reward
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {durationOptions &&
                            durationOptions.map((durationOption, id) => {
                              return (
                                <tr className="hover:bg-gray-50" key={id}>
                                  <td className="py-3 px-4 border-b">
                                    {durationOption.name}
                                  </td>
                                  <td className="py-3 px-4 border-b">
                                    {durationOption.percentage}%
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div ref={titleRef} className="xl:w-4/12 ">
                <motion.div
                  layout
                  initial={{ borderRadius: 20 }}
                  className={clsx(
                    "text-xl border-neutral dark:border-dark-neutral-border rounded-2xl border bg-gray-100 px-[30px] pb-[20px] dark:bg-gray-900 md:mx-auto md:w-[60%] xl:mx-0 xl:w-full"
                  )}
                >
                  <div>
                    <div>
                      <h1 className="item-center flex  font-bold border-b border-gray-300 py-4 text-3xl">
                        Account Details
                      </h1>

                      {/* <p className="py-4 text-base">
                        Make sure that your wallet is connected
                      </p> */}
                    </div>
                  </div>
                  <div>
                    <AccountDetails
                      tokenDetails={tokenDetails}
                      signerDetails={signerDetails}
                    />
                  </div>
                </motion.div>

                <motion.div
                  layout
                  initial={{ borderRadius: 20 }}
                  className={clsx(
                    "text-xl mt-6 border-neutral bg-gray-100 dark:border-dark-neutral-border rounded-2xl border px-[30px] pb-[20px] dark:bg-gray-900 md:mx-auto md:w-[60%] xl:mx-0 xl:w-full"
                  )}
                >
                  <div className="border-b border-gray-300">
                    <h1 className="item-center flex  font-bold  py-4 text-3xl">
                      Create an Investment
                    </h1>
                    <p className="text-sm text-center border border-theme-1/40 bg-theme-1/10 text-theme-1 rounded-md p-2">
                      Investing for longer period earns you more reward
                    </p>
                  </div>

                  <div className="pt-4">
                    <div className="mb-4 ">
                      <InputLabel
                        title="Amount"
                        className="text-base font-medium"
                      />
                      <Input
                        min={0.0}
                        onChange={handleInvestmentChange}
                        type="number"
                        placeholder="0"
                        inputClassName="text-base"
                      />
                      {/* {!isValidTokenAmount(tokenAmount) && (
                        <div>
                          <p className="py-1 text-[11px] text-red-500 ">
                            Investment amount should be within 4,000 FLX and
                            40,000 FLX
                          </p>
                        </div>
                      )} */}
                    </div>

                    {/* Investment Period */}
                    <div className="mb-2">
                      <InputLabel
                        title="Investment Period"
                        className="font-medium"
                      />
                      <div className="relative">
                        {/* Investment Period for Creating Insured Investments */}

                        {!isClicked && (
                          <Listbox
                            value={investperiodInsured}
                            onChange={setInvestPeriodInsured}
                          >
                            <Listbox.Button className="text-case-inherit text-base letter-space-inherit flex h-10 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 font-medium text-gray-900 outline-none transition-shadow duration-200 hover:border-gray-900 hover:ring-1 hover:ring-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-gray-600 dark:hover:ring-gray-600 sm:h-12 sm:px-5">
                              <div className="flex items-center">
                                {investperiodInsured?.name}
                              </div>
                              <ChevronDown />
                            </Listbox.Button>
                            <Transition
                              leave="transition ease-in duration-100"
                              leaveFrom="opacity-100"
                              leaveTo="opacity-0"
                            >
                              <Listbox.Options className="absolute left-0 z-10 mt-1 grid w-full origin-top-right gap-0.5 rounded-lg border border-gray-200 bg-white p-1 shadow-large outline-none dark:border-gray-700 dark:bg-gray-800 xs:p-2">
                                {durationOptions &&
                                  durationOptions.map((option) => (
                                    <Listbox.Option
                                      key={option.id}
                                      value={option}
                                    >
                                      {({ selected }) => (
                                        <div
                                          className={`flex cursor-pointer items-center rounded-md px-3 py-2 text-base text-gray-900 transition dark:text-gray-100  ${
                                            selected
                                              ? "bg-gray-200/70 font-medium dark:bg-gray-600/60"
                                              : "hover:bg-gray-100 dark:hover:bg-gray-700/70"
                                          }`}
                                        >
                                          <span className="ltr:mr-2 rtl:ml-2"></span>
                                          {option.name}
                                        </div>
                                      )}
                                    </Listbox.Option>
                                  ))}
                              </Listbox.Options>
                            </Transition>
                          </Listbox>
                        )}
                      </div>
                    </div>

                    {/* Modify this and handle calculations */}

                    {!isClicked && (
                      // <p className="mt-4 mb-4 animate-pulse text-center text-slate-800 dark:text-white">
                      //   Token Amount: {} <br />
                      //   <span className="font-semibold text-dark dark:text-white">
                      //     = {totalAmount()} FLEXVIS
                      //   </span>
                      // </p>
                      <div className="w-full py-4 text-base">
                        <h1 className="font-medium py-2">
                          {tokenDetails.symbol} to USDT Conversion
                        </h1>

                        <p>
                          {tokenAmount || 0} {tokenDetails.symbol} ={" "}
                          {inDollarFormat(
                            Number(
                              ethers.formatUnits(
                                tokenAmountInUsd.toString(),
                                18n
                              )
                            )
                          )}{" "}
                          USDT
                        </p>
                        {projectMetrics && (
                          <p className="py-3">
                            <span className="font-medium py-2 block">
                              Insurance Fee
                            </span>
                            {(
                              BigInt(projectMetrics.insuranceFeePercentage) /
                              100n
                            ).toString()}
                            % of{" "}
                            {inDollarFormat(
                              Number(
                                ethers.formatUnits(
                                  tokenAmountInUsd.toString(),
                                  18n
                                )
                              )
                            )}{" "}
                            USDT{" = "}
                            {inDollarFormat(
                              Number(
                                ethers.formatUnits(insuranceFee.toString(), 18n)
                              )
                            )}{" "}
                            USDT
                          </p>
                        )}
                        <p className="pt-4 text-sm">
                          NB: Minimum of{" "}
                          {inDollarFormat(
                            Number(
                              ethers.formatUnits(insuranceFee.toString(), 18n)
                            )
                          )}{" "}
                          USDT is required to be in your wallet to be able to
                          create an investment
                        </p>
                      </div>
                    )}
                  </div>

                  {!isClicked && signerAddress ? (
                    <CreateInsuredButton />
                  ) : (
                    <ConnectButton />
                  )}

                  {investorInvestments && (
                    <div className="flex items-center justify-center pt-4">
                      <Link
                        to={`/investments/${tokenAddress}`}
                        className="text-md  rounded-md cursor-pointer w-full"
                      >
                        <div className="flex space-x-3 justify-center items-center border border-theme-1/40 bg-theme-1/10 text-theme-1 rounded-md p-3 px-4 hover:scale-105">
                          <p className="text-base text-center ">
                            View your Investments
                          </p>
                          <MoveRight />
                        </div>
                      </Link>

                      {/* <CardSection investorInvestments={investorInvestments} /> */}
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
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
