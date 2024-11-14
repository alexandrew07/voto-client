import {
  Navbar,
  ScrollArea,
  ThemeIcon,
  createStyles,
  rem,
} from "@mantine/core";
import { IconLogout, IconX } from "@tabler/icons-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
import { useLogoutMutation } from "../../features/authApi";
// import { logout } from "../../features/authSlice";
import { close, open } from "../../features/toggleSidebarSlice";
import { RootState } from "../../store";
import { LinksGroup } from "./LinksGroup";

import Image from "next/image";
import { useRouter } from "next/router";

import voto from "public/voto-full.png";
import { organisationLinks } from "./navigationLinks";
import { notifications } from "@mantine/notifications";

const useStyles = createStyles((theme) => ({
  navbar: {
    backgroundColor: "#FCFCFC",
    // border: "none",
    paddingBottom: "0 !important",
    height: "100vh",
    transition: "width 0.3s ease",
  },

  header: {
    padding: theme.spacing.md,
    paddingTop: 0,
    marginLeft: `calc(${theme.spacing.md} * -1)`,
    marginRight: `calc(${theme.spacing.md} * -1)`,
    color: theme.white,
    // paddingBottom: rem(1),
    // borderBottom: `${rem(1)} solid ${theme.colors.gray[3]}`,
  },

  links: {
    marginLeft: `calc(${theme.spacing.md} * -1)`,
    marginRight: `calc(${theme.spacing.md} * -1)`,
  },

  linksInner: {
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },

  footer: {
    marginLeft: `calc(${theme.spacing.md} * -1)`,
    marginRight: `calc(${theme.spacing.md} * -1)`,
    borderTop: `${rem(1)} solid ${theme.colors.gray[3]}`,

    "&:hover": {
      color: "red",
    },
  },
}));

function Sidebar() {
  const { classes } = useStyles();

  const dispatch = useDispatch();
  const router = useRouter();
  const toggleSidebarValue = useSelector(
    (state: RootState) => state.toggleSidebar.value
  );

  const { user } = useSelector((state: RootState) => state.auth);

  let data: any[] = [];

  if (user?.role === "organisation") data = organisationLinks;

  const links = data.map((item) => <LinksGroup {...item} key={item.label} />);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        dispatch(close());
      } else {
        dispatch(open());
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [dispatch]);

  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      router.push("/organisation/login");

      notifications.show({
        color: "green",
        message: "logged out successfully",
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Navbar
      height={800}
      width={{ sm: 230 }}
      p="md"
      className={`${classes.navbar} md:sticky top-0 ${
        toggleSidebarValue === true ? "fixed h-[100dvh]" : "hidden"
      }`}
      zIndex={10}
      id="sidebar"
    >
      <Navbar.Section className={classes.header}>
        <div className="flex items-center justify-between">
          <div
            className="cursor-pointer ml-[1rem]"
            onClick={() => router.push("/organisation")}
          >
            <Image
              src={voto}
              alt="logo"
              priority
              unoptimized
              className="w-[5rem]"
            />
          </div>

          <div className="md:hidden cursor-pointer">
            <ThemeIcon
              variant="light"
              size={30}
              color="red"
              onClick={() => {
                dispatch(close());
              }}
            >
              <IconX />
            </ThemeIcon>
          </div>
        </div>
      </Navbar.Section>

      <Navbar.Section grow className={classes.links} component={ScrollArea}>
        <div className={classes.linksInner}>{links}</div>
      </Navbar.Section>

      <Navbar.Section className={classes.footer} onClick={logoutHandler}>
        <button className="flex items-center p-4 w-[100%] gap-4 cursor-pointer text-[#AFAFAF]">
          <ThemeIcon variant="light" size={30} color="red">
            <IconLogout size="1.1rem" />
          </ThemeIcon>
          <p className="text-[14px]">Logout</p>
        </button>
      </Navbar.Section>
    </Navbar>
  );
}

export default Sidebar;
