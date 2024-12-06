import React from "react";
import { Button, FileInput, Modal } from "@mantine/core";
import Image from "next/image";
import sample from "../../../public/sample.png";

type ImportVotersProps = {
  openedImport: boolean;
  closeImport: () => void;
  votersCSV: File | null;
  setVotersCSV: React.Dispatch<React.SetStateAction<File | null>>;
  uploadHandler: () => Promise<void>;
  importLoading: boolean;
};

const ImportVoters: React.FC<ImportVotersProps> = ({
  openedImport,
  closeImport,
  votersCSV,
  setVotersCSV,
  uploadHandler,
  importLoading,
}) => {
  return (
    <Modal
      overlayProps={{ opacity: 0.4, blur: 1 }}
      title="IMPORT VOTERS"
      size="lg"
      centered
      radius="md"
      opened={openedImport}
      onClose={closeImport}
    >
      <p className="mt-4 mb-1">Please select the CSV file to import</p>
      <p className="text-[10pt] text-center mb-4">
        Note: name, username, email and password are compulsory to add to the
        header of the csv file followed with your organisation custom fields
      </p>

      <div className="py-4">
        <p className="text-center text-sm mb-1 underline-offset-2 underline">
          Sample file structure
        </p>
        <Image src={sample} alt="sample csv" />

        <p className="text-xs mt-2">
          NOTE: <span className="text-[#961699]">username</span> and{" "}
          <span className="text-[#961699]">email</span> must be unique
        </p>
      </div>

      <FileInput
        value={votersCSV}
        onChange={setVotersCSV}
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
export default ImportVoters;
