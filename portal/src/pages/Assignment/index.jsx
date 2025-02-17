import { useFrappeGetCall } from "frappe-react-sdk";
import { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { CardClass, TableHeaderClass } from "../../common/CommonClasses";

const Assignment = () => {
  const navigate = useNavigate();
  // const [assignments, setAssignments] = useState([]);
  // const [loading, setLoading] = useState(true);
  const { data: assignments, isLoading: loading } = useFrappeGetCall(
    "parent_portal.parent_portal.api.get_student_assignments"
  );

  // async function getStudentAssignments() {
  //   try {
  //     setLoading(true);
  //     let response = await axios.get(
  //       "/api/method/parent_portal.parent_portal.api.get_student_assignments"
  //     );
  //     setAssignments(response.data.message);
  //     setLoading(false);
  //   } catch (error) {
  //     setLoading(false);
  //     console.error(
  //       "Failed to fetch assignments:",
  //       error.response || error.message
  //     );
  //   }
  // }

  // useEffect(() => {
  //   getStudentAssignments();
  // }, []);

  const columns = useMemo(
    () => [
      {
        name: <div className={TableHeaderClass}>Id</div>,
        selector: (row) => (
          <div
            className={TableHeaderClass}
            onClick={() => {
              navigate(`/assignment/${row.name}`);
            }}
          >
            {row.name}
          </div>
        ),
      },
      {
        name: <div className={TableHeaderClass}>Course</div>,
        selector: (row) => (
          <p className="text-black dark:text-white">{row.course}</p>
        ),
        sortable: true,
      },
      {
        name: <div className={TableHeaderClass}>Due Date</div>,
        selector: (row) => (
          <p className="text-black dark:text-white">{row.due_date}</p>
        ),
      },
    ],
    [assignments]
  );

  return (
    <div className={CardClass}>
      <DataTable
        title={<h2 className={TableHeaderClass}>Assignments</h2>}
        columns={columns}
        data={assignments ? assignments.message : []}
        progressPending={loading}
        pagination
        highlightOnHover
        pointerOnHover
      />
    </div>
  );
};

export default Assignment;
