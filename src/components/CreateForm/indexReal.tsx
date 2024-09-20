import React, { useEffect, useState } from "react";
import { createDirection, inDollarFormat, sDuration } from "../../utils/helper";
import ProfileForm from "../ProfileForm";
import BasicForm from "../BasicForm";
import MetricsForm from "../MetricsForm";
import { MoveLeft, MoveRight } from "lucide-react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../stores/store";
import isEqual from "lodash/isEqual";
import Button from "../../base-components/Button";
import Lucide from "../../base-components/Lucide";
import { Dialog } from "../../base-components/Headless";
import { useParams } from "react-router-dom";
import { displayToast } from "../Toast";

import {
  createFacetAbi,
  diamondAddress,
  pancakeswapRouter,
  usdtAddress,
  wbnbAddress,
} from "../../contracts";

import Moralis from "moralis/.";
import { ClipLoader } from "react-spinners";

// const Moralis = require("moralis").default;

export interface IBasicForm {
  tokenAddress: string;
  treasuryAddress: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  description: string;
  imageDataUrl: string;
}

export interface IProfileForm {
  twitterHandle: string;
  telegramHandle: string;
  discordHandle: string;
  websiteUrl: string;
}
export interface IMetricsForm {
  minimumAmount: string;
  maximumAmount: string;
  insuranceFeePercentage: string;
  liquidityPercentage: string;
  penaltyPercentage: string;
  durations: string[];
  percentages: string[];
}

export interface IValidator {
  isTokenAddress: boolean | undefined;
  isTreasuryAddress: boolean | undefined;
  isDescription: boolean | undefined;
  isTokenImage: boolean | undefined;
  isTokenName: boolean | undefined;
  isTokenSymbol: boolean | undefined;
  isTokenDecimal: boolean | undefined;
  isMinimumAmount: boolean | undefined;
  isMaximumAmount: boolean | undefined;
  isInsuranceFeePercentage: boolean | undefined;
  isLiquidityPercentage: boolean | undefined;
  isPenaltyPercentage: boolean | undefined;
  isDurationsAndPercentages: boolean | undefined;
}

export const minimumInsuranceFeePercentage = 20;
export const minimumLiquidityPercentage = 10;
export const minimumPenaltyPercentage = 10;
export const maximumPenaltyPercentage = 75;

const BasicStep = () => {
  return (
    <div className="text-gray-800 w-full flex flex-col items-center py-6">
      <p className="text-2xl sm:text-3xl">{createDirection[0].name}</p>
      <p className="w-10/12 sm:w-5/12 text-sm sm:text-base text-center py-3 leading-relaxed">
        {createDirection[0].description}
      </p>
    </div>
  );
};
const ProfileStep = () => {
  return (
    <div className="text-gray-800 w-full flex flex-col items-center py-6">
      <p className="text-2xl sm:text-3xl">{createDirection[1].name}</p>
      <p className="w-10/12 sm:w-5/12 text-sm sm:text-base text-center py-3 leading-relaxed">
        {createDirection[1].description}
      </p>
    </div>
  );
};
const MetricStep = () => {
  return (
    <div className="text-gray-800 w-full flex flex-col items-center py-6">
      <p className="text-2xl sm:text-3xl">{createDirection[2].name}</p>
      <p className="w-10/12 sm:w-5/12 text-sm sm:text-base text-center py-3 leading-relaxed">
        {createDirection[2].description}
      </p>
    </div>
  );
};

