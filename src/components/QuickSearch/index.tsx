import users from "../../fakers/users";
import departments from "../../fakers/departments";
import products from "../../fakers/products";
import { Menu } from "../../base-components/Headless";
import Lucide from "../../base-components/Lucide";
import { FormInput } from "../../base-components/Form";
import { Dialog as HeadlessDialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import _ from "lodash";
import { RootState } from "../../stores/store";
import { useSelector } from "react-redux";
import { AiOutlineArrowRight } from "react-icons/ai";
import { Link } from "react-router-dom";
import {
  ClipLoader,
  FadeLoader,
  GridLoader,
  PulseLoader,
} from "react-spinners";

interface MainProps {
  quickSearch: boolean;
  setQuickSearch: (val: boolean) => void;
}

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

function Main(props: MainProps) {
  const [detailedProjects, setDetailedProjects] = useState<DetailedProject[]>(
    []
  );
  const [loadedProjects, setLoadedProjects] =
    useState<DetailedProject[]>(detailedProjects);
  let [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    document.onkeydown = function (evt) {
      if (evt.key === "Escape" || evt.key === "Esc") {
        props.setQuickSearch(false);
      } else if ((evt.ctrlKey || evt.metaKey) && evt.key === "k") {
        props.setQuickSearch(true);
      }
    };
  }, []);

  // useEffect(() => {
  //   const updateToken = async () => {
  //     if (allProjects) {
  //       const robustProjects = allProjects.map(
  //         async (currentProject: string) => {
  //           // Name, symbols, decimals, token address

  //           const data = await multicall({
  //             chainId: SUPPORTED_CHAIN_ID,
  //             contracts: [
  //               {
  //                 address: currentProject as `0x${string}`,
  //                 abi: erc20ABI,
  //                 functionName: "name",
  //               },
  //               {
  //                 address: currentProject as `0x${string}`,
  //                 abi: erc20ABI,
  //                 functionName: "symbol",
  //               },
  //               {
  //                 address: currentProject as `0x${string}`,
  //                 abi: erc20ABI,
  //                 functionName: "decimals",
  //               },
  //             ],
  //           });

  //           console.log("Data inside project: ", data);

  //           const currentProjectInfo = await getProjectInfo(currentProject);

  //           return {
  //             name: data[0].result || "",
  //             symbol: data[1].result || "",
  //             decimals: data[2].result || 0,
  //             tokenAddress: currentProject,
  //             logo: currentProjectInfo.logo,
  //           };
  //         }
  //       );

  //       const resolved = (await Promise.all(
  //         robustProjects
  //       )) as DetailedProject[];

  //       setDetailedProjects(resolved);
  //     }
  //   };

  //   updateToken();
  // }, [allProjects]);

  useEffect(() => {
    const loadProjects = async () => {
      //const input = "flx";
      const matchingTokens = searchTokens(detailedProjects, searchInput);

      setLoadedProjects(matchingTokens);
    };
    loadProjects();
  }, [searchInput]);

  useEffect(() => {
    if (detailedProjects && detailedProjects.length > 0) {
      setLoadedProjects(detailedProjects);
    }
  }, [detailedProjects]);

  return (
    <>
      <Transition appear show={props.quickSearch} as={Fragment}>
        <HeadlessDialog
          as="div"
          className="relative z-[60]"
          onClose={props.setQuickSearch}
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
                <HeadlessDialog.Panel className="sm:w-[600px] lg:w-[700px] w-[95%] relative mx-auto transition-transform">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center justify-center w-12">
                      <Lucide
                        icon="Search"
                        className="w-5 h-5 -mr-1.5 text-slate-500 stroke-[1]"
                      />
                    </div>
                    <FormInput
                      className="pl-12 pr-14 py-3.5 text-base rounded-lg focus:ring-0 border-0 shadow-lg"
                      type="text"
                      placeholder="Search name or symbol or paste address ..."
                      onChange={(e) => {
                        setSearchInput(e.target.value);
                      }}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center w-14">
                      <div className="px-2 py-1 mr-auto text-xs border rounded-[0.4rem] bg-slate-100 text-slate-500/80">
                        ESC
                      </div>
                    </div>
                  </div>
                  <div className="relative z-10 pb-1 mt-1 bg-white rounded-lg shadow-lg max-h-[468px] sm:max-h-[615px] overflow-y-auto">
                    {detailedProjects && detailedProjects.length == 0 ? (
                      <div className="flex flex-col items-center py-4 space-y-2">
                        <FadeLoader />
                        <p>Loading Projects</p>
                      </div>
                    ) : (
                      <div>
                        <div className="px-5 py-4 border-t border-dashed">
                          <div className="flex items-center">
                            <div className="text-xs uppercase text-slate-500">
                              Products
                            </div>
                            <a
                              className="ml-auto text-xs text-slate-500"
                              href=""
                            >
                              See All
                            </a>
                          </div>
                          <div className="my-2 rounded-md border">
                            {loadedProjects && loadedProjects.length > 0 ? (
                              loadedProjects.map(
                                (currentProject: DetailedProject, index) => {
                                  return (
                                    <a
                                      className="flex cursor-pointer items-center justify-between py-2 px-3 hover:bg-gray-100"
                                      key={index}
                                      href={`/project/${currentProject.tokenAddress}`}
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
                                          <p className=" text-sm text-gray-400">
                                            {currentProject.name}
                                          </p>
                                        </div>
                                      </div>
                                      <AiOutlineArrowRight className="text-lg" />
                                    </a>
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
                    )}
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

export default Main;
