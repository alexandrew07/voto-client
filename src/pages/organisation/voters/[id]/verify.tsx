import {
  useResendVerificationCodeMutation,
  useVerifyAccountMutation,
} from "@/features/authApi";
import { Button, Loader, PinInput, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconLoader2 } from "@tabler/icons-react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import image from "public/vote-reg.png";
import React, { useState } from "react";

const Verify = () => {
  const { query, push } = useRouter();

  const email = query.email || "";
  const [verify, { isLoading }] = useVerifyAccountMutation();
  const [resend, { isLoading: isLoadingResend }] =
    useResendVerificationCodeMutation();
  const [otp, setOtp] = useState("");

  const handleInputChange = (value: string) => {
    setOtp(value);
  };

  const resendOTP = async () => {
    try {
      const res = await resend({ email }).unwrap();
      notifications.show({
        color: "green",
        message: res?.data?.message || "OTP resent successfully",
      });
      setOtp("");
    } catch (error: any) {
      notifications.show({
        color: "red",
        message: error.data.message ?? "failed to resend OTP",
      });
    }
  };

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await verify({ otp }).unwrap();

      notifications.show({
        color: "green",
        message: res?.data?.message || "Email successfully verified",
      });

      push("/voter/login");
    } catch (error: any) {
      notifications.show({
        color: "red",
        message: error.message ?? error.data.message ?? "verification failed",
      });
      setOtp("");
    }
  };

  return (
    <>
      <Head>
        <title>Verify | Voto</title>
      </Head>

      <section className="lg:grid grid-cols-2 h-screen">
        <aside className="hidden lg:flex h-screen">
          <Image src={image} alt="register" priority />
        </aside>

        <aside className="px-4 lg:px-0 h-screen lg:overflow-scroll bg-white">
          <div className="lg:px-12 outlet-container lg:w-[500px] min-h-screen flex flex-col justify-center mx-auto">
            <h1
              className="font-bold cursor-pointer text-[#961699]"
              onClick={() => push(process.env.NEXT_PUBLIC_URL!)}
            >
              VOTO
            </h1>
            <h5 className="font-semibold my-4 text-center text-2xl">
              Verify Account
            </h5>

            <p className="mb-6 text-sm">
              {" "}
              Enter the 4 Digit verification code sent to{" "}
              <span className="text-[#961699]">{email}</span>. The code expires
              in 15 minutes.{" "}
            </p>

            <form onSubmit={submitHandler}>
              <Stack spacing={20} className="mt-2">
                <PinInput
                  type="number"
                  placeholder=""
                  styles={{
                    input: {
                      width: "100%",
                      height: "85px",
                      fontSize: "3rem",
                      borderColor: "#000",
                    },
                    wrapper: {
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    },
                  }}
                  length={4}
                  onChange={handleInputChange}
                />

                <div>
                  <Button
                    type="submit"
                    className="w-full bg-[#961699] hover:bg-[#961699] p-2 px-6 text-white opacity-95 outline-none border-none h-[2.5rem] mt-4 hover:opacity-80"
                    loading={isLoading}
                  >
                    Verify
                  </Button>

                  <div className="mt-4 flex items-center">
                    <p>Haven&apos;t received code?</p>{" "}
                    {isLoadingResend ? (
                      <Loader color="#961699" size={20} className="ml-2" />
                    ) : (
                      <button
                        className="ml-2 text-[var(--primary-color)] enabled:hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
                        type="button"
                        onClick={resendOTP}
                        disabled={isLoadingResend}
                      >
                        Resend code
                      </button>
                    )}
                  </div>
                </div>
              </Stack>
            </form>
          </div>
        </aside>
      </section>
    </>
  );
};

export default Verify;
