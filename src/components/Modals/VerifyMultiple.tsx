import {
  useAddMultipleVoterToMultipleElectionsMutation,
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

type VerifyMultipleProps = {
  opened: boolean;
  close: () => void;
  voterIds: string[];
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

const VerifyMultiple: React.FC<VerifyMultipleProps> = ({
  voterIds,
  opened,
  close,
}) => {
  const { classes, cx } = useStyles();

  const [elections, setElections] = useState<Election[]>([]);
  const [getElections, { isLoading, error }] = useGetElectionsMutation();
  const [addMultiple, { isLoading: loadingMultiple }] =
    useAddMultipleVoterToMultipleElectionsMutation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const elections = await getElections({
          no: 0,
          limit: 0,
        }).unwrap();
        setElections(elections.data);
      } catch (error) {}
    };

    fetchData();
  }, [getElections]);

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
        message: "please select an election to add these voters to",
      });

    const data = {
      voterIds,
      electionIds: selection,
    };

    try {
      const res = await addMultiple(data).unwrap();
      notifications.show({
        color: "green",
        message: res.message,
      });
      close();
      // window.location.reload();
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
      onClose={close}
      overlayProps={{ opacity: 0.4, blur: 1 }}
      title="VERIFY MULTIPLE VOTERS TO MULTIPLE ELECTIONS"
      size="xl"
      radius="md"
      classNames={{
        body: classes.body,
        title: classes.title,
      }}
    >
      <div>
        {isLoading ? (
          <p className="text-center">Loading...</p>
        ) : elections.length === 0 ? (
          <p className="text-center">
            There are no elections to verify these voters too.
          </p>
        ) : (
          <>
            <p className="my-3 text-center">
              You are about to verify {voterIds.length} voters to this selected
              election(s)
            </p>
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
                loading={loadingMultiple}
              >
                Verify
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
export default VerifyMultiple;
