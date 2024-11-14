import Image from "next/image";
import React, { useState } from "react";

import image from "public/vote-reg.png";
import {
  Button,
  MultiSelect,
  PasswordInput,
  Stack,
  TextInput,
  createStyles,
} from "@mantine/core";

import { useForm } from "@mantine/form";
import Link from "next/link";
import Head from "next/head";
import ImageDrop from "@/components/Dropzone";
import { FileWithPath } from "@mantine/dropzone";
import {
  useRegisterOrganisationMutation,
  useUploadImageMutation,
} from "@/features/authApi";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/router";

const useStyles = createStyles((theme) => ({
  input: {
    background: "transparent",
    borderRadius: "0px",
  },
  label: {
    marginBottom: "4px",
  },
}));

type Form = {
  organisationName: string;
  // slogan: string;
  // title: string;
  email: string;
  votersFields: string[];
  candidatesFields: string[];
  password: string;
  logoUrl: string;
};

const Register: React.FC = () => {
  const [votersFields, setVotersFields] = useState<
    {
      value: string;
      label: string;
    }[]
  >([]);

  const [candidatesFields, setCandidatesFields] = useState<
    {
      value: string;
      label: string;
    }[]
  >([]);

  const form = useForm<Form>({
    initialValues: {
      organisationName: "",
      // slogan: "",
      // title: "",
      email: "",
      votersFields: [],
      candidatesFields: [],
      password: "",
      logoUrl: "",
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });

  const { classes } = useStyles();
  const [imgValue, setImgValue] = useState<FileWithPath[]>([]);

  const [uploadImage] = useUploadImageMutation();
  const [registerOrganisation] = useRegisterOrganisationMutation();

  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function submitHandler(values: Form) {
    setLoading(true);

    try {
      if (imgValue.length === 0)
        return notifications.show({
          color: "red",
          message: "please select an icon for your organisation",
        });

      const file = imgValue[0];

      const formData = new FormData();
      formData.append("file", file);

      const { image_url } = await uploadImage(formData).unwrap();
      values.logoUrl = image_url;

      const res = await registerOrganisation(values).unwrap();
      notifications.show({
        color: "green",
        message: res.message,
      });
      router.push("/organisation");
    } catch (error: any) {
      console.log(error);
      notifications.show({
        color: "red",
        message: error.data.message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Register | Voto</title>
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
                Register an organisation
              </h1>

              <Stack spacing={25}>
                <TextInput
                  label="Organisation Name"
                  classNames={{ input: classes.input, label: classes.label }}
                  {...form.getInputProps("organisationName")}
                  required
                />
                <TextInput
                  label="Email"
                  type="email"
                  classNames={{ input: classes.input, label: classes.label }}
                  {...form.getInputProps("email")}
                  required
                />
                {/* <TextInput
                  // placeholder="Name of the organisation"
                  label="Slogan"
                  classNames={{ input: classes.input, label: classes.label }}
                  {...form.getInputProps("slogan")}
                  required
                />
                <TextInput
                  // placeholder="Name of the organisation"
                  label="Title"
                  classNames={{ input: classes.input, label: classes.label }}
                  {...form.getInputProps("title")}
                  required
                /> */}

                <MultiSelect
                  label="Voters field"
                  data={votersFields}
                  placeholder="voters details"
                  searchable
                  creatable
                  getCreateLabel={(query) => `+ Create ${query}`}
                  onCreate={(query) => {
                    const item = { value: query, label: query };
                    setVotersFields((current) => [...current, item]);
                    return item;
                  }}
                  classNames={{ input: classes.input, label: classes.label }}
                  {...form.getInputProps("votersFields")}
                  required
                  description="name, email, username, gender, and password is already prefilled"
                  inputWrapperOrder={["label", "error", "input", "description"]}
                />

                <MultiSelect
                  label="Candidates field"
                  data={candidatesFields}
                  placeholder="candidate fields"
                  searchable
                  creatable
                  getCreateLabel={(query) => `+ Create ${query}`}
                  onCreate={(query) => {
                    const item = { value: query, label: query };
                    setCandidatesFields((current) => [...current, item]);
                    return item;
                  }}
                  classNames={{ input: classes.input, label: classes.label }}
                  {...form.getInputProps("candidatesFields")}
                  required
                  description="full name, email, gender, and photo is already prefilled"
                  inputWrapperOrder={["label", "error", "input", "description"]}
                />

                <PasswordInput
                  classNames={{ input: classes.input, label: classes.label }}
                  label="Password"
                  autoComplete="new-password"
                  {...form.getInputProps("password")}
                  required
                />

                <div>
                  <p className="mb-2 text-[0.875rem] font-[500] text-[#212529]">
                    Organisation icon
                  </p>

                  <ImageDrop setImgValue={setImgValue} />
                </div>
              </Stack>

              <Button
                type="submit"
                className=" bg-[#961699] hover:bg-[#961699] hover:text-white p-2 px-6 text-white opacity-95 outline-none border-none w-[100%] h-[2.5rem] mt-8 hover:opacity-80"
                loading={loading}
              >
                Register
              </Button>
            </form>

            <p className="text-[13px] my-6">
              Already an account?{" "}
              <Link
                href="/organisation/login"
                className="text-[#961699] hover:underline"
              >
                Login here.
              </Link>
            </p>
          </div>
        </aside>
      </section>
    </>
  );
};
export default Register;
