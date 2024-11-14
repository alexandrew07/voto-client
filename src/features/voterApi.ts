import { apiSlice } from "./apiSlice";

export const voterApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createVoter: builder.mutation({
      query: ({ payload, id }) => ({
        url: `/voters/${id}`,
        method: "POST",
        body: payload,
        credentials: "include",
      }),
    }),

    importVoters: builder.mutation({
      query: ({ file, id }) => ({
        url: `/voters/${id}/import`,
        method: "POST",
        body: file,
        credentials: "include",
      }),
    }),

    getVoters: builder.mutation<
      { data: any },
      { no?: number; limit?: number; filterBy?: string; filterValue?: string }
    >({
      query: ({ no = 1, limit = 50, filterBy, filterValue }) => {
        let _url = `/voters?page=${no}&limit=${limit}`;

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

    deleteVoter: builder.mutation({
      query: (id) => ({
        url: `/voters/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
    }),

    updateVoter: builder.mutation({
      query: (payload) => ({
        url: `/voters/${payload.id}`,
        method: "PATCH",
        body: payload.data,
        credentials: "include",
      }),
    }),

    deleteMultipleVoters: builder.mutation({
      query: (ids) => ({
        url: `/voters/delete-multiple-voters`,
        method: "DELETE",
        body: { voterIds: ids },
        credentials: "include",
      }),
    }),
  }),
});

export const {
  useCreateVoterMutation,
  useGetVotersMutation,
  useDeleteVoterMutation,
  useImportVotersMutation,
  useUpdateVoterMutation,
  useDeleteMultipleVotersMutation,
} = voterApi;
