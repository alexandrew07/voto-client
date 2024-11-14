import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
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
import {
  useUpdateCandidateMutation,
  useGetCandidateMutation,
} from "@/features/organisationApi";
import { Organisation } from "@/features/authSlice";
import Image from "next/image";

type UpdateCandidateModalProps = {
  opened: boolean;
  close: () => void;
  candidateId: string;
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
  photoUrl: string;
  details?: {
    [key: string]: string | undefined;
  };
};

const UpdateCandidateModal: React.FC<UpdateCandidateModalProps> = ({
  opened,
  close,
  candidateId,
}) => {
  const { classes } = useStyles();

  const [imgValue, setImgValue] = useState<FileWithPath[]>([]);

  const { user } = useSelector((state: RootState) => state.auth);

  const [formValues, setFormValues] = useState<FormValues>({
    details: {},
    fullName: "",
    email: "",
    gender: "",
    photoUrl: "",
  });

  const handleStaticInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.currentTarget;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleDynamicInputChange = (field: string, value: string) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      details: {
        ...prevValues.details,
        [field]: value,
      },
    }));
  };

  const handleSelectChange = (field: string, value: string | null) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [field]: value || "",
    }));
  };

  const [loading, setLoading] = useState(false);
  const [uploadImage] = useUploadImageMutation();
  const [updateCandidate] = useUpdateCandidateMutation();
  const [getCandidate] = useGetCandidateMutation();

  useEffect(() => {
    async function getCandidateData() {
      try {
        const res = await getCandidate(candidateId).unwrap();
        const candidate = res.data;
        setFormValues(candidate);
      } catch (error: any) {
        notifications.show({
          color: "red",
          message: error.data.message,
        });
      }
    }

    if (opened && candidateId) {
      getCandidateData();
    }
  }, [candidateId, getCandidate, opened]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);

    try {
      if (imgValue.length > 0) {
        const file = imgValue[0];
        const formData = new FormData();
        formData.append("file", file);
        const { image_url } = await uploadImage(formData).unwrap();
        formValues.photoUrl = image_url;
      }

      const data = {
        payload: formValues,
        _id: candidateId,
      };

      const res = await updateCandidate(data).unwrap();
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

  if (!formValues) return null;

  return (
    <Modal
      opened={opened}
      onClose={close}
      overlayProps={{ opacity: 0.4, blur: 1 }}
      title="UPDATE CANDIDATE"
      size="lg"
      radius="md"
      classNames={{
        body: classes.body,
        title: classes.title,
      }}
    >
      <form onSubmit={handleSubmit}>
        <h5 className="mb-2 ">Please update the candidate Details</h5>

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
                value={formValues.details?.[field]}
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
            {formValues.photoUrl && imgValue.length === 0 && (
              <div className="mt-4">
                <Image
                  src={formValues.photoUrl}
                  alt="candidate-profile"
                  width={100}
                  height={100}
                />
              </div>
            )}
          </div>
          <div className="flex justify-center">
            <Button
              type="submit"
              radius="lg"
              className=" bg-[#961699] hover:bg-[#961699] p-2 px-6 text-white opacity-95 outline-none border-none h-[2.5rem] mt-8 hover:opacity-80"
              loading={loading}
            >
              Update Candidate
            </Button>
          </div>
        </Stack>
      </form>
    </Modal>
  );
};

export default UpdateCandidateModal;
