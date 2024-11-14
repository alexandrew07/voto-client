import { apiSlice } from "./apiSlice";

export const electionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createElection: builder.mutation({
      query: (data) => ({
        url: "/elections",
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),

    getElections: builder.mutation<
      { data: any },
      { no?: number; limit?: number }
    >({
      query: ({ no = 1, limit = 10 }) => ({
        url: `/elections?page=${no}&limit=${limit}`,
        method: "GET",
        credentials: "include",
      }),
    }),

    getElection: builder.mutation({
      query: (id) => ({
        url: `/elections/${id}`,
        method: "GET",
        credentials: "include",
      }),
    }),

    editElection: builder.mutation({
      query: ({ data, id }) => ({
        url: `/elections/${id}`,
        method: "PATCH",
        credentials: "include",
        body: data,
      }),
    }),

    deleteElection: builder.mutation({
      query: (id) => ({
        url: `/elections/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
    }),

    startElection: builder.mutation({
      query: (id) => ({
        url: `/elections/start-election/${id}`,
        method: "PATCH",
        credentials: "include",
      }),
    }),

    toggleElection: builder.mutation({
      query: (id) => ({
        url: `/elections/toggle/${id}`,
        method: "PATCH",
        credentials: "include",
      }),
    }),

    endElection: builder.mutation({
      query: (id) => ({
        url: `/elections/end-election/${id}`,
        method: "PATCH",
        credentials: "include",
      }),
    }),

    vote: builder.mutation({
      query: ({ data, id }) => ({
        url: `/elections/vote/${id}`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),

    verifyVoters: builder.mutation({
      query: ({ data, id }) => ({
        url: `/elections/add-voter/${id}`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),

    addVoterToElections: builder.mutation({
      query: (data) => ({
        url: "/elections/add-voter-to-elections",
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),

    addMultipleVoterToMultipleElections: builder.mutation({
      query: (data) => ({
        url: "/elections/add-multiple-voter-to-multiple-elections",
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),

    categorizeElections: builder.mutation({
      query: (data) => ({
        url: "/electionCategories",
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),

    getAllCategorizedElections: builder.mutation({
      query: () => ({
        url: "/electionCategories",
        method: "GET",
        credentials: "include",
      }),
    }),

    getSingleCategorizedElection: builder.mutation({
      query: (id) => ({
        url: `/electionCategories/${id}`,
        method: "GET",
        credentials: "include",
      }),
    }),

    deleteCategorizedElection: builder.mutation({
      query: (id) => ({
        url: `/electionCategories/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
    }),

    removeElectionFromCategory: builder.mutation({
      query: ({ id, data }) => ({
        url: `/electionCategories/${id}/remove-elections`,
        method: "PATCH",
        body: data,
        credentials: "include",
      }),
    }),

    updateCategorizedElectionStatus: builder.mutation({
      query: ({ id, data }) => ({
        url: `/electionCategories/${id}/update-status`,
        method: "PATCH",
        body: data,
        credentials: "include",
      }),
    }),

    toggleElectionsInCategory: builder.mutation({
      query: ({ id, data }) => ({
        url: `/electionCategories/${id}/toggle-elections`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),

    startSelectedElections: builder.mutation({
      query: (body) => ({
        url: "/electionCategories/start-selected-elections",
        method: "POST",
        body,
        credentials: "include",
      }),
    }),
    endSelectedElections: builder.mutation({
      query: (body) => ({
        url: "/electionCategories/end-selected-elections",
        method: "POST",
        body,
        credentials: "include",
      }),
    }),
  }),
});

export const {
  useCreateElectionMutation,
  useGetElectionsMutation,
  useGetElectionMutation,
  useVoteMutation,
  useVerifyVotersMutation,
  useDeleteElectionMutation,
  useEndElectionMutation,
  useStartElectionMutation,
  useAddVoterToElectionsMutation,
  useAddMultipleVoterToMultipleElectionsMutation,
  useToggleElectionMutation,
  useEditElectionMutation,
  useCategorizeElectionsMutation,
  useGetAllCategorizedElectionsMutation,
  useGetSingleCategorizedElectionMutation,
  useDeleteCategorizedElectionMutation,
  useRemoveElectionFromCategoryMutation,
  useUpdateCategorizedElectionStatusMutation,
  useToggleElectionsInCategoryMutation,
  useStartSelectedElectionsMutation,
  useEndSelectedElectionsMutation,
} = electionApi;
