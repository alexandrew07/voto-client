import Spinner from "@/components/Spinner";
import { useMeMutation } from "@/features/authApi";
import { Voter, setCredentials } from "@/features/authSlice";
import {
  useGetElectionMutation,
  useGetSingleCategorizedElectionMutation,
  useVoteMutation,
} from "@/features/electionApi";
import { Election } from "@/pages/organisation/elections";
import { RootState } from "@/store";
import { Button, Modal, SimpleGrid, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconArrowDown } from "@tabler/icons-react";
import { ObjectId } from "bson";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { PaystackConsumer } from "react-paystack";
import { useDispatch, useSelector } from "react-redux";

function generateObjectId() {
  const objectId = new ObjectId();
  return objectId.toHexString();
}

const ElectionDetails = () => {
  const { query, push } = useRouter();
  const electionId = query.id;
  const categoryId = query?.category;
  const [election, setElection] = useState<Election>();
  const [timer, setTimer] = useState("");

  const { user } = useSelector((state: RootState) => state.auth);

  const dispatch = useDispatch();

  const [getMe] = useMeMutation();

  const [getElection] = useGetElectionMutation();
  const [getCategorizedElection] = useGetSingleCategorizedElectionMutation();
  const [vote] = useVoteMutation();

  const [opened, { open, close }] = useDisclosure(false);
  const [openedEmail, { open: openEmail, close: closeEmail }] =
    useDisclosure(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState("");

  const [email, setEmail] = useState("");
  const [unAuthVoterId, setUnAuthVoterId] = useState("");

  const [votingInProgress, setVotingInProgress] = useState<{
    [key: string]: boolean;
  }>({});

  const [noOfVotes, setNoOfVotes] = useState<string>("");

  const fetchData = useCallback(async () => {
    try {
      let fetchedUser = null;

      try {
        const { user: userResponse } = await getMe().unwrap();
        fetchedUser = userResponse;
        dispatch(setCredentials(fetchedUser));
      } catch (userError) {
        console.log("User fetch error:", userError);
      }

      const res = await getElection(electionId).unwrap();
      const election = res.data;

      if (!election.openElection && !fetchedUser) {
        push("/voter/login");
        return;
      }

      setElection(election);
    } catch (electionError) {
      console.error("Election fetch error:", electionError);
      push("/voter/login");
    }
  }, [dispatch, electionId, getElection, getMe, push]);

  useEffect(() => {
    if (electionId) {
      fetchData();
    }
  }, [electionId, fetchData]);

  const [categorizedElection, setCategorizedElection] = useState<
    Pick<Election, "_id" | "title">[]
  >([]);

  useEffect(() => {
    if (categoryId === undefined) return;

    const fetchData = async () => {
      try {
        const electionsCategory = await getCategorizedElection(
          categoryId
        ).unwrap();

        const filteredElections = electionsCategory.data.elections.map(
          (election: any) => ({
            _id: election._id,
            title: election.title,
          })
        );

        setCategorizedElection(filteredElections);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [categoryId]);

  const voteHandler = async (id: string) => {
    if (election?.pricing === "Voter") {
      setSelectedCandidateId(id);
      open();
    } else {
      const payload = {
        data: { candidateId: id } as { candidateId: string; voterId?: string },
        id: electionId,
      };

      if (user === null) {
        const unAuthVoterIdFromStorage = localStorage.getItem("voterId");
        payload.data.voterId = unAuthVoterIdFromStorage || unAuthVoterId;
      }

      try {
        setVotingInProgress((prevState) => ({ ...prevState, [id]: true }));
        const res = await vote(payload).unwrap();
        notifications.show({
          color: "green",
          message: res.message,
        });

        if (user === null) {
          const votedElections = JSON.parse(
            localStorage.getItem("votedElections") || "[]"
          );
          votedElections.push(electionId);
          localStorage.setItem(
            "votedElections",
            JSON.stringify(votedElections)
          );
        }

        window.location.reload();
      } catch (error: any) {
        notifications.show({
          color: "red",
          message: error.data.message,
        });
      } finally {
        setVotingInProgress((prevState) => ({ ...prevState, [id]: false }));
      }
    }
  };

  if (!election) return <Spinner />;

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

  // countDown(election.endingAt);

  const totalVotes = election.candidates.reduce(
    (total, candidate) => total + candidate.votesReceived,
    0
  );

  const handleSuccess = () => {
    notifications.show({
      color: "green",
      message: "Vote casted",
    });
    window.location.reload();
  };
  let hasVoted = false;

  if (user?._id) {
    hasVoted = election.castedVoters.some(
      (voter) => voter?.voter?._id === user._id
    );
  }

  if (!hasVoted && user === null) {
    const votedElections = JSON.parse(
      localStorage.getItem("votedElections") || "[]"
    );
    hasVoted = votedElections.includes(electionId);
  }

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <>
      <Modal
        opened={openedEmail}
        onClose={closeEmail}
        overlayProps={{ opacity: 0.4, blur: 1 }}
        title="ENTER EMAIL TO CONTINUE"
      >
        <form className="space-y-4">
          <TextInput
            type="email"
            className="mt-4"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="flex items-center justify-center">
            <Button
              type="button"
              className="bg-[#961699] text-white hover:bg-[#961699] hover:opacity-70"
              onClick={() => {
                if (!isValidEmail(email)) {
                  return notifications.show({
                    color: "red",
                    message: "please enter a valid email",
                  });
                }
                const voterId = generateObjectId();
                localStorage.setItem("voterId", voterId);
                setUnAuthVoterId(voterId);

                closeEmail();
                voteHandler(selectedCandidateId);
              }}
            >
              Continue
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        opened={opened}
        onClose={close}
        overlayProps={{ opacity: 0.4, blur: 1 }}
        title="PAY TO VOTE"
      >
        <div className="text-center">
          <p>How many votes do you want to buy?</p>
          <p>
            NGN <span className="font-bold">{election.amountToPay}</span> per
            vote.
          </p>

          {election.totalNoOfVotesPerVoter && (
            <p>Maximum of {election.totalNoOfVotesPerVoter} vote(s).</p>
          )}
        </div>

        <TextInput
          type="number"
          className="mt-4"
          placeholder="no. of votes"
          value={noOfVotes}
          onChange={(e) => setNoOfVotes(e.target.value)}
        />

        <div className="flex w-full justify-center">
          <PaystackConsumer
            amount={+noOfVotes * +election?.amountToPay! * 100}
            email={(user as Voter)?.email || email}
            publicKey={process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!}
            // @ts-ignore
            onSuccess={handleSuccess}
            metadata={{
              custom_fields: [
                {
                  display_name: "payToVote",
                  value: "payToVote",
                  variable_name: "payToVote",
                },
                {
                  display_name: "voterId",
                  value: user ? user._id : unAuthVoterId,
                  variable_name: "voterId",
                },
                {
                  display_name: "unAuthVoterEmail",
                  value: email,
                  variable_name: "unAuthVoterEmail",
                },
                {
                  display_name: "organisationId",
                  value: election.organisation,
                  variable_name: "organisationId",
                },
                {
                  display_name: "details",
                  value: {
                    candidateId: selectedCandidateId,
                    noOfVotes,
                    electionId,
                  },
                  variable_name: "details",
                },
              ],
            }}
          >
            {({ initializePayment }) => (
              <Button
                className=" bg-[#961699] hover:bg-[#961699] p-2 px-6 text-white opacity-95 outline-none border-none h-[2.5rem] mt-8 hover:opacity-80"
                onClick={() => {
                  if (!noOfVotes)
                    return notifications.show({
                      color: "red",
                      message: "Enter the number of votes you want to buy",
                    });

                  if (user && (user as Voter).email === "")
                    return notifications.show({
                      color: "red",
                      message: "Please add your email in the settings page",
                    });

                  const maxVotes = election?.totalNoOfVotesPerVoter;
                  if (maxVotes && +noOfVotes > +maxVotes) {
                    return notifications.show({
                      color: "red",
                      message:
                        "You can't buy more than the maximum number of votes",
                    });
                  }

                  if (election.status === "pending") {
                    return notifications.show({
                      color: "red",
                      message: "Cannot vote in a pending election",
                    });
                  } else if (election.status === "completed") {
                    return notifications.show({
                      color: "red",
                      message: "Cannot vote in a completed election",
                    });
                  }

                  if (new Date() > new Date(election.endingAt))
                    return notifications.show({
                      color: "red",
                      message: "This election has already ended",
                    });

                  const currentVoterCasted = election.castedVoters.find(
                    (voter) => voter.voter._id === user?._id
                  );

                  if (election.totalNoOfVotesPerVoter) {
                    if (
                      +noOfVotes >
                      election.totalNoOfVotesPerVoter -
                        currentVoterCasted?.votesAdded!
                    ) {
                      return notifications.show({
                        color: "red",
                        message: `You have ${
                          +election.totalNoOfVotesPerVoter -
                          currentVoterCasted?.votesAdded!
                        } votes left in this election`,
                      });
                    }
                  }

                  if (currentVoterCasted && election.votingType === "Once") {
                    return notifications.show({
                      color: "red",
                      message: "You can't vote again in this election",
                    });
                  }

                  initializePayment();

                  setNoOfVotes("");
                  close();
                }}
              >
                Make Payment
              </Button>
            )}
          </PaystackConsumer>
        </div>
      </Modal>

      <div>
        <div className="bg-[#961699] text-white p-4 rounded-md">
          <h1>{election.title}</h1>
          <h3>{election.type}</h3>

          <div className="flex justify-between items-center mt-2">
            <>
              {new Date(election.endingAt) > new Date() ? (
                <p>{timer}</p>
              ) : (
                "This Election Has Already Ended"
              )}
            </>

            <p className="text-end">
              {election.totalVotes} {election.totalVotes > 1 ? "VOTES" : "VOTE"}
            </p>
          </div>
        </div>

        {categoryId && (
          <div className="flex items-center mt-6 gap-4 lg:gap-8 w-full overflow-scroll">
            {categorizedElection.map((election, index) => (
              <Link
                href={`/voter/elections/${election._id}?category=${categoryId}`}
                key={index}
                className="cursor-pointer no-underline"
                style={{ textDecoration: "none" }}
              >
                {election._id === electionId ? (
                  <p className="text-center text-sm flex items-center justify-center gap-1 mb-1">
                    <span>viewing for</span> <IconArrowDown size={20} />
                  </p>
                ) : (
                  <p className="mb-5"></p>
                )}

                <div
                  className={`p-2 lg:p-4 rounded-md text-white w-[max-content] ${
                    election._id === electionId
                      ? "border border-[var(--primary-color)] !text-[var(--primary-color)]"
                      : "bg-[var(--primary-color)] hover:border hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] hover:bg-white"
                  }`}
                >
                  {election.title}
                </div>
              </Link>
            ))}
          </div>
        )}

        <h2 className="mt-10 underline underline-offset-1">CANDIDATES</h2>
        <SimpleGrid cols={2} className="mt-2" spacing="xl">
          {election.candidates.map((data, index) => {
            const percentage =
              totalVotes > 0 ? (data.votesReceived / totalVotes) * 100 : 0;

            return (
              <div
                key={index}
                style={{
                  boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
                }}
              >
                <div className="flex flex-col lg:flex-row lg:gap-8 lg:h-full">
                  <div className="cand-icon">
                    <Image
                      src={data.candidate.photoUrl}
                      alt="profile-pic"
                      className="w-full lg:w-[150px] h-[200px] lg:h-full object-cover"
                      width={100}
                      height={100}
                    />
                  </div>

                  <div className="p-2 flex-1">
                    <div>
                      <p className="font-bold mb-1 lg:text-2xl min-h-[100px] lg:min-h-auto">
                        {data.candidate.fullName}
                      </p>

                      {election.liveVoting && (
                        <div className="flex items-center justify-between gap-2">
                          <p className="mb-1">
                            {data.votesReceived}{" "}
                            {data.votesReceived > 1 ? "VOTES" : "VOTE"}
                          </p>

                          <p className="mb-1">{Math.round(percentage)}%</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 flex flex-1 justify-end">
                      {(!hasVoted || election.pricing === "Voter") && (
                        <Button
                          className="bg-[#961699] text-white hover:bg-[#961699] hover:opacity-70 w-full"
                          onClick={() => {
                            setSelectedCandidateId(data.candidate._id);
                            if (user === null) return openEmail();
                            voteHandler(data.candidate._id);
                          }}
                          loading={
                            votingInProgress[data.candidate._id] || false
                          }
                        >
                          Vote
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </SimpleGrid>
      </div>
    </>
  );
};

export default ElectionDetails;
