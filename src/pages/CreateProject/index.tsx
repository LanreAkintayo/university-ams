import { useContext, useState, useRef, useEffect, ChangeEvent } from "react";

import { ClipLoader, GridLoader } from "react-spinners";

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
import { CheckIcon, Timer } from "lucide-react";
import BasicForm from "../../components/BasicForm";
import ProfileForm from "../../components/ProfileForm";
import { useParams } from "react-router-dom";
import axios from "axios";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Alert from "../../base-components/Alert";
import Lucide from "../../base-components/Lucide";
import CreateForm from "../../components/CreateForm/Index";

// const Moralis = require("moralis").default;

const getProgressCount = (object: any) => {
  let totalFields = 0;
  let nonEmptyFields = 0;

  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      totalFields++;

      if (
        object[key] !== "" &&
        !(Array.isArray(object[key]) && object[key].length === 0) &&
        object[key] !== 0
      ) {
        nonEmptyFields++;
      }
    }
  }

  return nonEmptyFields;
};

function Main() {
  const dispatch = useAppDispatch();

  const { signerAddress, balance, chainId } = useSelector(
    (state: RootState) => state.wallet
  );

  const { owner, uniqueId } = useParams();
  const validUniqueId =
    (uniqueId && uniqueId.startsWith("new") ? `new${owner}` : uniqueId) || "";

  // console.log("Valid Unique Id: ", validUniqueId);

  const [projectDetails, setProjectDetails] = useState<any>({});
  const [basicProgressCount, setBasicProgressCount] = useState(0);
  const [profileProgressCount, setProfileProgressCount] = useState(0);
  const [metricsProgressCount, setMetricsProgressCount] = useState(0);
  const totalBasic = 7;
  const totalProfile = 4;
  const totalMetrics = 7;

  const [selectedPage, setSelectedPage] = useState(-1);

  const isCreated = () => {
    return (
      (projectDetails && projectDetails.status == 0) ||
      projectDetails.status == 1
    );
  };

  const getPercentage = (type: string) => {
    if (type == "metrics") {
      if (metricsProgressCount == -1) {
        return 0;
      } else {
        return (metricsProgressCount / totalMetrics) * 100;
      }
    }

    if (type == "basic") {
      if (basicProgressCount == -1) {
        return 0;
      } else {
        return (basicProgressCount / totalBasic) * 100;
      }
    }

    if (type == "profile") {
      if (profileProgressCount == -1) {
        return 0;
      } else {
        return (profileProgressCount / totalProfile) * 100;
      }
    }

    return 0;
  };

  return (
    <>
      {selectedPage == -1 && (
        <div className="mx-20">
          <h1 className="text-gray-800 text-4xl font-bold text-center">
            Project Overview
          </h1>
          <Alert variant="soft-success" className="flex items-center mt-10">
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
          <div className="border border-gray-300 mt-10 border-b">
            <div
              className="space-x-4 flex items-center border-b border-gray-300 py-8 px-4 hover:bg-gray-200 cursor-pointer"
              onClick={() => {
                localStorage.setItem("selectedPage", String(0));
                setSelectedPage(0);
              }}
            >
              <CircularProgressbar
                value={getPercentage("basic")}
                text={`${basicProgressCount} / ${totalBasic}`}
                className="w-16 h-16"
                styles={buildStyles({
                  // Rotation of path and trail, in number of turns (0-1)
                  rotation: 0.25,

                  // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
                  strokeLinecap: "butt",

                  // Text size
                  textSize: "24px",

                  // How long animation takes to go from one percentage to another, in seconds
                  pathTransitionDuration: 0.5,

                  // Can specify path transition in more detail, or remove it entirely
                  // pathTransition: 'none',

                  // Colors
                  pathColor: `rgba(0,128,0, ${getPercentage("basic")})`,
                  textColor: "#000",
                  trailColor: "#cccccc",
                  backgroundColor: "#3e9",
                })}
              />

              <div className="space-y-3">
                <h1 className="text-3xl font-medium">Basics</h1>
                <p className="text-base">
                  Enter your token address, description and other relevant token
                  information
                </p>
              </div>
            </div>
            <div
              className="space-x-4 flex items-center border-b border-gray-300 py-8 px-4 hover:bg-gray-200 cursor-pointer"
              onClick={() => {
                localStorage.setItem("selectedPage", String(1));
                setSelectedPage(1);
              }}
            >
              <CircularProgressbar
                value={getPercentage("profile")}
                text={`${profileProgressCount} / ${totalProfile}`}
                className="w-16 h-16"
                styles={buildStyles({
                  // Rotation of path and trail, in number of turns (0-1)
                  rotation: 0.25,

                  // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
                  strokeLinecap: "butt",

                  // Text size
                  textSize: "24px",

                  // How long animation takes to go from one percentage to another, in seconds
                  pathTransitionDuration: 0.5,

                  // Can specify path transition in more detail, or remove it entirely
                  // pathTransition: 'none',

                  // Colors
                  pathColor: `rgba(0,128,0, ${getPercentage("profile")})`,
                  textColor: "#000",
                  trailColor: "#cccccc",
                  backgroundColor: "#3e9",
                })}
              />

              <div className="space-y-3">
                <h1 className="text-3xl font-medium">Profile</h1>
                <p className="text-base">Set up your SafuFinance profile</p>
              </div>
            </div>
            <div
              className="space-x-4 flex items-center py-8 px-4 hover:bg-gray-200 cursor-pointer"
              onClick={() => {
                localStorage.setItem("selectedPage", String(2));
                setSelectedPage(2);
              }}
            >
              <CircularProgressbar
                value={getPercentage("metrics")}
                text={`${metricsProgressCount} / ${totalMetrics}`}
                className="w-16 h-16"
                styles={buildStyles({
                  // Rotation of path and trail, in number of turns (0-1)
                  rotation: 0.25,

                  // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
                  strokeLinecap: "butt",

                  // Text size
                  textSize: "24px",

                  // How long animation takes to go from one percentage to another, in seconds
                  pathTransitionDuration: 0.5,

                  // Can specify path transition in more detail, or remove it entirely
                  // pathTransition: 'none',

                  // Colors
                  pathColor: `rgba(0,128,0, ${getPercentage("metrics")})`,
                  textColor: "#000",
                  trailColor: "#cccccc",
                  backgroundColor: "#3e9",
                })}
              />

              <div className="space-y-3">
                <h1 className="text-3xl font-medium">Metrics & Payment</h1>
                <p className="text-base">Set up the metrics for your project</p>
              </div>
            </div>
          </div>

          <div className="flex justify-start items-center">
            <div className="flex flex-col items-center">
              {/* Vertical Line Above Circle */}
              <div
                className={`w-[1px] h-8 ${
                  isCreated() ? "bg-green-700" : "bg-gray-300"
                }`}
              ></div>

              {/* Circle */}
              <div
                className={`w-3 h-3 ${
                  isCreated() ? "bg-green-700" : "bg-gray-300"
                } rounded-full mx-4`}
              ></div>

              {/* Vertical Line Below Circle */}
              <div
                className={`w-[1px] flex-grow h-8 ${
                  isCreated() ? "bg-green-700" : "bg-gray-300"
                }`}
              ></div>
            </div>
            <p className="text-base">Project Review takes 2 to 3 days</p>
          </div>

          <div className="border border-gray-300 p-3 border-b px-4  hover:bg-gray-200">
            <div className="flex justify-between ">
              <div className="flex items-center space-x-4 my-6">
                <div className="relative">
                  {/* Circle Background */}
                  <div
                    className={`rounded-full h-16 w-16 border-2 ${
                      !isCreated() ? "border-gray-300" : "border-green-700"
                    } `}
                  ></div>
                  {/* Percentage Text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Timer
                      className={`w-[34px] h-[34px] ${
                        !isCreated() ? "text-gray-300" : "text-green-700"
                      } `}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <h1 className="text-3xl font-medium">Project Review</h1>
                  {!isCreated() && (
                    <p className="text-base">
                      Make sure that all details are valid.
                    </p>
                  )}
                  {projectDetails.status == 0 && (
                    <p className="text-base">
                      Project is under review to make sure it follows the rules
                      and guidelines
                    </p>
                  )}
                  {projectDetails.status == 1 && (
                    <p className="text-base">Project has been approved</p>
                  )}
                  {projectDetails.status == 2 && (
                    <p className="text-base">Project has been disapproved</p>
                  )}
                </div>
              </div>
              {projectDetails && (
                <div>
                  {projectDetails.status == 0 && (
                    <p className="bg-blue-800 text-white p-2 rounded-md animate-pulse">
                      Under Review
                    </p>
                  )}
                  {projectDetails.status == 1 && (
                    <p className="bg-green-800 text-white p-2 rounded-md">
                      Approved
                    </p>
                  )}
                  {projectDetails.status == 2 && (
                    <p className="bg-red-800 text-white p-2 rounded-md">
                      Disapproved
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* {selectedPage == 0 && <BasicForm />}
      {selectedPage == 1 && <ProfileForm />}
      {selectedPage == 2 && <MetricsPage />} */}

      {selectedPage != -1 && (
        <CreateForm
          selectedPage={selectedPage}
          owner={owner}
          uniqueId={validUniqueId}
        />
      )}
    </>
  );
}

export default Main;
