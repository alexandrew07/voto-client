import { apiSlice } from "./apiSlice";

export const organisationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createCandidate: builder.mutation({
      query: ({ payload, id }) => ({
        url: `/candidates/${id}`,
        method: "POST",
        body: payload,
        credentials: "include",
      }),
    }),

    verifyAccountNumber: builder.mutation({
      query: (data) => ({
        url: `/payments/validate-account`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),

    updateCandidate: builder.mutation({
      query: (data) => ({
        url: `/candidates/${data._id}`,
        method: "PATCH",
        body: data.payload,
        credentials: "include",
      }),
    }),

    importCandidates: builder.mutation({
      query: ({ file, id }) => ({
        url: `/candidates/${id}/import`,
        method: "POST",
        body: file,
        credentials: "include",
      }),
    }),

    getCandidate: builder.mutation({
      query: (id) => ({
        url: `/candidates/${id}`,
        method: "GET",
        credentials: "include",
      }),
    }),

    getCandidates: builder.mutation<
      { data: any },
      { no?: number; limit?: number; filterBy?: string; filterValue?: string }
    >({
      query: ({ no = 1, limit = 50, filterBy, filterValue }) => {
        let _url = `/candidates?page=${no}&limit=${limit}`;

        if (filterBy && filterValue) {
          _url += `&${filterBy}=${filterValue}`;
        }

        return {
          url: _url,
          method: "GET",
          credentials: "include",
        };
      },
    }),

    deleteCandidate: builder.mutation({
      query: (id) => ({
        url: `/candidates/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
    }),

    getOrganisation: builder.mutation({
      query: (id) => ({
        url: `/organisations/${id}`,
        method: "GET",
        credentials: "include",
      }),
    }),

    getStats: builder.mutation<{ data: any }, void>({
      query: () => ({
        url: "/organisations/stats",
        method: "GET",
        credentials: "include",
      }),
    }),

    withdraw: builder.mutation({
      query: (data) => ({
        url: "/payments/transfer",
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),

    updateOrganisation: builder.mutation({
      query: (payload) => ({
        url: `/organisations/${payload.id}`,
        method: "PATCH",
        body: payload.data,
        credentials: "include",
      }),
    }),

    updateExternalRegistration: builder.mutation({
      query: (payload) => ({
        url: `/organisations/${payload.id}/update-external-registration`,
        method: "PATCH",
        body: payload.data,
        credentials: "include",
      }),
    }),
  }),
});

export const {
  useCreateCandidateMutation,
  useUpdateCandidateMutation,
  useGetCandidatesMutation,
  useGetCandidateMutation,
  useGetOrganisationMutation,
  useGetStatsMutation,
  useWithdrawMutation,
  useUpdateOrganisationMutation,
  useDeleteCandidateMutation,
  useUpdateExternalRegistrationMutation,
  useVerifyAccountNumberMutation,
  useImportCandidatesMutation,
} = organisationApi;
