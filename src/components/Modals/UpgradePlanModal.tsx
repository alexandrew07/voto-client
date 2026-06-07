import { Organisation } from "@/features/authSlice";
import { RootState } from "@/store";
import { Modal, createStyles, Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCircleCheck } from "@tabler/icons-react";
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

type PricingPlan = {
  name: string;
  price: string;
  audience?: string;
  subtitle?: string;
  features: readonly string[];
  cta: string;
  amount?: number;
  plan?: string;
};

const UpgradePlanModal: React.FC<UpgradePlanModalProps> = ({
  opened,
  close,
}) => {
  const { classes } = useStyles();
  const { user } = useSelector((state: RootState) => state.auth);
  const pricingLink = "https://voto.com.ng/#pricing";

  const plans: readonly PricingPlan[] = [
    {
      name: "LITE",
      price: "₦15,000",
      audience: "2,000 votes",
      subtitle: "Small Organization",
      features: [
        "On-site and Off-site Elections",
        "Secure Voting",
        "Analytics and Reporting",
        "Free graphic design",
        "Customizable Solutions",
        "Priority Email Support",
        "Onboarding & training",
        "Printed Ballots",
        "Email or Phone Support",
        "Certification & Verification",
      ],
      cta: "Get started",
      amount: 15000,
      plan: "lite",
    },
    {
      name: "DELUXE",
      price: "₦35,000",
      audience: "5,000 votes - 10,000 votes",
      subtitle: "Big Organization",
      features: [
        "On-site and Off-site Elections",
        "Secure Voting",
        "Analytics and Reporting",
        "Free graphic design",
        "Customizable Solutions",
        "Priority Email Support",
        "Onboarding & training",
        "Printed Ballots",
        "Email or Phone Support",
        "Certification & Verification",
      ],
      cta: "Get started",
      amount: 35000,
      plan: "deluxe",
    },
    {
      name: "ENTERPRISE",
      price: "For 10,000 votes & above",
      subtitle: "All features on LITE and DELUXE",
      features: [],
      cta: "Contact us",
    },
    {
      name: "PAY TO VOTE",
      price: "8% of total revenue",
      subtitle: "Monetized Elections",
      features: [
        "All features on LITE and DELUXE",
        "Price negotiable",
        "Next-day-payout after voting",
      ],
      cta: "Get started",
    },
  ];

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
        {plans.map((plan) => (
          <aside
            key={plan.name}
            className="p-4 rounded-xl bg-white flex flex-col"
            style={{
              boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
            }}
          >
            <h5 className="font-bold text-lg">{plan.name}</h5>
            <h1 className="text-3xl font-bold text-[var(--primary-color)]">
              {plan.price}
            </h1>
            <p className="text-center mt-4 text-[var(--primary-color)]">
              {plan.audience || plan.subtitle}
            </p>

            {plan.audience ? (
              <p className="text-center mt-1 text-sm">{plan.subtitle}</p>
            ) : plan.subtitle ? (
              <p className="text-center mt-1 text-sm">{plan.subtitle}</p>
            ) : null}

            <div className="border-b my-6"></div>

            {plan.features.length > 0 && (
              <ul className="space-y-4 text-sm flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2 items-center">
                    <IconCircleCheck
                      fill="var(--primary-color)"
                      color="#fff"
                      size={28}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-8">
              {plan.amount ? (
                <PaystackConsumer
                  amount={plan.amount * 100}
                  email={(user as Organisation)?.email}
                  onSuccess={() => handleSuccess("Plan upgraded successfully")}
                  publicKey={process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!}
                  channels={["card", "bank", "bank_transfer", "ussd", "qr"]}
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
                        value: plan.plan,
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
                      {plan.cta}
                    </Button>
                  )}
                </PaystackConsumer>
              ) : (
                <Button
                  component="a"
                  href={pricingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#961699] hover:bg-[#961699] hover:opacity-80"
                >
                  {plan.cta}
                </Button>
              )}
            </div>
          </aside>
        ))}
      </div>
    </Modal>
  );
};
export default UpgradePlanModal;
