import { useSelector } from "react-redux";
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
  getProjectInfo,
  getProjectMetrics,
  getTokenToUsdPath,
  getRewardPercentages,
  getRewardDurations,
  getProjectPlatformAddresses,
} from "../../stores/insuranceSlice";
import { RootState } from "../../stores/store";
import { useEffect, useState } from "react";
import { useAppDispatch } from "../../stores/hooks";

import {
  getAccount,
  getNetwork,
  switchNetwork,
  readContract,
  getContract,
  fetchBalance,
  prepareWriteContract,
  erc20ABI,
  writeContract,
  waitForTransaction,
} from "@wagmi/core";
import { SUPPORTED_CHAIN_ID } from "../../contracts";
import PendingProjectRow from "../PendingProjectRow";

export interface IRobustPending {
  totalInvested: bigint;
  totalAccumulatedReward: bigint;
  totalAccumulatedStables: bigint;
  totalRewardIssuedOut: bigint;
  liquidityPercentage: bigint;
  insuranceFeePercentage: bigint;
  penaltyPercentage: bigint;
  minAmount: bigint;
  maxAmount: bigint;
  name: string;
  symbol: string;
  decimals: number;
  investmentReserveBalance: bigint;
  stableReserveBalance: bigint;
  creator: string;
  treasury: string;
  router: string;
  tokenAddress: string;
  stableTokenAddress: string;
  wbnb: string;
  status: string;
  logo: string;
  discordHandle: string;
  twitterHandle: string;
  telegramHandle: string;
  message: string;
  rewardPercentages: bigint[];
  rewardDurations: bigint[];
  tokenToUsdPath: string[];
}

export default function PendingProjects() {
  const { pendingProjects } = useSelector(
    (state: RootState) => state.insurance
  );

  console.log("Pending projects: ", pendingProjects);
  const dispatch = useAppDispatch();

  let [robustProjects, setRobustProjects] = useState<
    IRobustPending[] | undefined
  >();

  useEffect(() => {
    const getRobustProject = async () => {
      if (pendingProjects) {
        const robustProjects = pendingProjects.map(async (projectId) => {
          const platformAddresses = await getProjectPlatformAddresses(
            projectId
          );

          const projectInfo = await getProjectInfo(projectId);
          const projectMetrics = await getProjectMetrics(projectId);
          const rewardPercentages = await getRewardPercentages(projectId);
          const rewardDurations = await getRewardDurations(projectId);
          const tokenToUsdPath = await getTokenToUsdPath(projectId);
          const { name, symbol, decimals } =
            projectId == "0x1234567890123456789012345678901234567890"
              ? { name: "Test Token", symbol: "Test", decimals: "18" }
              : await getTokenAttributes(projectId);
          console.log("We are here inside pending projects");

          console.log("Project info: ", projectInfo);
          console.log("Project metrics: ", projectMetrics);
          console.log("Platform Addresses: ", platformAddresses);

          return  {
            ...platformAddresses,
            ...projectInfo,
            ...projectMetrics,
            name,
            symbol,
            decimals,
            rewardPercentages,
            rewardDurations,
            tokenToUsdPath,
          };

        });

        const resolved = (await Promise.all(
          robustProjects
        )) as IRobustPending[];

        setRobustProjects(resolved);
      }
    };

    getRobustProject();
  }, [pendingProjects]);

  const getTokenAttributes = async (tokenAddress: string) => {
    const name = (await readContract({
      address: tokenAddress as `0x${string}`,
      abi: erc20ABI,
      functionName: "name",
      chainId: SUPPORTED_CHAIN_ID,
    })) as string;
    const symbol = (await readContract({
      address: tokenAddress as `0x${string}`,
      abi: erc20ABI,
      functionName: "symbol",
      chainId: SUPPORTED_CHAIN_ID,
    })) as string;
    const decimals = (await readContract({
      address: tokenAddress as `0x${string}`,
      abi: erc20ABI,
      functionName: "decimals",
      chainId: SUPPORTED_CHAIN_ID,
    })) as number;

    return { name, symbol, decimals };
  };


  console.log("RObust project:: ", robustProjects)

  return (
    <div className="mt-2 mb-8">
      {!pendingProjects ? (
        <div>Loading Pending Projects</div>
      ) : (
        <div className="">
          <h1 className="mb-3">ALL PENDING PROJECTS</h1>
          <table className="divide-y divide-slate-300">
            <thead>
              <tr>
                <th className=" py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Project ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Project Creator
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 ">
              {robustProjects && robustProjects.length > 0 ? (
                robustProjects.map((pendingProject, id) => {
                  return (
                    <PendingProjectRow
                      key={id}
                      pendingProject={pendingProject}
                    />
                  );
                })
              ) : (
                <td colSpan={4} className="py-3">
                  No pending Projects
                </td>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
