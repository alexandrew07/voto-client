import { useVoterLoginMutation } from "@/features/authApi";
import { Button, PasswordInput, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import image from "public/hands_box.jpg";

type Form = {
  username: string;
  password: string;
};

const Login = () => {
  const form = useForm<Form>({
    initialValues: {
      username: "",
      password: "",
    },

    // validate: {
    //   email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    // },
  });

  const router = useRouter();

  const [loginVoter, { isLoading }] = useVoterLoginMutation();

  const submitHandler = async (values: Form) => {
    try {
      const res = await loginVoter(values).unwrap();
      notifications.show({
        color: "green",
        message: res.message,
      });
      router.push("/voter");
    } catch (error: any) {
      console.log(error.data.message.split("+"));

      const msg1 = error.data.message.split("+")[0];
      const msg2 = error.data.message.split("+")[1];
      const msg3 = error.data.message.split("+")[2];

      if (error.status === 406) {
        router.push(`/organisation/voters/${msg2}/verify?email=${msg3}`);
      }

      notifications.show({
        color: error.status === 406 ? "yellow" : "red",
        message: error.status === 406 ? msg1 : error.data.message,
      });
    }
  };

  return (
    <>
      <Head>
        <title>Login Voter | Voto</title>
      </Head>

      <section className="lg:grid grid-cols-2 h-screen">
        <aside className="hidden lg:flex h-screen">
          <Image src={image} alt="register" priority />
        </aside>

        <aside className="px-4 lg:px-0 h-screen lg:overflow-scroll bg-white">
          <div className="lg:px-12 outlet-container lg:w-[500px] min-h-screen flex flex-col justify-center mx-auto">
            <h1
              className="font-bold cursor-pointer text-[#961699]"
              onClick={() => router.push(process.env.NEXT_PUBLIC_URL!)}
            >
              VOTO
            </h1>
            <form onSubmit={form.onSubmit((values) => submitHandler(values))}>
              <h1 className="font-bold text-center mb-6 text-[1.5em] lg:text-[2em] mt-8">
                Voter login
              </h1>

              <Stack spacing={25}>
                <TextInput
                  type="text"
                  label="Username"
                  {...form.getInputProps("username")}
                  required
                />

                <div>
                  <PasswordInput
                    label="Password"
                    {...form.getInputProps("password")}
                    required
                    autoComplete="current-password"
                  />
                  <div className="flex justify-end mt-2">
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm text-[#961699] hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                </div>
              </Stack>

              <Button
                type="submit"
                className=" bg-[#961699] hover:bg-[#961699] p-2 px-6 text-white opacity-95 outline-none border-none w-[100%] h-[2.5rem] mt-8 hover:opacity-80"
                loading={isLoading}
              >
                Login
              </Button>
            </form>
          </div>
        </aside>
      </section>
    </>
  );
};

export default Login;
