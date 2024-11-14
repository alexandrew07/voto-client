import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store"; // Replace with the actual path to your RootState type
import {
  Button,
  Modal,
  Select,
  Stack,
  TextInput,
  createStyles,
} from "@mantine/core";
import ImageDrop from "../Dropzone";
import { FileWithPath } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import { useUploadImageMutation } from "@/features/authApi";
import { useCreateCandidateMutation } from "@/features/organisationApi";
import { Organisation } from "@/features/authSlice";
// Add any other required imports from your UI library

type CandidateModalProps = {
  opened: boolean;
  close: () => void;
};

const useStyles = createStyles(() => ({
  body: {
    [`@media (min-width: 1024px)`]: {
      padding: "1rem 3rem",
    },
  },

  title: {
    fontWeight: "bold",
    fontSize: "1.5rem",
    marginTop: "1rem",
    [`@media (min-width: 1024px)`]: {
      paddingLeft: "2rem",
    },
  },
}));

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

type FormValues = {
  fullName: string;
  email: string;
  gender: string;
  [key: string]: string; // Dynamic form fields
};

const CandidateModal: React.FC<CandidateModalProps> = ({ opened, close }) => {
  const { classes } = useStyles();

  const [imgValue, setImgValue] = useState<FileWithPath[]>([]);

  const { user } = useSelector((state: RootState) => state.auth);

  // if (!user) return null;

  // State to hold form values, including dynamic fields
  const [formValues, setFormValues] = useState<FormValues>({
    ...(user as Organisation)?.candidatesFields.reduce((acc, field) => {
      // Initialize dynamicFormValues with empty strings for each candidate field
      acc[field] = "";
      return acc;
    }, {} as FormValues), // Use {} as FormValues to assert the type for reduce()
    fullName: "",
    email: "",
    gender: "",
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

      const payload = {
        ...formValues,
      };

      const data = {
        payload,
        id: user?._id,
      };

      const res = await createCandidate(data).unwrap();
      notifications.show({
        color: "green",
        message: res.message,
      });
      close();
      window.location.reload();
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

  return (
    <Modal
      opened={opened}
      onClose={close}
      // centered
      overlayProps={{ opacity: 0.4, blur: 1 }}
      title="ADD CANDIDATE"
      size="lg"
      radius="md"
      classNames={{
        body: classes.body,
        title: classes.title,
      }}
    >
      <form onSubmit={handleSubmit}>
        <h5 className="mb-2 ">Please fill the candidate Details</h5>

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

          {(user as Organisation)?.candidatesFields.map(
            (field: string, index: number) => (
              <TextInput
                key={index}
                label={capitalizeFirstLetter(field)}
                required
                value={formValues[field]}
                onChange={(event) =>
                  handleDynamicInputChange(field, event.currentTarget.value)
                }
              />
            )
          )}

          <div>
            <label>
              Picture{" "}
              <span className="mantine-103svbs mantine-InputWrapper-required mantine-TextInput-required mb-10">
                *
              </span>
            </label>

            <ImageDrop setImgValue={setImgValue} />
          </div>
          <div className="flex justify-center">
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
    </Modal>
  );
};

export default CandidateModal;
