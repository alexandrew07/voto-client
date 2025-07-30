import ImageDrop from "@/components/Dropzone";
import Spinner from "@/components/Spinner";
import { useUploadImageMutation } from "@/features/authApi";
import { Organisation } from "@/features/authSlice";
import {
  useUpdateExternalRegistrationMutation,
  useUpdateOrganisationMutation,
  useUpdateAllowVotersEmailVerificationMutation,
} from "@/features/organisationApi";
import { RootState } from "@/store";
import { Button, Divider, MultiSelect, Stack, TextInput } from "@mantine/core";
import { FileWithPath } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import { IconRotate } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const Settings = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const [initialState, setInitialState] = useState({
    organisationName: "",
    email: "",
    logoUrl: "",
    candidatesFields: (user as Organisation)?.candidatesFields,
    votersFields: (user as Organisation)?.votersFields,
    allowVotersToVerifyEmail: (user as Organisation)
      ?.allowVotersEmailVerification,
  });

  const [imgValue, setImgValue] = useState<FileWithPath[]>([]);

  useEffect(() => {
    setInitialState((prev) => ({
      ...prev,
      organisationName: (user as Organisation)?.organisationName,
      email: (user as Organisation)?.email,
      logoUrl: (user as Organisation)?.logoUrl,
    }));
  }, [user]);

  const [uploadImage] = useUploadImageMutation();
  const [updateOrganisation] = useUpdateOrganisationMutation();
  const [loading, setLoading] = useState(false);

  const [update, { isLoading: loadingUpdate }] =
    useUpdateExternalRegistrationMutation();

  const [
    updateAllowVotersEmailVerification,
    { isLoading: loadingUpdateVotersEmailVerification },
  ] = useUpdateAllowVotersEmailVerificationMutation();

  async function submitHandler(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    setLoading(true);

    if (
      initialState.organisationName === "" ||
      initialState.email === "" ||
      initialState.logoUrl === ""
    ) {
      setLoading(false);
      return notifications.show({
        color: "red",
        message: "Please fill in all fields.",
      });
    }

    try {
      if (imgValue.length > 0) {
        const file = imgValue[0];

        const formData = new FormData();
        formData.append("file", file);

        const { image_url } = await uploadImage(formData).unwrap();
        initialState.logoUrl = image_url;
      }

      const payload = {
        data: initialState,
        id: user?._id,
      };

      const res = await updateOrganisation(payload).unwrap();
      notifications.show({
        color: "green",
        message: res.message,
      });
      window.location.reload();
    } catch (error: any) {
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
      <div className="mb-4 flex items-center gap-2">
        External Registration:{" "}
        <strong className={`${loadingUpdate && "opacity-20"}`}>
          {(user as Organisation)?.externalRegistration
            ? "ENABLED"
            : "DISABLED"}
        </strong>
        <IconRotate
          className={`text-[#961699] cursor-pointer ${
            loadingUpdate && "opacity-20"
          }`}
          onClick={async () => {
            if (loadingUpdate) return;

            const payload = {
              id: user._id,
              data: {
                externalRegistration: (user as Organisation)
                  ?.externalRegistration
                  ? false
                  : true,
              },
            };

            try {
              const res = await update(payload).unwrap();
              notifications.show({
                color: "green",
                message: res.message,
              });
              window.location.reload();
            } catch (error: any) {
              notifications.show({
                color: "red",
                message: error.data.message,
              });
            }
          }}
        />
      </div>

      <div className="mb-4 flex items-center gap-2">
        Allow email verification (if exists) for voters:{" "}
        <strong className={`${loadingUpdate && "opacity-20"}`}>
          {(user as Organisation)?.allowVotersEmailVerification
            ? "ENABLED"
            : "DISABLED"}
        </strong>
        <IconRotate
          className={`text-[#961699] cursor-pointer ${
            loadingUpdateVotersEmailVerification && "opacity-20"
          }`}
          onClick={async () => {
            if (loadingUpdateVotersEmailVerification) return;

            const payload = {
              id: user._id,
              data: {
                allowVotersEmailVerification: (user as Organisation)
                  ?.allowVotersEmailVerification
                  ? false
                  : true,
              },
            };

            try {
              const res = await updateAllowVotersEmailVerification(
                payload
              ).unwrap();
              notifications.show({
                color: "green",
                message: res.message,
              });
              window.location.reload();
            } catch (error: any) {
              notifications.show({
                color: "red",
                message: error.data.message,
              });
            }
          }}
        />
      </div>

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
                  <p className="font-bold text-sm">Organisation Name:</p>
                  <p className="text-xs font-normal ml-1">
                    {(user as Organisation).organisationName}
                  </p>
                </div>
              </div>

              <div className="mt-2">
                <div className="flex items-center py-1">
                  <p className="font-bold text-sm">Email:</p>
                  <p className="text-xs font-normal ml-1">
                    {(user as Organisation).email}
                  </p>
                </div>

                {/* <div className="flex items-center py-2">
                  <p className="font-bold text-sm">Slogan:</p>
                  <p className="text-xs font-normal ml-1">
                    {(user as Organisation).slogan}
                  </p>
                </div> */}
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
                label="Organisation Name:"
                value={initialState.organisationName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setInitialState({
                    ...initialState,
                    organisationName: e.target.value,
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

            <div className="lg:gap-4 gap-2  grid grid-cols-1 lg:grid-cols-2">
              <MultiSelect
                defaultValue={(user as Organisation).votersFields}
                label="Voters field"
                data={initialState.votersFields}
                placeholder="voters details"
                searchable
                creatable
                getCreateLabel={(query) => `+ Create ${query}`}
                onCreate={(query) => {
                  const item = query;
                  setInitialState((prev) => ({
                    ...prev,
                    votersFields: [...prev.votersFields, item],
                  }));
                  return item;
                }}
                required
                description="name, email, gender, and password is already prefilled"
                inputWrapperOrder={["label", "error", "input", "description"]}
                onChange={(e) =>
                  setInitialState((prev) => ({
                    ...prev,
                    votersFields: e,
                  }))
                }
              />

              <MultiSelect
                defaultValue={(user as Organisation).votersFields}
                label="Candidates field"
                data={initialState.candidatesFields}
                placeholder="candidate fields"
                searchable
                creatable
                getCreateLabel={(query) => `+ Create ${query}`}
                onCreate={(query) => {
                  const item = query;
                  setInitialState((prev) => ({
                    ...prev,
                    candidatesFields: [...prev.votersFields, item],
                  }));
                  return item;
                }}
                required
                description="full name, email, gender, and photo is already prefilled"
                inputWrapperOrder={["label", "error", "input", "description"]}
                onChange={(e) =>
                  setInitialState((prev) => ({
                    ...prev,
                    candidatesFields: e,
                  }))
                }
              />
            </div>

            <div>
              <p className="mb-2 text-[0.875rem] font-[500] text-[#212529]">
                Organisation icon
              </p>
              <ImageDrop setImgValue={setImgValue} />
            </div>

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
