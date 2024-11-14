import {
  Menu,
  Button,
  Text,
  UnstyledButton,
  createStyles,
  Group,
  Avatar,
} from "@mantine/core";
import {
  IconSettings,
  IconSearch,
  IconPhoto,
  IconMessageCircle,
  IconTrash,
  IconArrowsLeftRight,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useLogoutMutation } from "@/features/authApi";
import { notifications } from "@mantine/notifications";

const useStyles = createStyles((theme) => ({
  user: {
    display: "block",
    padding: 0,
    color: theme.black,
  },
}));

interface MenuButtonProps {
  image?: string;
  name: string;
  role: string;
}

function MenuButton({ image, name, role, ...others }: MenuButtonProps) {
  const { classes } = useStyles();
  const router = useRouter();

  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      router.push("/voter/login");

      notifications.show({
        color: "green",
        message: "logged out successfully",
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Menu
      position="right"
      shadow="md"
      width={200}
      styles={{
        dropdown: {
          marginTop: "5.2rem",
          left: "inherit !important",
          right: "1.5rem",
        },
      }}
    >
      <Menu.Target>
        <UnstyledButton
          className={`${classes.user} w-[100%] lg:w-[10rem]`}
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
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Application</Menu.Label>
        <Menu.Item
          icon={<IconSettings size={14} />}
          onClick={() => router.push("/voter/settings")}
        >
          Settings
        </Menu.Item>
        <Menu.Divider />

        <Menu.Label>Danger zone</Menu.Label>
        <Menu.Item
          color="red"
          icon={<IconTrash size={14} />}
          onClick={logoutHandler}
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

export default MenuButton;
