import TableLayout from "@/components/TableLayout";
import { useEffect, useState } from "react";

import Spinner from "@/components/Spinner";
import {
  useGetSingleCategorizedElectionMutation,
  useRemoveElectionFromCategoryMutation,
  useUpdateCategorizedElectionStatusMutation,
  useToggleElectionsInCategoryMutation,
  useStartSelectedElectionsMutation,
  useEndSelectedElectionsMutation,
} from "@/features/electionApi";
import { Affix, Button, Checkbox, Modal } from "@mantine/core";
import { useClipboard, useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconLink } from "@tabler/icons-react";
import Image from "next/image";
import { useRouter } from "next/router";
import { Election } from "..";
import eye from "/public/fi-sr-eye.svg";
import { IconRotate } from "@tabler/icons-react";

const CategorizedElections = () => {
  const [getElection, { isLoading }] =
    useGetSingleCategorizedElectionMutation();

  const [updateStatus, { isLoading: loadingUpdate }] =
    useUpdateCategorizedElectionStatusMutation();

  const [toggleElections, { isLoading: loadingToggle }] =
    useToggleElectionsInCategoryMutation();

  const [startSelectedElections, { isLoading: loadingStartSelected }] =
    useStartSelectedElectionsMutation();
  const [endSelectedElections, { isLoading: loadingEndSelected }] =
    useEndSelectedElectionsMutation();

  const [categorizedElection, setCategorizedElection] = useState<Election[]>(
    []
  );
  const [opened, { open, close }] = useDisclosure(false);
  const [pageNo, setPageNo] = useState<number>(1);
  const [categoryName, setCategoryName] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [categoryStatus, setCategoryStatus] = useState<boolean>(false);

  const router = useRouter();

  const id = router.query.id;

  const clipboard = useClipboard({ timeout: 2000 });

  useEffect(() => {
    clipboard.copied
      ? notifications.show({
          color: "green",
          message: "copied",
        })
      : "";
  }, [clipboard]);

  const [selection, setSelection] = useState<string[]>([]);
  const toggleRow = (id: string) =>
    setSelection((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );

  const toggleAll = () =>
    setSelection((current) =>
      current.length === categorizedElection.length
        ? []
        : categorizedElection.map((item) => item._id)
    );

  useEffect(() => {
    if (id === undefined) return;

    const fetchData = async () => {
      try {
        const electionsCategory = await getElection(id).unwrap();

        setCategorizedElection(electionsCategory.data.elections);
        setCategoryName(electionsCategory.data.name);
        setCategoryId(electionsCategory.data._id);
        setCategoryStatus(electionsCategory.data.opened);
      } catch (error) {}
    };

    fetchData();
  }, [getElection, pageNo, id]);

  const [removeElection, { isLoading: loadingRemove }] =
    useRemoveElectionFromCategoryMutation();

  const removeHandler = async () => {
    try {
      const res = await removeElection({
        id: categoryId,
        data: { elections: selection },
      }).unwrap();
      notifications.show({
        color: "green",
        message: res.message || "election removed successfully",
      });

      if (res.message === "Category deleted as it became empty") {
        router.push(`/organisation/elections/categories`);
      } else {
        window.location.reload();
      }
    } catch (error: any) {
      notifications.show({
        color: "red",
        message: error.data.message,
      });
    }
  };

  const startElectionsHandler = async () => {
    try {
      const res = await toggleElections({
        id: categoryId,
        data: { action: "start" },
      }).unwrap();
      notifications.show({
        color: "green",
        message: res.message || "Elections started successfully",
      });
      window.location.reload();
    } catch (error: any) {
      notifications.show({
        color: "red",
        message: error.data.message,
      });
    }
  };

  const endElectionsHandler = async () => {
    try {
      const res = await toggleElections({
        id: categoryId,
        data: { action: "end" },
      }).unwrap();
      notifications.show({
        color: "green",
        message: res.message || "Elections ended successfully",
      });
      window.location.reload();
    } catch (error: any) {
      notifications.show({
        color: "red",
        message: error.data.message,
      });
    }
  };

  const startSelectedHandler = async () => {
    try {
      const res = await startSelectedElections({
        electionIds: selection,
      }).unwrap();
      notifications.show({
        color: "green",
        message: res.message || "Selected elections started successfully",
      });
      window.location.reload();
    } catch (error: any) {
      notifications.show({
        color: "red",
        message: error.data.message,
      });
    }
  };

  const endSelectedHandler = async () => {
    try {
      const res = await endSelectedElections({
        electionIds: selection,
      }).unwrap();
      notifications.show({
        color: "green",
        message: res.message || "Selected elections ended successfully",
      });
      window.location.reload();
    } catch (error: any) {
      notifications.show({
        color: "red",
        message: error.data.message,
      });
    }
  };

  const allElectionsPendingOrCompleted = categorizedElection.every(
    (election) =>
      election.status === "pending" || election.status === "completed"
  );

  const anyElectionActive = categorizedElection.some(
    (election) => election.status === "active"
  );

  const tableHeads = ["Title", "Live", "Type", "Votes"];
  const th = (
    <tr>
      <th>
        <Checkbox
          onChange={toggleAll}
          checked={selection.length === categorizedElection.length}
          indeterminate={
            selection.length > 0 &&
            selection.length !== categorizedElection.length
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

  const rows = categorizedElection.map((election, index) => (
    <tr key={index}>
      <td>
        <Checkbox
          checked={selection.includes(election._id)}
          onChange={() => toggleRow(election._id)}
          transitionDuration={0}
          onClick={(e) => e.stopPropagation()}
        />
      </td>
      <td className="table-data">{election.title}</td>
      <td className="table-data">{election.liveVoting ? "Yes" : "No"}</td>
      <td className="table-data">{election.votingType}</td>
      <td className="table-data">{election.totalVotes}</td>

      <td
        className="table-data flex gap-4 items-center justify-start"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={eye}
          alt="eye"
          width={15}
          height={15}
          className="cursor-pointer"
          onClick={() => router.push(`/organisation/elections/${election._id}`)}
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
      {selection.length > 0 && (
        <Modal
          opened={opened}
          onClose={close}
          title="Remove Election"
          size="500px"
          styles={{
            title: {
              fontWeight: 600,
              fontSize: "1.3rem",
            },
          }}
          centered
        >
          <p className="text-center">
            Are you sure you want to remove{" "}
            {selection.length > 1 ? "these elections" : "this election"} from
            this category?
          </p>

          <div className="mt-4 flex items-center justify-center">
            <Button
              loading={loadingRemove}
              type="button"
              onClick={removeHandler}
              className="bg-[#961699] hover:bg-[#961699] p-2 px-6 text-white outline-none border-none h-[2.5rem] hover:opacity-80"
            >
              Continue
            </Button>
          </div>
        </Modal>
      )}
      <div>
        {isLoading || id === undefined ? (
          <Spinner />
        ) : (
          <>
            <div className="flex items-center gap-4 my-3">
              <Button
                className="bg-[#F4ECFB] hover:bg-[#F4ECFB] hover:opacity-70 text-[#961699] transition"
                color={clipboard.copied ? "teal" : "blue"}
                onClick={() => {
                  clipboard.copy(
                    `${window.location.origin}/voter/elections/category/${categoryId}`
                  );
                }}
              >
                <IconLink stroke={1.5} /> Copy Categorized Election Link
              </Button>
            </div>

            <div className="mb-4 flex items-center gap-2">
              Category Status:{" "}
              <strong className={`${loadingUpdate && "opacity-20"}`}>
                {categoryStatus ? "OPENED" : "CLOSED"}
              </strong>
              <IconRotate
                className={`text-[#961699] cursor-pointer ${
                  loadingUpdate && "opacity-20"
                }`}
                onClick={async () => {
                  if (loadingUpdate) return;

                  const payload = {
                    id: categoryId,
                    data: {
                      opened: categoryStatus ? false : true,
                    },
                  };

                  try {
                    const res = await updateStatus(payload).unwrap();
                    notifications.show({
                      color: "green",
                      message: res.message,
                    });
                    window.location.reload();
                  } catch (error: any) {
                    notifications.show({
                      color: "red",
                      message: error.data.message,
                    });
                  }
                }}
              />
            </div>
            <p className="text-sm -mt-2 italic">
              all elections in this category are{" "}
              {categoryStatus
                ? "opened and anyone on the internet can vote in them"
                : "closed and only logged in voters can vote in them"}
            </p>

            <div className="flex items-center gap-2 mt-10">
              {allElectionsPendingOrCompleted && (
                <Button
                  loading={loadingToggle}
                  className="bg-[#961699]  text-white hover:bg-[#961699] hover:opacity-80"
                  onClick={startElectionsHandler}
                >
                  Start Elections
                </Button>
              )}
              {anyElectionActive && (
                <Button
                  loading={loadingToggle}
                  className="bg-[#961699]  text-white hover:bg-[#961699] hover:opacity-80"
                  onClick={endElectionsHandler}
                >
                  End Elections
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2 mt-10">
              {selection.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    loading={loadingStartSelected}
                    loaderProps={{
                      color: "#961699",
                    }}
                    className="border-[#961699]  text-[var(--primary-color)] hover:bg-[#961699]/30"
                    onClick={startSelectedHandler}
                  >
                    Start Selected Elections
                  </Button>
                  <Button
                    loading={loadingEndSelected}
                    loaderProps={{
                      color: "#961699",
                    }}
                    className="border-[#961699]  text-[var(--primary-color)] hover:bg-[#961699]/30"
                    onClick={endSelectedHandler}
                  >
                    End Selected Elections
                  </Button>
                </>
              )}
            </div>

            <div className="mt-4">
              <TableLayout
                th={th}
                rows={rows}
                title={`${categoryName}(categorized)`}
                pageNo={pageNo}
                nextHandler={nextHandler}
                prevHandler={prevHandler}
                data={categorizedElection}
              />
            </div>

            {selection.length > 0 && !opened && (
              <Affix position={{ bottom: 20, right: 20 }}>
                <Button
                  className="bg-[#961699] hover:bg-[#961699] hover:opacity-80"
                  onClick={open}
                >
                  Remove from category
                </Button>
              </Affix>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default CategorizedElections;
