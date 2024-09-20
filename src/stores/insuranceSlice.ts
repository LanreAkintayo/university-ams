// import { ethers } from "ethers";
// import React from "react";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

import {
  Error,
  InsuranceInvestment,
  LiquidityProvider,
  Metrics,
  PlatformAddresses,
  ProjectInfo,
  ProtocolDetails,
} from "../types/general";
import { erc20ABI } from "wagmi";
import { serializeBigInt } from "../utils/helper";
import { serialize } from "v8";
import {
  diamondAddress,
  getterFacetAbi,
  SUPPORTED_CHAIN_ID,
} from "../contracts";

export interface Balance {
  decimals: number;
  formatted: string;
  symbol: string;
  value: string;
}

interface InsuranceState {
  investorInvestments: InsuranceInvestment[] | null;
  investorTotalInvested: string | null;
  allProjects: string[] | null;
  pendingProjects: string[] | null;
  disapprovedProjects: string[] | null;
  allInvestors: string[] | null;
  projectMetrics: Metrics | null;
  protocolDetails: ProtocolDetails | null;
  rewardDurations: string[] | null;
  rewardPercentages: string[] | null;
  tokenToUsdPath: string[] | null;
  projectPlatformAddresses: PlatformAddresses | null;
  projectInfo: ProjectInfo | null;
  projectPendingInvestments: InsuranceInvestment[] | null;
  liquidityProviders: LiquidityProvider[] | null;
}

const initialState: InsuranceState = {
  investorInvestments: null,
  investorTotalInvested: null,
  allProjects: null,
  pendingProjects: null,
  disapprovedProjects: null,
  allInvestors: null,
  projectMetrics: null,
  protocolDetails: null,
  rewardDurations: null,
  rewardPercentages: null,
  tokenToUsdPath: null,
  projectPlatformAddresses: null,
  projectInfo: null,
  projectPendingInvestments: null,
  liquidityProviders: null,
};

export const insuranceSlice = createSlice({
  name: "insurance",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(
        loadAllProjects.fulfilled,
        (state, action: PayloadAction<string[]>) => {
          state.allProjects = action.payload;
        }
      )
      .addCase(
        loadPendingProjects.fulfilled,
        (state, action: PayloadAction<string[]>) => {
          state.pendingProjects = action.payload;
        }
      )
      .addCase(
        loadDisapprovedProjects.fulfilled,
        (state, action: PayloadAction<string[]>) => {
          state.disapprovedProjects = action.payload;
        }
      )
      .addCase(
        loadProtocolDetails.fulfilled,
        (state, action: PayloadAction<ProtocolDetails>) => {
          state.protocolDetails = action.payload;
        }
      )
      .addCase(
        loadAllInvestors.fulfilled,
        (state, action: PayloadAction<string[]>) => {
          state.allInvestors = action.payload;
        }
      )
      .addCase(
        loadProjectMetrics.fulfilled,
        (state, action: PayloadAction<Metrics>) => {
          state.projectMetrics = action.payload;
        }
      )
      .addCase(
        loadRewardDurations.fulfilled,
        (state, action: PayloadAction<string[]>) => {
          state.rewardDurations = action.payload;
        }
      )
      .addCase(
        loadRewardPercentages.fulfilled,
        (state, action: PayloadAction<string[]>) => {
          state.rewardPercentages = action.payload;
        }
      )
      .addCase(
        loadTokenToUsdPath.fulfilled,
        (state, action: PayloadAction<string[]>) => {
          state.tokenToUsdPath = action.payload;
        }
      )
      .addCase(
        loadProjectPlatformAddresses.fulfilled,
        (state, action: PayloadAction<PlatformAddresses>) => {
          state.projectPlatformAddresses = action.payload;
        }
      )
      .addCase(
        loadProjectInfo.fulfilled,
        (state, action: PayloadAction<ProjectInfo>) => {
          state.projectInfo = action.payload;
        }
      )
      .addCase(
        loadProjectPendingInvestments.fulfilled,
        (state, action: PayloadAction<InsuranceInvestment[]>) => {
          state.projectPendingInvestments = action.payload;
        }
      )
      .addCase(
        loadLiquidityProviders.fulfilled,
        (state, action: PayloadAction<LiquidityProvider[]>) => {
          state.liquidityProviders = action.payload;
        }
      )

      .addCase(
        loadInvestorTotalInvested.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.investorTotalInvested = action.payload;
        }
      )
      .addCase(
        loadInvestorInvestments.fulfilled,
        (state, action: PayloadAction<InsuranceInvestment[]>) => {
          state.investorInvestments = action.payload;
        }
      );
  },
});

export const loadAllProjects = createAsyncThunk(
  "insurance/loadAllProjects",
  async (_, thunkAPI) => {
    try {
      const allProjects = (await readContract({
        address: diamondAddress,
        abi: getterFacetAbi,
        functionName: "getAllProjects",
        chainId: SUPPORTED_CHAIN_ID,
      })) as string[];

      return allProjects;
    } catch (error) {
      const typedError = error as Error;
      return thunkAPI.rejectWithValue(typedError.message);
    }
  }
);

