import Spinner from "@/components/Spinner";
import TableLayout from "@/components/TableLayout";
import {
  useGetAllCategorizedElectionsMutation,
  useDeleteCategorizedElectionMutation,
} from "@/features/electionApi";
import { useEffect, useState } from "react";

import Image from "next/image";
import { useRouter } from "next/router";
import eye from "/public/fi-sr-eye.svg";
import trash from "/public/fi-sr-trash.svg";
import { notifications } from "@mantine/notifications";
import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

interface CategorizedElection {
  name: string;
  _id: string;
}

const Categories = () => {
  const [getElections, { isLoading }] = useGetAllCategorizedElectionsMutation();
  const [deleteCategory, { isLoading: loadingDelete }] =
    useDeleteCategorizedElectionMutation();
  const [pageNo, setPageNo] = useState<number>(1);
  const [categories, setCategories] = useState<CategorizedElection[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [opened, { open, close }] = useDisclosure();

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const electionsCategory = await getElections({
          no: pageNo,
          limit: 100,
        }).unwrap();

        const mappedCategories = electionsCategory.data.map(
          (category: any) => ({
            _id: category._id,
            name: category.name,
          })
        );

        setCategories(mappedCategories);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [getElections, pageNo]);

  const deleteHandler = async () => {
    if (!selectedCategoryId) return;

    try {
      await deleteCategory(selectedCategoryId).unwrap();
      notifications.show({
        color: "green",
        message: "Category deleted successfully",
      });
      window.location.reload();
    } catch (error: any) {
      notifications.show({
        color: "red",
        message: error.data.message,
      });
    } finally {
      close();
    }
  };

  const th = (
    <tr>
      <th className="table-head">Category Name</th>
      <th className="table-head"></th>
      <th className="table-head"></th>
      <th className="table-head"></th>
      <th className="table-head"></th>
      <th className="table-head"></th>
      <th className="table-head"></th>
      <th className="table-head"></th>
      <th className="table-head"></th>
      <th className="table-head"></th>
      <th className="table-head"></th>
      <th className="table-head"></th>
    </tr>
  );

  const rows = categories.map((category, index) => (
    <tr key={index}>
      <td className="table-data">{category.name}</td>
      <td className="table-data"></td>
      <td className="table-data"></td>
      <td className="table-data"></td>
      <td className="table-data"></td>
      <td className="table-data"></td>
      <td className="table-data"></td>
      <td className="table-data"></td>
      <td className="table-data"></td>
      <td className="table-data"></td>
      <td className="table-data"></td>
      <td className="table-data flex gap-4 items-center justify-start">
        <Image
          src={eye}
          alt="eye"
          width={15}
          height={15}
          className="cursor-pointer"
          onClick={() =>
            router.push(`/organisation/elections/categories/${category._id}`)
          }
        />

        <Image
          src={trash}
          alt="trash"
          width={15}
          height={15}
          className="cursor-pointer"
          onClick={() => {
            setSelectedCategoryId(category._id);
            open();
          }}
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
      <Modal
        opened={opened}
        onClose={close}
        title="Delete Category"
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
          Are you sure you want to delete this category? All the elections in it
          will be uncategorized.
        </p>

        <div className="mt-4 flex items-center justify-center">
          <Button
            loading={loadingDelete}
            type="button"
            onClick={deleteHandler}
            className="bg-[#961699] hover:bg-[#961699] p-2 px-6 text-white outline-none border-none h-[2.5rem] hover:opacity-80"
          >
            Continue
          </Button>
        </div>
      </Modal>

      <div>
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <div className="mt-10">
              <TableLayout
                th={th}
                rows={rows}
                title="CATEGORIZED ELECTIONS"
                pageNo={pageNo}
                nextHandler={nextHandler}
                prevHandler={prevHandler}
                data={categories}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Categories;
