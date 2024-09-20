import { useContext, useState, useRef, useEffect, ChangeEvent } from "react";
import { Web3Button, Web3NetworkSwitch } from "@web3modal/react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import { ClipLoader, GridLoader } from "react-spinners";
import { erc20ABI, useAccount, useDisconnect } from "wagmi";
import {
  readContract,
  prepareWriteContract,
  writeContract,
  waitForTransaction,
} from "@wagmi/core";

import { useSelector } from "react-redux";
import { RootState } from "../../stores/store";
import { loadProjectInfo } from "../../stores/insuranceSlice";
import { ProjectInfo } from "../../types/general";
import { useAppDispatch } from "../../stores/hooks";
import ConnectButton from "../../components/ConnectButton";
import InputLabel from "../../components/InputLabel";
import Input from "../../components/Input";
import { displayToast } from "../../components/Toast";

enum Status {
  PENDING = "pending",
  APPROVED = "approved",
  DISAPPROVED = "disapproved",
  PAUSED = "paused",
  ACTIVE = "active",
  NOT_FOUND = "not found",
}

const isFound = (projects: string[], target: string) => {
  const result = projects.filter(
    (project) => project.toLowerCase() == target.toLowerCase()
  );
  return result.length > 0;
};

function Main() {
  const dispatch = useAppDispatch();

  const { signerAddress, balance, chainId } = useSelector(
    (state: RootState) => state.wallet
  );
  const {
    protocolDetails,
    pendingProjects,
    allProjects,
    disapprovedProjects,
    projectInfo,
  } = useSelector((state: RootState) => state.insurance);
  const { isConnected } = useAccount();

  let [tokenAddress, setTokenAddress] = useState("");

  const [isChecking, setIsChecking] = useState(false);

  const [isvalidTokenAddress, setIsValidTokenAddress] = useState(true);
  let [projectStatus, setProjectStatus] = useState<Status>();

  const handleCheckStatus = async () => {
    setProjectStatus(undefined);
    try {
      setIsChecking(true);
      if (!isvalidTokenAddress) {
        displayToast("failure", "Make sure you enter a valid token address");
        setIsChecking(false);
        return;
      }

      if (pendingProjects && allProjects && disapprovedProjects) {
        if (isFound(pendingProjects, tokenAddress)) {
          setProjectStatus(Status.PENDING);
        } else if (isFound(allProjects, tokenAddress)) {
          setProjectStatus(Status.APPROVED);
        } else if (isFound(disapprovedProjects, tokenAddress)) {
          setProjectStatus(Status.DISAPPROVED);
        } else {
          setProjectStatus(Status.NOT_FOUND);
        }

        dispatch(loadProjectInfo(tokenAddress));

        setIsChecking(false);
      }
    } catch (error) {
      console.log("Error: ", error);
      displayToast("failure", "An error encountered while checking status");
      setIsChecking(false);
    }
  };

  console.log("Project Status: ", projectStatus);
  console.log("Project Info: ", projectInfo);
  return (
    <>
      <div className="container relative mx-auto h-full ">
        <div className="flex w-full flex-col items-center justify-center gap-4">
          <h1 className="text-gray-800 text-4xl font-bold text-center">
            Project Status
          </h1>
          <div className="flex flex-col items-center space-y-8 mt-8">
            <div className="flex flex-col items-center space-y-8">
              <div className="w-[450px]">
                <InputLabel
                  title="Enter the token address:"
                  note={
                    <p className="text-[12px]">
                      This is the address of the token to which you wish to
                      incorporate utility within the insurance protocol.
                      <br />
                      <br />
                      Input should be a token address, For example: <br />
                      <br />
                      <span className="text-[13px]">
                        0x1234567890123456789012345678901234567890
                      </span>{" "}
                      <br />
                      <br />
                      The example shows how a token address should look like.
                    </p>
                  }
                />
                <Input
                  onChange={(event) => {
                    const { value } = event.target;
                    setTokenAddress(value);

                    const standardAddressPattern = /^0x[0-9a-fA-F]{40}$/;
                    if (!standardAddressPattern.test(value)) {
                      setIsValidTokenAddress(false);
                    } else {
                      setIsValidTokenAddress(true);
                    }
                  }}
                  type="text"
                  placeholder={""}
                  inputClassName="spin-button-hidden"
                />
                {!isvalidTokenAddress && (
                  <p className="mt-1 text-[13px] text-red-700">
                    Invalid Token Address
                  </p>
                )}
              </div>
            </div>

            <div>
              {signerAddress ? (
                <button
                  disabled={isChecking}
                  onClick={handleCheckStatus}
                  className={`${
                    isChecking && "cursor-not-allowed opacity-50"
                  } mx-4 bg-theme-1 p-2 text-white text-lg w-[300px] `}
                >
                  {isChecking ? (
                    <div className="flex w-full items-center justify-center space-x-4">
                      <ClipLoader color="#fff" loading={true} size={30} />
                      <p className="ml-2">Checking Status</p>
                    </div>
                  ) : (
                    <div className="flex w-full items-center">
                      <p className="w-full">Check Status</p>
                    </div>
                  )}
                  {/*  */}
                </button>
              ) : (
                <ConnectButton
                  connectMessage="Connect Your Wallet"
                  className="text-[21x] rounded-md bg-gray-300 p-2"
                />
              )}
            </div>
            {projectStatus && (
              <div className="w-[450px] self-start ">
                {projectStatus == Status.PENDING && (
                  <div className="border border-slate-300 bg-theme-1/20 p-2 text-sm">
                    <p>
                      Project is{" "}
                      <span className="animate-pulse">{projectStatus}</span>.
                      You can contact the{" "}
                      <span className="rounded-md bg-theme-1/80 p-1 px-2 text-white">
                        admin
                      </span>{" "}
                      here.
                    </p>
                  </div>
                )}
                {projectStatus == Status.DISAPPROVED && (
                  <div className="bg-red-100 text-red-800 p-2 text-sm">
                    <p>Project has been disapproved by the admin.</p>
                    {projectInfo && projectInfo.message && (
                      <div className="py-3">
                        {" "}
                        <p className="text-red-300">REASON FOR DISAPPROVAL</p>
                        <p>{projectInfo?.message}</p>
                      </div>
                    )}
                  </div>
                )}

                {projectStatus == Status.APPROVED && (
                  <div className="border border-slate-300 bg-theme-1/10 p-2 text-sm py-3">
                    <p className="pb-4">
                      <span className="text-green-600">Congrats!</span> Your
                      project has been approved.
                    </p>
                    <Link
                      to={`/project/${tokenAddress}`}
                      className="rounded-md bg-theme-1/80 p-1 px-2 text-white py-2"
                    >
                      Go to project's page
                    </Link>
                  </div>
                )}

                {projectStatus == Status.NOT_FOUND && (
                  <div className="border border-slate-300 bg-theme-2/10 p-2 text-sm py-3">
                    <p className="pb-4">Project is not found.</p>
                    <Link
                      to={`/create_new`}
                      className="rounded-md bg-theme-1/80 p-1 px-2 text-white py-2 my-3"
                    >
                      Create a Project
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Main;
