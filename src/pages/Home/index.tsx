import { useContext, useState, useRef, useEffect, ChangeEvent } from "react";
// import { Web3Button, Web3NetworkSwitch } from "@web3modal/react";

// import { ethers } from "ethers";
import { ClipLoader, GridLoader } from "react-spinners";
// import { useAccount, useDisconnect } from "wagmi";

// import {
//   loadAllProjects,
//   loadLiquidityProviders,
//   loadProtocolDetails,
// } from "../../stores/insuranceSlice";
import { useSelector } from "react-redux";
import { SUPPORTED_CHAIN_ID } from "../../contracts";
import { useAppDispatch } from "../../stores/hooks";
import { RootState } from "../../stores/store";
import { inDollarFormat } from "../../utils/helper";
import ConnectButton from "../../components/ConnectButton";
import HomeProject from "../../components/HomeProject";
import { Link } from "react-router-dom";

export interface IDetailedProject {
  name: string;
  symbol: string;
  projectAddress: string;
  decimals: number;
}

function Main() {
  const dispatch = useAppDispatch();

  // const { signerAddress, balance, chainId } = useSelector(
  //   (state: RootState) => state.wallet
  // );
  // const { protocolDetails, allProjects, liquidityProviders } = useSelector(
  //   (state: RootState) => state.insurance
  // );

  let [detailedProjects, setDetailedProjects] = useState<IDetailedProject[]>();
  let [totalStablesLocked, setTotalStablesLocked] = useState<bigint>();

  // useEffect(() => {
  //   const loadData = async () => {
  //     dispatch(loadProtocolDetails());
  //     dispatch(loadAllProjects());
  //   };

  //   loadData();
  // }, []);

  // useEffect(() => {
  //   const getProjects = async () => {
  //     if (allProjects) {
  //       const detailedProjects = allProjects.map(async (projectAddress) => {
  //         const data = await multicall({
  //           chainId: SUPPORTED_CHAIN_ID,
  //           contracts: [
  //             {
  //               address: projectAddress as `0x${string}`,
  //               abi: erc20ABI,
  //               functionName: "name",
  //             },
  //             {
  //               address: projectAddress as `0x${string}`,
  //               abi: erc20ABI,
  //               functionName: "symbol",
  //             },
  //             {
  //               address: projectAddress as `0x${string}`,
  //               abi: erc20ABI,
  //               functionName: "decimals",
  //             },
  //           ],
  //         });

  //         return {
  //           name: data[0]?.result || "",
  //           projectAddress,
  //           symbol: data[1].result || "",
  //           decimals: data[2].result || 0,
  //         };
  //       });

  //       const resolve = await Promise.all(detailedProjects);
  //       setDetailedProjects(resolve);
  //     }
  //   };

  //   getProjects();
  // }, [allProjects]);

  // useEffect(() => {
  //   const getTotalUSDT = async () => {
  //     if (allProjects) {
  //       const totalStableLiquidity = await allProjects.reduce(
  //         async (accumulatorPromise, currentProject) => {
  //           const accumulator = await accumulatorPromise;
  //           dispatch(loadLiquidityProviders(currentProject));

  //           const totalStableLiquidity = liquidityProviders?.reduce(
  //             (providerAccumulator, currentLiquidityProvider) =>
  //               providerAccumulator +
  //               BigInt(currentLiquidityProvider.stableAmount),
  //             0n
  //           );
  //           return accumulator + (totalStableLiquidity || 0n);
  //         },
  //         Promise.resolve(0n)
  //       );

  //       setTotalStablesLocked(totalStableLiquidity);

  //       console.log("Total stable liquidity: ", totalStableLiquidity);
  //     }
  //   };

  //   getTotalUSDT();
  // }, [allProjects]);

  // console.log("Protocol details: ", protocolDetails);
  return (
    <>
     
        <div className="container relative h-full ">
          {true ? (
            <div className="space-y-10">
              <div className="h-screen border-b-4 border-dashed w-full flex flex-col items-center justify-center space-y-10">
                <h1 className="text-6xl font-bold text-theme-1">
                  The Investment Protocol for Everyone!
                </h1>
                <p className="text-2xl leading-10 w-4/6 text-center">
                  SafuFinance strives to enable individuals to effortlessly
                  create a highly secure investment protocol, even without
                  technical expertise. Investors participating in any
                  established investment protocol can be confident that they
                  will not experience losses, regardless of prevailing market
                  conditions
                </p>

                <div className="flex items-center justify-center space-x-10">
                  <Link
                    to={`/create_new`}
                    className="p-3 px-16 text-xl bg-theme-1 text-white rounded-md hover:scale-105"
                  >
                    Create Now
                  </Link>
                  <button className="p-3 px-16 text-xl text-theme-1 bg-gray-200 rounded-md hover:scale-105">
                    Learn More
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-6 text-xl">
                <div className="border shadow-md p-4 rounded-md text-center min-w-max transform hover:scale-105 transition-transform duration-300">
                  <p className="font-semibold mb-2">Number of Projects</p>
                  <p className="text-gray-700">
                    {detailedProjects && detailedProjects.length}
                  </p>
                </div>

                <div className="border shadow-md p-4 rounded-md text-center min-w-max transform hover:scale-105 transition-transform duration-300">
                  <p className="font-semibold mb-2">
                    Total Number of Participants
                  </p>
                  <p className="text-gray-700">
                  12 participants
                  </p>
                </div>

                <div className="border shadow-md p-4 rounded-md text-center min-w-max transform hover:scale-105 transition-transform duration-300">
                  <p className="font-semibold mb-2">Total USDT Locked</p>
                  <p className="text-gray-700">
                  400 USDT
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center">
                <h1 className="text-4xl text-center text-theme-1 font-bold pt-4 pb-10">
                  List of projects launched
                </h1>
                <div>
                  {" "}
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* {detailedProjects &&
                      detailedProjects.map((project, index) => (
                        // Add a unique key to each HomeProject component
                        <HomeProject key={index} project={project} />
                      ))} */}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex w-full items-center justify-center">
              <div className="flex flex-col items-center justify-center">
                <p>No account is detected</p>
              </div>
            </div>
          )}
        </div>

    </>
  );
}

export default Main;
