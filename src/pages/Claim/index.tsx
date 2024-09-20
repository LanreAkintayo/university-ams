import { useContext, useState, useRef, useEffect, ChangeEvent } from "react";
import { Web3Button, Web3NetworkSwitch } from "@web3modal/react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import { ClipLoader, GridLoader } from "react-spinners";
import { erc20ABI, useAccount, useDisconnect } from "wagmi";
import { useParams } from "react-router-dom";

import {
  readContract,
  prepareWriteContract,
  writeContract,
  waitForTransaction,
} from "@wagmi/core";

import { useSelector } from "react-redux";
import { RootState } from "../../stores/store";
import {
  loadProjectInfo,
  loadProjectMetrics,
} from "../../stores/insuranceSlice";
import { LiquidityProvider, ProjectInfo } from "../../types/general";
import { useAppDispatch } from "../../stores/hooks";
import ConnectButton from "../../components/ConnectButton";
import InputLabel from "../../components/InputLabel";
import Input from "../../components/Input";
import { displayToast } from "../../components/Toast";
import {
  SUPPORTED_CHAIN_ID,
  adminFacetAbi,
  diamondAddress,
  getterFacetAbi,
  usdtAddress,
} from "../../contracts";
import { inDollarFormat } from "../../utils/helper";

function Main() {
  const dispatch = useAppDispatch();

  const { tokenAddress } = useParams();

  const [liquidityProviderInfo, setLiquidityProviderInfo] =
    useState<LiquidityProvider>();

  const [undistributedReward, setUndistributedReward] = useState<bigint>(0n);

  const { signerAddress, balance, chainId } = useSelector(
    (state: RootState) => state.wallet
  );

  const [stableDetails, setStableDetails] = useState({
    stableAddress: usdtAddress,
    stableBalance: 0n,
    stableSymbol: "",
    stableDecimal: 0,
    stableAmount: 0n,
  });
  const { projectMetrics } = useSelector((state: RootState) => state.insurance);
  const { isConnected } = useAccount();

  const [isClaiming, setIsClaiming] = useState(false);
  const [claimText, setClaimText] = useState("Claim");
  const [claimAmount, setClaimAmount] = useState("");

  const [isDistributing, setIsDistributing] = useState(false);
  const [distributeText, setDistributeText] = useState("Distribute Reward");

  const getLiquidityProviderData = async () => {
    dispatch(loadProjectMetrics(tokenAddress as string));
    // getLiquidityReward(address _projectId, address _liqProvider)

    const liquidityProviderInfo = (await readContract({
      address: diamondAddress as `0x${string}`,
      abi: getterFacetAbi,
      functionName: "getLiquidityProvider",
      args: [tokenAddress, signerAddress],
    })) as LiquidityProvider;

    const undistributedReward = (await readContract({
      address: diamondAddress as `0x${string}`,
      abi: getterFacetAbi,
      functionName: "getUndistributedReward",
      args: [tokenAddress, signerAddress],
    })) as bigint;

    // const totalClaimable =
    //   liquidityReward - BigInt(liquidityProviderInfo.totalClaimed);

    setLiquidityProviderInfo(liquidityProviderInfo);
    setUndistributedReward(undistributedReward);
  };

  useEffect(() => {
    if (tokenAddress && signerAddress) {
      getLiquidityProviderData();
    }
  }, [tokenAddress, signerAddress]);

  // For token amount
  useEffect(() => {
    const updateStable = async () => {
      if (signerAddress) {
        const stableBalance = (await readContract({
          address: stableDetails.stableAddress as `0x${string}`,
          abi: erc20ABI,
          functionName: "balanceOf",
          args: [signerAddress as `0x${string}`],
          chainId: SUPPORTED_CHAIN_ID,
        })) as bigint;
        const stableSymbol = (await readContract({
          address: stableDetails.stableAddress as `0x${string}`,
          abi: erc20ABI,
          functionName: "symbol",
          chainId: SUPPORTED_CHAIN_ID,
        })) as string;
        const stableDecimal = (await readContract({
          address: stableDetails.stableAddress as `0x${string}`,
          abi: erc20ABI,
          functionName: "decimals",
          chainId: SUPPORTED_CHAIN_ID,
        })) as number;

        // setStableBalance(stableBalance);
        // setStableSymbol(stableSymbol);
        // setStableDecimal(stableDecimal);

        setStableDetails((prevStableDetails) => ({
          ...prevStableDetails,
          stableBalance: stableBalance,
          stableSymbol: stableSymbol,
          stableDecimal: stableDecimal,
        }));
      }
    };

    updateStable();
  }, [signerAddress]);

  const handleClaim = async () => {
    const parsedClaimAmount = ethers.parseUnits(
      claimAmount,
      stableDetails.stableDecimal
    );

    try {
      setClaimText(`Claiming ${claimAmount} USDT`);
      setIsClaiming(true);

      // Add to Reserve
      const claimRequest = await prepareWriteContract({
        address: diamondAddress as `0x${string}`,
        abi: adminFacetAbi,
        functionName: "claimReward",
        args: [tokenAddress, parsedClaimAmount],
      });

      const { hash } = await writeContract(claimRequest);

      const claimReceipt = await waitForTransaction({
        hash,
      });

      console.log("Receipt: ", claimReceipt);
      if (claimReceipt.status == "success") {
        displayToast("success", "Claimed");

        await getLiquidityProviderData();
        console.log("Success");
      } else {
        console.log("Failure");
        console.log("Failed to Claim");
      }

      setIsClaiming(false);
      setClaimText(`Claim`);
    } catch (error) {
      console.log("Error: ", error);
      displayToast("failure", "An error occured. Try again later.");
      setIsClaiming(false);
      setClaimText(`Claim`);
    }
  };

  const handleDistribute = async () => {
    try {
      setDistributeText(`Distributing`);
      setIsDistributing(true);

      // Add to Reserve
      const distributeRequest = await prepareWriteContract({
        address: diamondAddress as `0x${string}`,
        abi: adminFacetAbi,
        functionName: "distributeReward",
        args: [tokenAddress],
      });

      const { hash } = await writeContract(distributeRequest);

      const distributeReceipt = await waitForTransaction({
        hash,
      });

      console.log("Receipt: ", distributeReceipt);
      if (distributeReceipt.status == "success") {
        displayToast("success", "Distribution successful");

        await getLiquidityProviderData();
        console.log("Success");
      } else {
        console.log("Failure");
        console.log("Failed to distribute");
      }

      setIsDistributing(false);
      setDistributeText(`Distribute Reward`);
    } catch (error) {
      console.log("Error: ", error);
      displayToast("failure", "An error occured. Try again later.");
      setIsDistributing(false);
      setDistributeText(`Distribute Reward`);
    }
  };

  //   console.log("Liquidity provider info: ", liquidityProviderInfo);
  console.log("Stable details: ", stableDetails);

  return (
    <>
      <div className="container relative mx-auto h-full ">
        <div className="flex w-full flex-col items-center justify-center gap-4">
          <h1 className="text-gray-800 text-4xl font-bold text-center">
            Claim Your Reward
          </h1>
          {liquidityProviderInfo && (
            <div>
              <p>
                USDT undistributed:{" "}
                {ethers.formatUnits(undistributedReward, 18)}
              </p>
              <p>
                Total Claimed:{" "}
                {ethers.formatUnits(liquidityProviderInfo.totalClaimed, 18)}
              </p>
              <p>
                Total USDT Added as Liquidity:{" "}
                {ethers.formatUnits(liquidityProviderInfo.stableAmount, 18)}
              </p>
              <p>
                Total REN Added as Liquidity:{" "}
                {ethers.formatUnits(liquidityProviderInfo.tokenAmount, 18)}
              </p>
              <p>
                Total USDT Claimable:{" "}
                {ethers.formatUnits(liquidityProviderInfo.totalReward, 18)}
              </p>
            </div>
          )}

          <div className="flex flex-col items-center space-y-8 mt-8">
            <div className="flex flex-col items-center space-y-8">
              <div className="text-gray-800 w-auto">
                <InputLabel title="Enter USDT Amount To Claim:" />
                <div className="flex items-center space-x-3 rounded-md border p-3">
                  <div>
                    <button
                      onClick={() => {
                        setClaimAmount(
                          ethers.formatUnits(
                            liquidityProviderInfo?.totalReward || 0,
                            18
                          )
                        );
                      }}
                      className="w-auto rounded-md bg-gray-200 p-1 px-3 text-sm hover:bg-gray-300"
                    >
                      MAX
                    </button>
                  </div>

                  <input
                    type="number"
                    placeholder={"0"}
                    onChange={(event) => {
                      const { value } = event.target;
                      setClaimAmount(value);
                    }}
                    value={claimAmount}
                    className="border-none focus:outline-none"
                  />

                  <div className="flex flex-col  text-[12px]">
                    <p className="text-gray-600">Balance</p>
                    <p className="text-gray-800">
                      {Number(
                        ethers.formatUnits(
                          stableDetails.stableBalance,
                          stableDetails.stableDecimal
                        )
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              {signerAddress ? (
                <div>
                  <div className="flex w-full justify-center space-x-5">
                    <button
                      disabled={isClaiming}
                      onClick={handleClaim}
                      className="my-4 w-auto rounded-md text-white bg-theme-1 p-3 text-sm disabled:cursor-not-allowed disabled:bg-theme-1/50 hover:scale-105"
                    >
                      {isClaiming ? (
                        <div className="flex items-center justify-center">
                          <ClipLoader color="#fff" loading={true} size={30} />
                          <p className="ml-2">{claimText}</p>
                        </div>
                      ) : (
                        <div className="flex w-full items-center">
                          <p className="w-full">{claimText}</p>
                        </div>
                      )}
                    </button>

                    <button
                      disabled={isDistributing}
                      onClick={handleDistribute}
                      className="my-4 w-auto rounded-md text-white bg-theme-1 p-3 text-sm disabled:cursor-not-allowed disabled:bg-theme-1/50 hover:scale-105"
                    >
                      {isDistributing ? (
                        <div className="flex items-center justify-center">
                          <ClipLoader color="#fff" loading={true} size={30} />
                          <p className="ml-2">{distributeText}</p>
                        </div>
                      ) : (
                        <div className="flex w-full items-center">
                          <p className="w-full">{distributeText}</p>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <ConnectButton
                  connectMessage="Connect Your Wallet"
                  className="text-[21x] rounded-md bg-gray-300 p-2"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Main;
