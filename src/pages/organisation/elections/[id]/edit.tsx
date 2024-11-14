import Spinner from "@/components/Spinner";
import {
  useEditElectionMutation,
  useGetElectionMutation,
} from "@/features/electionApi";
import { useGetCandidatesMutation } from "@/features/organisationApi";
import {
  Button,
  MultiSelect,
  Select,
  Stack,
  TextInput,
  createStyles,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Election } from "..";

type Form = {
  title: string;
  endingAt: string | Date;
  votingType: string;
  liveVoting: boolean;
  openElection: boolean;
  amountToPay: string | number;
  totalNoOfVotesPerVoter: string | number;
  votersVerification: boolean;
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

const EditElection = () => {
  const { classes } = useStyles();
  const [pricing, setPricing] = useState<string | null>(null);
  const [votingType, setVotingType] = useState<string | null>(null);
  const [pickedCandidates, setPickedCandidates] = useState<
    { candidate: string }[]
  >([]);

  const [candidates, setCandidates] = useState<
    {
      fullName: string;
      _id: string;
    }[]
  >([]);

  const form = useForm<Form>({
    initialValues: {
      title: "",
      endingAt: new Date(),
      votingType: "",
      liveVoting: false,
      amountToPay: 0,
      openElection: false,
      totalNoOfVotesPerVoter: "",
      votersVerification: false,
    },
  });

  const router = useRouter();

  const electionId = router.query.id;

  const [getElection, { isLoading: loadingGettingElection }] =
    useGetElectionMutation();

  useEffect(() => {
    if (!electionId) return;

    async function fetchData() {
      const res = await getElection(electionId as string).unwrap();

      form.setValues({
        title: res.data.title,
        endingAt: new Date(res.data.endingAt),
        votingType: res.data.votingType,
        liveVoting: res.data.liveVoting,
        amountToPay: res.data.amountToPay || 0,
        openElection: res.data.openElection,
        totalNoOfVotesPerVoter: res.data.totalNoOfVotesPerVoter || "",
        votersVerification: res.data.votersVerification,
      });

      setPricing(res.data.pricing);
      setVotingType(res.data.votingType);
      setPickedCandidates(
        res.data.candidates.map((c: any) => ({ candidate: c.candidate._id }))
      );
    }

    fetchData();
  }, [electionId, getElection]);

  const [getCandidates] = useGetCandidatesMutation();
  const [editElection] = useEditElectionMutation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data } = await getCandidates({ no: 0, limit: 0 }).unwrap();
      setCandidates(data);
    }
    fetchData();
  }, [getCandidates]);

  // Function to convert boolean values to "Yes" and "No"
  const convertToYesNo = (value: boolean) => {
    return value ? "Yes" : "No";
  };

  // Function to convert "Yes" and "No" to boolean values
  const convertToBoolean = (value: string) => {
    return value === "Yes";
  };

  const submitHandler = async (values: any) => {
    if (new Date(values.endingAt) < new Date()) {
      return notifications.show({
        color: "red",
        message: "Election ending date can't be less than now",
      });
    }

    const payload = {
      ...values,
      endingAt: new Date(values.endingAt).toISOString(),
      candidates: pickedCandidates,
      pricing,
      votingType,
    };

    setLoading(true);

    try {
      const res = await editElection({
        id: electionId,
        data: payload,
      }).unwrap();
      notifications.show({
        color: "green",
        message: res.message,
      });
      router.push(`/organisation/elections`);
    } catch (error: any) {
      notifications.show({
        color: "red",
        message: error.data.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingGettingElection) return <Spinner />;

  return (
    <div className="bg-white p-4">
      <h1 className="text-center mb-10">EDIT ELECTION</h1>
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
              value={pickedCandidates.map(
                (c) =>
                  candidates.find((cand) => cand._id === c.candidate)?.fullName!
              )}
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
            value={convertToYesNo(form.values.openElection)}
            onChange={(value) =>
              form.setFieldValue("openElection", convertToBoolean(value!))
            }
            required
          />

          <Select
            data={["Yes", "No"]}
            label="Verify Voters"
            classNames={{ input: classes.input, label: classes.label }}
            {...form.getInputProps("votersVerification")}
            value={convertToYesNo(form.values.votersVerification)}
            onChange={(value) =>
              form.setFieldValue("votersVerification", convertToBoolean(value!))
            }
            required
          />

          <Select
            data={["Yes", "No"]}
            label="Live Voting"
            classNames={{ input: classes.input, label: classes.label }}
            {...form.getInputProps("liveVoting")}
            value={convertToYesNo(form.values.liveVoting)}
            onChange={(value) =>
              form.setFieldValue("liveVoting", convertToBoolean(value!))
            }
            required
          />
        </Stack>

        <div className="flex justify-center">
          <Button
            type="submit"
            radius="lg"
            className=" bg-[#961699] hover:bg-[#961699] p-2 px-6 text-white opacity-95 outline-none border-none h-[2.5rem] mt-8 hover:opacity-80"
            loading={loading}
          >
            Update Election
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditElection;
