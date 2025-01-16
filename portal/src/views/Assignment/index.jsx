import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";

const Assignment = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  async function getStudentAssignments() {
    try {
      setLoading(true);
      let response = await axios.get(
        "/api/method/parent_portal.parent_portal.api.get_student_assignments"
      );
      setAssignments(response.data.message);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(
        "Failed to fetch assignments:",
        error.response || error.message
      );
    }
  }

  useEffect(() => {
    getStudentAssignments();
  }, []);

  const columns = useMemo(
    () => [
      {
        name: "Id",
        selector: (row) => (
          <div
            onClick={() => {
              navigate(`/assignment/${row.name}`);
            }}
          >
            {row.name}
          </div>
        ),
      },
      {
        name: "Course",
        selector: (row) => row.course,
        sortable: true,
      },
      {
        name: "Due Date",
        selector: (row) => row.due_date,
      },
    ],
    [assignments]
  );

  return (
    <div className="body m-4 mt-0 p-2 bg-white pt-0 rounded">
      <DataTable
        title="Assignments"
        columns={columns}
        data={assignments.length > 0 ? assignments : []}
        progressPending={loading}
        pagination
        highlightOnHover
        pointerOnHover
      />
    </div>
  );
};

export default Assignment;
