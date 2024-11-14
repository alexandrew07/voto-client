import TableLayout from "@/components/TableLayout";
import { RootState } from "@/store";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { useGetVotersMutation } from "@/features/voterApi";

type VotersDetails = Record<string, string>;

interface Voter {
  name: string;
  email: string;
  gender: string;
  details: VotersDetails;
  _id: string;
}

const DashboardVoters = () => {
  const [getVoters, { isLoading, error }] = useGetVotersMutation();
  const [voters, setVoters] = useState<Voter[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const voters = await getVoters({ no: 1, limit: 2 }).unwrap();
        setVoters(voters.data); // Assuming the API response contains an array of candidates
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [getVoters]);

  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) return null; // Return null or a loading/error component, if desired

  const tableHeads = ["Name"];
  const th = (
    <tr>
      {tableHeads.map((head, index) => (
        <th key={index} className="table-head">
          {head}
        </th>
      ))}
    </tr>
  );

  const rows = voters.map((voter, index) => (
    <tr key={index}>
      <td className="table-data">{voter?.name}</td>
      {/* <td className="table-data">{voter?.email ?? "-"}</td> */}
      {/* <td className="table-data">
        {voter?.email?.length > 15
          ? `${voter.email.slice(0, 15)}...`
          : voter.email ?? "-"}
      </td> */}
      {/* <td className="table-data">{voter?.gender ?? "-"}</td> */}
    </tr>
  ));

  return (
    <>
      <div>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="mt-8 lg:mt-0">
              <TableLayout th={th} rows={rows} title="RECENT VOTERS" />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default DashboardVoters;
