import TableLayout from "@/components/TableLayout";
import {
  useDeleteCandidateMutation,
  useGetCandidatesMutation,
  useImportCandidatesMutation,
} from "@/features/organisationApi";
import { RootState } from "@/store";
import { Button, Select, TextInput } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import CandidateModal from "@/components/Modals/CandidateModal";
import ImportCandidate from "@/components/Modals/ImportCandidate";
import UpdateCandidateModal from "@/components/Modals/UpdateCandidateModal";
import Spinner from "@/components/Spinner";
import { Organisation } from "@/features/authSlice";
import { useForm } from "@mantine/form";
import { useClipboard, useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconLink } from "@tabler/icons-react";
import Image from "next/image";
import eye from "/public/fi-sr-eye.svg";
import pencil from "/public/fi-sr-pencil.svg";
import trash from "/public/fi-sr-trash.svg";

type CandidateDetails = Record<string, string>;

interface Candidate {
  _id: string;
  fullName: string;
  email: string;
  gender: string;
  photoUrl: string;
  organisation: string;
  details: CandidateDetails;
}

const Candidate = () => {
  const [getCandidates, { isLoading, error }] = useGetCandidatesMutation();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [candidateId, setCandidateId] = useState<string>("");
  const [opened, { open, close }] = useDisclosure(false);
  const [
    openedUpdateCandidate,
    { open: openUpdateCandidate, close: closeUpdateCandidate },
  ] = useDisclosure(false);

  const clipboard = useClipboard({ timeout: 2000 });

  const [pageNo, setPageNo] = useState<number>(1);

  const [deleteCandidate] = useDeleteCandidateMutation();

  const [filterParams, setFilterParams] = useState<{
    filterBy: string;
    filterValue: string;
  }>({
    filterBy: "",
    filterValue: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { filterBy, filterValue } = filterParams;
        const candidates = await getCandidates({
          no: pageNo,
          limit: 100,
          filterBy,
          filterValue,
        }).unwrap();
        setCandidates(candidates.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [getCandidates, pageNo, filterParams]);

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
    (user as Organisation)?.candidatesFields?.map((field) => {
      return field.charAt(0).toUpperCase() + field.slice(1);
    }) ?? [];

  const nextHandler = () => {
    setPageNo((prev) => prev + 1);
  };

  const prevHandler = () => {
    setPageNo((prev) => prev - 1);
  };

  const deleteHandler = async (id: string) => {
    try {
      await deleteCandidate(id).unwrap();
      notifications.show({
        color: "green",
        message: "Candidate deleted successfully",
      });
      window.location.reload();
    } catch (error: any) {
      notifications.show({
        color: "red",
        message: error.data.message,
      });
    }
  };

  const [openedImport, { open: openImport, close: closeImport }] =
    useDisclosure(false);

  const [importCandidates, { isLoading: importLoading }] =
    useImportCandidatesMutation();

  const [candidatesCSV, setCandidatesCSV] = useState<File | null>(null);

  const uploadHandler = async () => {
    if (!candidatesCSV)
      return notifications.show({
        color: "red",
        message: "please select a csv file to import",
      });

    const formData = new FormData();
    formData.append("file", candidatesCSV);

    const data = {
      file: formData,
      id: user?._id,
    };

    try {
      const res = await importCandidates(data).unwrap();
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

  const form = useForm({
    initialValues: {
      filterBy: "",
      filterValue: "",
    },
  });

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

  const tableHeads = ["Full Name", "Email", "Gender", ...capitalizedFields];
  const th = (
    <tr>
      {tableHeads.map((head, index) => (
        <th key={index} className="table-head">
          {head}
        </th>
      ))}
      <th className="table-head">Actions</th>
    </tr>
  );

  const rows = candidates.map((candidate, index) => (
    <tr key={index}>
      <td className="table-data">{candidate?.fullName ?? "-"}</td>
      <td className="table-data">{candidate?.email ?? "-"}</td>
      <td className="table-data">{candidate?.gender ?? "-"}</td>
      {(user as Organisation)?.candidatesFields.map((field, fieldIndex) => (
        <td key={fieldIndex} className="table-data">
          {candidate && candidate.details && field in candidate.details
            ? candidate.details[field]
            : "-"}
        </td>
      ))}

      <td className="table-data flex gap-4 items-center">
        <Image
          src={pencil}
          alt="pencil"
          width={15}
          height={15}
          className="cursor-pointer"
          onClick={() => {
            setCandidateId(candidate._id);
            openUpdateCandidate();
          }}
        />
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
          onClick={() => deleteHandler(candidate._id)}
        />
      </td>
    </tr>
  ));

  if (!user) return null;

  return (
    <>
      <ImportCandidate
        openedImport={openedImport}
        closeImport={closeImport}
        candidatesCSV={candidatesCSV}
        setCandidatesCSV={setCandidatesCSV}
        uploadHandler={uploadHandler}
        importLoading={importLoading}
      />
      <UpdateCandidateModal
        opened={openedUpdateCandidate}
        close={closeUpdateCandidate}
        candidateId={candidateId}
      />
      <CandidateModal opened={opened} close={close} />
      <div>
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <div className="flex items-center gap-4 my-3">
              {/* <Button
                className="bg-[#F4ECFB] hover:bg-[#F4ECFB] hover:opacity-70 text-[#961699]"
                onClick={openImport}
              >
                <IconDownload stroke={1.5} /> Import
              </Button> */}

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
                    `${window.location.origin}/organisation/candidates/${user?._id}/create`
                  )
                }
              >
                <IconLink stroke={1.5} /> Copy Link
              </Button>
            </div>

            <form
              className="mt-10"
              onSubmit={form.onSubmit((values) => handleFilters(values))}
            >
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Filter by"
                  data={["Name", "Email", ...capitalizedFields]}
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

            <div className="mt-10">
              <TableLayout
                th={th}
                rows={rows}
                title="CANDIDATES"
                nextHandler={nextHandler}
                prevHandler={prevHandler}
                pageNo={pageNo}
                data={candidates}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Candidate;
