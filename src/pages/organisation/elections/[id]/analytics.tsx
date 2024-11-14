import Spinner from "@/components/Spinner";
import { useGetElectionMutation } from "@/features/electionApi";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

type AnalyticsProps = {};

const Analytics: React.FC<AnalyticsProps> = () => {
  const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
  const { query } = useRouter();
  const electionId = query.id;

  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [electionType, setElectionType] = useState("");
  const [isSmallScreen, setIsSmallScreen] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 600 : false
  );

  const [getElection] = useGetElectionMutation();

  useEffect(() => {
    if (!electionId) return;

    async function fetchData() {
      try {
        const res = await getElection(electionId).unwrap();
        setCandidates(res.data.candidates);
        setElectionType(res.data.type);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [electionId, getElection, query.candidateId]);

  const candidateFullNames = candidates.map(
    (candidate: { candidate: any }) => candidate.candidate.fullName
  );

  const votesReceived = candidates.map(
    (candidate: { votesReceived: number }) => candidate.votesReceived
  );

  const series = [
    {
      name: "Total votes received",
      data: votesReceived,
    },
  ];

  const options: ApexOptions = {
    title: {
      text: electionType,
      align: "center",
      margin: 10,
      offsetX: 0,
      offsetY: 0,
      floating: false,
      style: {
        fontSize: "18px",
        fontWeight: "bold",
        color: "#263238",
      },
    },
    chart: {
      id: `Bar chart of ${electionType}`,
    },
    xaxis: {
      categories: candidateFullNames,
    },
    colors: ["#961699"],
  };

  useEffect(() => {
    function handleResize() {
      setIsSmallScreen(window.innerWidth <= 600);
    }

    window.addEventListener("resize", handleResize);
    handleResize(); // Initialize on component mount

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      {isSmallScreen ? (
        <p>This chart cannot be displayed on small screens.</p>
      ) : (
        <Chart options={options} type="bar" series={series} width="80%" />
      )}
    </div>
  );
};

export default Analytics;
