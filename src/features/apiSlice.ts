import { BACKEND_URL } from "@/constants";
import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/v1/",
  }),
  tagTypes: ["Organisation", "Voter", "Junior Admin"],
  endpoints: () => ({}),
});
