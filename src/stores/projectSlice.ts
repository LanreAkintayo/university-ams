import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

interface Project {
  allProjects: any;
}

const initialState: Project = {
  allProjects: [{name: "", surname: ""}],
};



export const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    updateAllProjects: (state, action: PayloadAction<any>) => {
      state.allProjects = action.payload;
    },
  }
//   extraReducers: (builder) => {
//     builder
//       .addCase(getAllProjects.pending, () => {
//         console.log("incrementAsync.pending");
//       })
//       .addCase(
//         getAllProjects.fulfilled,
//         (state, action: PayloadAction<any[]>) => {
//           state.allProjects = action.payload;
//         }
//       );
//   },
});

// export const getAllProjects = createAsyncThunk("getAllProjects", async () => {
//     const result = await [{ name: "LanreAsync", surname: "AkintayoAsync" }];
//     return result;
// })

export const { updateAllProjects } = projectSlice.actions;


export default projectSlice.reducer;
