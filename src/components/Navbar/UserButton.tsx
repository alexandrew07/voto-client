import {
  Avatar,
  Group,
  Text,
  UnstyledButton,
  UnstyledButtonProps,
  createStyles,
} from "@mantine/core";

const useStyles = createStyles((theme) => ({
  user: {
    display: "block",
    padding: 0,
    color: theme.black,
  },
}));

interface UserButtonProps extends UnstyledButtonProps {
  image?: string;
  name: string;
  role: string;
}

export default function UserButton({
  image,
  name,
  role,
  ...others
}: UserButtonProps) {
  const { classes } = useStyles();

  return (
    <UnstyledButton
      className={`${classes.user} w-[100%] lg:w-[12rem]`}
      {...others}
    >
      <Group>
        <Avatar src={image} radius="xl" color="red" />

        <div style={{ flex: 1 }} className="hidden lg:block">
          <Text
            size="sm"
            weight={500}
            style={{
              letterSpacing: "1px",
            }}
          >
            {name.length > 10 ? `${name.slice(0, 10)}...` : name}
          </Text>

          <Text
            color="dimmed"
            size="xs"
            style={{
              letterSpacing: "1px",
            }}
          >
            {role}
          </Text>
        </div>
      </Group>
    </UnstyledButton>
  );
}
