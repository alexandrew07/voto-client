import { RootState } from "@/store";
import { useDisclosure } from "@mantine/hooks";
import { IconMessageCircle2Filled } from "@tabler/icons-react";
import { useRouter } from "next/router";
import Draggable from "react-draggable";
import { useSelector } from "react-redux";
import ChatModal from "./Modals/ChatModal";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useRef } from "react";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const nodeRef = useRef(null);
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  const isOrganization = user?.role === "organisation";

  const [opened, { open, close }] = useDisclosure();

  return (
    <>
      <ChatModal opened={opened} close={close} />
      <Draggable nodeRef={nodeRef}>
        <div className="z-[20] fixed bottom-[20px] right-[25px]" ref={nodeRef}>
          <button onClick={open} className="handle">
            <div
              className="bg-[#961699] p-1 rounded-md shadow-xl"
              style={{
                boxShadow:
                  "0 4px 6px rgba(150, 22, 153, 0.5), 0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            >
              <IconMessageCircle2Filled size={35} color="white" id="msg-icon" />
            </div>
          </button>
        </div>
      </Draggable>

      <div className="md:flex w-full">
        {isOrganization && <Sidebar />}
        <main className="flex-1 bg-[#FFF9FE]">
          <Navbar />
          <div
            className={
              router.pathname === "/auth/reset-password/[token]" ||
              router.pathname === "/auth/forgot-password"
                ? "p-6"
                : "max-w-7xl p-6 mx-auto h-[calc(100vh - 70px)] overflow-scroll"
            }
          >
            {children}
          </div>
        </main>
      </div>
    </>
  );
};

export default Layout;
