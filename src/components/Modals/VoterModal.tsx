import { Organisation } from "@/features/authSlice";
import { useCreateVoterMutation } from "@/features/voterApi";
import { RootState } from "@/store";
import {
  Button,
  Modal,
  PasswordInput,
  Stack,
  TextInput,
  createStyles,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import React, { useState } from "react";
import { useSelector } from "react-redux";

type VoterModalProps = {
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

export function capitalizeFirstLetter(str: string): string {
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

const VoterModal: React.FC<VoterModalProps> = ({ opened, close }) => {
  const { classes } = useStyles();

  const { user } = useSelector((state: RootState) => state.auth);

  // if (!user) return null;

  // State to hold form values, including dynamic fields
  const [formValues, setFormValues] = useState<FormValues>({
    name: "",
    username: "",
    email: "",
    // gender: "",
    password: "",
    // @ts-ignore
    ...user?.votersFields.reduce((acc, field) => {
      // Initialize dynamicFormValues with empty strings for each candidate field
      acc[field] = "";
      return acc;
    }, {} as FormValues),
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
      [field]: value,
    }));
  };

  const handleSelectChange = (field: string, value: string | null) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [field]: value || "",
    }));
  };

  const [loading, setLoading] = useState(false);
  const [createVoter] = useCreateVoterMutation();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);

    const payload = {
      ...formValues,
    };

    const data = {
      payload,
      id: user?._id,
    };

    try {
      const res = await createVoter(data).unwrap();
      notifications.show({
        color: "green",
        message: res.message,
      });
      close();
      window.location.reload();

      setFormValues({
        name: "",
        email: "",
        username: "",
        // gender: "",
        password: "",
        // @ts-ignore
        ...user?.votersFields.reduce((acc, field) => {
          // Initialize dynamicFormValues with empty strings for each candidate field
          acc[field] = "";
          return acc;
        }, {} as FormValues), // Use {} as FormValues to assert the type for reduce()
      });
    } catch (error: any) {
      notifications.show({
        color: "red",
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
      overlayProps={{ opacity: 0.4, blur: 1 }}
      title="ADD VOTER"
      size="lg"
      radius="md"
      classNames={{
        body: classes.body,
        title: classes.title,
      }}
    >
      <form onSubmit={handleSubmit}>
        <h5 className="mb-2">Please fill the voters Details</h5>

        <Stack spacing={20}>
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
            // required
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

          {(user as Organisation)?.votersFields.map(
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
          <PasswordInput
            label="Password"
            name="password"
            value={formValues.password}
            onChange={handleStaticInputChange}
            required
          />

          <div className="flex justify-center">
            <Button
              type="submit"
              radius="lg"
              className=" bg-[#961699] hover:bg-[#961699] p-2 px-6 text-white opacity-95 outline-none border-none h-[2.5rem] mt-8 hover:opacity-80"
              loading={loading}
            >
              Register Voter
            </Button>
          </div>
        </Stack>
      </form>
    </Modal>
  );
};

export default VoterModal;
