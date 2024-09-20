// import { ethers } from "ethers";
// import React from "react";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

import { Error } from "../types/general";
import { erc20ABI } from "wagmi";
import { serializeBigInt } from "../utils/helper";
import { serialize } from "v8";

export interface Balance {
  decimals: number;
  formatted: string;
  symbol: string;
  value: string;
}

interface WalletState {
  signerAddress: string;
  chainId: number | undefined;
  balance: Balance | null;
}

const initialState: WalletState = {
  signerAddress: "",
  chainId: 0,
  balance: null,
};

export const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(
        loadSignerAddress.fulfilled,
        (state, action: PayloadAction<any>) => {
          console.log("Action::::: ", action);
          state.signerAddress = action.payload;
        }
      )
      .addCase(loadChainId.fulfilled, (state, action) => {
        state.chainId = action.payload;
      })
      .addCase(loadBalance.fulfilled, (state, action) => {
        state.balance = action.payload;
      });
  },
});

export const loadSignerAddress = createAsyncThunk(
  "wallet/loadSignerAddress",
  async (_, thunkAPI) => {
    try {
      const account = await getAccount();

      const signerAddress = account.address;

      return signerAddress;
    } catch (error) {
      // Handle errors here, e.g., dispatch an error action
      const typedError = error as Error;
      return thunkAPI.rejectWithValue(typedError.message);
    }
  }
);
export const loadChainId = createAsyncThunk(
  "wallet/loadChainId",
  async (_, thunkAPI) => {
    try {
      const { chain, chains } = await getNetwork();

      const chainId = chain && chain.id;

      return chainId;
    } catch (error) {
      // Handle errors here, e.g., dispatch an error action
      const typedError = error as Error;
      return thunkAPI.rejectWithValue(typedError.message);
    }
  }
);

export const loadBalance = createAsyncThunk(
  "wallet/loadBalance",
  async (signerAddress: `0x${string}`, thunkAPI) => {
    try {
      const balance = await fetchBalance({
        address: signerAddress,
      });

      const serialized = serializeBigInt(balance) as Balance;
      return serialized;
    } catch (error) {
      // Handle errors here, e.g., dispatch an error action
      const typedError = error as Error;
      return thunkAPI.rejectWithValue(typedError.message);
    }
  }
);

export const {} = walletSlice.actions;

export default walletSlice.reducer;
