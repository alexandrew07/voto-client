import ImageDrop from "@/components/Dropzone";
import { useUploadImageMutation } from "@/features/authApi";
import {
  useCreateCandidateMutation,
  useGetOrganisationMutation,
} from "@/features/organisationApi";
import { Button, Select, Stack, TextInput } from "@mantine/core";
import { FileWithPath } from "@mantine/dropzone";
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

const CreateCandidate = () => {
  const { query, push } = useRouter();

  const organisationId = query.id;

  const [candidatesFields, setCandidatesFields] = useState([]);

  const [organisationName, setOrganisationName] = useState("");
  const [externalRegistration, setExternalRegistration] =
    useState<Boolean>(true);

  const [getOrganisation] = useGetOrganisationMutation();

  const [imgValue, setImgValue] = useState<FileWithPath[]>([]);

  useEffect(() => {
    if (!organisationId) return;

    async function fetchData() {
      const { data } = await getOrganisation(organisationId).unwrap();
      setCandidatesFields(data.candidatesFields);
      setOrganisationName(data.organisationName);
      setExternalRegistration(data.externalRegistration);
    }
    fetchData();
  }, [organisationId, getOrganisation]);

  // State to hold form values, including dynamic fields
  const [formValues, setFormValues] = useState<FormValues>({
    ...candidatesFields.reduce((acc, field) => {
      acc[field] = "";
      return acc;
    }, {} as FormValues),
    fullName: "",
    email: "",
    gender: "",
    // name: "",
    // username: "",
    // email: "",
    // // gender: "",
    // password: "",
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
  const [uploadImage] = useUploadImageMutation();
  const [createCandidate] = useCreateCandidateMutation();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!externalRegistration)
      return notifications.show({
        color: "red",
        message:
          "Registration is currently unavailable. Please try again later.",
      });

    setLoading(true);

    try {
      if (imgValue.length === 0)
        return notifications.show({
          color: "red",
          message: "please select a picture",
        });

      const file = imgValue[0];

      const formData = new FormData();
      formData.append("file", file);

      const { image_url } = await uploadImage(formData).unwrap();
      formValues.photoUrl = image_url;

      const data = {
        payload: formValues,
        id: organisationId,
      };

      const res = await createCandidate(data).unwrap();
      notifications.show({
        color: "green",
        message: res.message,
      });
      push(process.env.NEXT_PUBLIC_URL!);
    } catch (error: any) {
      console.log(error);
      notifications.show({
        color: "green",
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
        <title>Create | Candidate</title>
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
              Create Candidate
            </h5>
            <form onSubmit={handleSubmit}>
              <Stack spacing={20}>
                <TextInput
                  label="Full Name"
                  required
                  name="fullName"
                  value={formValues.fullName}
                  onChange={handleStaticInputChange}
                />
                <TextInput
                  label="Email"
                  required
                  name="email"
                  value={formValues.email}
                  onChange={handleStaticInputChange}
                />
                <Select
                  label="Gender"
                  data={[
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                  ]}
                  name="gender"
                  value={formValues.gender}
                  onChange={(value) => handleSelectChange("gender", value)}
                  required
                />

                {candidatesFields.map((field: string, index: number) => (
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

                <div>
                  <label>
                    Picture{" "}
                    <span className="mantine-103svbs mantine-InputWrapper-required mantine-TextInput-required mb-10">
                      *
                    </span>
                  </label>

                  <ImageDrop setImgValue={setImgValue} />
                </div>
                <div className="flex justify-center pb-8">
                  <Button
                    type="submit"
                    radius="lg"
                    className=" bg-[#961699] hover:bg-[#961699] p-2 px-6 text-white opacity-95 outline-none border-none h-[2.5rem] mt-8 hover:opacity-80"
                    loading={loading}
                  >
                    Create Candidate
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

export default CreateCandidate;
