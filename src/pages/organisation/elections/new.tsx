// import ImageDrop from "@/components/Dropzone";
// import { useUploadImageMutation } from "@/features/authApi";
import { useCreateElectionMutation } from "@/features/electionApi";
import { useGetCandidatesMutation } from "@/features/organisationApi";
import {
  Button,
  MultiSelect,
  Select,
  Stack,
  TextInput,
  // Textarea,
  createStyles,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { FileWithPath } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

type NewElectionProps = {};

type Form = {
  title: string;
  // type: string;
  endingAt: string | Date;
  // comment: string;
  votingType: string;
  liveVoting: string;
  openElection: string;
  amountToPay: string | number;
  totalNoOfVotesPerVoter: string | number;
  votersVerification: string;
};

const useStyles = createStyles((theme) => ({
  input: {
    background: "transparent",
    borderColor: "#68066A",
  },
  label: {
    marginBottom: "4px",
  },
  placeholder: {
    letterSpacing: "1px",
  },
}));

const NewElection: React.FC<NewElectionProps> = () => {
  const { classes } = useStyles();
  const [pricing, setPricing] = useState<string | null>(null);
  const [votingType, setVotingType] = useState<string | null>(null);
  const [pickedCandidates, setPickedCandidates] =
    useState<{ candidate: string }[]>();

  const router = useRouter();

  const [candidates, setCandidates] = useState<
    {
      fullName: string;
      _id: string;
    }[]
  >([]);

  const [imgValue, setImgValue] = useState<FileWithPath[]>([]);

  const form = useForm<Form>({
    initialValues: {
      title: "",
      // type: "",
      endingAt: "",
      // comment: "",
      votingType: "",
      liveVoting: "",
      amountToPay: 0,
      openElection: "",
      totalNoOfVotesPerVoter: "",
      votersVerification: "",
    },
  });

  const [getCandidates] = useGetCandidatesMutation();
  // const [uploadImage] = useUploadImageMutation();
  const [createElection] = useCreateElectionMutation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data } = await getCandidates({ no: 0, limit: 0 }).unwrap();
      setCandidates(data);
    }
    fetchData();
  }, [getCandidates]);

  // Function to convert "Yes" and "No" to boolean values
  const convertToBoolean = (value: string) => {
    return value === "Yes" ? true : false;
  };

  const submitHandler = async (values: any) => {
    if (new Date(values.endingAt) < new Date()) {
      return notifications.show({
        color: "red",
        message: "Election ending date can't be less than now",
      });
    }

    const convertYesNoInObject = (obj: any) => {
      const newObj = { ...obj };
      for (const key in newObj) {
        if (newObj.hasOwnProperty(key)) {
          if (newObj[key] === "Yes" || newObj[key] === "No") {
            newObj[key] = convertToBoolean(newObj[key]);
          }
        }
      }
      return newObj;
    };

    const convertedValues = convertYesNoInObject(values);

    if (pricing === "Admin") delete convertedValues.amountToPay;
    if (votingType === "Once") delete convertedValues.totalNoOfVotesPerVoter;

    const payload = {
      ...convertedValues,
      candidates: pickedCandidates,
      pricing,
      votingType,
    };

    setLoading(true);

    try {
      // if (imgValue.length > 0) {
      //   const file = imgValue[0];

      //   const formData = new FormData();
      //   formData.append("file", file);

      //   const { image_url } = await uploadImage(formData).unwrap();
      //   payload.bannerUrl = image_url;
      // }

      const res = await createElection(payload).unwrap();
      notifications.show({
        color: "green",
        message: res.message,
      });
      router.push(`/organisation/elections`);
      // router.push(`/organisation/elections/${res.data._id}`);
    } catch (error: any) {
      notifications.show({
        color: "red",
        message: error.data.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (form.getInputProps("openElection").value === "Yes") {
      form.setFieldValue("votersVerification", "No");
    }
  }, [form.getInputProps("openElection").value]);

  return (
    <div className="bg-white p-4">
      <h1 className="text-center mb-10">CREATE AN ELECTION</h1>
      <form
        onSubmit={form.onSubmit((values) => submitHandler(values))}
        id="create-election"
      >
        <Stack spacing={25}>
          <div className="contents lg:grid gap-10">
            <TextInput
              label="Title"
              classNames={{ input: classes.input, label: classes.label }}
              {...form.getInputProps("title")}
              required
            />

            {/* <TextInput
              label="Type"
              classNames={{ input: classes.input, label: classes.label }}
              {...form.getInputProps("type")}
              required
            /> */}
          </div>

          <div className="contents lg:grid lg:grid-cols-2 gap-10">
            <DateTimePicker
              minDate={new Date(Date.now())}
              label="Ending Date"
              classNames={{
                input: classes.input,
                label: classes.label,
                placeholder: classes.placeholder,
              }}
              {...form.getInputProps("endingAt")}
              required
            />

            <MultiSelect
              data={candidates.map((candidate) => candidate.fullName)}
              label="Candidates"
              classNames={{ input: classes.input, label: classes.label }}
              required
              nothingFound="No candidates found"
              styles={{ values: { marginTop: "3px" } }}
              onChange={(e) => {
                const matchedCandidates = e.map((eFullName) => {
                  const candidate = candidates.find(
                    (candidate) => candidate.fullName === eFullName
                  );
                  return { candidate: candidate ? candidate._id : "" };
                });

                setPickedCandidates(matchedCandidates);
              }}
            />
          </div>

          <div
            className={`contents lg:grid gap-10 ${
              votingType === "Multiple" ? "lg:grid-cols-2 " : ""
            }`}
          >
            <Select
              value={votingType}
              onChange={setVotingType}
              data={["Once", "Multiple"]}
              label="Voting Type"
              classNames={{ input: classes.input, label: classes.label }}
              required
            />

            {votingType === "Multiple" && (
              <TextInput
                label="NO. of vote per voter"
                type="number"
                classNames={{ input: classes.input, label: classes.label }}
                {...form.getInputProps("totalNoOfVotesPerVoter")}
                description="leave blank for unlimited votes"
                // required
                inputWrapperOrder={["label", "error", "input", "description"]}
              />
            )}
          </div>

          <div
            className={`contents lg:grid gap-10 ${
              pricing === "Voter" ? "lg:grid-cols-2 " : ""
            }`}
          >
            <Select
              value={pricing}
              onChange={setPricing}
              data={["Admin", "Voter"]}
              label="Pricing"
              classNames={{ input: classes.input, label: classes.label }}
              required
            />

            {pricing === "Voter" && (
              <TextInput
                label="Amount to pay(NGN)"
                type="number"
                classNames={{ input: classes.input, label: classes.label }}
                {...form.getInputProps("amountToPay")}
                required
              />
            )}
          </div>

          <Select
            data={["Yes", "No"]}
            label="Open Election"
            classNames={{ input: classes.input, label: classes.label }}
            {...form.getInputProps("openElection")}
            required
          />

          <Select
            data={["Yes", "No"]}
            label="Verify Voters"
            classNames={{
              input: classes.input,
              label: classes.label,
            }}
            {...form.getInputProps("votersVerification")}
            required
            disabled={form.getInputProps("openElection").value === "Yes"}
            description={
              form.getInputProps("openElection").value === "Yes" &&
              "you cannot verify voters in an open election"
            }
            inputWrapperOrder={["label", "input", "description", "error"]}
          />

          <Select
            data={["Yes", "No"]}
            label="Live Voting"
            classNames={{ input: classes.input, label: classes.label }}
            {...form.getInputProps("liveVoting")}
            required
          />

          {/* <Textarea
            label="Comment"
            autosize
            minRows={4}
            {...form.getInputProps("comment")}
          /> */}

          {/* <div>
            <p className="mb-2">Banner</p>
            <ImageDrop setImgValue={setImgValue} />
          </div> */}
        </Stack>

        <div className="flex justify-center">
          <Button
            type="submit"
            radius="lg"
            className=" bg-[#961699] hover:bg-[#961699] p-2 px-6 text-white opacity-95 outline-none border-none h-[2.5rem] mt-8 hover:opacity-80"
            loading={loading}
          >
            Create Election
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewElection;
