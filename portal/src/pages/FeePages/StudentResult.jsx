import { useMemo } from "react";
import DataTable from "react-data-table-component";
import { CardClass, TableHeaderClass } from "../../common/CommonClasses";
import { useFrappeGetCall } from "frappe-react-sdk";

const StudentResult = () => {
  const { data: results, isLoading } = useFrappeGetCall(
    "parent_portal.parent_portal.api.get_final_result_list"
  );

  const handlePrint = (studentId) => {
    window.open(
      `/api/method/parent_portal.parent_portal.api.download_student_result_pdf?student=${studentId}`,
      "_blank"
    );
  };

  const columns = useMemo(
    () => [
      {
        name: <div className={TableHeaderClass}>Student Name</div>,
        selector: (row) => (
          <div className={TableHeaderClass}>{row.student_name}</div>
        ),
        sortable: true,
      },
      {
        name: <div className={TableHeaderClass}>Student ID</div>,
        selector: (row) => (
          <p className="text-black dark:text-white">{row.student_id}</p>
        ),
        sortable: true,
      },
      {
        name: <div className={TableHeaderClass}>Class</div>,
        selector: (row) => (
          <p className="text-black dark:text-white">{row.class}</p>
        ),
        sortable: true,
      },
      {
        name: <div className={TableHeaderClass}>Print Result</div>,
        selector: (row) =>
          row.can_print ? (
            <button
              type="button"
              onClick={() => handlePrint(row.student_id)}
              className="inline-flex items-center gap-1 rounded-md border border-primary py-1 px-3 text-sm font-medium text-primary hover:bg-primary hover:text-white"
            >
              Print
            </button>
          ) : null,
      },
    ],
    [results]
  );

  return (
    <div className={CardClass}>
      <DataTable
        title={<h2 className={TableHeaderClass}>Student Result</h2>}
        columns={columns}
        data={results?.message || []}
        progressPending={isLoading}
        pagination
        highlightOnHover
        pointerOnHover
        theme="system"
      />
    </div>
  );
};

export default StudentResult;
