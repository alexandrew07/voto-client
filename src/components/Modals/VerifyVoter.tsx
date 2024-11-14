import {
  useAddVoterToElectionsMutation,
  useGetElectionsMutation,
} from "@/features/electionApi";
import { Election } from "@/pages/organisation/elections";
import {
  Button,
  Checkbox,
  Modal,
  Table,
  Text,
  createStyles,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import React, { useEffect, useState } from "react";

type VerifyVoterProps = {
  opened: boolean;
  close: () => void;
  voterId: string;
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

  rowSelected: {
    // backgroundColor: "#961699",
    // // op,
  },
}));

const VerifyVoter: React.FC<VerifyVoterProps> = ({
  voterId,
  opened,
  close,
}) => {
  const { classes, cx } = useStyles();

  const [elections, setElections] = useState<Election[]>([]);
  const [getElections, { isLoading, error }] = useGetElectionsMutation();
  const [loading, setLoading] = useState(false);
  const [addVoterToElections, { isLoading: isLoadingAdding }] =
    useAddVoterToElectionsMutation();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const elections = await getElections({
          no: 0,
          limit: 0,
        }).unwrap();
        const filteredElections = elections.data.filter(
          (election: Election) => {
            const voterExists = election.voters.some((voter: any) => {
              return voter._id === voterId;
            });

            return !voterExists;
          }
        );
        setElections(filteredElections);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getElections, voterId]);

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

  const rows = elections.map((election) => {
    const selected = selection.includes(election._id);
    return (
      <tr
        key={election._id}
        className={cx({ [classes.rowSelected]: selected })}
      >
        <td>
          <Checkbox
            checked={selection.includes(election._id)}
            onChange={() => toggleRow(election._id)}
            transitionDuration={0}
          />
        </td>
        <td>
          <Text size="sm" weight={500}>
            {election.title}
          </Text>
        </td>
        <td>{election.type}</td>
        <td>{election.liveVoting ? "Yes" : "No"}</td>
        <td>{election.votingType}</td>
      </tr>
    );
  });

  const verifyHandler = async () => {
    if (selection.length === 0)
      return notifications.show({
        color: "red",
        message: "please select an election to add this voter to",
      });

    const data = {
      voterId,
      electionIds: selection,
    };
    try {
      const res = await addVoterToElections(data).unwrap();
      notifications.show({
        color: "green",
        message: res.message,
      });
      close();
      window.location.reload();
    } catch (error: any) {
      notifications.show({
        color: "red",
        message: error.data.message,
      });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={async () => {
        close();
      }}
      overlayProps={{ opacity: 0.4, blur: 1 }}
      title="VERIFY VOTER"
      size="xl"
      radius="md"
      classNames={{
        body: classes.body,
        title: classes.title,
      }}
    >
      <div>
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : elections.length === 0 ? (
          <p className="text-center">
            This voter is allowed to vote in all the elections
          </p>
        ) : (
          <>
            <Table verticalSpacing="sm">
              <thead>
                <tr>
                  <th>
                    <Checkbox
                      onChange={toggleAll}
                      checked={selection.length === elections.length}
                      indeterminate={
                        selection.length > 0 &&
                        selection.length !== elections.length
                      }
                      transitionDuration={0}
                      color="#961699"
                    />
                  </th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Live</th>
                  <th>Voting Type</th>
                </tr>
              </thead>
              <tbody>{rows}</tbody>
            </Table>

            <div className="flex justify-center">
              <Button
                onClick={verifyHandler}
                radius="lg"
                className=" bg-[#961699] hover:bg-[#961699] p-2 px-6 text-white opacity-95 outline-none border-none h-[2.5rem] mt-8 hover:opacity-80"
                loading={isLoadingAdding}
              >
                Add to Election
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
export default VerifyVoter;