export const loadPendingProjects = createAsyncThunk(
  "insurance/loadPendingProjects",
  async (_, thunkAPI) => {
    try {
      const pendingProjects = (await readContract({
        address: diamondAddress,
        abi: getterFacetAbi,
        functionName: "getPendingProjects",
        chainId: SUPPORTED_CHAIN_ID,
      })) as string[];

      return pendingProjects;
    } catch (error) {
      const typedError = error as Error;
      return thunkAPI.rejectWithValue(typedError.message);
    }
  }
);

export const loadDisapprovedProjects = createAsyncThunk(
  "insurance/loadDisapprovedProjects",
  async (_, thunkAPI) => {
    try {
      const disapprovedProjects = (await readContract({
        address: diamondAddress,
        abi: getterFacetAbi,
        functionName: "getDisapprovedProjects",
        chainId: SUPPORTED_CHAIN_ID,
      })) as string[];

      return disapprovedProjects;
    } catch (error) {
      const typedError = error as Error;
      return thunkAPI.rejectWithValue(typedError.message);
    }
  }
);

export const loadProtocolDetails = createAsyncThunk(
  "insurance/loadProtocolDetails",
  async (_, thunkAPI) => {
    try {
      const protocolDetails = (await readContract({
        address: diamondAddress,
        abi: getterFacetAbi,
        functionName: "getProtocolDetails",
        chainId: SUPPORTED_CHAIN_ID,
      })) as ProtocolDetails;

      const serialized = serializeBigInt(protocolDetails);

      return serializeBigInt(protocolDetails);
    } catch (error) {
      const typedError = error as Error;
      return thunkAPI.rejectWithValue(typedError.message);
    }
  }
);
export const loadAllInvestors = createAsyncThunk(
  "insurance/loadAllInvestors",
  async (projectId: string, thunkAPI) => {
    try {
      const allInvestors = (await readContract({
        address: diamondAddress,
        abi: getterFacetAbi,
        functionName: "getAllInvestors",
        args: [projectId],
        chainId: SUPPORTED_CHAIN_ID,
      })) as string[];

      return allInvestors;
    } catch (error) {
      const typedError = error as Error;
      return thunkAPI.rejectWithValue(typedError.message);
    }
  }
);

export const loadProjectMetrics = createAsyncThunk(
  "insurance/loadProjectMetrics",
  async (projectId: string, thunkAPI) => {
    try {
      return getProjectMetrics(projectId);
    } catch (error) {
      const typedError = error as Error;
      return thunkAPI.rejectWithValue(typedError.message);
    }
  }
);

export const loadRewardDurations = createAsyncThunk(
  "insurance/loadRewardDurations",
  async (projectId: string, thunkAPI) => {
    try {
      const rewardDurations = (await readContract({
        address: diamondAddress,
        abi: getterFacetAbi,
        functionName: "getRewardDurations",
        args: [projectId],
        chainId: SUPPORTED_CHAIN_ID,
      })) as bigint[];

      return rewardDurations.map((duration) => duration.toString());
    } catch (error) {
      const typedError = error as Error;
      return thunkAPI.rejectWithValue(typedError.message);
    }
  }
);

export const loadRewardPercentages = createAsyncThunk(
  "insurance/loadRewardPercentages",
  async (projectId: string, thunkAPI) => {
    try {
      const rewardPercentages = (await readContract({
        address: diamondAddress,
        abi: getterFacetAbi,
        functionName: "getRewardPercentages",
        args: [projectId],
        chainId: SUPPORTED_CHAIN_ID,
      })) as bigint[];

      return rewardPercentages.map((percentage) => percentage.toString());
    } catch (error) {
      const typedError = error as Error;
      return thunkAPI.rejectWithValue(typedError.message);
    }
  }
);

export const loadTokenToUsdPath = createAsyncThunk(
  "insurance/loadTokenToUsdPath",
  async (projectId: string, thunkAPI) => {
    try {
      const tokenToUsdPath = await getTokenToUsdPath(projectId);

      return tokenToUsdPath;
    } catch (error) {
      const typedError = error as Error;
      return thunkAPI.rejectWithValue(typedError.message);
    }
  }
);

export const loadProjectPlatformAddresses = createAsyncThunk(
  "insurance/loadProjectPlatformAddresses",
  async (projectId: string, thunkAPI) => {
    try {
      const projectPlatformAddresses = (await getProjectPlatformAddresses(
        projectId
      )) as PlatformAddresses;

      return projectPlatformAddresses;
    } catch (error) {
      const typedError = error as Error;
      return thunkAPI.rejectWithValue(typedError.message);
    }
  }
);

export const loadProjectInfo = createAsyncThunk(
  "insurance/loadProjectInfo",
  async (projectId: string, thunkAPI) => {
    try {
      return getProjectInfo(projectId);
    } catch (error) {
      const typedError = error as Error;
      return thunkAPI.rejectWithValue(typedError.message);
    }
  }
);

