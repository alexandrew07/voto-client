import React from "react";
import { Button, FileInput, Modal } from "@mantine/core";

type ImportCandidateProps = {
  openedImport: boolean;
  closeImport: () => void;
  candidatesCSV: File | null;
  setCandidatesCSV: React.Dispatch<React.SetStateAction<File | null>>;
  uploadHandler: () => Promise<void>;
  importLoading: boolean;
};

const ImportCandidate: React.FC<ImportCandidateProps> = ({
  openedImport,
  closeImport,
  candidatesCSV,
  setCandidatesCSV,
  uploadHandler,
  importLoading,
}) => {
  return (
    <Modal
      overlayProps={{ opacity: 0.4, blur: 1 }}
      title="IMPORT VOTERS"
      size="md"
      centered
      radius="md"
      opened={openedImport}
      onClose={closeImport}
    >
      <p className="mt-4 mb-1">Please select the CSV file to import</p>
      <p className="text-[10pt] text-center mb-4">
        Note: fullName, gender and email are compulsory to add to the header.
        followed with your description
      </p>
      <FileInput
        value={candidatesCSV}
        onChange={setCandidatesCSV}
        placeholder="Upload CSV"
        accept=".csv"
        required
      />

      <div className="w-full flex justify-center">
        <Button
          className=" bg-[#961699] hover:bg-[#961699] p-2 px-6 text-white opacity-95 outline-none border-none h-[2.5rem] mt-8 hover:opacity-80"
          onClick={uploadHandler}
          loading={importLoading}
        >
          Upload
        </Button>
      </div>
    </Modal>
  );
};
export default ImportCandidate;
