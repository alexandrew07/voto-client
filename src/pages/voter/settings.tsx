import { capitalizeFirstLetter } from "@/components/Modals/VoterModal";
import Spinner from "@/components/Spinner";
import { Voter } from "@/features/authSlice";
import { useUpdateVoterMutation } from "@/features/voterApi";
import { RootState } from "@/store";
import { Button, Divider, Stack, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const Settings = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const [initialState, setInitialState] = useState({
    name: "",
    username: "",
    email: "",
    details: (user as Voter)?.details,
  });

  const handleDynamicInputChange = (field: string, value: string) => {
    setInitialState((prevState) => ({
      ...prevState,
      details: {
        ...prevState.details,
        [field]: value,
      },
    }));
  };

  useEffect(() => {
    setInitialState((prev) => ({
      ...prev,
      details: (user as Voter)?.details || {},
      email: (user as Voter)?.email || "",
      name: (user as Voter)?.name || "",
      username: (user as Voter)?.username || "",
    }));
  }, [user]);

  const [updateVoter] = useUpdateVoterMutation();
  const [loading, setLoading] = useState(false);

  async function submitHandler(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    setLoading(true);

    if (
      initialState.username === "" ||
      initialState.email === "" ||
      initialState.name === ""
    ) {
      setLoading(false);
      return notifications.show({
        color: "red",
        message: "Please fill in all fields.",
      });
    }

    for (const field in initialState.details) {
      setLoading(false);
      // @ts-ignore
      if (initialState.details[field] === "") {
        return notifications.show({
          color: "red",
          message: "Please fill in all fields.",
        });
      }
    }

    try {
      const payload = {
        data: initialState,
        id: user?._id,
      };

      const res = await updateVoter(payload).unwrap();
      notifications.show({
        color: "green",
        message: res.message,
      });
      window.location.reload();
    } catch (error: any) {
      console.log(error);
      notifications.show({
        color: "green",
        message: error.data.message,
      });
    } finally {
      setLoading(false);
    }
  }

  if (!user) return <Spinner />;

  return (
    <div>
      <div className="flex">
        <div className="flex flex-1 flex-col mb-5">
          <div className="flex w-full rounded flex-col border-[1px] border-[#e9ebec]">
            <div className="flex justify-between items-center p-3">
              <div className="flex w-full justify-between  items-center">
                <p className=" font-bold text-[20px] text-[#961699]">Details</p>
              </div>
            </div>
            <Divider color="#e9ebec" />

            <div className="flex flex-col p-4">
              <div className="flex flex-col">
                <div className="flex items-center py-1">
                  <p className="font-bold text-sm">Name:</p>
                  <p className="text-xs font-normal ml-1">
                    {(user as Voter).name}
                  </p>
                </div>
              </div>

              <div className="mt-2">
                <div className="flex items-center py-1">
                  <p className="font-bold text-sm">Username:</p>
                  <p className="text-xs font-normal ml-1">
                    {(user as Voter).username}
                  </p>
                </div>

                <div className="flex items-center py-2">
                  <p className="font-bold text-sm">Email:</p>
                  <p className="text-xs font-normal ml-1">
                    {(user as Voter).email ?? "---"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Divider color="#e9ebec" />
      <div className="mt-2">
        <form>
          <Stack spacing={30}>
            <div className="lg:gap-4 gap-2  grid grid-cols-1 lg:grid-cols-2">
              <TextInput
                required
                label="Name:"
                value={initialState.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setInitialState({
                    ...initialState,
                    name: e.target.value,
                  })
                }
              />

              <TextInput
                required
                type="email"
                label="Email:"
                value={initialState.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setInitialState({
                    ...initialState,
                    email: e.target.value,
                  })
                }
              />
            </div>

            <TextInput
              required
              label="Username:"
              value={initialState.username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setInitialState({
                  ...initialState,
                  username: e.target.value,
                })
              }
            />

            {(
              (user as Voter)?.details && Object?.keys((user as Voter)?.details)
            )?.map((field: string, index: number) => (
              <TextInput
                key={index}
                label={capitalizeFirstLetter(field)}
                required
                //   @ts-ignore
                value={initialState.details[field]}
                onChange={(event) =>
                  handleDynamicInputChange(field, event.currentTarget.value)
                }
              />
            ))}

            <div className="flex justify-center items-center">
              <Button
                type="submit"
                className=" bg-[#961699] hover:bg-[#961699] hover:text-white p-2 px-6 text-white opacity-95 outline-none border-none w-fit h-[2.5rem] mt-8 hover:opacity-80"
                loading={loading}
                onClick={(e) => submitHandler(e)}
              >
                Update
              </Button>
            </div>
          </Stack>
        </form>
      </div>
    </div>
  );
};
export default Settings;
