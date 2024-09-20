import { ethers } from "ethers";

import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
  Fragment,
} from "react";
import { Dialog as HeadlessDialog, Transition } from "@headlessui/react";
import { ClipLoader } from "react-spinners";
import { useContractRead } from "wagmi";
import { readContract, erc20ABI, waitForTransaction } from "@wagmi/core";
import { AiOutlineArrowRight } from "react-icons/ai";
import { useSelector } from "react-redux";
import { SUPPORTED_CHAIN_ID } from "../../contracts";
import { RootState } from "../../stores/store";
import Input from "../Input";
import InputLabel from "../InputLabel";

interface DetailedProject {
  name: string;
  symbol: string;
  decimals: number;
  logo: string;
  tokenAddress: string;
}

const searchTokens = (tokens: DetailedProject[], input: string) => {
  input = input.toLowerCase(); // Convert input to lowercase for case-insensitive search

  return tokens.filter((token) => {
    const { name, symbol, tokenAddress } = token;
    return (
      name.toLowerCase().includes(input) ||
      symbol.toLowerCase().includes(input) ||
      input.toLowerCase() == tokenAddress.toLowerCase()
    );
  });
};
export default function SelectModal({
  openSelectModal,
  setOpenSelectModal,
  setTokenDetails,
  detailedProjects,
}: {
  openSelectModal: boolean;
  setOpenSelectModal: Dispatch<SetStateAction<boolean>>;
  setTokenDetails: Dispatch<
    SetStateAction<{
      tokenBalance: bigint;
      tokenSymbol: string;
      tokenDecimal: number;
      tokenAmount: string;
      tokenAddress: string;
      tokenLogo: string;
    }>
  >;
  detailedProjects: DetailedProject[];
}) {
  let [searchInput, setSearchInput] = useState("");
  let [loadedProjects, setLoadedProjects] =
    useState<DetailedProject[]>(detailedProjects);

  const { signerAddress, balance, chainId } = useSelector(
    (state: RootState) => state.wallet
  );

  // useEffects

  useEffect(() => {
    const loadProjects = async () => {
      //const input = "flx";
      const matchingTokens = searchTokens(detailedProjects, searchInput);

      setLoadedProjects(matchingTokens);
    };
    loadProjects();
  }, [searchInput]);

  return (
    <>
      <Transition appear show={openSelectModal} as={Fragment}>
        <HeadlessDialog
          as="div"
          className="relative z-[60]"
          onClose={setOpenSelectModal}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-50"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gradient-to-b from-theme-1/50 via-theme-2/50 to-black/50 backdrop-blur-sm" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex justify-center my-2 sm:mt-40">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-50"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-100"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <HeadlessDialog.Panel className="sm:w-[450px] relative mx-auto transition-transform">
                  <div className="relative mx-3 rounded-lg shadow dark:bg-gray-700">
                    <div className="font-hand bg-white p-5 dark:bg-gray-800">
                      <div className="flex items-center justify-between rounded-t">
                        <div className="text-center text-3xl  text-gray-700 dark:text-white sm:text-2xl">
                          Select a Token
                        </div>
                        <button
                          onClick={() => {
                            setOpenSelectModal(false);
                          }}
                          type="button"
                          className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:hover:text-white"
                          data-modal-toggle="small-modal"
                        >
                          <svg
                            className="h-5 w-5  dark:text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                        </button>
                      </div>

                      <div className="my-10">
                        <div>
                          <InputLabel title="Search name or symbol or paste address" />
                          <Input
                            type="text"
                            inputClassName="spin-button-hidden"
                            onChange={(event) => {
                              const { value } = event.target;
                              setSearchInput(value);
                            }}
                          />
                        </div>

                        <div className="my-2 rounded-md border">
                          {loadedProjects && loadedProjects.length > 0 ? (
                            loadedProjects.map(
                              (currentProject: DetailedProject, index) => {
                                return (
                                  <div
                                    className="flex cursor-pointer items-center justify-between py-2 px-3 hover:bg-gray-100"
                                    key={index}
                                    onClick={async () => {
                                      console.log("Project clicked: ", index);

                                      console.log(
                                        "Current proejct.tokenAddress is ",
                                        currentProject.tokenAddress
                                      );
                                      const balance = (await readContract({
                                        address:
                                          currentProject.tokenAddress as `0x${string}`,
                                        abi: erc20ABI,
                                        functionName: "balanceOf",
                                        args: [signerAddress as `0x${string}`],
                                        chainId: SUPPORTED_CHAIN_ID,
                                      })) as bigint;

                                      console.log("Balance:   ", balance);

                                      setTokenDetails((prevTokenDetails) => ({
                                        ...prevTokenDetails,
                                        tokenBalance: balance,
                                        tokenSymbol: currentProject.symbol,
                                        tokenDecimal: currentProject.decimals,
                                        tokenAddress:
                                          currentProject.tokenAddress,
                                        tokenLogo: currentProject.logo,
                                      }));
                                      setOpenSelectModal(false);
                                    }}
                                  >
                                    <div className="flex items-center space-x-2">
                                      <div>
                                        <img
                                          src={currentProject.logo}
                                          width={30}
                                          height={30}
                                        />
                                      </div>

                                      <div>
                                        <p className="text-base">
                                          {currentProject.symbol}
                                        </p>
                                        <p className="text-[12px] text-gray-500">
                                          {currentProject.name}
                                        </p>
                                      </div>
                                    </div>
                                    <AiOutlineArrowRight className="text-lg" />
                                  </div>
                                );
                              }
                            )
                          ) : (
                            <div className="flex w-full justify-center py-3">
                              <p className="text-sm">No results found</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </HeadlessDialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </HeadlessDialog>
      </Transition>
    </>
  );
}
