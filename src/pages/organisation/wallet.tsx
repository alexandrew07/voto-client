import UpgradePlanModal from "@/components/Modals/UpgradePlanModal";
import { Organisation } from "@/features/authSlice";
import {
  useVerifyAccountNumberMutation,
  useWithdrawMutation,
} from "@/features/organisationApi";
import { RootState } from "@/store";
import { Button, Card, Modal, Select, Stack, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

type Bank = {
  active: boolean;
  code: string;
  country: string;
  createdAt: string;
  currency: string;
  gateway: string;
  id: number;
  is_deleted: boolean;
  longcode: string;
  name: string;
  pay_with_bank: boolean;
  slug: string;
  type: string;
  updatedAt: string;
};

const Wallet = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const [withdrawalAmount, setWithdrawalAmount] = useState<string | number>("");
  const [banks, setBanks] = useState<Bank[]>([]);

  const [selectedBank, setSelectedBank] = useState<Bank>();

  const [withdrawOpened, { open: withdrawOpen, close: withdrawClose }] =
    useDisclosure(false);
  const [
    openedUpgradePlan,
    { open: openUpgradePlan, close: closeUpgradePlan },
  ] = useDisclosure(false);

  const [form, setForm] = useState({
    account_number: "",
    bank_code: "",
    account_name: "",
  });

  const fetchBanks = async () => {
    const res = await fetch(
      "https://api.paystack.co/bank?country=nigeria&currency=NGN"
    );
    const { data } = await res.json();
    setBanks(data);
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  const handleSuccess = (message: string) => {
    notifications.show({
      color: "green",
      message,
    });
    window.location.reload();
  };

  const deduction = (8 / 100) * +withdrawalAmount;
  const remainingAmount = +withdrawalAmount - deduction;

  function formatNigerianCurrency(amount: number) {
    return amount.toLocaleString("en-NG", {
      style: "currency",
      currency: "NGN",
    });
  }

  const [btnValue, setBtnValue] = useState("Validate");

  const [withdraw, { isLoading }] = useWithdrawMutation();
  const [validated, setValidated] = useState(false);

  const [verifyAccountNumber, { isLoading: loadingValidation }] =
    useVerifyAccountNumberMutation();

  const validateAccountNumber = async () => {
    try {
      const { account_number, bank_code } = form;

      const res = await verifyAccountNumber({
        account_number,
        bank_code,
      }).unwrap();

      setForm((prevForm) => ({
        ...prevForm,
        account_name: res.data.account_name,
      }));

      setValidated(true);
      setBtnValue("Withdraw");
    } catch (error: any) {
      notifications.show({
        color: "red",
        message: error.data.message || "error validating account number",
      });
    }
  };

  const withdrawAmount = async () => {
    const accountDetails = {
      ...form,
      bank: selectedBank,
    };

    const data = {
      accountDetails,
      amount: withdrawalAmount,
    };

    try {
      const res = await withdraw(data).unwrap();
      notifications.show({
        color: "green",
        message: res.message,
      });

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      notifications.show({
        color: "red",
        message: error.data.message || "error processing withdrawal",
      });
    }
  };

  return (
    <>
      <UpgradePlanModal opened={openedUpgradePlan} close={closeUpgradePlan} />
      <Modal
        title="Withdraw"
        opened={withdrawOpened}
        onClose={() => {
          withdrawClose();
          setForm({
            account_number: "",
            bank_code: "",
            account_name: "",
          });
          setBtnValue("Validate");
          setValidated(false);
          setSelectedBank(undefined);
        }}
        size="lg"
        centered
        styles={{
          title: { fontWeight: "bold", fontSize: "20px" },
        }}
      >
        <p className="font-bold">
          You&apos;re about to withdraw{" "}
          {formatNigerianCurrency(+withdrawalAmount)} from your wallet.
          you&apos;ll be charged 8% per withdrawal.
        </p>
        <p className="mt-2 underline underline-offset-2">
          You&apos;ll receive {formatNigerianCurrency(remainingAmount)}
        </p>

        <div className="mt-6">
          <p className="text-center">provide your bank details below</p>
          <form action="">
            <Stack spacing={20}>
              <Select
                label="Bank Name"
                value={selectedBank?.name}
                onChange={(value) => {
                  const selectedBank: Bank | undefined = banks.find(
                    (bank) => bank.name === value
                  );
                  setSelectedBank(selectedBank!);

                  setForm((prevForm) => ({
                    ...prevForm,
                    bank_code: selectedBank?.code || "",
                  }));
                }}
                data={banks.map((bank) => bank.name)}
                searchable
                required
              />
              <TextInput
                label="Account Number"
                type="number"
                value={form.account_number}
                onChange={(e) =>
                  setForm((prevForm) => ({
                    ...prevForm,
                    account_number: e.target.value || "",
                  }))
                }
                required
              />
              {validated && (
                <TextInput
                  label="Account Name"
                  required
                  disabled
                  readOnly
                  value={form.account_name}
                />
              )}
              <Button
                className="bg-[#961699] mt-4 hover:bg-[#961699] hover:opacity-80"
                loading={isLoading || loadingValidation}
                onClick={() => {
                  if (btnValue === "Validate") {
                    validateAccountNumber();
                  } else {
                    withdrawAmount();
                  }
                }}
              >
                {btnValue}
              </Button>
            </Stack>
          </form>
        </div>
      </Modal>

      <div>
        <div className="flex justify-between flex-col lg:flex-row gap-2 lg:gap-0">
          <div>
            <h1 className="text-[25px] font-bold">Balance:</h1>

            <h2 className="text-[18px] font-medium">
              NGN{" "}
              <span className="text-sm">
                {(user as Organisation)?.wallet.toFixed(2)}
              </span>
            </h2>
          </div>

          <div>
            <div>
              <h1 className="text-[25px] font-bold">Current Plan:</h1>
              <h2 className="text-[18px] font-medium capitalize">
                {(user as Organisation)?.subscriptionPlan
                  ? (user as Organisation).subscriptionPlan
                  : "free"}
              </h2>
            </div>

            {(user as Organisation)?.subscriptionPlan === "free" && (
              <div className="flex justify-center">
                <Button
                  className="bg-[#961699] mt-4 hover:bg-[#961699] hover:opacity-80"
                  onClick={openUpgradePlan}
                >
                  Upgrade
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10">
          <Card className="lg:w-[800px] mx-auto">
            <h2 className="font-bold">Withdraw</h2>

            <form action="" className="mt-4">
              <TextInput
                label="Amount to withdraw"
                type="number"
                onChange={(e) => setWithdrawalAmount(e.target.value)}
              />
              <div className="flex justify-center">
                <Button
                  className="bg-[#961699] mt-4 hover:bg-[#961699] hover:opacity-80"
                  onClick={() => {
                    if (+withdrawalAmount < 1)
                      return notifications.show({
                        color: "red",
                        message: "please enter the amount you want to withdraw",
                      });

                    if ((user as Organisation).wallet < +withdrawalAmount)
                      return notifications.show({
                        color: "red",
                        message:
                          "you can't withdraw more that your available balance",
                      });
                    withdrawOpen();
                  }}
                >
                  Withdraw
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Wallet;
