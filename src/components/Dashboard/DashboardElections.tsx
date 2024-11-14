import TableLayout from "@/components/TableLayout";
import { useEffect, useState } from "react";

import VerifyVoters from "@/components/Modals/VerifyVoters";
import { useGetElectionsMutation } from "@/features/electionApi";
import { Election } from "@/pages/organisation/elections";
import { useDisclosure } from "@mantine/hooks";

const DashboardElections = () => {
  const [getElections, { isLoading, error }] = useGetElectionsMutation();
  const [elections, setElections] = useState<Election[]>([]);
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const elections = await getElections({ no: 1, limit: 2 }).unwrap();
        setElections(elections.data);
      } catch (error) {}
    };

    fetchData();
  }, [getElections]);

  const [electionId, setElectionId] = useState("");

  const tableHeads = ["Title", "Live", "Voting", "Votes"];
  const th = (
    <tr>
      {tableHeads.map((head, index) => (
        <th key={index} className="table-head">
          {head}
        </th>
      ))}
      {/* <th className="table-head">Actions</th> */}
    </tr>
  );

  const rows = elections.map((election, index) => (
    <tr
      key={index}
      onClick={() => {
        setElectionId(election._id);
        open();
      }}
      className="cursor-pointer"
    >
      <td className="table-data">
        {election.title.length > 20
          ? `${election.title.slice(0, 20)}...`
          : election.title}
      </td>
      {/* <td className="table-data">
        {" "}
        {election.type.length > 20
          ? `${election.type.slice(0, 20)}...`
          : election.type}
      </td> */}
      <td className="table-data">{election.liveVoting ? "Yes" : "No"}</td>
      <td className="table-data">{election.votingType}</td>
      <td className="table-data">{election.totalVotes}</td>
    </tr>
  ));

  return (
    <>
      <VerifyVoters opened={opened} close={close} electionId={electionId} />
      <div>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div>
              <TableLayout th={th} rows={rows} title="RECENT ELECTIONS" />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default DashboardElections;
