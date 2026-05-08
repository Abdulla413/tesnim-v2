// src/features/auth/authSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "./authService";
import type { AuthData } from "./authType";

// Get user from localStorage
const user = JSON.parse(localStorage.getItem("user") || "null");

const initialState = {
  user: user || null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

// Register
export const register = createAsyncThunk("auth/register", async (userData: AuthData, thunkAPI) => {
  try {
    return await authService.register(userData);
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || "Registration failed");
  }
});

// Login
export const login = createAsyncThunk("auth/login", async (userData: AuthData, thunkAPI) => {
  try {
    return await authService.login(userData);
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || "Login failed");
  }
});

// Logout
export const logout = createAsyncThunk("auth/logout", async () => {
  await authService.logout();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
        state.user = null;
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
        state.user = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;
