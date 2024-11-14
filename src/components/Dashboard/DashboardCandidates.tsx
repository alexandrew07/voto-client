import TableLayout from "@/components/TableLayout";
import { useGetCandidatesMutation } from "@/features/organisationApi";
import { RootState } from "@/store";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

type CandidateDetails = Record<string, string>;

interface Candidate {
  fullName: string;
  email: string;
  gender: string;
  details: CandidateDetails;
}

const DashboardCandidates = () => {
  const [getCandidates, { isLoading, error }] = useGetCandidatesMutation();
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const candidates = await getCandidates({ no: 1, limit: 2 }).unwrap();
        setCandidates(candidates.data);
      } catch (error) {}
    };

    fetchData();
  }, [getCandidates]);

  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) return null; // Return null or a loading/error component, if desired

  const tableHeads = ["Full Name", "Email", "Gender"];
  const th = (
    <tr>
      {tableHeads.map((head, index) => (
        <th key={index} className="table-head">
          {head}
        </th>
      ))}
    </tr>
  );

  const rows = candidates.map((candidate, index) => (
    <tr key={index}>
      <td className="table-data">{candidate?.fullName ?? "-"}</td>
      <td className="table-data">{candidate?.email ?? "-"}</td>
      <td className="table-data">{candidate?.gender ?? "-"}</td>
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
              <TableLayout
                th={th}
                rows={rows}
                title="RECENT CANDIDATES"
                className="min-h-[14.8rem]"
              />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default DashboardCandidates;
