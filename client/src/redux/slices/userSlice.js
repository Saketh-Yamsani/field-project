import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk for user login
export const userLoginThunk = createAsyncThunk(
  "user/login",
  async (userCred, { rejectWithValue }) => {
    try {
      const response = await axios.post("http://localhost:5000/faculty-api/login", userCred);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk for user registration
export const userRegisterThunk = createAsyncThunk(
  "user/register",
  async (userObj, { rejectWithValue }) => {
    try {
      const response = await axios.post("http://localhost:5000/faculty-api/users", userObj);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  currentUser: null,
  isPending: false,
  loginUserStatus: false,
  registerUserStatus: false,
  errorOccurred: false,
  errMsg: "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      state.currentUser = null;
      state.loginUserStatus = false;
      state.registerUserStatus = false;
      state.errorOccurred = false;
      state.errMsg = "";
    },
  },
  extraReducers: (builder) => {
    // Login user
    builder
      .addCase(userLoginThunk.pending, (state) => {
        state.isPending = true;
        state.errorOccurred = false;
        state.errMsg = "";
      })
      .addCase(userLoginThunk.fulfilled, (state, action) => {
        state.isPending = false;
        state.loginUserStatus = true;
        state.currentUser = action.payload.user;
      })
      .addCase(userLoginThunk.rejected, (state, action) => {
        state.isPending = false;
        state.errorOccurred = true;
        state.errMsg = action.payload.message;
      });

    // Register user
    builder
      .addCase(userRegisterThunk.pending, (state) => {
        state.isPending = true;
        state.errorOccurred = false;
        state.errMsg = "";
      })
      .addCase(userRegisterThunk.fulfilled, (state, action) => {
        state.isPending = false;
        state.registerUserStatus = true;
        state.errorOccurred = false;
        state.errMsg = "";
      })
      .addCase(userRegisterThunk.rejected, (state, action) => {
        state.isPending = false;
        state.errorOccurred = true;
        state.errMsg = action.payload.message;
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
