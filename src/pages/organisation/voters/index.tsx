import TableLayout from "@/components/TableLayout";
import { RootState } from "@/store";
import { Button, Checkbox, Select, TextInput } from "@mantine/core";
import {
  IconDownload,
  IconLink,
  IconPlus,
  IconPrinter,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

import ImportVoters from "@/components/Modals/ImportVoters";
import VerifyMultiple from "@/components/Modals/VerifyMultiple";
import VerifyVoter from "@/components/Modals/VerifyVoter";
import VoterModal from "@/components/Modals/VoterModal";
import Spinner from "@/components/Spinner";
import { Organisation } from "@/features/authSlice";
import { useUpdateExternalRegistrationMutation } from "@/features/organisationApi";
import {
  useDeleteMultipleVotersMutation,
  useDeleteVoterMutation,
  useGetVotersMutation,
  useImportVotersMutation,
} from "@/features/voterApi";
import { useForm } from "@mantine/form";
import { useClipboard, useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import Image from "next/image";
import { useReactToPrint } from "react-to-print";
import eye from "/public/fi-sr-eye.svg";
import trash from "/public/fi-sr-trash.svg";

type VotersDetails = Record<string, string>;

interface Voter {
  name: string;
  username: string;
  email: string;
  details: VotersDetails;
  _id: string;
}

const Voters = () => {
  const [getVoters, { isLoading, error }] = useGetVotersMutation();
  const [voters, setVoters] = useState<Voter[]>([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [openedImport, { open: openImport, close: closeImport }] =
    useDisclosure(false);
  const [
    openedVerifyVoter,
    { open: openVerifyVoter, close: closeVerifyVoter },
  ] = useDisclosure(false);
  const [openedMultiple, { open: openMultiple, close: closeMultiple }] =
    useDisclosure(false);
  const [votersCSV, setVotersCSV] = useState<File | null>(null);
  const [importVoters, { isLoading: importLoading }] =
    useImportVotersMutation();
  const [deleteVoter] = useDeleteVoterMutation();
  const [deleteMultipleVoters] = useDeleteMultipleVotersMutation();
  const clipboard = useClipboard({ timeout: 2000 });

  const [pageNo, setPageNo] = useState<number>(1);

  const [voterId, setVoterId] = useState("");

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { filterBy, filterValue } = filterParams;
        const voters = await getVoters({
          no: pageNo,
          limit: 100,
          filterBy,
          filterValue,
        }).unwrap();
        setVoters(voters.data);
      } catch (error) {
        console.error("Error fetching voters:", error);
      }
    };

    fetchData();
  }, [getVoters, pageNo, filterParams]);

  const deleteHandler = async (id: string) => {
    try {
      await deleteVoter(id).unwrap();
      notifications.show({
        color: "green",
        message: "voter deleted successfully",
      });
      setTimeout(() => {
        setVoters((prevVoters) =>
          prevVoters.filter((voter) => voter._id !== id)
        );
      }, 1000);
    } catch (error: any) {
      notifications.show({
        color: "red",
        message: error.data.message,
      });
    }
  };

  const deleteMultiple = async () => {
    try {
      await deleteMultipleVoters(selection).unwrap();
      notifications.show({
        color: "green",
        message: "voters deleted successfully",
      });

      setTimeout(() => {
        setVoters((prevVoters) =>
          prevVoters.filter((voter) => !selection.includes(voter._id))
        );
      }, 1000);
    } catch (error: any) {
      notifications.show({
        color: "red",
        message: error.data.message,
      });
    }
  };

  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    clipboard.copied
      ? notifications.show({
          color: "green",
          message: "copied",
        })
      : "";
  }, [clipboard]);

  const capitalizedFields =
    (user as Organisation)?.votersFields.map((field) => {
      return field.charAt(0).toUpperCase() + field.slice(1);
    }) ?? [];

  const tableHeads = ["Name", "Username", "Email", ...capitalizedFields];

  const th = (
    <tr>
      <th>
        <Checkbox
          onChange={toggleAll}
          checked={selection.length === voters.length}
          indeterminate={
            selection.length > 0 && selection.length !== voters.length
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

  const rows = voters.map((voter, index) => (
    <tr
      className="cursor-pointer"
      onClick={() => {
        setVoterId(voter._id);
        openVerifyVoter();
      }}
      key={voter._id}
    >
      <td>
        <Checkbox
          checked={selection.includes(voter._id)}
          onChange={() => toggleRow(voter._id)}
          transitionDuration={0}
          onClick={(e) => e.stopPropagation()}
        />
      </td>
      <td className="table-data">{voter?.name ?? "-"}</td>
      <td className="table-data">{voter?.username ?? "-"}</td>
      <td className="table-data">{voter?.email ?? "-"}</td>
      {(user as Organisation)?.votersFields.map((field, fieldIndex) => (
        <td key={fieldIndex} className="table-data">
          {voter && voter.details && field in voter.details
            ? voter.details[field]
            : "-"}
        </td>
      ))}

      <td className="table-data flex gap-4 items-center">
        <Image
          src={eye}
          alt="pencil"
          width={15}
          height={15}
          className="cursor-pointer"
        />

        <Image
          src={trash}
          alt="pencil"
          width={15}
          height={15}
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            deleteHandler(voter._id);
          }}
        />
      </td>
    </tr>
  ));

  const uploadHandler = async () => {
    if (!votersCSV)
      return notifications.show({
        color: "red",
        message: "please select a csv file to import",
      });

    const formData = new FormData();
    formData.append("file", votersCSV);

    const data = {
      file: formData,
      id: user?._id,
    };

    try {
      const res = await importVoters(data).unwrap();
      notifications.show({
        color: "green",
        message: res.message,
      });
      closeImport();

      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error: any) {
      notifications.show({
        color: "red",
        message: error.data.message,
      });
    }
  };

  const nextHandler = () => {
    setPageNo((prev) => prev + 1);
  };

  const prevHandler = () => {
    setPageNo((prev) => prev - 1);
  };

  const clearFilters = () => {
    if (filterParams.filterBy === "" && filterParams.filterValue === "") return;
    setFilterParams({ filterBy: "", filterValue: "" });
    form.reset();
  };

  const handleFilters = async (values: {
    filterBy: string;
    filterValue: string;
  }) => {
    const { filterBy, filterValue } = values;
    if (!filterBy) {
      return notifications.show({
        color: "red",
        message: "please select a filter by field",
      });
    }

    const _filterBy = filterBy.charAt(0).toLowerCase() + filterBy.slice(1);

    setFilterParams({ filterBy: _filterBy, filterValue });
    setPageNo(1);
  };

  const [isPrinting, setIsPrinting] = useState(false);
  const printRef = useRef(null);

  const promiseResolveRef = useRef<any>(null);

  useEffect(() => {
    if (isPrinting && promiseResolveRef.current) {
      promiseResolveRef.current();
    }
  }, [isPrinting]);

  const handlePrint = useReactToPrint({
    copyStyles: false,
    content: () => printRef.current,
    onBeforeGetContent: () => {
      return new Promise((resolve) => {
        promiseResolveRef.current = resolve;
        setIsPrinting(true);
      });
    },
    onAfterPrint: () => {
      // Reset the Promise resolve so we can print again
      promiseResolveRef.current = null;
      setIsPrinting(false);
    },
  });

  if (!user) return null;

  return (
    <>
      <VerifyVoter
        opened={openedVerifyVoter}
        close={closeVerifyVoter}
        voterId={voterId}
      />
      <VerifyMultiple
        opened={openedMultiple}
        close={closeMultiple}
        voterIds={selection}
      />
      <ImportVoters
        openedImport={openedImport}
        closeImport={closeImport}
        votersCSV={votersCSV}
        setVotersCSV={setVotersCSV}
        uploadHandler={uploadHandler}
        importLoading={importLoading}
      />
      <VoterModal opened={opened} close={close} />

      <div>
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <div className="flex items-center gap-4 my-3">
              <Button
                className="bg-[#F4ECFB] hover:bg-[#F4ECFB] hover:opacity-70 text-[#961699]"
                onClick={openImport}
              >
                <IconDownload stroke={1.5} /> Import
              </Button>

              <Button
                className="bg-[#961699] hover:bg-[#961699] hover:opacity-70"
                onClick={open}
              >
                <IconPlus stroke={1.5} /> Add
              </Button>

              <Button
                className="bg-[#961699] hover:bg-[#961699] hover:opacity-70"
                color={clipboard.copied ? "teal" : "blue"}
                onClick={() =>
                  clipboard.copy(
                    `${window.location.origin}/organisation/voters/${user?._id}/register`
                  )
                }
              >
                <IconLink stroke={1.5} /> Copy Link
              </Button>

              <Button
                className="bg-[#961699] hover:bg-[#961699] hover:opacity-70"
                onClick={handlePrint}
              >
                <IconPrinter stroke={1.5} /> Print voters list
              </Button>
            </div>

            <form
              className="mt-10"
              onSubmit={form.onSubmit((values) => handleFilters(values))}
            >
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Filter by"
                  data={["Name", "Email", "Username", ...capitalizedFields]}
                  required
                  withAsterisk={false}
                  {...form.getInputProps("filterBy")}
                  dropdownPosition="bottom"
                  placeholder="Select one"
                />
                <TextInput
                  label="Filter value"
                  required
                  withAsterisk={false}
                  {...form.getInputProps("filterValue")}
                  placeholder="Values..."
                />
              </div>
              <div className="flex items-center gap-4 mt-4">
                <Button
                  type="button"
                  onClick={clearFilters}
                  className="border border-[#961699] text-[#961699] p-2 px-6 outline-none h-[2.5rem] hover:opacity-80"
                >
                  Clear
                </Button>
                <Button
                  type="submit"
                  className="bg-[#961699] hover:bg-[#961699] p-2 px-6 text-white outline-none border-none h-[2.5rem] hover:opacity-80"
                >
                  Submit
                </Button>
              </div>
            </form>

            <div className="mt-10 py-10">
              <TableLayout
                ref={printRef}
                th={th}
                rows={rows}
                title="VOTERS"
                pageNo={pageNo}
                nextHandler={nextHandler}
                prevHandler={prevHandler}
                data={voters}
              />
            </div>

            <div className="fixed right-6 bottom-6">
              <div className="flex items-center gap-4">
                {selection.length > 1 && (
                  <>
                    <Button
                      className="bg-[#961699] hover:bg-[#961699] hover:opacity-80"
                      onClick={openMultiple}
                    >
                      Verify Multiple
                    </Button>

                    <Button
                      className="bg-[#961699] hover:bg-[#961699] hover:opacity-80"
                      onClick={deleteMultiple}
                    >
                      Delete Multiple
                    </Button>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Voters;
