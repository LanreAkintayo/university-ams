// import { ethers } from "ethers";
// import React from "react";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";
import axios from "axios";

import {
  Error,
  Product
} from "../types/general";


interface InsuranceState {
  allProducts: any[] | null;
}

const initialState: InsuranceState = {
  allProducts: null,
};

export const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(
        loadAllProducts.fulfilled,
        (state, action: PayloadAction<string[]>) => {
          state.allProducts = action.payload;
        }
      )
  }
});

export const loadAllProducts = createAsyncThunk(
  "insurance/loadAllProducts",
  async (_, thunkAPI) => {
    try {
      const allProducts = await getAllProducts();

      return allProducts;
    } catch (error) {
      const typedError = error as Error;
      return thunkAPI.rejectWithValue(typedError.message);
    }
  }
);



export const getAllProducts = async () => {
  try {
    const response = await axios.get("http://localhost:3000/api/products/all-products");
    console.log("Reponse.data: ", response.data)
    return response.data
  } catch (error) {
    console.log("Error fetching products: ", error);
  }
};

export const {} = productsSlice.actions;

export default productsSlice.reducer;