export const loadProjectPendingInvestments = createAsyncThunk(
  "insurance/loadProjectPendingInvestments",
  async (projectId: string, thunkAPI) => {
    try {
      const projectPendingInvestments = (await readContract({
        address: diamondAddress,
        abi: getterFacetAbi,
        functionName: "getPendingInvestments",
        args: [projectId],
        chainId: SUPPORTED_CHAIN_ID,
      })) as InsuranceInvestment[];

      return projectPendingInvestments.map((investment) =>
        serializeBigInt(investment)
      );
    } catch (error) {
      const typedError = error as Error;
      return thunkAPI.rejectWithValue(typedError.message);
    }
  }
);

export const loadLiquidityProviders = createAsyncThunk(
  "insurance/loadLiquidityProviders",
  async (projectId: string, thunkAPI) => {
    try {
      return getLiquidityProviders(projectId);
    } catch (error) {
      const typedError = error as Error;
      return thunkAPI.rejectWithValue(typedError.message);
    }
  }
);

export const loadInvestorTotalInvested = createAsyncThunk(
  "insurance/loadInvestorTotalInvested",
  async (
    {
      projectId,
      investorAddress,
    }: { projectId: string; investorAddress: string },
    thunkAPI
  ) => {
    try {
      const investorTotalInvested = (await readContract({
        address: diamondAddress,
        abi: getterFacetAbi,
        functionName: "getInvestorTotalInvested",
        args: [projectId, investorAddress],
      })) as bigint;

      return investorTotalInvested.toString();
    } catch (error) {
      const typedError = error as Error;
      return thunkAPI.rejectWithValue(typedError.message);
    }
  }
);

export const loadInvestorInvestments = createAsyncThunk(
  "insurance/loadInvestorInvestments",
  async (
    {
      projectId,
      investorAddress,
    }: { projectId: string; investorAddress: string },
    thunkAPI
  ) => {
    try {
      const investorInvestments = (await readContract({
        address: diamondAddress,
        abi: getterFacetAbi,
        functionName: "getAllInvestments",
        args: [projectId, investorAddress],
      })) as InsuranceInvestment[];

      return investorInvestments.map((insuranceInvestment) =>
        serializeBigInt(insuranceInvestment)
      );
    } catch (error) {
      const typedError = error as Error;
      return thunkAPI.rejectWithValue(typedError.message);
    }
  }
);

export const getLiquidityProviders = async (projectId: string) => {
  const liquidityProviders = (await readContract({
    address: diamondAddress,
    abi: getterFacetAbi,
    functionName: "getProjectLiquidityProviders",
    args: [projectId],
    chainId: SUPPORTED_CHAIN_ID,
  })) as LiquidityProvider[];

  return liquidityProviders.map((provider) => serializeBigInt(provider));
};
export const getProjectMetrics = async (projectId: string) => {
  const projectMetrics = (await readContract({
    address: diamondAddress,
    abi: getterFacetAbi,
    functionName: "getProjectMetrics",
    args: [projectId],
    chainId: SUPPORTED_CHAIN_ID,
  })) as Metrics;

  return serializeBigInt(projectMetrics);
};

export const getProjectInfo = async (projectId: string) => {
  const projectInfo = (await readContract({
    address: diamondAddress,
    abi: getterFacetAbi,
    functionName: "getProjectInfo",
    args: [projectId],
    chainId: SUPPORTED_CHAIN_ID,
  })) as ProjectInfo;

  return projectInfo;
};

export const getTokenToUsdPath = async (projectId: string) => {
  const tokenToUsdPath = (await readContract({
    address: diamondAddress,
    abi: getterFacetAbi,
    functionName: "getTokenToUsdPath",
    args: [projectId],
    chainId: SUPPORTED_CHAIN_ID,
  })) as string[];

  return tokenToUsdPath;
};

export const getRewardDurations = async (projectId: string) => {
  const rewardDurations = (await readContract({
    address: diamondAddress,
    abi: getterFacetAbi,
    functionName: "getRewardDurations",
    args: [projectId],
    chainId: SUPPORTED_CHAIN_ID,
  })) as bigint[];

  return rewardDurations.map((duration) => duration.toString());
};

export const getRewardPercentages = async (projectId: string) => {
  const rewardPercentages = (await readContract({
    address: diamondAddress,
    abi: getterFacetAbi,
    functionName: "getRewardPercentages",
    args: [projectId],
    chainId: SUPPORTED_CHAIN_ID,
  })) as bigint[];

  return rewardPercentages.map((percentage) => percentage.toString());
};

export const getProjectPlatformAddresses = async (projectId: string) => {
  const projectPlatformAddresses = (await readContract({
    address: diamondAddress,
    abi: getterFacetAbi,
    functionName: "getProjectPlatformAddresses",
    args: [projectId],
    chainId: SUPPORTED_CHAIN_ID,
  })) as PlatformAddresses;

  return projectPlatformAddresses;
};

export const {} = insuranceSlice.actions;

export default insuranceSlice.reducer;