export default function CreateForm({
  selectedPage,
  owner,
  uniqueId,
}: {
  selectedPage: number;
  owner: string | undefined;
  uniqueId: string | undefined;
}) {
  const [tokenAddress, setTokenAddress] = useState(uniqueId);

  const [currentStep, setCurrentStep] = useState(selectedPage);
  const { signerAddress } = useSelector((state: RootState) => state.wallet);
  const [isUnsavedChangesBasic, setIsUnsavedChangesBasic] = useState(false);
  const [isUnsavedChangesProfile, setIsUnsavedChangesProfile] = useState(false);
  const [isUnsavedChangesMetrics, setIsUnsavedChangesMetrics] = useState(false);
  const [buttonModalPreview, setButtonModalPreview] = useState(false);

  const [lastProfile, setLastProfile] = useState<IProfileForm>();
  const [lastBasic, setLastBasic] = useState<IBasicForm>();
  const [lastMetrics, setLastMetrics] = useState<IMetricsForm>();

  // All the states will be controlled here.
  const [basicForm, setBasicForm] = useState({
    tokenAddress: "",
    treasuryAddress: "",
    tokenName: "",
    tokenSymbol: "",
    tokenDecimal: "",
    description: "",
    imageDataUrl: "",
  });

  const [metricsForm, setMetricsForm] = useState({
    minimumAmount: "",
    maximumAmount: "",
    insuranceFeePercentage: "",
    liquidityPercentage: "",
    penaltyPercentage: "",
    durations: [] as string[],
    percentages: [] as string[],
  });

  const [profileForm, setProfileForm] = useState({
    twitterHandle: "",
    telegramHandle: "",
    discordHandle: "",
    websiteUrl: "",
  });

  const [validator, setValidator] = useState<IValidator>();
  const validatorLength = 13;

  const lastSaved = [lastBasic, lastProfile, lastMetrics];
  const currentForm = [basicForm, profileForm, metricsForm];

  const [formSelected, setFormSelected] = useState(selectedPage);

  const [isCreating, setIsCreating] = useState(false);
  const [isSavingChanges, setIsSavingChanges] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);

  const [createText, setCreateText] = useState("Create Project");

  const { protocolDetails } = useSelector(
    (state: RootState) => state.insurance
  );

  const [isFirstLoadedMetrics, setIsFirstLoadedMetrics] = useState(true);
  const [isFirstLoadedBasic, setIsFirstLoadedBasic] = useState(true);

  const anyDataFilled = (data: any) => {
    return Object.values(data).some(
      (value) => value !== "" && !Array.isArray(value)
    );
  };

  useEffect(() => {
    const selectedPage = parseInt(
      localStorage.getItem("selectedPage") || "-1",
      10
    );

    setCurrentStep(selectedPage);
  }, [selectedPage]);

  useEffect(() => {
    // Fetch profile form from the database
    const fetchProfile = async () => {
      // const tokenAddress = "";

      if (signerAddress && tokenAddress) {
        const response = await axios.get(
          `https://safu-finance-online.vercel.app/projects/${owner}/${tokenAddress}`
        );

        const projectData = response.data;
        if (projectData && projectData.length != 0) {
          const {
            basicDetails,
            profileDetails: profileData,
            metricsDetails,
            tokenAddress: uniqueId,
          } = projectData[0];

          if (basicDetails) {
            const basic = basicDetails as IBasicForm;
            const neededBasicDetails = {
              tokenAddress: basic.tokenAddress,
              treasuryAddress: basic.treasuryAddress,
              tokenName: basic.tokenName,
              tokenSymbol: basic.tokenSymbol,
              tokenDecimal: basic.tokenDecimal,
              description: basic.description,
              imageDataUrl: basic.imageDataUrl,
            };

            setLastBasic(neededBasicDetails);
            setBasicForm(neededBasicDetails);
          }
          if (profileData) {
            const profile = profileData as IProfileForm;
            const neededProfile = {
              twitterHandle: profile.twitterHandle,
              telegramHandle: profile.telegramHandle,
              discordHandle: profile.discordHandle,
              websiteUrl: profile.websiteUrl,
            };

            setLastProfile(neededProfile);
            setProfileForm(neededProfile);
          }
          if (metricsDetails) {
            setLastMetrics(metricsDetails);
            setMetricsForm(metricsDetails);
          }
        }
      }
    };

    fetchProfile();
  }, [signerAddress]);

  useEffect(() => {
    if (isEqual(lastProfile, profileForm)) {
      setIsUnsavedChangesProfile(false);
    } else {
      setIsUnsavedChangesProfile(true);
    }

    setProfileForm(profileForm);
  }, [profileForm]);

  useEffect(() => {
    if (isEqual(lastBasic, basicForm)) {
      setIsUnsavedChangesBasic(false);
    } else {
      setIsUnsavedChangesBasic(true);
    }

    setBasicForm(basicForm);
  }, [basicForm]);

  useEffect(() => {
    if (anyDataFilled(basicForm) && isFirstLoadedBasic) {
      const {
        tokenAddress,
        treasuryAddress,
        tokenName,
        tokenSymbol,
        tokenDecimal,
        description,
      } = basicForm;

      if (tokenAddress) {
        validateAddress(tokenAddress, "isTokenAddress");
      }
      if (treasuryAddress) {
        validateAddress(treasuryAddress, "isTreasuryAddress");
      }
      if (tokenName) {
        validateNonEmpty(tokenName, "isTokenName");
      }
      if (tokenSymbol) {
        validateNonEmpty(tokenSymbol, "isTokenSymbol");
      }
      if (tokenDecimal) {
        validateDecimal(tokenDecimal, "isTokenDecimal");
      }
      if (description) {
        validateNonEmpty(description, "isDescription");
      }
      setIsFirstLoadedBasic(false);
    }
  }, [basicForm]);

  useEffect(() => {
    if (basicForm.imageDataUrl) {
      setValidator((prevValidator: any) => {
        return { ...prevValidator, isTokenImage: true };
      });
    } else {
      setValidator((prevValidator: any) => {
        return { ...prevValidator, isTokenImage: false };
      });
    }
  }, [basicForm.imageDataUrl]);

  useEffect(() => {
    if (isEqual(lastMetrics, metricsForm)) {
      setIsUnsavedChangesMetrics(false);
    } else {
      setIsUnsavedChangesMetrics(true);
    }

    setMetricsForm(metricsForm);
  }, [metricsForm]);

  useEffect(() => {
    console.log("About to load metrics");
    console.log("Metrics Form: ", metricsForm);
    console.log("Any data filled Form: ", anyDataFilled(metricsForm));
    console.log("isFirstLoaded metrics: ", isFirstLoadedMetrics);
    if (anyDataFilled(metricsForm) && isFirstLoadedMetrics) {
      console.log("Now loading metrics");
      const {
        minimumAmount,
        maximumAmount,
        insuranceFeePercentage,
        liquidityPercentage,
        penaltyPercentage,
        durations,
        percentages,
      } = metricsForm;

      if (minimumAmount) {
        validateNumber(minimumAmount, "isMinimumAmount");
      }
      if (maximumAmount) {
        validateNumber(maximumAmount, "isMaximumAmount");
      }
      if (insuranceFeePercentage) {
        validatePercentage(
          insuranceFeePercentage,
          minimumInsuranceFeePercentage,
          100,
          "isInsuranceFeePercentage"
        );
      }
      if (liquidityPercentage) {
        validatePercentage(
          liquidityPercentage,
          minimumLiquidityPercentage,
          100,
          "isLiquidityPercentage"
        );
      }
      if (penaltyPercentage) {
        validatePercentage(
          penaltyPercentage,
          minimumPenaltyPercentage,
          maximumPenaltyPercentage,
          "isPenaltyPercentage"
        );
      }

      setIsFirstLoadedMetrics(false);
    }
  }, [metricsForm]);

  const validateNumber = (value: string, isValidator: string) => {
    const positiveNumberPattern = /^\d*\.?\d+$/;
    if (!positiveNumberPattern.test(value) || Number(value) == 0) {
      setValidator((prevValidator: any) => {
        return { ...prevValidator, [isValidator]: false };
      });
    } else {
      setValidator((prevValidator: any) => {
        return { ...prevValidator, [isValidator]: true };
      });
    }
  };

  const validatePercentage = (
    value: string,
    min: number,
    max: number,
    isValidator: string
  ) => {
    const positiveNumberPattern = /^\d*\.?\d+$/;
    if (
      !positiveNumberPattern.test(value) ||
      Number(value) < min ||
      Number(value) > max
    ) {
      setValidator((prevValidator: any) => {
        return {
          ...prevValidator,
          [isValidator]: false,
        };
      });
    } else {
      setValidator((prevValidator: any) => {
        return {
          ...prevValidator,
          [isValidator]: true,
        };
      });
    }
  };

  const validateAddress = (value: string, isValidator: any) => {
    console.log("We are inside the validateAddress function");
    const standardAddressPattern = /^0x[0-9a-fA-F]{40}$/;
    if (!standardAddressPattern.test(value)) {
      setValidator((prevValidator: any) => {
        return { ...prevValidator, [isValidator]: false };
      });
    } else {
      setValidator((prevValidator: any) => {
        return { ...prevValidator, [isValidator]: true };
      });
    }
  };

  const validateNonEmpty = (value: string, isValidator: any) => {
    if (value == "") {
      setValidator((prevValidator: any) => {
        return { ...prevValidator, [isValidator]: false };
      });
    } else {
      setValidator((prevValidator: any) => {
        return { ...prevValidator, [isValidator]: true };
      });
    }
  };

  const validateDecimal = (value: string, isValidator: any) => {
    const positiveIntegerPattern = /^\d+$/;
    if (!positiveIntegerPattern.test(value)) {
      setValidator((prevValidator: any) => {
        return { ...prevValidator, [isValidator]: false };
      });
    } else {
      setValidator((prevValidator: any) => {
        return { ...prevValidator, [isValidator]: true };
      });
    }
  };

  const saveBasicToDataBase = async () => {
    const basicDetailsToStore = {
      ...basicForm,
    };
    // const tokenAddress = "";

    try {
      const response = await axios.post(
        `https://safu-finance-online.vercel.app/projects/${signerAddress}/${tokenAddress}/${0}`,
        basicDetailsToStore
      );

      console.log("Saved successfully", response.data);

      // Store of tokenAddress has already been filled
      if (basicForm.tokenAddress && tokenAddress != basicForm.tokenAddress) {
        console.log("BasicForm.tokenAddress: ", basicForm.tokenAddress);
        console.log("Token address: ", tokenAddress);
        const tokenResponse = await axios.post(
          `https://safu-finance-online.vercel.app/projects/${signerAddress}/${
            basicForm.tokenAddress
          }/${0}`,
          basicDetailsToStore
        );

        console.log("Basic form: ", tokenResponse.data);
      }

      const response2 = await axios.get(
        `https://safu-finance-online.vercel.app/projects/${signerAddress}/${tokenAddress}`
      );

      console.log("Response2.data", response2.data);
      const projectData = response2.data;
      if (projectData && projectData.length != 0) {
        const {
          basicDetails,
          profileDetails: profileData,
          tokenAddress: uniqueId,
        } = projectData[0];

        if (basicDetails) {
          const basic = basicDetails as IBasicForm;
          const neededBasicDetails = {
            tokenAddress: basic.tokenAddress,
            treasuryAddress: basic.treasuryAddress,
            tokenName: basic.tokenName,
            tokenSymbol: basic.tokenSymbol,
            tokenDecimal: basic.tokenDecimal,
            description: basic.description,
            imageDataUrl: basic.imageDataUrl,
          };

          setLastBasic(neededBasicDetails);
          setIsUnsavedChangesBasic(false);
        }
      }
    } catch (error) {
      console.error("Error posting data:", error);
    }
  };
  const saveProfileToDataBase = async () => {
    const dataToStore = {
      ...profileForm,
    };

    // const tokenAddress = "";

    try {
      const response = await axios.post(
        `https://safu-finance-online.vercel.app/projects/${signerAddress}/${tokenAddress}/${1}`,
        dataToStore
      );

      // Store of tokenAddress has already been filled
      if (basicForm.tokenAddress && tokenAddress != basicForm.tokenAddress) {
        const tokenResponse = await axios.post(
          `https://safu-finance-online.vercel.app/projects/${signerAddress}/${
            basicForm.tokenAddress
          }/${1}`,
          dataToStore
        );

        console.log("Basic form: ", tokenResponse.data);
      }

      console.log("Post request successful:", response.data);

      const response2 = await axios.get(
        `https://safu-finance-online.vercel.app/projects/${signerAddress}/${tokenAddress}`
      );

      const projectData = response2.data;
      if (projectData && projectData.length != 0) {
        const {
          basicDetails,
          profileDetails: profileData,
          tokenAddress: uniqueId,
        } = projectData[0];

        if (profileData) {
          const profile = profileData as IProfileForm;
          const neededProfile = {
            twitterHandle: profile.twitterHandle,
            telegramHandle: profile.telegramHandle,
            discordHandle: profile.discordHandle,
            websiteUrl: profile.websiteUrl,
          };

          console.log("Needed profile --->: ", neededProfile);

          setLastProfile(neededProfile);
          setIsUnsavedChangesProfile(false);
        }
      }
    } catch (error) {
      console.error("Error posting data:", error);
    }
  };

  const saveMetricsToDataBase = async () => {
    const dataToStore = {
      ...metricsForm,
    };

    try {
      const response = await axios.post(
        `https://safu-finance-online.vercel.app/projects/${signerAddress}/${tokenAddress}/${2}`,
        dataToStore
      );
      console.log("Post request successful:", response.data);

      // Store of tokenAddress has already been filled
      if (basicForm.tokenAddress && tokenAddress != basicForm.tokenAddress) {
        const tokenResponse = await axios.post(
          `https://safu-finance-online.vercel.app/projects/${signerAddress}/${
            basicForm.tokenAddress
          }/${2}`,
          dataToStore
        );

        console.log("Basic form: ", tokenResponse.data);
      }

      const response2 = await axios.get(
        `https://safu-finance-online.vercel.app/projects/${signerAddress}/${tokenAddress}`
      );

      const projectData = response2.data;
      if (projectData && projectData.length != 0) {
        const { metricsDetails } = projectData[0];

        if (metricsDetails) {
          setLastMetrics(metricsDetails);
          setIsUnsavedChangesMetrics(false);
        }
      }
    } catch (error) {
      console.error("Error posting data:", error);
    }
  };

  const approveToken = async () => {
    if (protocolDetails) {
      setCreateText(
        `Approving to withdraw ${ethers.formatUnits(
          protocolDetails.creationFee.toString(),
          18
        )} USDT`
      );

      try {
        const decimals = (await readContract({
          address: basicForm.tokenAddress as `0x${string}`,
          abi: erc20ABI,
          functionName: "decimals",
        })) as number;

        const approveRequest = await prepareWriteContract({
          address: usdtAddress as `0x${string}`,
          abi: erc20ABI,
          functionName: "approve",
          args: [diamondAddress, protocolDetails?.creationFee as bigint],
        });

        const { hash } = await writeContract(approveRequest);

        const approveReceipt = await waitForTransaction({
          hash,
        });

        console.log("Receipt: ", approveReceipt);
        if (approveReceipt.status == "success") {
          console.log("Approved");
          displayToast("success", `USDT has been approved`);
          setCreateText(`Creating Project`);
          return true;
        } else {
          console.log("Failure");
          displayToast("failure", `Failed to approve USDT`);
          setCreateText(`Create Project`);
          return false;
        }
      } catch (error) {
        console.log("Error: ", error);
        displayToast("failure", `Failed to approve USDT`);
        setCreateText(`Create Project`);

        return false;
      }
    }
  };

  const setStatusToPending = async () => {
    const newStatus = 0; // 0 means pending, 1 means approved, 2 means disapproved.

    const api = `https://safu-finance-online.vercel.app/projects/updateStatus/${signerAddress}/${basicForm.tokenAddress}/${newStatus}`;

    try {
      const response = await axios.post(api);

      console.log("Post request successful:", response.data);

      if (response.data) {
        console.log("Success");
      }
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const handleCreateProject = async () => {
    const validPercentages: number[] = metricsForm.percentages.map(
      (percentage: string) => {
        return Number(percentage) * 100;
      }
    );
    const validDurations: number[] = metricsForm.durations.map(
      (duration: string) => {
        return sDuration.days(Number(duration));
      }
    );

    // Create the project
    setIsCreating(true);
    setCreateText(`Creating Project`);

    try {
      // Upload image to IPFS
      setCreateText("Uploading Data");

      const logoUrl = basicForm.imageDataUrl;

      if (!logoUrl) {
        displayToast("failure", "Error encountered while uploading data..");
        return;
      }

      setCreateText("Creating Project");

      console.log("token address: ", basicForm.tokenAddress);

      const decimals = (await readContract({
        address: basicForm.tokenAddress as `0x${string}`,
        abi: erc20ABI,
        functionName: "decimals",
      })) as number;

      // Your USDT has to be approved first if it has not been approved before
      const allowance = (await readContract({
        address: usdtAddress as `0x${string}`,
        abi: erc20ABI,
        functionName: "allowance",
        args: [signerAddress as `0x${string}`, diamondAddress as `0x${string}`],
      })) as bigint;

      if (protocolDetails && allowance < BigInt(protocolDetails.creationFee)) {
        const result = await approveToken();

        if (!result) {
          return;
        }
      }

      const tokenToUsd = [basicForm.tokenAddress, wbnbAddress, usdtAddress];

      const createRequest = await prepareWriteContract({
        address: diamondAddress as `0x${string}`,
        abi: createFacetAbi,
        functionName: "createProject",
        args: [
          ethers.parseUnits(metricsForm.minimumAmount, decimals),
          ethers.parseUnits(metricsForm.maximumAmount, decimals),
          Number(metricsForm.insuranceFeePercentage) * 100,
          Number(metricsForm.liquidityPercentage) * 100,
          Number(metricsForm.penaltyPercentage) * 100,
          basicForm.tokenAddress,
          basicForm.treasuryAddress,
          pancakeswapRouter,
          usdtAddress,
          wbnbAddress,
          logoUrl,
          profileForm.discordHandle,
          profileForm.twitterHandle,
          profileForm.telegramHandle,
          profileForm.websiteUrl,
          // basicForm.tokenName,
          basicForm.description,
          // basicForm.tokenSymbol,
          // basicForm.tokenDecimal,
          validPercentages,
          validDurations,
        ],
      });

      const { hash } = await writeContract(createRequest);

      const createReceipt = await waitForTransaction({
        hash,
      });

      console.log("Receipt: ", createReceipt);
      if (createReceipt.status == "success") {
        // Update the data base status here
        await setStatusToPending();
        // displayToast("success", "Project has been created");
        setOpenSuccessModal(true);
      } else {
        console.log("Failure");
        console.log("Failed to Supply");
      }
    } catch (error) {
      console.log("Errorrrrr: ", error);

      displayToast("failure", "Failed to create");
      setIsCreating(false);
      setCreateText(`Create Project`);
    } finally {
      setIsCreating(false);
      setCreateText(`Create Project`);
    }
  };

  const isReadyToCreate = () => {
    if (validator) {
      const validatorArray = Object.values(validator);

      return (
        validatorArray.every((value) => value === true) &&
        validatorArray.length == validatorLength
      );
    } else {
      return false;
    }
  };

  console.log("Is ready to create: ", isReadyToCreate());
  return (
    <div className="">
      <div className="relative mt-6 mx-5">
        <div className="flex justify-around">
          <div
            className={`z-10 w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center rounded-full cursor-pointer hover:scale-105 ${
              currentStep == 0
                ? "bg-theme-1 text-white"
                : "bg-gray-300 text-gray-800"
            }`}
            onClick={() => {
              console.log("Last prooooooooooo:", lastSaved[currentStep]);
              console.log("Current proooooooooo:", currentForm[currentStep]);
              if (!isEqual(lastSaved[currentStep], currentForm[currentStep])) {
                setButtonModalPreview(true);
                setFormSelected(0);
              } else {
                if (currentStep != 0) {
                  setCurrentStep(0);
                  localStorage.setItem("currentStep", String(0));
                }
              }
            }}
          >
            1
          </div>
          <div
            className={`z-10 w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center rounded-full cursor-pointer hover:scale-105 ${
              currentStep == 1
                ? "bg-theme-1 text-white"
                : "bg-gray-300 text-gray-800"
            }`}
            onClick={() => {
              // Make sure they save first before anything happens
              if (!isEqual(lastSaved[currentStep], currentForm[currentStep])) {
                setButtonModalPreview(true);
                setFormSelected(1);
              } else {
                if (currentStep != 1) {
                  setCurrentStep(1);
                  localStorage.setItem("selectedPage", String(1));
                }
              }
            }}
          >
            2
          </div>
          <div
            className={`z-10 w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center rounded-full cursor-pointer hover:scale-105 ${
              currentStep === 2
                ? "bg-theme-1 text-white"
                : "bg-gray-300 text-gray-800"
            }`}
            onClick={() => {
              if (!isEqual(lastSaved[currentStep], currentForm[currentStep])) {
                setButtonModalPreview(true);
                setFormSelected(2);
              } else {
                if (currentStep != 2) {
                  setCurrentStep(2);
                  localStorage.setItem("selectedPage", String(2));
                }
              }
            }}
          >
            3
          </div>
        </div>
        <div className="absolute top-5 sm:top-6 left-0 right-0 h-0.5 bg-gray-200"></div>
      </div>

      {currentStep == 0 && (
        <div>
          <BasicStep />
          <div className="py-4">
            <BasicForm
              basicForm={basicForm}
              setBasicForm={setBasicForm}
              validator={validator}
              setValidator={setValidator}
              validateAddress={validateAddress}
              validateNonEmpty={validateNonEmpty}
              validateDecimal={validateDecimal}
            />
          </div>
        </div>
      )}
      {currentStep == 1 && (
        <div>
          <ProfileStep />
          <div className="py-4">
            <ProfileForm
              profileForm={profileForm}
              setProfileForm={setProfileForm}
              validator={validator}
              setValidator={setValidator}
            />
          </div>
        </div>
      )}
      {currentStep == 2 && (
        <div>
          <MetricStep />
          <div className="py-4">
            <MetricsForm
              metricsForm={metricsForm}
              setMetricsForm={setMetricsForm}
              validator={validator}
              setValidator={setValidator}
              validateNumber={validateNumber}
              validatePercentage={validatePercentage}
            />
          </div>
        </div>
      )}

      <div className="w-full flex justify-center space-x-6">
        {(currentStep == 0 && isUnsavedChangesBasic) ||
        (currentStep == 1 && isUnsavedChangesProfile) ||
        (currentStep == 2 && isUnsavedChangesMetrics) ? (
          <div>
            <button
              className="w-[200px] text-xl py-3  bg-gray-300 rounded-md flex space-x-4 justify-center items-center hover:scale-105"
              onClick={async () => {
                console.log("We are here right now");
                setIsSavingChanges(true);
                try {
                  if (currentStep == 0) {
                    await saveBasicToDataBase();
                    // setIsSavingChanges(false);
                  } else if (currentStep == 1) {
                    await saveProfileToDataBase();
                    // setIsSavingChanges(false);
                  } else if (currentStep == 2) {
                    await saveMetricsToDataBase();
                    // setIsSavingChanges(false);
                  }
                } catch (error) {
                  console.log("Failed to save: ", error);
                } finally {
                  setIsSavingChanges(false);
                }
              }}
            >
              <p className={`${isSavingChanges ? "opacity-50" : ""}`}>
                {isSavingChanges ? "Saving Changes" : "Save Changes"}
              </p>
            </button>
          </div>
        ) : (
          <div>
            {currentStep != 2 ? (
              <div className="flex space-x-4">
                <button
                  className="w-[200px] text-xl py-3 border text-theme-2 bg-theme-1/40 flex space-x-4 justify-center items-center hover:scale-105"
                  onClick={() => {
                    if (currentStep == 0) {
                      setCurrentStep(currentStep);
                      localStorage.setItem(
                        "selectedPage",
                        currentStep.toString()
                      );
                    } else {
                      setCurrentStep(currentStep - 1);
                      localStorage.setItem(
                        "selectedPage",
                        String(currentStep - 1)
                      );
                    }
                  }}
                >
                  <MoveLeft />
                  <p>Previous</p>
                </button>
                <button
                  className="w-[200px] text-xl py-3 border text-white bg-theme-1 flex space-x-4 justify-center items-center hover:scale-105"
                  onClick={() => {
                    if (currentStep == 2) {
                      setCurrentStep(currentStep);
                      localStorage.setItem(
                        "selectedPage",
                        currentStep.toString()
                      );
                    } else {
                      setCurrentStep(currentStep + 1);
                      localStorage.setItem(
                        "selectedPage",
                        String(currentStep + 1)
                      );
                    }
                  }}
                >
                  <p>Next</p>
                  <MoveRight />
                </button>
              </div>
            ) : (
              <div>
                {protocolDetails && (
                  <div className="p-2 bg-theme-1/10 rounded-md text-xl w-[500px] my-4">
                    <p>Important Note</p>
                    <ul className="list-inside list-decimal space-y-3 mt-2">
                      <li>
                        {inDollarFormat(
                          Number(
                            ethers.formatUnits(
                              protocolDetails.creationFee.toString(),
                              18
                            )
                          )
                        )}{" "}
                        USDT is required to create a project
                      </li>
                      <li>
                        Make sure that all input fields are properly filled
                      </li>
                    </ul>

                    {/* <p className="text-base">
                      1.{"   "}
                      {inDollarFormat(
                        Number(
                          ethers.formatUnits(
                            protocolDetails.creationFee.toString(),
                            18
                          )
                        )
                      )}{" "}
                      USDT is required to create a project <br />
                    </p> */}
                  </div>
                )}

                <button
                  disabled={isCreating || !isReadyToCreate()}
                  onClick={handleCreateProject}
                  className={`disabled:opacity-50 disabled:cursor-not-allowed w-full bg-theme-1 p-2 text-xl text-white`}
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
                  {/*  */}
                </button>

                {/* <button
                  className="w-[200px] text-xl py-3 border text-white bg-theme-1 flex space-x-4 justify-center items-center hover:scale-105"
                  onClick={() => {}}
                >
                  <p>Create Project</p>
                </button> */}
              </div>
            )}
          </div>
        )}

        {/* BEGIN: Modal Save Changes Content */}
        <Dialog
          open={buttonModalPreview}
          onClose={() => {
            setButtonModalPreview(false);
          }}
        >
          <Dialog.Panel>
            <a
              onClick={(event: React.MouseEvent) => {
                event.preventDefault();
                setButtonModalPreview(false);
              }}
              className="absolute top-0 right-0 mt-3 mr-3"
              href="#"
            >
              <Lucide icon="X" className="w-8 h-8 text-slate-400" />
            </a>
            <div className="p-5 text-center">
              {/* <Lucide
                icon="CheckCircle"
                className="w-16 h-16 mx-auto mt-3 text-success"
              /> */}
              <h1 className="text-xl font-medium">You have unsaved changes</h1>
              <div className="mt-12 text-slate-500 text-base">
                If you continue, you'll lose any unsaved changes. To save all
                your changes, go back and hit Save.
              </div>
            </div>
            <div className="px-5 pb-8 text-center">
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  setCurrentStep(formSelected);
                  setButtonModalPreview(false);
                }}
                className="w-full text-base"
              >
                Just Continue
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setCurrentStep(currentStep);
                  setButtonModalPreview(false);
                }}
                className="w-full text-base mt-4"
              >
                Go back and hit save
              </Button>
            </div>
          </Dialog.Panel>
        </Dialog>
        {/* END: Modal Save Changes Content */}

        {/* BEGIN: Modal Project Created Content */}
        <Dialog
          open={openSuccessModal}
          onClose={() => {
            setOpenSuccessModal(false);
          }}
        >
          <Dialog.Panel>
            <div className="p-5 text-center">
              <Lucide
                icon="CheckCircle2"
                className="w-16 h-16 mx-auto mt-3 text-theme-1"
              />
              <div className="mt-5 text-3xl">Congrats</div>
              <div className="mt-2 text-slate-500">
                <p className="text-sm">
                  Project has been created. Wait for admin's approval
                </p>
              </div>
            </div>
            <div className="px-5 pb-8 text-center">
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  setOpenSuccessModal(false);
                }}
                className="w-24"
              >
                Ok
              </Button>
            </div>
            <div className="p-5 text-center border-t border-slate-200/60 dark:border-darkmode-400">
              <a href={`/status`} className="text-primary">
                Check Project Status
              </a>
            </div>
          </Dialog.Panel>
        </Dialog>
        {/* END: Modal Project Created Content */}
      </div>
    </div>
  );
}
