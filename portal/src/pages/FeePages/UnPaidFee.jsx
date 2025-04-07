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
import { useFrappeGetCall, useFrappeGetDoc } from "frappe-react-sdk";
import { toast } from "react-toastify";
import SelectField from "../../components/Fields/SelectField";

createTheme("default", {
  background: {
    default: "transparent",
  },
});

const UnPaidFee = () => {
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedFeeType, setSelectedFeeType] = useState("");
  const { data: students, isLoading: sLoading } = useFrappeGetCall(
    "parent_portal.parent_portal.api.get_student_details"
  );
  const { data: feeList, isLoading } = useFrappeGetCall(
    "parent_portal.parent_portal.api.get_fee_list",
    { isPaid: 0 }
  );
  const { data: eduSettings, error: eduError } = useFrappeGetDoc(
    "Education Settings",
    "Education Settings"
  );
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedFees, setSelectedFees] = useState(new Set());

  const [feeCategories, setFeeCategories] = useState([]);
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
  const [filteredFees, setFilteredFees] = useState([]);
  const [discountFilter, setDiscountFilter] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setModelFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const sortFunc = (val1, val2) => {
    const a = val1.toLowerCase();
    const b = val2.toLowerCase();

    if (a > b) {
      return 1;
    }

    if (b > a) {
      return -1;
    }

    return 0;
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
        sortFunction: (rowA, rowB) => sortFunc(rowA.posting_date, rowB.posting_date),
      },
      {
        name: <div className={TableHeaderClass}>Fee Type</div>,
        selector: (row) => (
          <p className="text-black dark:text-white">{row.fees_category}</p>
        ),
      },
      {
        name: <div className={TableHeaderClass}>Program</div>,
        selector: (row) => (
          <p className="text-black dark:text-white">{row.program}</p>
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
    const selectedNames = new Set(state.selectedRows.map((row) => row.name));
    setSelectedFees(selectedNames);
    setSelectedRows(state.selectedRows);
  }, []);

  const selectableRowDisabled = useCallback(
    (row) => {
      // Group fees by student_id
      const feesByStudent = {};
      filteredFees.forEach((fee) => {
        if (!feesByStudent[fee.student_id]) {
          feesByStudent[fee.student_id] = [];
        }
        feesByStudent[fee.student_id].push(fee);
      });

      // Sort each student's fees by posting_date
      Object.values(feesByStudent).forEach((fees) => {
        fees.sort(
          (a, b) => new Date(a.posting_date) - new Date(b.posting_date)
        );
      });

      // Find first unpaid fee per student
      const firstUnpaidFees = new Set();

      Object.values(feesByStudent).forEach((fees) => {
        let previousPaid = true; // Assume all previous fees are paid initially

        for (const fee of fees) {
          if (fee.parent_attachment === 1 || selectedFees.has(fee.name)) {
            // If paid or selected, next month can be enabled
            previousPaid = true;
          } else if (previousPaid) {
            // First unpaid fee should be enabled
            firstUnpaidFees.add(fee.name);
            previousPaid = false; // Next months should remain disabled unless this is selected
          } else {
            previousPaid = false;
          }
        }
      });

      // Disable row if:
      // - It's already paid (parent_attachment === 1)
      // - It's not the first unpaid fee and previous month is not selected
      return (
        row.parent_attachment === 1 ||
        selectedFees.has(row.name) ||
        (!firstUnpaidFees.has(row.name) && !selectedFees.has(row.name))
      );
    },
    [filteredFees, selectedFees]
  );

  useEffect(() => {
    handleDiscount();
  }, [selectedRows]);

  const handleDiscount = async () => {
    let discountedRows = selectedRows.filter(
      (row) => row.due_date >= moment().format("YYYY-MM-DD")
    );
    if (discountedRows.length <= 0 || !eduSettings?.enable_discount) {
      setDiscountFilter([]);
      return;
    }
    const eduDiscountOn = eduSettings && eduSettings.apply_discount_on;
    if (eduDiscountOn) {
      // Filtering based on due date and fees category
      discountedRows = discountedRows.filter(
        (row) => row.fees_category === eduDiscountOn
      );
      // Filter by student category
      const as_category = eduSettings.applicable_student_categories;
      if (as_category) {
        const studentCategories = new Set(
          as_category.map((ele) => ele.student_category)
        );

        discountedRows = discountedRows.filter((row) =>
          studentCategories.has(row.student_category)
        );
      }
      // Count occurrences of each student_id
      const student_count = {};
      for (let i = 0; i < discountedRows.length; i++) {
        const ele = discountedRows[i];
        student_count[ele.student_id] = student_count[ele.student_id]
          ? student_count[ele.student_id] + 1
          : 1;
      }

      const eduDiscountSlabs = eduSettings && eduSettings.discount_slabs;
      if (eduDiscountSlabs) {
        for (let i = 0; i < discountedRows.length; i++) {
          let row = discountedRows[i];
          let student_id = row.student_id;

          // Find the applicable discount slab
          let discountSlab = null;
          for (let j = 0; j < eduDiscountSlabs.length; j++) {
            let ele = eduDiscountSlabs[j];
            if (
              ele.from_month <= student_count[student_id] &&
              student_count[student_id] <= ele.to_month
            ) {
              discountSlab = ele;
              break; // Exit loop early when first matching slab is found
            }
          }

          // If no matching discount slab, continue to next row
          if (!discountSlab) continue;

          // Apply discount based on type
          let discountAmount =
            discountSlab.discount_type === "Percentage"
              ? (row.grand_total * discountSlab.percentage) / 100
              : discountSlab.amount;

          // Update discountedRows[i] directly
          discountedRows[i] = {
            ...row,
            grand_total: row.grand_total - discountAmount,
          };
        }

        setDiscountFilter(discountedRows);
      }
    }
  };

  const handleSubmit = async () => {
    setSubmitLoading(true);

    try {
      if (!file) throw "Please select a file to upload.";
      if (modelFormData.bank_name === "") throw "Bank Name is required.";
      if (modelFormData.transaction_number === "")
        throw "Transaction Number is required.";
      if (modelFormData.holder_name === "")
        throw "Account Holder Name is required.";
      if (modelFormData.mobile_number === "")
        throw "Mobile Number is required.";

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
          await axios
            .post("/api/method/upload_file", formData, {
              headers: {
                "Content-Type": "multipart/form-data",
                Accept: "application/json",
              },
            })
            .then((response) => {
              toast.success("File uploaded successfully");
              setFile(null);
            })
            .catch((error) => {
              console.error("Error uploading file:", error);
              toast.error("Error uploading file");
            });
        })
        .catch((error) => {
          console.log(error, "checking error");

          toast.error(error.toString());
          setError(error.response.data.message);
        });
      setFile(null);
      setSubmitLoading(false);
      setModelFormData({
        bank_name: "",
        transaction_number: "",
        holder_name: "",
        mobile_number: "",
      });
      setError("");
      setToggleCleared(!toggleCleared);
      setIsModalVisible(false);
    } catch (error) {
      setError("Error during file upload:", error);
      toast.error(`${error}`);
      setSubmitLoading(false);
    }
    // setFees(differenceBy(fees, selectedRows, 'title'));
  };

  useEffect(() => {
    if (feeList) {
      if (selectedStudent) {
        const filtered = feeList.message.filter(
          (fee) => fee.student_id === selectedStudent
        );
        setFilteredFees(filtered);
      }
      if (selectedFeeType) {
        const filtered = feeList.message.filter(
          (fee) => fee.fees_category === selectedFeeType
        );
        setFilteredFees(filtered);
      }
      if (selectedStudent && selectedFeeType) {
        const filtered = feeList.message.filter(
          (fee) =>
            fee.student_id === selectedStudent &&
            fee.fees_category === selectedFeeType
        );
        setFilteredFees(filtered);
      }
      if (!selectedStudent && !selectedFeeType) {
        setFilteredFees(feeList.message);
      }
    }
  }, [selectedStudent, selectedFeeType, feeList]);

  useEffect(() => {
    const categories =
      feeList && feeList.message.map((fee) => fee.fees_category);
    setFeeCategories([...new Set(categories)]);
  }, [feeList]);

  const contextActions = useMemo(() => {
    return (
      <div className="mt-3">
        <form
          className="grid grid-cols-2 gap-1"
          onSubmit={(e) => {
            e.preventDefault();
            setIsModalVisible(true);
          }}
        >
          {/* File Input */}
          <div className="mt-2">
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

  useEffect(() => {
    toast.error(eduError && eduError._server_messages);
  }, [eduError]);

  return (
    <div className={CardClass}>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}
      {!isModalVisible && !sLoading && (
        <div className="grid grid-cols-4 gap-6">
          <SelectField
            label=""
            selectedOption={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            options={
              <>
                <option value="">Select Student</option>
                {students &&
                  students.message.map((student, index) => (
                    <option key={index} value={student.name}>
                      {student.first_name}
                    </option>
                  ))}
              </>
            }
          />
          <SelectField
            label=""
            selectedOption={selectedFeeType}
            onChange={(e) => setSelectedFeeType(e.target.value)}
            options={
              <>
                <option value="">Select Fee Type</option>
                {feeCategories &&
                  feeCategories.map((type, index) => (
                    <option key={index} value={type}>
                      {type}
                    </option>
                  ))}
              </>
            }
          />
        </div>
      )}
      {/* Calculate Subtotal */}
      {(() => {
        const subtotal = selectedRows
          .reduce((sum, row) => sum + (row.grand_total || 0), 0)
          .toFixed(2);
        const discountrowGrandTotal = discountFilter
          .reduce((sum, row) => sum + (row.grand_total || 0), 0)
          .toFixed(2);
        const discountrowOutStandingTotal = discountFilter
          .reduce((sum, row) => sum + (row.outstanding_amount || 0), 0)
          .toFixed(2);
        const discountTotal =
          discountrowOutStandingTotal - discountrowGrandTotal;

        const total = discountTotal > 0 ? subtotal - discountTotal : subtotal;
        const discount = discountTotal > 0 ? discountTotal.toFixed(2) : "0.00";

        return (
          <div className="flex">
            <div className="mx-2 mt-3 text-sm">SubTotal: {subtotal}</div>
            <div className="mx-2 mt-3 text-sm">Discount: {discount}</div>
            <div className="mx-2 mt-3 text-sm font-bold text-black dark:text-white">
              Total: {parseFloat(total.toString()).toFixed(2)}
            </div>
          </div>
        );
      })()}
      {!isModalVisible ? (
        <DataTable
          title={<h2 className={TableHeaderClass}>Fees</h2>}
          columns={columns}
          data={filteredFees || []}
          progressPending={isLoading}
          pagination
          highlightOnHover
          pointerOnHover
          selectableRows
          contextActions={contextActions}
          onSelectedRowsChange={handleRowSelected}
          clearSelectedRows={toggleCleared}
          selectableRowDisabled={(row) => selectableRowDisabled(row)}
          theme="default"
        />
      ) : (
        <ConformationDialog
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          body={
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300">
                Please confirm payment slip attachments for the following fees:
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
  );
};

export default UnPaidFee;
