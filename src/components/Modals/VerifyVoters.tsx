import { Organisation, Voter } from "@/features/authSlice";
import {
  useGetElectionMutation,
  useVerifyVotersMutation,
} from "@/features/electionApi";
import { useGetVotersMutation } from "@/features/voterApi";
import { RootState } from "@/store";
import {
  Button,
  Checkbox,
  Divider,
  Modal,
  ScrollArea,
  Select,
  Table,
  Text,
  TextInput,
  createStyles,
  rem,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCaretRight } from "@tabler/icons-react";
import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

type VerifyVotersProps = {
  opened: boolean;
  close: () => void;
  electionId: string;
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

const VerifyVoters: React.FC<VerifyVotersProps> = ({
  opened,
  close,
  electionId,
}) => {
  const { classes, cx } = useStyles();
  const [getVoters] = useGetVotersMutation();
  const [verifyVoters, { isLoading, error }] = useVerifyVotersMutation();
  const [voters, setVoters] = useState<Voter[]>([]);

  const [loading, setLoading] = useState(false);

  const [getElection] = useGetElectionMutation();
  const [pageNo, setPageNo] = useState<number>(1);

  const [filterValues, setFilterValues] = useState<{
    filterBy: string;
    filterValue: string;
  }>({
    filterBy: "",
    filterValue: "",
  });

  const { user } = useSelector((state: RootState) => state.auth);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: votersData } = await getVoters({
        no: pageNo,
        limit: 0,
        filterBy: filterValues.filterBy,
        filterValue: filterValues.filterValue,
      }).unwrap();
      const res = await getElection(electionId).unwrap();
      const votersInElection = res.data.voters;

      const newVoters = votersData.filter(
        (voter: Voter) =>
          !votersInElection.some((v: Voter) => v._id === voter._id)
      );

      setVoters(newVoters);
    } catch (error: any) {
      notifications.show({
        color: "red",
        message: error.data.message,
      });
    } finally {
      setLoading(false);
    }
  }, [getElection, getVoters, electionId, pageNo, filterValues]);

  useEffect(() => {
    if (!electionId) return;
    fetchData();
  }, [electionId, fetchData, getElection, getVoters]);

  const [selection, setSelection] = useState<string[]>([]);
  const toggleRow = (id: string) =>
    setSelection((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );

  const toggleAll = () =>
    setSelection((current) =>
      current.length === voters.length ? [] : voters.map((item) => item._id)
    );

  const rows = voters.map((voter) => {
    const selected = selection.includes(voter._id);
    return (
      <tr key={voter._id} className={cx({ [classes.rowSelected]: selected })}>
        <td>
          <Checkbox
            checked={selection.includes(voter._id)}
            onChange={() => toggleRow(voter._id)}
            transitionDuration={0}
          />
        </td>
        <td>
          <Text size="sm" weight={500}>
            {voter.name}
          </Text>
        </td>
        <td>{voter.email || "-"}</td>
        {/* <td>{voter.gender}</td> */}
      </tr>
    );
  });

  const verifyHandler = async () => {
    if (selection.length === 0)
      return notifications.show({
        color: "red",
        message: "please select a voter to add",
      });

    const data = {
      data: { voters: selection },
      id: electionId,
    };
    try {
      const res = await verifyVoters(data).unwrap();
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

  const form = useForm({
    initialValues: {
      filterBy: "",
      filterValue: "",
    },
  });

  const handleFilters = async (values: {
    filterBy: string;
    filterValue: string;
  }) => {
    const { filterValue, filterBy } = values;

    if (!filterBy) {
      notifications.show({
        color: "red",
        message: "Please select a filter by field",
      });
      return;
    }

    setFilterValues(values);
    setPageNo(1);

    setLoading(true);
    try {
      const { data: votersData } = await getVoters({
        no: 1,
        limit: 0,
        filterBy,
        filterValue,
      }).unwrap();
      const res = await getElection(electionId).unwrap();
      const votersInElection = res.data.voters;

      const newVoters = votersData.filter(
        (voter: Voter) => !votersInElection.some((v: string) => v === voter._id)
      );

      setVoters(newVoters);
    } catch (error: any) {
      notifications.show({
        color: "red",
        message: error.data.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const nextHandler = async () => {
    setPageNo((prev) => prev + 1);
  };

  const prevHandler = () => {
    setPageNo((prev) => prev - 1);
  };

  return (
    <Modal
      opened={opened}
      onClose={async () => {
        close();
        form.reset();
        setPageNo(1);
        setFilterValues({
          filterBy: "",
          filterValue: "",
        });
        fetchData();
      }}
      overlayProps={{ opacity: 0.4, blur: 1 }}
      title="VERIFY VOTERS"
      size="lg"
      radius="md"
      classNames={{
        body: classes.body,
        title: classes.title,
      }}
    >
      <form onSubmit={form.onSubmit((values) => handleFilters(values))}>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Filter by"
            data={(user as Organisation)?.votersFields?.map(
              (votersField) => votersField
            )}
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
        <Button
          type="submit"
          className=" bg-[#961699] hover:bg-[#961699] p-2 px-6 text-white opacity-95 outline-none border-none h-[2.5rem] mt-4 hover:opacity-80"
        >
          Submit
        </Button>
      </form>

      <Divider className="my-4" />

      <div>
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : voters.length === 0 ? (
          <p className="text-center">
            All voters are allowed to vote or voter(s) not found with the
            specific filter.
          </p>
        ) : (
          <ScrollArea>
            <Table verticalSpacing="sm">
              <thead>
                <tr>
                  <th style={{ width: rem(40) }}>
                    <Checkbox
                      onChange={toggleAll}
                      checked={selection.length === voters.length}
                      indeterminate={
                        selection.length > 0 &&
                        selection.length !== voters.length
                      }
                      transitionDuration={0}
                      color="#961699"
                    />
                  </th>
                  <th>Name</th>
                  <th>Email</th>
                  {/* <th>Gender</th> */}
                </tr>
              </thead>
              <tbody>{rows}</tbody>
            </Table>

            <aside className="flex items-center gap-3 justify-end">
              {pageNo !== 1 && (
                <button
                  className="px-2 p-1 bg-[#F4ECFB] border-none rounded cursor-pointer hover:bg-[#F4ECFB] hover:opacity-70 rotate-180"
                  onClick={prevHandler}
                >
                  <IconCaretRight stroke={1.5} size={20} color="#68066A" />
                </button>
              )}

              <button className="px-[0.9rem] py-[0.3rem] bg-[#F4ECFB] border-none rounded cursor-pointer hover:bg-[#F4ECFB] hover:opacity-70 text-[#68066A]">
                {pageNo}
              </button>

              {voters && voters.length === 100 && (
                <button
                  className="px-2 p-1 bg-[#F4ECFB] border-none rounded cursor-pointer hover:bg-[#F4ECFB] hover:opacity-70"
                  onClick={nextHandler}
                >
                  <IconCaretRight stroke={1.5} size={20} color="#68066A" />
                </button>
              )}
            </aside>

            <div className="flex justify-center">
              <Button
                onClick={verifyHandler}
                radius="lg"
                className=" bg-[#961699] hover:bg-[#961699] p-2 px-6 text-white opacity-95 outline-none border-none h-[2.5rem] mt-8 hover:opacity-80"
                loading={isLoading}
              >
                verify voters
              </Button>
            </div>
          </ScrollArea>
        )}
      </div>
    </Modal>
  );
};
export default VerifyVoters;
