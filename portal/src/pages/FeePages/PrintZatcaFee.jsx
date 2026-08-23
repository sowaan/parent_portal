import { useMemo } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { CardClass, TableHeaderClass } from "../../common/CommonClasses";
import { useFrappeGetCall } from "frappe-react-sdk";
import { toast } from "react-toastify";

const PrintZatcaFee = () => {
  const { data: feeCollections, isLoading } = useFrappeGetCall(
    "parent_portal.parent_portal.api.get_fee_collection_list"
  );

  const handlePrint = async (name) => {
    try {
      const response = await axios.post(
        "/api/method/parent_portal.parent_portal.api.get_fee_collection_print_url",
        { name }
      );
      window.open(response.data.message, "_blank");
    } catch (error) {
      toast.error("Unable to open print view for this fee collection.");
    }
  };

  const columns = useMemo(
    () => [
      {
        name: <div className={TableHeaderClass}>Fee Collection ID</div>,
        selector: (row) => (
          <div className={TableHeaderClass}>{row.name}</div>
        ),
        sortable: true,
      },
      {
        name: <div className={TableHeaderClass}>Payment Date</div>,
        selector: (row) => (
          <p className="text-black dark:text-white">
            {row.creation && row.creation.slice(0, 10)}
          </p>
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
        name: <div className={TableHeaderClass}>Print</div>,
        selector: (row) => (
          <button
            type="button"
            onClick={() => handlePrint(row.name)}
            className="inline-flex items-center gap-1 rounded-md border border-primary py-1 px-3 text-sm font-medium text-primary hover:bg-primary hover:text-white"
          >
            Print
          </button>
        ),
      },
    ],
    [feeCollections]
  );

  return (
    <div className={CardClass}>
      <DataTable
        title={<h2 className={TableHeaderClass}>Print Zatca Fee</h2>}
        columns={columns}
        data={feeCollections?.message || []}
        progressPending={isLoading}
        pagination
        highlightOnHover
        pointerOnHover
        theme="system"
      />
    </div>
  );
};

export default PrintZatcaFee;
