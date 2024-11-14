import { Organisation } from "@/features/authSlice";
import { RootState } from "@/store";
import { Modal, createStyles, Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCircleCheck } from "@tabler/icons-react";
import Link from "next/link";
import React from "react";
import { PaystackConsumer } from "react-paystack";
import { useSelector } from "react-redux";

type UpgradePlanModalProps = {
  opened: boolean;
  close: () => void;
};

const useStyles = createStyles(() => ({
  body: {
    [`@media (min-width: 1024px)`]: {
      padding: "1rem 3rem",
    },
  },

  title: {
    fontWeight: "bold",
    fontSize: "1.5rem",
    marginTop: "1rem",
    [`@media (min-width: 1024px)`]: {
      paddingLeft: "2rem",
    },
  },
}));

const UpgradePlanModal: React.FC<UpgradePlanModalProps> = ({
  opened,
  close,
}) => {
  const { classes } = useStyles();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleSuccess = (message: string) => {
    notifications.show({
      color: "green",
      message,
    });

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <Modal
      opened={opened}
      onClose={close}
      centered
      overlayProps={{ opacity: 0.4, blur: 1 }}
      title="UPGRADE PLAN"
      size="xl"
      radius="md"
      classNames={classes}
    >
      <div className="grid lg:grid-cols-2 gap-10 mt-8">
        <aside
          className="p-4 rounded-xl bg-white"
          style={{
            boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
          }}
        >
          <h5 className="font-bold text-lg">LITE</h5>
          <h1 className="text-3xl font-bold text-[var(--primary-color)]">
            ₦10,000
          </h1>
          <p className="text-center mt-4 text-[var(--primary-color)]">
            Small Organization
          </p>

          <div className="border-b my-6"></div>

          <ul className="space-y-4 text-sm">
            <li className="flex gap-2 items-center">
              <IconCircleCheck
                fill="var(--primary-color)"
                color="#fff"
                size={28}
              />
              <span>On-site and Off-site Elections</span>
            </li>

            <li className="flex gap-2 items-center">
              <IconCircleCheck
                fill="var(--primary-color)"
                color="#fff"
                size={28}
              />
              <span>Secure Voting</span>
            </li>

            <li className="flex gap-2 items-center">
              <IconCircleCheck
                fill="var(--primary-color)"
                color="#fff"
                size={28}
              />
              <span>Analytics and Reporting</span>
            </li>

            <Link
              href="https://voto.com.ng/#pricing"
              className="block text-center mt-2 underline hover:text-[var(--primary-color)]"
              target="_blank"
              rel="noopener noreferrer"
            >
              Explore more benefits
            </Link>
          </ul>

          <div className="mt-8">
            <PaystackConsumer
              amount={10000 * 100}
              email={(user as Organisation)?.email}
              onSuccess={() => handleSuccess("Plan upgraded successfully")}
              publicKey={process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!}
              metadata={{
                custom_fields: [
                  {
                    display_name: "upgradePlan",
                    value: "upgradePlan",
                    variable_name: "upgradePlan",
                  },
                  {
                    display_name: "organisationId",
                    value: user?._id,
                    variable_name: "organisationId",
                  },
                  {
                    display_name: "plan",
                    value: "lite",
                    variable_name: "plan",
                  },
                ],
              }}
            >
              {({ initializePayment }) => (
                <Button
                  className="bg-[#961699] hover:bg-[#961699] hover:opacity-80"
                  onClick={() => {
                    initializePayment();
                  }}
                >
                  Subscribe
                </Button>
              )}
            </PaystackConsumer>
          </div>
        </aside>

        <aside
          className="p-4 rounded-xl bg-white"
          style={{
            boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
          }}
        >
          <h5 className="font-bold text-lg">DELUXE</h5>
          <h1 className="text-3xl font-bold text-[var(--primary-color)]">
            ₦20,000
          </h1>
          <p className="text-center mt-4 text-[var(--primary-color)]">
            Big Organization
          </p>

          <div className="border-b my-6"></div>

          <ul className="space-y-4 text-sm">
            <li className="flex gap-2 items-center">
              <IconCircleCheck
                fill="var(--primary-color)"
                color="#fff"
                size={28}
              />
              <span>On-site and Off-site Elections</span>
            </li>

            <li className="flex gap-2 items-center">
              <IconCircleCheck
                fill="var(--primary-color)"
                color="#fff"
                size={28}
              />
              <span>Secure Voting</span>
            </li>

            <li className="flex gap-2 items-center">
              <IconCircleCheck
                fill="var(--primary-color)"
                color="#fff"
                size={28}
              />
              <span>Analytics and Reporting</span>
            </li>

            <Link
              href="https://voto.com.ng/#pricing"
              className="block text-center mt-2 underline hover:text-[var(--primary-color)]"
              target="_blank"
              rel="noopener noreferrer"
            >
              Explore more benefits
            </Link>
          </ul>

          <div className="mt-8">
            <PaystackConsumer
              amount={20000 * 100}
              email={(user as Organisation)?.email}
              onSuccess={() => handleSuccess("Plan upgraded successfully")}
              publicKey={process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!}
              metadata={{
                custom_fields: [
                  {
                    display_name: "upgradePlan",
                    value: "upgradePlan",
                    variable_name: "upgradePlan",
                  },
                  {
                    display_name: "organisationId",
                    value: user?._id,
                    variable_name: "organisationId",
                  },
                  {
                    display_name: "plan",
                    value: "deluxe",
                    variable_name: "plan",
                  },
                ],
              }}
            >
              {({ initializePayment }) => (
                <Button
                  className="bg-[#961699] hover:bg-[#961699] hover:opacity-80"
                  onClick={() => {
                    initializePayment();
                  }}
                >
                  Subscribe
                </Button>
              )}
            </PaystackConsumer>
          </div>
        </aside>
      </div>
    </Modal>
  );
};
export default UpgradePlanModal;
