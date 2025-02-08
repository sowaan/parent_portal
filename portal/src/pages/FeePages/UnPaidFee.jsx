import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DataTable, { createTheme } from "react-data-table-component";
import moment from "moment";
import {
  CardClass,
  InputWithoutIconClass,
  TableHeaderClass,
} from "../../common/CommonClasses";
import { ConformationDialog } from "../../common/Dialog";
import { useFrappeGetCall } from "frappe-react-sdk";

createTheme("default", {
  background: {
    default: "transparent",
  },
});

const UnPaidFee = () => {
  const navigate = useNavigate();
  const { data: feeList, isLoading } = useFrappeGetCall(
    "parent_portal.parent_portal.api.get_fee_list"
  );
  const [selectedRows, setSelectedRows] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [toggleCleared, setToggleCleared] = useState(false);
  const [file, setFile] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
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

  const columns = useMemo(
    () => [
      {
        name: <div className={TableHeaderClass}>Student Name</div>,
        selector: (row) => (
          <div
            className={TableHeaderClass}
            onClick={() => {
              navigate(`/student-fee/${row.name}`);
            }}
          >
            {row.student_name}
          </div>
        ),
      },
      {
        name: <div className={TableHeaderClass}>Date</div>,
        selector: (row) => (
          <p className="text-black dark:text-white">{row.posting_date}</p>
        ),
        sortable: true,
      },
      {
        name: <div className={TableHeaderClass}>Program</div>,
        selector: (row) => (
          <p className="text-black dark:text-white">{row.program}</p>
        ),
      },
      {
        name: <div className={TableHeaderClass}>Family Code</div>,
        selector: (row) => (
          <p className="text-black dark:text-white">{row.family_code}</p>
        ),
      },
      {
        name: <div className={TableHeaderClass}>Total</div>,
        selector: (row) => (
          <p className="text-black dark:text-white">
            {parseFloat(parseFloat(row.grand_total.toString()).toFixed(2))}
          </p>
        ),
      },
      {
        name: <div className={TableHeaderClass}>Fee Status</div>,
        selector: (row) => {
          return (
            <div
              className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${
                row.is_return == 1
                  ? "bg-secondary text-secondary"
                  : row.outstanding_amount == 0
                    ? "bg-success text-success"
                    : row.outstanding_amount > 0 &&
                        moment(row.due_date).isSameOrAfter(moment(), "day")
                      ? "bg-warning text-warning"
                      : row.outstanding_amount > 0 &&
                          moment(row.due_date).isBefore(moment(), "day")
                        ? "bg-danger text-danger"
                        : "bg-warning text-warning"
              }`}
            >
              {row.is_return == 1
                ? "Refund"
                : row.outstanding_amount == 0
                  ? "Paid"
                  : row.outstanding_amount > 0 &&
                      moment(row.due_date).isSameOrAfter(moment(), "day")
                    ? "Unpaid"
                    : row.outstanding_amount > 0 &&
                        moment(row.due_date).isBefore(moment(), "day")
                      ? "Overdue"
                      : "Draft"}
            </div>
          );
        },
      },
      {
        name: <div className={TableHeaderClass}>Student Status</div>,
        selector: (row) => (
          <p
            className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${row.custom_status === "Active" ? "bg-success text-success" : "bg-danger text-danger"}`}
          >
            {row.custom_status}
          </p>
        ),
      },
    ],
    [feeList]
  );

  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Store the selected file
  };

  const handleRowSelected = useCallback((state) => {
    setSelectedRows(state.selectedRows);
  }, []);

  const handleSubmit = async () => {
    setSubmitLoading(true);

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
            fees: selectedRows,
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
      setSubmitLoading(false);
      setModelFormData({
        bank_name: "",
        transaction_number: "",
        holder_name: "",
        mobile_number: "",
      });
      setError("");
      // }
      setToggleCleared(!toggleCleared);
      setIsModalVisible(false);

      // window.location.reload();
    } catch (error) {
      setError("Error during file upload:", error);
      setSubmitLoading(false);
    }
    // setFees(differenceBy(fees, selectedRows, 'title'));
  };
  const contextActions = useMemo(() => {
    return (
      <div className="mt-3">
        <form
          className="grid grid-cols-2 gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            setIsModalVisible(true);
          }}
        >
          {/* File Input */}
          <div className="mb-3">
            <input
              type="file"
              id="formFile"
              required
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none dark:text-white dark:border-gray-600 dark:bg-gray-800"
            />
          </div>

          {/* Submit Button */}
          <div className="mb-3 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    );
  }, [feeList, selectedRows, toggleCleared, isModalVisible]);

  return (
    <>
      <div className={CardClass}>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}
        {!isModalVisible ? (
          <DataTable
            title={<h2 className={TableHeaderClass}>Fees</h2>}
            columns={columns}
            data={feeList ? feeList.message : []}
            progressPending={isLoading}
            pagination
            highlightOnHover
            pointerOnHover
            selectableRows
            contextActions={contextActions}
            onSelectedRowsChange={handleRowSelected}
            clearSelectedRows={toggleCleared}
            selectableRowDisabled={(row) => row.parent_attachment === 1}
            theme="default"
          />
        ) : (
          <ConformationDialog
            isModalVisible={isModalVisible}
            setIsModalVisible={setIsModalVisible}
            body={
              <div className="p-6">
                <p className="text-gray-700 dark:text-gray-300">
                  Please confirm payment slip attachments for the following
                  fees:
                </p>
                <ul className="mt-2 space-y-1 text-gray-900 dark:text-white">
                  {selectedRows.map((row) => (
                    <li key={row.name} className="list-disc ml-5">
                      {row.name}
                    </li>
                  ))}
                </ul>

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
                        value={modelFormData.bank_name}
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
                        value={modelFormData.transaction_number}
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
                        value={modelFormData.holder_name}
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
                        value={modelFormData.mobile_number}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            }
            handleSubmit={handleSubmit}
            agree={submitLoading}
          />
        )}
      </div>
    </>
  );
};

export default UnPaidFee;
