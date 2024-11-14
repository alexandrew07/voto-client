import { createStyles, rem } from "@mantine/core";
import { IconBell, IconMenu2 } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import UserButton from "./UserButton";
import { open } from "../../features/toggleSidebarSlice";
import { Organisation, Voter } from "@/features/authSlice";
import Image from "next/image";
import voto from "public/voto-full.png";
import { useRouter } from "next/router";
import MenuButton from "./MenuButton";
import { useState } from "react";

const useStyles = createStyles((theme) => ({
  header: {
    paddingTop: 0,
    position: "sticky",
    top: "0.1px",
    backgroundColor: "#FCFCFC",
    boxShadow: "inset 1px 0px 0px #F4F4F4",
    zIndex: 2,
    borderBottom: `${rem(1)} solid ${theme.colors.gray[3]}`,
  },
}));

const Navbar = () => {
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  if (!user) return;

  return (
    <nav className={classes.header} id="navbar">
      <div className="flex items-center justify-between p-[1rem]">
        <div className="flex gap-4 items-center">
          {user.role === "organisation" && (
            <IconMenu2
              size={20}
              className="block md:hidden cursor-pointer"
              onClick={() => {
                dispatch(open());
              }}
            />
          )}

          {user.role === "voter" && (
            <div
              className="cursor-pointer ml-[1rem]"
              onClick={() => router.push("/voter")}
            >
              <Image
                src={voto}
                alt="logo"
                priority
                unoptimized
                className="w-[5rem]"
              />
            </div>
          )}
        </div>

        <div className="flex items-center">
          {user.role === "organisation" ? (
            <UserButton
              name={(user as Organisation).organisationName}
              role={user.role}
              image={(user as Organisation).logoUrl}
            />
          ) : (
            <MenuButton
              name={(user as Voter).name}
              role={user.role}
              // image={(user as Organisation).logoUrl}
            />
          )}
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
