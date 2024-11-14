import { useResetPasswordMutation } from "@/features/authApi";
import { Button, PasswordInput, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

type Form = {
  newPassword: string;
  confirmPassword: string;
};

const ForgotPassword = () => {
  const { query, push } = useRouter();
  const token = query.token;

  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const form = useForm<Form>({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const submitHandler = async (values: Form) => {
    if (!token) return;

    if (values.newPassword.length < 6 || values.confirmPassword.length < 6)
      return notifications.show({
        color: "red",
        message: "password must be greater than 6 characters",
      });

    if (values.newPassword !== values.confirmPassword)
      return notifications.show({
        color: "red",
        message: "passwords do not match",
      });

    const data = {
      token,
      payload: {
        password: values.newPassword,
      },
    };

    try {
      const res = await resetPassword(data).unwrap();
      notifications.show({
        color: "green",
        message: res.message,
      });

      const user_role = res.data;

      if (user_role === "voter") {
        push("/voter/login");
      } else {
        push("/organisation/login");
      }
    } catch (error: any) {
      console.log(error);
      notifications.show({
        color: "red",
        message: error.data.message,
      });
    }
  };

  return (
    <>
      <Head>
        <title>Reset password | Voto</title>
      </Head>

      <section className="lg:w-[450px] mx-auto flex flex-col justify-center h-[90vh]">
        <div>
          <h1 className="font-bold text-center text-[1.5em] lg:text-[2em]">
            Reset your password
          </h1>
        </div>
        <form
          className="mt-8"
          onSubmit={form.onSubmit((values) => submitHandler(values))}
        >
          <Stack spacing={25}>
            <PasswordInput
              label="New Password"
              autoComplete="new-password"
              {...form.getInputProps("newPassword")}
              required
            />
            <PasswordInput
              label="Confirm New Password"
              autoComplete="new-password"
              {...form.getInputProps("confirmPassword")}
              required
            />
          </Stack>

          <Button
            type="submit"
            className=" bg-[#961699] hover:bg-[#961699] hover:text-white p-2 px-6 text-white opacity-95 outline-none border-none w-[100%] h-[2.5rem] mt-8 hover:opacity-80"
            loading={isLoading}
          >
            Reset password
          </Button>
        </form>

        <p className="mt-6 text-sm text-center">
          Never mind!{" "}
          <Link href="/voter/login" className="text-[#961699]">
            Take me back to login
          </Link>
        </p>
      </section>
    </>
  );
};

export default ForgotPassword;
