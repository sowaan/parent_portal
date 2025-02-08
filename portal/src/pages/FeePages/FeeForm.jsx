import { useNavigate, useParams } from "react-router-dom";
import { useFrappeGetDoc } from "frappe-react-sdk";
import DataTable from "react-data-table-component";
import { useEffect, useState } from "react";
import axios from "axios";
import Breadcrumb from "../../common/Breadcrumb";
import {
  AttachFileClass,
  InputClass,
  InputWithoutIconClass,
} from "../../common/CommonClasses";
import { IconFillUser } from "../../common/Icons";

const columns = [
  {
    name: "Fee Category",
    selector: (row) => row.fees_category,
  },
  {
    name: "Description",
    selector: (row) => row.description,
  },
  {
    name: "Amount",
    selector: (row) => row.amount,
  },
];

const FeeForm = () => {
  const { slug } = useParams();
  const { data } = useFrappeGetDoc("Fees", slug);
  const [file, setFile] = useState(null);
  const [attachment, setAttachment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [modelFormData, setModelFormData] = useState({
    bank_name: "",
    transaction_number: "",
    holder_name: "",
    mobile_number: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setModelFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Store the selected file
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!file) {
        throw "Please select a file to upload.";
      }

      if (modelFormData.bank_name === "") {
        throw "Bank Name is required.";
      }

      if (modelFormData.transaction_number === "") {
        throw "Transaction Number is required.";
      }

      if (modelFormData.holder_name === "") {
        throw "Account Holder Name is required.";
      }

      if (modelFormData.mobile_number === "") {
        throw "Mobile Number is required.";
      }

      await axios
        .post(
          "/api/method/parent_portal.parent_portal.api.make_portal_payment_record",
          {
            fees: [data],
            bank_name: modelFormData.bank_name,
            tran_number: modelFormData.transaction_number,
            holder_name: modelFormData.holder_name,
            number: modelFormData.mobile_number,
          }
        )
        .then(async (result) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("is_private", 0); // Set 1 for private, 0 for public
          formData.append("doctype", "Portal Payment Record"); // Specify the doctype
          formData.append("docname", result.data.message.record_name); // Specify the document name (fee record)
          await axios.post("/api/method/upload_file", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              Accept: "application/json",
            },
          });
        })
        .catch((error) => setError(error.response.data.message));
      setFile(null);
      setLoading(false);
      setModelFormData({
        bank_name: "",
        transaction_number: "",
        holder_name: "",
        mobile_number: "",
      });
      setSuccess("File uploaded successfully.");
      setTimeout(() => {
        setSuccess("");
        navigator("/student-fee");
      }, 2000);
    } catch (error) {
      setError("Error during file upload:", error);
      setLoading(false);
    }
  };

  async function getFeeAttachment() {
    try {
      const response = await axios.get(
        `/api/method/parent_portal.parent_portal.api.get_fees_attachment`,
        {
          params: {
            fee_id: slug,
          },
        }
      );

      const attachments = response.data.message;

      setAttachment(attachments); // Returns an array of attachment objects
    } catch (error) {
      console.error(
        "Failed to fetch attachments:",
        error.response || error.message
      );
    }
  }

  useEffect(() => {
    getFeeAttachment();
  }, [file]);

  return (
    <>
      <Breadcrumb parent="student-fee" pageName={slug} />
      <div className="col-span-5 xl:col-span-3">
        <div className="rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              Fee Information
            </h3>
          </div>
          <div className="p-7">
            {success && (
              <div className="badge bg-success bg-opacity-10 text-success p-3 mb-2">
                {success}
              </div>
            )}
            {error && (
              <div className="badge bg-red-300 text-red p-3 mb-2">{error}</div>
            )}

            <form onSubmit={handleSubmit}>
              {data && data.parent_attachment ? null : (
                <div className="mb-5.5 flex flex-col items-end justify-between gap-5.5 sm:flex-row">
                  <div className="w-full sm:w-1/2">
                    <label className="mb-3 block text-black dark:text-white">
                      Attach file
                    </label>
                    <input
                      type="file"
                      required
                      onChange={handleFileChange}
                      disabled={data && data.parent_attachment}
                      className={`${AttachFileClass} w-full`}
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex cursor-pointer justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90"
                    disabled={loading || (data && data.parent_attachment)}
                  >
                    {loading ? "Loading ..." : "Submit"}
                  </button>
                </div>
              )}
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
                      className={InputWithoutIconClass}
                      type="text"
                      name="bank_name"
                      id="bank_name"
                      disabled={data && data.parent_attachment}
                      value={
                        data ? data.custom_bank_name : modelFormData.bank_name
                      }
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="w-full sm:w-1/2">
                  <label
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                    htmlFor="transaction_number"
                  >
                    Transaction Number
                  </label>
                  <div className="relative">
                    <input
                      className={InputWithoutIconClass}
                      type="text"
                      name="transaction_number"
                      id="transaction_number"
                      disabled={data && data.parent_attachment}
                      value={
                        data
                          ? data.custom_transaction_number
                          : modelFormData.transaction_number
                      }
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                <div className="w-full sm:w-1/2">
                  <label
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                    htmlFor="holder_name"
                  >
                    Account Holder Name
                  </label>
                  <div className="relative">
                    <input
                      className={InputWithoutIconClass}
                      type="text"
                      name="holder_name"
                      id="holder_name"
                      disabled={data && data.parent_attachment}
                      value={
                        data
                          ? data.custom_account_holder_name
                          : modelFormData.holder_name
                      }
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="w-full sm:w-1/2">
                  <label
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                    htmlFor="mobile_number"
                  >
                    Mobile Number
                  </label>
                  <div className="relative">
                    <input
                      className={InputWithoutIconClass}
                      type="phone"
                      name="mobile_number"
                      id="mobile_number"
                      disabled={data && data.parent_attachment}
                      value={
                        data
                          ? data.custom_mobile_number
                          : modelFormData.mobile_number
                      }
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
              <hr className="mb-4" />
              <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                <div className="w-full sm:w-1/2">
                  <label
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                    htmlFor="studentName"
                  >
                    Student Name
                  </label>
                  <div className="relative">
                    <span className="absolute left-4.5 top-4">
                      <IconFillUser className="fill-current" />
                    </span>
                    <input
                      className={InputClass}
                      type="text"
                      name="studentName"
                      id="studentName"
                      disabled={true}
                      defaultValue={
                        data
                          ? data.student_name
                            ? data.student_name
                            : data.student
                          : ""
                      }
                    />
                  </div>
                </div>
                <div className="w-full sm:w-1/2">
                  <label
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                    htmlFor="institution"
                  >
                    Institution
                  </label>
                  <div className="relative">
                    <input
                      className={InputWithoutIconClass}
                      type="text"
                      name="institution"
                      id="institution"
                      disabled={true}
                      defaultValue={data ? data.company : ""}
                    />
                  </div>
                </div>
              </div>
              <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                <div className="w-full sm:w-1/2">
                  <label
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                    htmlFor="date"
                  >
                    Date
                  </label>
                  <div className="relative">
                    <input
                      className={InputWithoutIconClass}
                      type="text"
                      name="date"
                      id="date"
                      disabled={true}
                      defaultValue={data ? data.posting_date : ""}
                    />
                  </div>
                </div>
                <div className="w-full sm:w-1/2">
                  <label
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                    htmlFor="due_date"
                  >
                    Due Date
                  </label>
                  <div className="relative">
                    <input
                      className={InputWithoutIconClass}
                      type="text"
                      name="due_date"
                      id="due_date"
                      disabled={true}
                      defaultValue={data ? data.due_date : ""}
                    />
                  </div>
                </div>
              </div>
              <div className="mb-2 col-12">
                {data && data.components.length > 0 ? (
                  <DataTable
                    columns={columns}
                    data={data.components}
                    pagination
                    highlightOnHover
                    pointerOnHover
                  />
                ) : (
                  "No data found"
                )}
              </div>
              <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                <div className="w-full sm:w-1/2">
                  <label
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                    htmlFor="total_tax"
                  >
                    Total Taxes and Charges
                  </label>
                  <div className="relative">
                    <input
                      className={InputWithoutIconClass}
                      type="text"
                      name="total_tax"
                      id="total_tax"
                      disabled={true}
                      defaultValue={data ? data.total_taxes_and_charges : ""}
                    />
                  </div>
                </div>
                <div className="w-full sm:w-1/2">
                  <label
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                    htmlFor="grand_total"
                  >
                    Grand Total
                  </label>
                  <div className="relative">
                    <input
                      className={InputWithoutIconClass}
                      type="text"
                      name="grand_total"
                      id="grand_total"
                      disabled={true}
                      defaultValue={data ? data.grand_total : ""}
                    />
                  </div>
                </div>
              </div>
              <hr />
              <div className="mb-3 col-6">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Attachments
                </label>
                {attachment && attachment.length > 0 ? (
                  attachment.map((file, index) => (
                    <div key={index}>
                      <a href={file.file_url} target="_blank" rel="noreferrer">
                        {file.name}
                      </a>
                    </div>
                  ))
                ) : (
                  <div>No attachments found.</div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default FeeForm;
