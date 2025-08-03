import { useGetOrganisationPublicMutation } from "@/features/organisationApi";
import { useCreateVoterMutation } from "@/features/voterApi";
import { Button, PasswordInput, Select, Stack, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import image from "public/vote-reg.png";
import { useEffect, useState } from "react";

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

type FormValues = {
  name: string;
  username: string;
  email: string;
  // gender: string;
  password: string;
  [key: string]: string; // Dynamic form fields
};

const RegisterVoter = () => {
  const { query, push } = useRouter();

  const organisationId = query.id;

  const [votersFields, setVotersFields] = useState([]);

  const [organisationName, setOrganisationName] = useState("");
  const [externalRegistration, setExternalRegistration] =
    useState<Boolean>(true);
  const [allowVotersEmailVerification, setAllowVotersEmailVerification] =
    useState<Boolean>(true);

  const [getOrganisation] = useGetOrganisationPublicMutation();

  useEffect(() => {
    if (!organisationId) return;

    async function fetchData() {
      const { data } = await getOrganisation(organisationId).unwrap();
      setVotersFields(data.votersFields);
      setOrganisationName(data.organisationName);
      setExternalRegistration(data.externalRegistration);
      setAllowVotersEmailVerification(data.allowVotersEmailVerification);
    }
    fetchData();
  }, [organisationId, getOrganisation]);

  // State to hold form values, including dynamic fields
  const [formValues, setFormValues] = useState<FormValues>({
    ...votersFields.reduce((acc, field) => {
      acc[field] = "";
      return acc;
    }, {} as FormValues),
    name: "",
    username: "",
    email: "",
    // gender: "",
    password: "",
  });

  // Update the form values when the static inputs change
  const handleStaticInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.currentTarget;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  // Update the form values when the dynamic inputs change
  const handleDynamicInputChange = (field: string, value: string) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [field]: value,
    }));
  };

  // Update the form values when the Select component changes
  const handleSelectChange = (field: string, value: string | null) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [field]: value || "", // If value is null, set it to an empty string
    }));
  };

  const [loading, setLoading] = useState(false);
  const [createVoter] = useCreateVoterMutation();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!externalRegistration)
      return notifications.show({
        color: "red",
        message:
          "Registration is currently unavailable. Please try again later.",
      });

    setLoading(true);

    const payload = {
      ...formValues,
      deviceIdentifier: navigator.userAgent,
    };

    const data = {
      payload,
      id: organisationId,
    };

    try {
      const res = await createVoter(data).unwrap();
      notifications.show({
        color: "green",
        message: res.message,
      });
      if (allowVotersEmailVerification) {
        push(
          `/organisation/voters/${organisationId}/verify?email=${formValues.email}`
        );
      } else {
        push(`/voter/login`);
      }
    } catch (error: any) {
      console.log(error);
      notifications.show({
        color: "red",
        message: error.data.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!organisationName) return;

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
              onClick={() => push(process.env.NEXT_PUBLIC_URL!)}
            >
              VOTO
            </h1>
            <h5 className="font-semibold my-4 text-center text-2xl">
              Register Voter
            </h5>
            <form onSubmit={handleSubmit}>
              <Stack spacing={20} className="mt-2">
                <TextInput
                  label="Name"
                  required
                  name="name"
                  value={formValues.name}
                  onChange={handleStaticInputChange}
                />
                <TextInput
                  label="Username"
                  required
                  name="username"
                  value={formValues.username}
                  onChange={handleStaticInputChange}
                />
                <TextInput
                  label="Email"
                  // required={false}
                  name="email"
                  value={formValues.email}
                  onChange={handleStaticInputChange}
                />
                {/* <Select
                  label="Gender"
                  data={[
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                  ]}
                  name="gender"
                  value={formValues.gender}
                  onChange={(value) => handleSelectChange("gender", value)}
                  required
                /> */}

                {votersFields.map((field: string, index: number) => (
                  <TextInput
                    key={index}
                    label={capitalizeFirstLetter(field)}
                    required
                    value={formValues[field]}
                    onChange={(event) =>
                      handleDynamicInputChange(field, event.currentTarget.value)
                    }
                  />
                ))}
                <PasswordInput
                  label="Password"
                  name="password"
                  autoComplete="new-password"
                  value={formValues.password}
                  onChange={handleStaticInputChange}
                  required
                />

                <div className="flex justify-center mb-4">
                  <Button
                    type="submit"
                    // radius="lg"
                    className=" bg-[#961699] hover:bg-[#961699] p-2 px-6 text-white opacity-95 outline-none border-none h-[2.5rem] mt-4 hover:opacity-80"
                    loading={loading}
                  >
                    Register
                  </Button>
                </div>
              </Stack>
            </form>
          </div>
        </aside>
      </section>
    </>
  );
};

export default RegisterVoter;
