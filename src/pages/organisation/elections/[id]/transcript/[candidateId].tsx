import Spinner from "@/components/Spinner";
import { Organisation, Voter } from "@/features/authSlice";
import { useGetElectionMutation } from "@/features/electionApi";
import Candidate from "@/pages/organisation/candidates";
import { RootState } from "@/store";
import { Button, Loader, Select, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

type CastedVoter = {
  votedFor: string;
  voter: Voter;
  votesAdded: number;
  details: { [key: string]: any };
};

const Transcript = () => {
  const { query } = useRouter();
  const electionId = query.id;

  const { user } = useSelector((state: RootState) => state.auth);

  const [filterParams, setFilterParams] = useState<{
    filterBy: string;
    filterValue: string;
  }>({
    filterBy: "",
    filterValue: "",
  });

  const form = useForm({
    initialValues: {
      filterBy: "",
      filterValue: "",
    },
  });

  const [originalCastedVoters, setOriginalCastedVoters] = useState<
    CastedVoter[]
  >([]);
  const [castedVoters, setCastedVoters] = useState<CastedVoter[]>([]);
  const [candidateWithFields, setCandidateWithFields] = useState<any>();

  const [getElection, { isLoading }] = useGetElectionMutation();

  const fetchData = useCallback(async () => {
    try {
      const res = await getElection(electionId).unwrap();

      const filteredCastedVoters = res.data.castedVoters.filter(
        (castedVoter: CastedVoter) => castedVoter.votedFor === query.candidateId
      );

      const candidate = res.data.candidates.find(
        (candidate: any) => candidate.candidate._id === query.candidateId
      );

      setOriginalCastedVoters(filteredCastedVoters);
      setCastedVoters(filteredCastedVoters);
      setCandidateWithFields(candidate);
    } catch (error) {}
  }, [electionId, getElection, query.candidateId]);

  useEffect(() => {
    if (!electionId) return;

    fetchData();
  }, [electionId, fetchData]);

  if (!castedVoters || !candidateWithFields) return <Spinner />;

  const { candidate } = candidateWithFields as { candidate: Candidate };

  const totalVotesReceived = castedVoters.reduce(
    (total, castedVoter) => total + castedVoter.votesAdded,
    0
  );

  const handleFilters = (values: { filterBy: string; filterValue: string }) => {
    const { filterBy, filterValue } = values;

    if (!filterBy) {
      return notifications.show({
        color: "red",
        message: "Please select a filter by field",
      });
    }

    const _filterBy = filterBy.charAt(0).toLowerCase() + filterBy.slice(1);

    const filteredCastedVoters = originalCastedVoters.filter((castedVoter) => {
      // @ts-ignore
      const voterDetailValue = castedVoter?.voter?.details?.[_filterBy];
      // @ts-ignore
      const voterFieldValue = castedVoter?.voter?.[_filterBy];
      return (
        (voterDetailValue &&
          voterDetailValue.toLowerCase().includes(filterValue.toLowerCase())) ||
        (voterFieldValue &&
          voterFieldValue.toLowerCase().includes(filterValue.toLowerCase()))
      );
    });

    setCastedVoters(filteredCastedVoters);
    setFilterParams({ filterBy, filterValue });
  };

  const clearFilters = () => {
    if (filterParams.filterBy === "" && filterParams.filterValue === "") return;
    setFilterParams({ filterBy: "", filterValue: "" });
    form.reset();
    setCastedVoters(originalCastedVoters);
  };

  const capitalizedFields = (user as Organisation).votersFields.map((field) => {
    return field.charAt(0).toUpperCase() + field.slice(1);
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="print-wrapper">
      <div className="fixed right-6 bottom-6">
        <Button
          className="bg-[#961699] hover:bg-[#961699] hover:opacity-75 w-[6rem]"
          id="print-btn"
          onClick={handlePrint}
        >
          Print
        </Button>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Image
          src={candidate.photoUrl}
          alt="profile-pic"
          className="h-[6rem] overflow-hidden rounded-full"
          width={100}
          height={100}
        />
        <h1>{candidate.fullName}</h1>
        <p>Received a total of {totalVotesReceived} vote(s).</p>
      </div>

      <form
        className="mt-10"
        onSubmit={form.onSubmit((values) => handleFilters(values))}
      >
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Filter by"
            data={["Name", ...capitalizedFields]}
            required
            withAsterisk={false}
            {...form.getInputProps("filterBy")}
            dropdownPosition="bottom"
            placeholder="select one"
          />
          <TextInput
            label="Filter value"
            required
            withAsterisk={false}
            {...form.getInputProps("filterValue")}
            placeholder="values..."
          />
        </div>
        <div className="flex items-center gap-4">
          <Button
            type="button"
            onClick={clearFilters}
            className="border border-[#961699] text-[#961699] p-2 px-6 outline-none h-[2.5rem] mt-4 hover:opacity-80"
          >
            Clear
          </Button>
          <Button
            type="submit"
            className=" bg-[#961699] hover:bg-[#961699] p-2 px-6 text-white opacity-95 outline-none border-none h-[2.5rem] mt-4 hover:opacity-80"
          >
            Submit
          </Button>
        </div>
      </form>

      {isLoading && (
        <div className="flex item-center justify-center mt-8">
          <Loader color="#961699" size="40px" />
        </div>
      )}

      {castedVoters.length > 0 && !isLoading && (
        <div>
          <h2 className="text-lg mt-8 underline underline-offset-2">Voters</h2>

          <ul className="list-disc mt-4 flex flex-col gap-4">
            {castedVoters.map((castedVoter, index) => (
              <li
                key={index}
                className="ml-5 bg-white shadow-sm p-2 rounded-lg list-none w-[50%] space-y-2 text-sm"
              >
                <h3>
                  <span className="text-[#961699]">Name</span> -{" "}
                  {castedVoter?.voter ? castedVoter?.voter.name : "Anonymous"}
                </h3>

                {/* <h3>
                  <span className="text-[#961699]">Email</span> -{" "}
                  {castedVoter?.voter?.email}
                </h3>

                <h3>
                  <span className="text-[#961699]">Username</span> -{" "}
                  {castedVoter?.voter?.username}
                </h3> */}

                {castedVoter.voter &&
                  Object.entries(castedVoter.voter.details).map(
                    ([key, value]) => (
                      <h3 key={key}>
                        <span className="text-[#961699]">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </span>{" "}
                        - {value as any}
                      </h3>
                    )
                  )}

                <p className="pt-4 font-semibold">
                  Votes Added: {castedVoter.votesAdded}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
export default Transcript;
