import { useCategorizeElectionsMutation } from "@/features/electionApi";
import { Button, Modal, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";

type CategorizeElectionModalProps = {
  opened: boolean;
  close: () => void;
  elections: string[];
};

function CategorizeElectionModal({
  opened,
  close,
  elections,
}: CategorizeElectionModalProps) {
  const form = useForm({
    initialValues: {
      name: "",
      elections,
    },
  });

  const [categorize, { isLoading }] = useCategorizeElectionsMutation();

  const handleCategorize = async (values: any) => {
    try {
      const res = await categorize(values).unwrap();
      notifications.show({
        color: "green",
        message: res.message,
      });
      close();
      window.location.reload();
    } catch (error: any) {
      notifications.show({
        color: "red",
        message: error.data.message,
      });
    }
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title="Categorize Election"
        size="500px"
        styles={{
          title: {
            fontWeight: 600,
            fontSize: "1.3rem",
          },
        }}
        centered
      >
        <p className="text-sm text-center">
          You are about to categorize {elections.length} elections
        </p>
        <form
          className="mt-2"
          onSubmit={form.onSubmit((values) => handleCategorize(values))}
        >
          <Stack spacing={30}>
            <TextInput
              label="Category Name"
              required
              withAsterisk={false}
              {...form.getInputProps("name")}
              placeholder="category name"
            />

            <Button
              loading={isLoading}
              type="submit"
              className="bg-[#961699] hover:bg-[#961699] p-2 px-6 text-white outline-none border-none h-[2.5rem] hover:opacity-80"
            >
              Submit
            </Button>
          </Stack>
        </form>
      </Modal>
    </>
  );
}

export default CategorizeElectionModal;
