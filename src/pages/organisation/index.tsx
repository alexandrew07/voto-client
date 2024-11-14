import DashboardStats from "@/components/Dashboard/DashboardStats";
import DashboardElections from "@/components/Dashboard/DashboardElections";
import dash from "/public/dashboard.png";
import Image from "next/image";
import DashboardCandidates from "@/components/Dashboard/DashboardCandidates";
import DashboardVoters from "@/components/Dashboard/DashboardVoters";
import UpgradePlanModal from "@/components/Modals/UpgradePlanModal";
import { useDisclosure } from "@mantine/hooks";
import { RootState } from "@/store";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { Organisation } from "@/features/authSlice";

const Dashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const [
    openedUpgradePlan,
    { open: openUpgradePlan, close: closeUpgradePlan },
  ] = useDisclosure(false);

  useEffect(() => {
    if ((user as Organisation)?.subscriptionPlan === "free") {
      openUpgradePlan();
    }
  }, [openUpgradePlan, user]);

  return (
    <>
      <UpgradePlanModal opened={openedUpgradePlan} close={closeUpgradePlan} />
      <div className="mt-1">
        <Image
          src={dash}
          width={100}
          height={100}
          alt="dashboard"
          unoptimized
          className="w-full"
          placeholder="blur"
        />
      </div>

      <div className="lg:grid lg:grid-cols-2 gap-4 mt-8">
        <DashboardStats />
        <DashboardCandidates />
      </div>

      <div className="lg:grid lg:grid-cols-3 gap-4 mt-8">
        <div className="lg:col-span-2">
          <DashboardElections />
        </div>
        <div>
          <DashboardVoters />
        </div>
      </div>
    </>
  );
};
export default Dashboard;
