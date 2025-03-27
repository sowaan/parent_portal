import { useFrappeGetDoc } from "frappe-react-sdk";
import { useEffect } from "react";
import { toast } from "react-toastify";

const BankDetails = () => {
  const { data, error, isValidating } = useFrappeGetDoc(
    "Parent Portal Settings",
    "Parent Portal Settings"
  );

  useEffect(() => {
    toast.error(error && error.message)
  }, [error]);

  return (
    <div className="col-span-5 xl:col-span-3">
      <div className="rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Bank Information
          </h3>
        </div>
        <div className="p-7">
          <form action="#">
            <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
              <div className="w-full sm:w-1/2">
                <label
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                  htmlFor="bank_name"
                >
                  Bank Name
                </label>
                <div className="relative">
                  <input
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                    type="text"
                    name="bank_name"
                    id="bank_name"
                    defaultValue={data && data.bank_name}
                    disabled
                  />
                </div>
              </div>
              <div className="w-full sm:w-1/2">
                <label
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                  htmlFor="account_name"
                >
                  Account Title
                </label>
                <div className="relative">
                  <input
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                    type="text"
                    name="account_name"
                    id="account_name"
                    defaultValue={data && data.account_name}
                    disabled
                  />
                </div>
              </div>
            </div>
            <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
              <div className="w-full sm:w-1/2">
                <label
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                  htmlFor="account_no"
                >
                  Account Number
                </label>
                <div className="relative">
                  <input
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                    type="text"
                    name="account_no"
                    id="account_no"
                    defaultValue={data && data.account_number}
                    disabled
                  />
                </div>
              </div>
              <div className="w-full sm:w-1/2">
                <label
                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                  htmlFor="iban"
                >
                  IBAN
                </label>
                <div className="relative">
                  <input
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                    type="text"
                    name="iban"
                    id="iban"
                    defaultValue={data && data.iban}
                    disabled
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BankDetails;
