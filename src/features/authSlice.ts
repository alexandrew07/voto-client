import { createSlice } from "@reduxjs/toolkit";

export type Organisation = {
  email: string;
  candidatesFields: string[];
  createdAt: string;
  logoUrl: string;
  externalRegistration: boolean;
  organisationName: string;
  subscriptionPlan: string;
  role: string;
  slogan: string;
  title: string;
  updatedAt: string;
  votersCount: number;
  votersFields: string[];
  wallet: number;
  votesRemaining: number;
  _id: string;
};

export type Voter = {
  details: {};
  email: string;
  username: string;
  gender: string;
  name: string;
  organisation: string;
  role: string;
  _id: string;
};

export interface AuthState {
  user: Organisation | Voter | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    // setIsAuthenticated: (state, action) => {
    //   state.isAuthenticated = action.payload;
    // },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;
