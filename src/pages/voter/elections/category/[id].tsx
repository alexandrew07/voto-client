import { Voter } from "@/features/authSlice";
import { RootState } from "@/store";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  useGetElectionsMutation,
  useGetSingleCategorizedElectionMutation,
} from "@/features/electionApi";
import { Button, SimpleGrid } from "@mantine/core";
import Link from "next/link";
import dayjs from "dayjs";
import Image from "next/image";

import elect from "/public/elec.png";
import small from "/public/small.png";
import Spinner from "@/components/Spinner";
import { Election } from "@/pages/organisation/elections";
import { useRouter } from "next/router";

const CategorizedElection = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [elections, setElections] = useState<Election[]>([]);
  const [pageNo, setPageNo] = useState<number>(1);

  const [getElection, { isLoading }] =
    useGetSingleCategorizedElectionMutation();

  const [categoryName, setCategoryName] = useState<string>("");

  const [categorizedElection, setCategorizedElection] = useState<Election[]>(
    []
  );

  const router = useRouter();

  const id = router.query.id;

  useEffect(() => {
    if (id === undefined) return;

    const fetchData = async () => {
      try {
        const electionsCategory = await getElection(id).unwrap();

        setCategorizedElection(electionsCategory.data.elections);
        setCategoryName(electionsCategory.data.name);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [getElection, pageNo, id]);

  const nextHandler = () => {
    setPageNo((prev) => prev + 1);
  };

  const prevHandler = () => {
    setPageNo((prev) => prev - 1);
  };

  if (isLoading || id === undefined) return <Spinner />;

  return (
    <div className="text-[#961699]">
      <div className="mb-6">
        <p className="!text-[#CCB6D3]">Welcome to Voto</p>
        <h3 className="font-bold text-[1.3rem] !text-[#961699]">
          {(user as Voter)?.name}
        </h3>
      </div>
      <div className="flex items-center justify-center mb-4">
        <div className="election-text px-[10px] py-[3px]">
          <h1>{categoryName && categoryName + "-"} Elections (categorized)</h1>
        </div>
      </div>

      {categorizedElection.length === 0 ? (
        <p className="text-center mt-10">
          This category does&apos;nt have any election(s) yet
        </p>
      ) : (
        <SimpleGrid
          cols={1}
          className="mt-10"
          breakpoints={[{ minWidth: 980, cols: 2, spacing: "md" }]}
        >
          {categorizedElection.map((election, index) => {
            return (
              <Link
                href={`/voter/elections/${election._id}?category=${id}`}
                key={index}
                className="cursor-pointer no-underline"
                style={{ textDecoration: "none" }}
              >
                <div className="election-card flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <Image
                        src={elect.src}
                        height={100}
                        width={100}
                        alt="something"
                        layout="fixed"
                        objectFit="contain"
                        style={{ width: "auto", height: "auto" }}
                      />
                    </div>
                    <div className="no-underline">
                      <h1 className="text-[25px]">{election.title}</h1>

                      {new Date(election.endingAt) > new Date() ? (
                        <>
                          <span>Ending at: </span>
                          {dayjs(election.endingAt).format("DD-MM-YYYY")}
                        </>
                      ) : (
                        "This Election Has Ended"
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center w-[100%] justify-end">
                      <Image
                        src={small.src}
                        height={100}
                        width={100}
                        alt="something"
                        layout="fixed"
                        objectFit="contain"
                        style={{ width: "auto", height: "auto" }}
                      />
                    </div>
                    <p>
                      {election.totalVotes}
                      {+election.totalVotes > 1 ? "VOTES" : "VOTE"}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </SimpleGrid>
      )}

      <div className="flex items-center gap-4 justify-end">
        {pageNo !== 1 && (
          <Button
            className=" bg-[#961699] hover:bg-[#961699] hover:text-white p-2 px-6 text-white opacity-95 outline-none border-none h-[2.5rem] mt-8 hover:opacity-80"
            onClick={prevHandler}
          >
            Previous
          </Button>
        )}
        {elections.length === 10 && (
          <Button
            className=" bg-[#961699] hover:bg-[#961699] hover:text-white p-2 px-6 text-white opacity-95 outline-none border-none h-[2.5rem] mt-8 hover:opacity-80"
            onClick={nextHandler}
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
};
export default CategorizedElection;
