import TableLayout from "@/components/TableLayout";
import { IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import VerifyVoters from "@/components/Modals/VerifyVoters";
import Spinner from "@/components/Spinner";
import {
  useDeleteElectionMutation,
  useGetElectionsMutation,
} from "@/features/electionApi";
import { useDisclosure } from "@mantine/hooks";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import eye from "/public/fi-sr-eye.svg";
import pencil from "/public/fi-sr-pencil.svg";
import trash from "/public/fi-sr-trash.svg";
import { Notifications, notifications } from "@mantine/notifications";
import { Voter } from "@/features/authSlice";
import { Affix, Button, Checkbox } from "@mantine/core";
import CategorizeElectionModal from "@/components/Modals/CategorizeElectionModal";

export interface Election {
  status: string;
  bannerUrl: string;
  candidates: [{ candidate: any; votesReceived: number }];
  castedVoters: [{ voter: Voter; votesAdded: number }];
  castedVotes: 0;
  comment: string;
  endingAt: string;
  liveVoting: boolean;
  totalNoOfVotesPerVoter: number | null;
  pricing: string;
  amountToPay: number;
  organisation: string;
  title: string;
  votersVerification: boolean;
  voters: string[];
  totalVotes: number;
  type: string;
  votingType: string;
  _id: string;
  openElection: boolean;
}

const Elections = () => {
  const [getElections, { isLoading, error }] = useGetElectionsMutation();
  const [elections, setElections] = useState<Election[]>([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [pageNo, setPageNo] = useState<number>(1);

  const [
    openedCategorizeElection,
    { open: openCategorizeElection, close: closeCategorizeElection },
  ] = useDisclosure(false);

  const router = useRouter();

  const [selection, setSelection] = useState<string[]>([]);
  const toggleRow = (id: string) =>
    setSelection((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );

  const toggleAll = () =>
    setSelection((current) =>
      current.length === elections.length
        ? []
        : elections.map((item) => item._id)
    );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const elections = await getElections({
          no: pageNo,
          limit: 100,
        }).unwrap();
        setElections(elections.data);
      } catch (error) {}
    };

    fetchData();
  }, [getElections, pageNo]);

  const [deleteElection] = useDeleteElectionMutation();

  const deleteHandler = async (id: string) => {
    try {
      await deleteElection(id).unwrap();
      notifications.show({
        color: "green",
        message: "election deleted successfully",
      });
      window.location.reload();
    } catch (error: any) {
      notifications.show({
        color: "red",
        message: error.data.message,
      });
    }
  };

  const [electionId, setElectionId] = useState("");

  const tableHeads = ["Title", "Live", "Type", "Votes"];
  const th = (
    <tr>
      <th>
        <Checkbox
          onChange={toggleAll}
          checked={selection.length === elections.length}
          indeterminate={
            selection.length > 0 && selection.length !== elections.length
          }
          transitionDuration={0}
          color="#961699"
        />
      </th>
      {tableHeads.map((head, index) => (
        <th key={index} className="table-head">
          {head}
        </th>
      ))}
      <th className="table-head">Actions</th>
    </tr>
  );

  const rows = elections.map((election, index) => (
    <tr
      key={index}
      onClick={() => {
        if (!election.votersVerification)
          return Notifications.show({
            color: "red",
            message: "Voters can't be verified in this type of election",
          });
        setElectionId(election._id);
        open();
      }}
      className="cursor-pointer"
    >
      <td>
        <Checkbox
          checked={selection.includes(election._id)}
          onChange={() => toggleRow(election._id)}
          transitionDuration={0}
          onClick={(e) => e.stopPropagation()}
        />
      </td>
      <td className="table-data">{election.title}</td>
      {/* <td className="table-data">{election.type}</td> */}
      <td className="table-data">{election.liveVoting ? "Yes" : "No"}</td>
      <td className="table-data">{election.votingType}</td>
      <td className="table-data">{election.totalVotes}</td>

      <td
        className="table-data flex gap-4 items-center justify-start"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={pencil}
          alt="pencil"
          width={15}
          height={15}
          className="cursor-pointer"
          onClick={() =>
            router.push(`/organisation/elections/${election._id}/edit`)
          }
        />

        <Image
          src={eye}
          alt="eye"
          width={15}
          height={15}
          className="cursor-pointer"
          onClick={() => router.push(`/organisation/elections/${election._id}`)}
        />

        <Image
          src={trash}
          alt="pencil"
          width={15}
          height={15}
          className="cursor-pointer"
          onClick={() => deleteHandler(election._id)}
        />
      </td>
    </tr>
  ));

  const nextHandler = () => {
    setPageNo((prev) => prev + 1);
  };

  const prevHandler = () => {
    setPageNo((prev) => prev - 1);
  };

  return (
    <>
      {selection.length > 1 && (
        <CategorizeElectionModal
          opened={openedCategorizeElection}
          close={closeCategorizeElection}
          elections={selection}
        />
      )}
      <VerifyVoters opened={opened} close={close} electionId={electionId} />
      <div>
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <div className="flex items-center gap-4 my-3">
              <Link
                className="bg-[#961699] hover:bg-[#961699] hover:opacity-70 flex items-center py-[0.35rem] px-3 text-white rounded-md"
                href="/organisation/elections/new"
                style={{ textDecoration: "none" }}
              >
                <IconPlus stroke={1.5} /> Create
              </Link>

              <Link
                href="/organisation/elections/categories"
                className="text-[#961699] hover:underline"
              >
                View categorized elections
              </Link>
            </div>
            <div className="mt-10">
              <TableLayout
                th={th}
                rows={rows}
                title="ELECTIONS"
                pageNo={pageNo}
                nextHandler={nextHandler}
                prevHandler={prevHandler}
                data={elections}
              />
            </div>

            {selection.length > 1 && !openedCategorizeElection && (
              <Affix position={{ bottom: 20, right: 20 }}>
                <Button
                  className="bg-[#961699] hover:bg-[#961699] hover:opacity-80"
                  onClick={openCategorizeElection}
                >
                  Categorize
                </Button>
              </Affix>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Elections;
