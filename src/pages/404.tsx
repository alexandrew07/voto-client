import { RootState } from "@/store";
import {
  createStyles,
  Title,
  Text,
  Button,
  Container,
  Group,
  rem,
} from "@mantine/core";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

const useStyles = createStyles((theme) => ({
  label: {
    textAlign: "center",
    fontWeight: 900,
    fontSize: rem(220),
    lineHeight: 1,
    marginBottom: `calc(${theme.spacing.xl} * 1.5)`,
    color: theme.colors.gray[2],

    [theme.fn.smallerThan("sm")]: {
      fontSize: rem(120),
    },
  },

  title: {
    // fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    textAlign: "center",
    fontWeight: 900,
    fontSize: rem(38),

    [theme.fn.smallerThan("sm")]: {
      fontSize: rem(32),
    },
  },

  description: {
    maxWidth: rem(500),
    margin: "auto",
    marginTop: theme.spacing.xl,
    marginBottom: `calc(${theme.spacing.xl} * 1.5)`,
  },
}));

export default function Custom404() {
  const { classes } = useStyles();

  const router = useRouter();

  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <Container>
      <div className={classes.label}>404</div>
      <Title className={classes.title}>You have found a secret place.</Title>
      <Text
        color="dimmed"
        size="lg"
        align="center"
        className={classes.description}
      >
        Page you are trying to open does not exist. You may have mistyped the
        address, or the page has been moved to another URL. If you think this is
        an error contact support.
      </Text>
      <Group position="center">
        <Button
          variant="subtle"
          size="md"
          className="text-[#961699] hover:bg-[#961699] hover:text-white hover:opacity-75 transition"
          onClick={() => {
            let path = "";
            if (user?.role === "organisation") {
              path = "/organisation";
            } else if (user?.role === "voter") {
              path = "/voter";
            } else {
              path = "/";
            }
            router.push(path);
          }}
        >
          Take me back to home page
        </Button>
      </Group>
    </Container>
  );
}
