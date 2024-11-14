import {
  useEndElectionMutation,
  useGetElectionMutation,
  useStartElectionMutation,
  useToggleElectionMutation,
} from "@/features/electionApi";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Election } from "..";
import Image from "next/image";
import Spinner from "@/components/Spinner";
import { Button, SimpleGrid } from "@mantine/core";
import Link from "next/link";
import { notifications } from "@mantine/notifications";
import { IconLink } from "@tabler/icons-react";
import { useClipboard } from "@mantine/hooks";

const ElectionDetails = () => {
  const { query, push } = useRouter();
  const electionId = query.id;
  const [election, setElection] = useState<Election>();
  const [timer, setTimer] = useState("");

  const clipboard = useClipboard({ timeout: 2000 });

  const [getElection] = useGetElectionMutation();
  const [endElection, { isLoading }] = useEndElectionMutation();
  const [toggleElectionApi, { isLoading: loadingToggle }] =
    useToggleElectionMutation();
  const [startElection, { isLoading: loadingStartElection }] =
    useStartElectionMutation();

  useEffect(() => {
    clipboard.copied
      ? notifications.show({
          color: "green",
          message: "copied",
        })
      : "";
  }, [clipboard.copied]);

  useEffect(() => {
    if (!electionId) return;
    async function fetchData() {
      const res = await getElection(electionId).unwrap();

      setElection(res.data);
    }
    fetchData();
  }, [electionId, getElection]);

  if (!election) return <Spinner />;

  const totalVotes = election.candidates.reduce(
    (total, candidate) => total + candidate.votesReceived,
    0
  );

  const handlePrint = () => {
    window.print();
  };

  const countDown = (date: string) => {
    // Set the date we're counting down to
    let countDownDate = new Date(date).getTime();

    if (Number.isNaN(countDownDate)) return;

    // Update the count down every 1 second
    let x = setInterval(function () {
      // Get today's date and time
      let now = new Date().getTime();

      // Find the distance between now and the count down date
      let distance = countDownDate - now;

      // Time calculations for days, hours, minutes and seconds
      let days = Math.floor(distance / (1000 * 60 * 60 * 24));
      let hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((distance % (1000 * 60)) / 1000);

      const timer =
        days + "d " + hours + "h " + minutes + "m " + seconds + "s ";

      setTimer(timer);

      if (distance < 0) {
        clearInterval(x);
      }
    }, 1000);
  };

  const toggleElection = async () => {
    try {
      const res = await toggleElectionApi(electionId).unwrap();
      notifications.show({
        color: "green",
        message: res.message,
      });
      window.location.reload();
    } catch (error: any) {
      notifications.show({
        color: "green",
        message: error.data.message || "Error updating election view",
      });
    }
  };

  countDown(election.endingAt);

  return (
    <div id="print-wrapper">
      {election.status === "completed" && (
        <div className="fixed right-6 bottom-6">
          <Button
            className="bg-[#961699] hover:bg-[#961699] hover:opacity-75 w-[6rem] transition"
            id="print-btn"
            onClick={handlePrint}
          >
            Print
          </Button>
        </div>
      )}

      <div className="bg-[#961699] text-white p-4 rounded-md">
        <div className="flex lg:items-center justify-between flex-col lg:flex-row">
          <aside>
            <h1>{election.title}</h1>
            <h3>{election.type}</h3>
          </aside>

          <aside className="mt-6 lg:mt-0">
            <p>
              STATUS: <strong>{election.status}</strong>
            </p>

            {election.status == "pending" && (
              <div className="mt-2 flex lg:justify-end">
                <Button
                  className="bg-white text-[#961699] hover:bg-white hover:opacity-80"
                  loading={loadingStartElection}
                  loaderProps={{
                    color: "#961699",
                  }}
                  onClick={async () => {
                    try {
                      const res = await startElection(electionId).unwrap();
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
                >
                  Start Election
                </Button>
              </div>
            )}
          </aside>
        </div>

        <div className="flex justify-between mt-6 flex-col lg:flex-row items-start lg:items-end gap-2 lg:gap-0">
          {election.status !== "pending" && (
            <div className="flex w-full lg:items-center gap-2 flex-col lg:flex-row">
              <>
                {new Date(election.endingAt) > new Date() ? (
                  <p> {timer}</p>
                ) : (
                  <p>This Election Has Already Ended</p>
                )}
              </>

              <div className="flex lg:justify-end">
                {Date.now() < new Date(election.endingAt).getTime() && (
                  <Button
                    className="bg-white text-[#961699] hover:bg-white hover:opacity-80"
                    loading={isLoading}
                    loaderProps={{
                      color: "#961699",
                    }}
                    onClick={async () => {
                      try {
                        const res = await endElection(electionId).unwrap();
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
                  >
                    End Election
                  </Button>
                )}
              </div>
            </div>
          )}

          {election.pricing === "Admin" && election.votersVerification ? (
            <div className="flex w-full flex-col gap-1 lg:items-end">
              <p>
                Expected vote(s): <strong>{election.voters.length}</strong>
              </p>
              <p>
                Casted vote(s): <strong>{election.totalVotes}</strong>
              </p>
              <p>
                Awaiting vote(s):{" "}
                <strong>{election.voters.length - election.totalVotes}</strong>
              </p>
            </div>
          ) : (
            <p className="w-full lg:text-end">
              {election.totalVotes} {election.totalVotes > 1 ? "VOTES" : "VOTE"}
            </p>
          )}
        </div>

        <p className="mt-4 underline underline-offset-2">
          Current view status: {election.openElection ? "Public" : "Hidden"}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Button
          className="bg-[#F4ECFB] hover:bg-[#F4ECFB] hover:opacity-70 text-[#961699] transition"
          color={clipboard.copied ? "teal" : "blue"}
          onClick={() => {
            clipboard.copy(
              `${window.location.origin}/voter/elections/${election?._id}`
            );
          }}
        >
          <IconLink stroke={1.5} /> Copy Election Link
        </Button>

        <Button
          variant="outline"
          className="border-[#961699] hover:bg-[#961699] hover:text-white text-[#961699] transition"
          onClick={toggleElection}
          loading={loadingToggle}
        >
          {election.openElection ? "Hide" : "Show"} Election
        </Button>
      </div>

      <h2 className="mt-10 underline underline-offset-1">CANDIDATES</h2>
      <SimpleGrid
        cols={1}
        className="mt-2"
        breakpoints={[{ minWidth: 980, cols: 2, spacing: "md" }]}
      >
        {election.candidates.map((data, index) => {
          const percentage =
            totalVotes > 0 ? (data.votesReceived / totalVotes) * 100 : 0;

          return (
            <div
              className="border border-[#961699] rounded-md px-2 py-6"
              key={index}
              style={{
                boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.20)",
              }}
            >
              <div
                className="flex items-center gap-4 cursor-pointer"
                onClick={() =>
                  push(
                    `/organisation/elections/${electionId}/transcript/${data.candidate._id}`
                  )
                }
              >
                <div className="cand-icon w-[4rem]">
                  <Image
                    src={data.candidate.photoUrl}
                    alt="profile-pic"
                    className="h-[3.5rem] overflow-hidden"
                    width={100}
                    height={100}
                  />
                </div>

                <div>
                  <p className="font-bold mb-1">{data.candidate.fullName}</p>
                  <p className="mb-1">
                    {data.votesReceived}{" "}
                    {data.votesReceived > 1 ? "VOTES" : "VOTE"}
                  </p>
                  <p className="mb-1">{Math.round(percentage)} %</p>
                </div>
              </div>
            </div>
          );
        })}
      </SimpleGrid>

      <div className="flex mt-8 justify-center hover:text-[#961699]">
        <Link href={`/organisation/elections/${electionId}/analytics`}>
          View analytics
        </Link>
      </div>
    </div>
  );
};
export default ElectionDetails;
