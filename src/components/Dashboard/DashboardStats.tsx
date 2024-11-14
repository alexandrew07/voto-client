import React, { useState, useEffect } from "react";
import RoundProgressBar from "./RoundProgressBar";
import { IconDots } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import base from "/public/Base.png";
import { useGetStatsMutation } from "@/features/organisationApi";

type Stats = {
  totalElections: number;
  totalVoters: number;
  totalCandidates: number;
  totalJuniorAdmins: number;
};

type DashboardStatsProps = {};

const DashboardStats: React.FC<DashboardStatsProps> = () => {
  const [getStats] = useGetStatsMutation();
  const [stats, setStats] = useState<Stats>();

  useEffect(() => {
    async function fetchData() {
      const { data } = await getStats().unwrap();
      setStats(data);
    }

    fetchData();
  }, [getStats]);

  if (!stats) return <p>loading...</p>;

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <aside
        className="flex items-center gap-3 flex-1 justify-between p-4 rounded-lg"
        style={{
          boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
        }}
      >
        <div>
          <RoundProgressBar
            progress={stats.totalElections ?? 0}
            title="Total Elections"
          />
        </div>

        <p className="text-sm text-[#858585]">All Elections</p>

        <div className="flex flex-col gap-4 items-end">
          <Link href="">
            <IconDots color="#858585" />
          </Link>
          <Image src={base} height={70} width={70} alt="base" />
        </div>
      </aside>

      <aside
        className="flex items-center gap-3 flex-1 justify-between p-4 rounded-lg"
        style={{
          boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
        }}
      >
        <div>
          <RoundProgressBar
            progress={stats.totalVoters ?? 0}
            title="Total Voters"
          />
        </div>

        <p className="text-sm text-[#858585]">All Voters</p>

        <div className="flex flex-col gap-4 items-end">
          <Link href="">
            <IconDots color="#858585" />
          </Link>
          <Image src={base} height={70} width={70} alt="base" />
        </div>
      </aside>

      <aside
        className="flex items-center gap-3 flex-1 justify-between p-4 rounded-lg"
        style={{
          boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
        }}
      >
        <div>
          <RoundProgressBar
            progress={stats.totalCandidates ?? 0}
            title="Total Voters"
          />
        </div>

        <p className="text-sm text-[#858585]">All candidates</p>

        <div className="flex flex-col gap-4 items-end">
          <Link href="">
            <IconDots color="#858585" />
          </Link>
          <Image src={base} height={70} width={70} alt="base" />
        </div>
      </aside>

      <aside
        className="flex items-center gap-3 flex-1 justify-between p-4 rounded-lg"
        style={{
          boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
        }}
      >
        <div>
          <RoundProgressBar
            progress={stats.totalJuniorAdmins ?? 0}
            title="Total Junior Admins"
          />
        </div>

        <p className="text-sm text-[#858585]">All Junior admins</p>

        <div className="flex flex-col gap-4 items-end">
          <Link href="">
            <IconDots color="#858585" />
          </Link>
          <Image src={base} height={70} width={70} alt="base" />
        </div>
      </aside>
    </div>
  );
};

export default DashboardStats;
