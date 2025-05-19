import { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { CardClass, TableHeaderClass } from "../../common/CommonClasses";
import { useFrappeGetCall } from "frappe-react-sdk";
import SelectField from "../../components/Fields/SelectField";

const PaidFee = () => {
  const { data: feeList, isLoading } = useFrappeGetCall(
    "parent_portal.parent_portal.api.get_fee_list?isPaid=1&asc=0"
  );
  const { data: students } = useFrappeGetCall(
    "parent_portal.parent_portal.api.get_student_details"
  );
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedFeeType, setSelectedFeeType] = useState("");
  const [feeCategories, setFeeCategories] = useState([]);
  const [filteredFees, setFilteredFees] = useState([]);

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
          <div className={TableHeaderClass}>{row.student_name}</div>
        ),
        sortable: true,
        sortFunction: (rowA, rowB) => sortFunc(rowA.student_name, rowB.student_name),
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
        sortable: true,
      },
      {
        name: <div className={TableHeaderClass}>Family Code</div>,
        selector: (row) => (
          <p className="text-black dark:text-white">{row.family_code}</p>
        ),
        sortable: true,
      },
      {
        name: <div className={TableHeaderClass}>Total</div>,
        selector: (row) => (
          <p className="text-black dark:text-white">
            {parseFloat(parseFloat(row.grand_total.toString()).toFixed(2))}
          </p>
        ),
        sortable: true,
      },
      {
        name: <div className={TableHeaderClass}>Fee Status</div>,
        selector: (row) => {
          return (
            <div
              className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${
                row.outstanding_amount == 0
                  ? "bg-success text-success"
                  : "bg-warning text-warning"
              }`}
            >
              {row.outstanding_amount == 0 ? "Paid" : "Draft"}
            </div>
          );
        },
        sortable: true,
      },
    ],
    [feeList]
  );

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

  return (
    <div className={CardClass}>
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
      <DataTable
        title={<h2 className={TableHeaderClass}>Paid Fees</h2>}
        columns={columns}
        data={filteredFees || []}
        progressPending={isLoading}
        pagination
        highlightOnHover
        pointerOnHover
        theme="system"
      />
    </div>
  );
};

export default PaidFee;
