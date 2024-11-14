import { useForgotPasswordMutation } from "@/features/authApi";
import { Button, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import Head from "next/head";
import Link from "next/link";
import React, { useState } from "react";

type Form = {
  email: string;
};

const ForgotPassword = () => {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [emailSent, setEmailSent] = useState(false);
  const form = useForm<Form>({
    initialValues: {
      email: "",
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });

  const submitHandler = async (values: Form) => {
    try {
      const res = await forgotPassword(values).unwrap();
      notifications.show({
        color: "green",
        message: res.message,
      });
      setEmailSent(true);
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
        <title>Forgot password | Voto</title>
      </Head>

      <>
        {!emailSent ? (
          <section className="lg:w-[450px] mx-auto flex flex-col justify-center h-[90vh]">
            <div>
              <h1 className="font-bold text-center text-[1.5em] lg:text-[2em]">
                Reset your password
              </h1>
              <p className="text-center lg:w-[300px] mx-auto">
                To reset your password, enter the email address you use to log
                in.
              </p>
            </div>
            <form
              className="mt-8"
              onSubmit={form.onSubmit((values) => submitHandler(values))}
            >
              <TextInput
                label="Email"
                {...form.getInputProps("email")}
                required
              />

              <Button
                type="submit"
                className=" bg-[#961699] hover:bg-[#961699] hover:text-white p-2 px-6 text-white opacity-95 outline-none border-none w-[100%] h-[2.5rem] mt-8 hover:opacity-80"
                loading={isLoading}
              >
                Get reset link
              </Button>
            </form>

            <p className="mt-6 text-sm text-center">
              Never mind!{" "}
              <Link href="/voter/login" className="text-[#961699]">
                Take me back to login
              </Link>
            </p>
          </section>
        ) : (
          <section className="lg:w-[450px] mx-auto flex flex-col justify-center h-[90vh]">
            <h2 className="font-bold text-center text-[1.5em] lg:text-[2em]">
              Check your email
            </h2>
            <p className="mt-4 text-center">
              Check your <strong>{form.values.email}</strong> inbox for
              instructions from us on how to reset your password.
            </p>

            <p className="mt-6 text-sm text-center">
              <Link href="/voter/login" className="text-[#961699]">
                Go back to login screen
              </Link>
            </p>
          </section>
        )}
      </>
    </>
  );
};

export default ForgotPassword;
