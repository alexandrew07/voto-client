import { Box, Group, createStyles } from "@mantine/core";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import Image from "next/image";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { close, open } from "../../features/toggleSidebarSlice";
import { useRouter } from "next/router";

const useStyles = createStyles((theme) => ({
  control: {
    fontWeight: 400,
    display: "block",
    width: "100%",
    padding: `${theme.spacing.md} ${theme.spacing.md}`,
    color: "#AFAFAF",
    fontSize: theme.fontSizes.sm,

    "&:hover": {
      color: "#961699",
    },
  },
}));

interface LinksGroupProps {
  label: string;
  link: string;
  image: string | StaticImport;
}

export function LinksGroup({ image, label, link }: LinksGroupProps) {
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const router = useRouter();

  const isExactMatch = router.pathname === link;
  const isNestedPath =
    router.pathname.startsWith(link) && router.pathname !== link;

  const isActive = isExactMatch || (isNestedPath && link !== "/organisation");

  const clickHandler = () => {
    if (window.innerWidth < 768) {
      dispatch(close());
    } else {
      dispatch(open());
    }
  };

  return (
    <div className="px-4 py-1">
      <Link
        className={`${classes.control} ${isActive ? "text-[#961699]" : ""}`}
        href={link}
        onClick={clickHandler}
      >
        <Group position="apart" spacing={0}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Image
              src={image}
              alt="image"
              width="0"
              height="0"
              style={{ width: "50px", height: "50px" }}
            />
            <Box ml="md">{label}</Box>
          </Box>
        </Group>
      </Link>

      <style jsx>{`
        .active-link {
          color: #961699;
        }
      `}</style>
    </div>
  );
}
