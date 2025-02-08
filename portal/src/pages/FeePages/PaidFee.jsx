import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { CardClass, TableHeaderClass } from "../../common/CommonClasses";
import { useFrappeGetCall } from "frappe-react-sdk";

const PaidFee = () => {
  const navigate = useNavigate();
  const { data: feeList, isLoading } = useFrappeGetCall(
    "parent_portal.parent_portal.api.get_fee_list?isPaid=1"
  );

  const columns = useMemo(
    () => [
      {
        name: <div className={TableHeaderClass}>Student Name</div>,
        selector: (row) => (
          <div className={TableHeaderClass}>{row.student_name}</div>
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
                row.outstanding_amount == 0
                  ? "bg-success text-success"
                  : "bg-warning text-warning"
              }`}
            >
              {row.outstanding_amount == 0 ? "Paid" : "Draft"}
            </div>
          );
        },
      },
    ],
    [feeList]
  );

  return (
      <div className={CardClass}>
        <DataTable
          title={<h2 className={TableHeaderClass}>Paid Fees</h2>}
          columns={columns}
          data={feeList ? feeList.message : []}
          progressPending={isLoading}
          pagination
          highlightOnHover
          pointerOnHover
          theme="default"
        />
      </div>
  );
};

export default PaidFee;
