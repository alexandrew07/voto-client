import { Modal } from "@mantine/core";

type ChatModalProps = {
  opened: boolean;
  close: () => void;
};

function ChatModal({ opened, close }: ChatModalProps) {
  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title="Messages"
        size="1000px"
        styles={{
          title: {
            fontWeight: 600,
            fontSize: "1.3rem",
          },
        }}
      >
        <p className="text-lg text-center my-8">
          REAL TIME CHAT COMMUNICATION COMING SOON
        </p>
        {/* Modal content */}
      </Modal>
    </>
  );
}

export default ChatModal;
