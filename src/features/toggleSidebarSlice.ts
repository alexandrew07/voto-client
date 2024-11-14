import { createSlice } from "@reduxjs/toolkit";

export interface ToggleSidebarState {
  value: boolean;
}

const initialState: ToggleSidebarState = {
  value: true,
};

export const toggleSidebarSlice = createSlice({
  name: "toggleSidebar",
  initialState,
  reducers: {
    open: (state) => {
      state.value = true;
    },
    close: (state) => {
      state.value = false;
    },
  },
});

export const { open, close } = toggleSidebarSlice.actions;

export default toggleSidebarSlice.reducer;
