import { useContext, useState, useRef, useEffect, ChangeEvent } from "react";

import { Web3Button, Web3NetworkSwitch } from "@web3modal/react";

import { ethers } from "ethers";
import { ClipLoader, GridLoader } from "react-spinners";
import { erc20ABI, useAccount, useDisconnect } from "wagmi";

import {
  readContract,
  prepareWriteContract,
  writeContract,
  waitForTransaction,
} from "@wagmi/core";

import { useAppDispatch } from "../../stores/hooks";
import { RootState } from "../../stores/store";
import { useSelector } from "react-redux";
import {
  createFacetAbi,
  diamondAddress,
  pancakeswapRouter,
  usdtAddress,
  wbnbAddress,
} from "../../contracts";
import { displayToast } from "../../components/Toast";
import { inDollarFormat, sDuration } from "../../utils/helper";
import InputLabel from "../../components/InputLabel";
import Input from "../../components/Input";
import Moralis from "moralis/.";
import StepProgressBar from "../../components/MultiStepProgressBar";
import { CheckIcon, Plus, Timer } from "lucide-react";
import BasicForm from "../../components/BasicForm";
import ProfileForm from "../../components/ProfileForm";
import CreateForm from "../../components/CreateForm/indexReal";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Alert from "../../base-components/Alert";
import Lucide from "../../base-components/Lucide";
import Notification from "../../base-components/Notification";
import { NotificationElement } from "../../base-components/Notification";
import LoadingIcon from "../../base-components/LoadingIcon";

// const Moralis = require("moralis").default;

function Main() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Basic non sticky notification
  const basicNonStickyNotification = useRef<NotificationElement>();
  const basicNonStickyNotificationToggle = () => {
    // Show notification
    basicNonStickyNotification.current?.showToast();
  };

  const { signerAddress, balance, chainId } = useSelector(
    (state: RootState) => state.wallet
  );

  const [projects, setProjects] = useState<any>(undefined);
  const [openWalletAlert, setOpenWalletAlert] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);

  const loadProjects = async () => {
    if (signerAddress) {
      try {
        const response = await axios.get(
          `https://safu-finance-online.vercel.app/projects/${signerAddress}`
        );

        const projectData = response.data;
        let projects = [];
        if (projectData.length > 0) {
          projects = projectData.filter(
            (project: any) => project.uniqueId != `new${signerAddress}`
          );
        }

        setProjects(projects);
      } catch (error) {
        console.log("Error: No Project found", error);
      }
    }
  };

  useEffect(() => {
    if (signerAddress) {
      setOpenWalletAlert(false);
    }
  }, [signerAddress]);

  useEffect(() => {
    loadProjects();
  }, [signerAddress]);

  // console.log(`Projects for ${signerAddress}: `, projects);

  return (
    <>
      <div className="mx-20">
        <div className="text-center">
          <h1 className="text-gray-800 text-4xl font-bold">Create Project</h1>
        
        </div>
        <div className=" mt-12">
          <Alert variant="soft-success" className="flex items-center my-10">
            {({ dismiss }) => (
              <>
                <Lucide icon="AlertOctagon" className="w-6 h-6 mr-2" />
                <p className="text-base text-gray-800">
                  Projects with liquidity on PancakeswapV2 are supported for
                  now.
                </p>
                <Alert.DismissButton
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={dismiss}
                >
                  <Lucide icon="X" className="w-4 h-4" />
                </Alert.DismissButton>
              </>
            )}
          </Alert>

      
          <div className=" w-full border border-gray-300 mt-3 border-b hover:bg-gray-200">
            <button
              className="space-x-4 w-full flex items-center border-b border-gray-300 py-8 px-4  cursor-pointer"
              onClick={async () => {

                console.log("ROuting...");
                    const route = `/create/${"0x123"}/new`;
                    setIsSettingUp(false);
                    navigate(route);

                    console.log("Route done");
              }}
            >
              {isSettingUp ? (
                <ClipLoader size={60} speedMultiplier={0.5} />
              ) : (
                <div className="relative">
                  {/* Circle Background */}
                  <div className="h-16 w-16 rounded-full border-2 border-gray-300"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Plus className="w-[34px] h-[34px]" />
                  </div>
                </div>
              )}

              <div className="space-y-3 text-left">
                <h1 className="text-3xl font-medium">Create a New Project</h1>
                <p className="text-base">Set up a project with Safu Finance</p>
              </div>
            </button>
          </div>
        </div>

        <div className="mt-10">
          <h1 className="text-4xl mb-4">Saved Projects</h1>
          {signerAddress ? (
            projects ? (
              projects.length > 0 ? (
                projects?.map((project: any, index: any) => {
                  return (
                    <Link to={`/create/${signerAddress}/${project.uniqueId}`}>
                      <div className="flex justify-between border border-gray-300 hover:bg-gray-200 cursor-pointer">
                        <div
                          className={`space-x-4 flex items-center  py-8 px-4  ${
                            project.uniqueId == `new${signerAddress}`
                              ? "hidden"
                              : "block"
                          }`}
                        >
                          {project.basicDetails.imageDataUrl ? (
                            <div>
                              <img
                                src={project.basicDetails.imageDataUrl}
                                alt=""
                                width={80}
                                height={80}
                              />
                            </div>
                          ) : (
                            <div className="w-[80px] h-[80px] rounded-full bg-gray-200 "></div>
                          )}

                          <div className="space-y-3">
                            <h1 className="text-2xl font-medium">
                              {project.uniqueId}
                            </h1>
                            <p className="text-base">
                              {project.basicDetails.description}
                            </p>
                          </div>
                        </div>
                        <div className="p-5 whitespace-nowrap">
                          {project.status == 0 && (
                            <p className="bg-blue-800 text-white p-2 rounded-md animate-pulse">
                              Under Review
                            </p>
                          )}
                          {project.status == 1 && (
                            <p className="bg-green-800 text-white p-2 rounded-md">
                              Approved
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="">
                  <h1 className="text-xl">No Saved Project</h1>
                </div>
              )
            ) : (
              <div className="flex space-x-2 items-center mt-4">
                <LoadingIcon icon="circles" className="w-8 h-8" />
                <h1 className="text-xl">Loading Projects</h1>
              </div>
            )
          ) : (
            <p className="text-xl">Make sure your wallet is connected </p>
          )}
        </div>
        <Notification
          getRef={(el) => {
            basicNonStickyNotification.current = el;
          }}
          options={{
            duration: 3000,
            position: "right",
          }}
          className="flex flex-col sm:flex-row"
        >
          <div className="font-medium">An error occured. Try again later</div>
        </Notification>
      </div>
    </>
  );
}

export default Main;
