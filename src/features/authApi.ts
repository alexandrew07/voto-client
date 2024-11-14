import { apiSlice } from "./apiSlice";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    registerOrganisation: builder.mutation({
      query: (data) => ({
        url: "/organisations",
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),

    organisationLogin: builder.mutation({
      query: (data) => ({
        url: "/auth/organisation/login",
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),

    forgotPassword: builder.mutation({
      query: (data) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),

    verifyAccount: builder.mutation({
      query: (data) => ({
        url: "/auth/verify-account",
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),

    resendVerificationCode: builder.mutation({
      query: (data) => ({
        url: "/auth/resend-verification-code",
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),

    resetPassword: builder.mutation({
      query: (data) => ({
        url: `/auth/reset-password/${data.token}`,
        method: "PATCH",
        body: data.payload,
        credentials: "include",
      }),
    }),

    voterLogin: builder.mutation({
      query: (data) => ({
        url: "/auth/voter/login",
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),

    me: builder.mutation<{ user: any }, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
        credentials: "include",
      }),
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
        credentials: "include",
      }),
    }),

    uploadImage: builder.mutation({
      query: (image) => ({
        url: "/upload",
        method: "POST",
        body: image,
        credentials: "include",
      }),
    }),
  }),
});

export const {
  useOrganisationLoginMutation,
  useVoterLoginMutation,
  useMeMutation,
  useLogoutMutation,
  useUploadImageMutation,
  useRegisterOrganisationMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyAccountMutation,
  useResendVerificationCodeMutation,
} = authApi;
