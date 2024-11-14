import { useRouter } from "next/router";

import { RootState } from "@/store";
import { useSelector } from "react-redux";

import voto from "public/voto-full.png";
import Image from "next/image";

const Home = () => {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  if (user?.role === "organisation") {
    router.push("/organisation");
  } else if (user?.role === "voter") {
    router.push("/voter");
  }

  return (
    <section className="h-screen flex items-center justify-center flex-col">
      <div>
        <Image src={voto} className="w-[7rem]" alt="logo" />
      </div>

      <div className="mt-6">
        <div className="spinner-line"></div>
      </div>
    </section>
  );
};

export default Home;
