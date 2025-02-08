import { useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { useFrappeGetCall } from "frappe-react-sdk";
import { CardClass, TableHeaderClass } from "../../common/CommonClasses";
import { ButtonWithIcon } from "../../components/Button";
import { IconAdd } from "../../common/Icons";
import SelectField from "../../components/Fields/SelectField";

const StudentLeave = () => {
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState("");
  const { data: students, isLoading: sLoading } = useFrappeGetCall(
    "parent_portal.parent_portal.api.get_student_details"
  );
  const { data: leaves, isLoading: lLoading } = useFrappeGetCall(
    "parent_portal.parent_portal.api.get_student_leave_applications",
    {
      student: selectedStudent ? selectedStudent : null,
    }
  );

  const columns = useMemo(
    () => [
      {
        name: <div className={TableHeaderClass}>ID</div>,
        selector: (row) => (
          <div
            className={TableHeaderClass}
            onClick={() => {
              navigate(`/student-leave/${row.name}`);
            }}
          >
            {row.name}
          </div>
        ),
        sortable: true,
      },
      {
        name: <div className={TableHeaderClass}>Student Name</div>,
        selector: (row) => (
          <p className="text-black dark:text-white">{row.student_name}</p>
        ),
        sortable: true,
      },
      {
        name: <div className={TableHeaderClass}>From Date</div>,
        selector: (row) => (
          <p className="text-black dark:text-white">{row.from_date}</p>
        ),
        sortable: true,
      },
      {
        name: <div className={TableHeaderClass}>To Date</div>,
        selector: (row) => (
          <p className="text-black dark:text-white">{row.to_date}</p>
        ),
        sortable: true,
      },
    ],
    [leaves]
  );

  return (
    <div className={CardClass}>
      <div className="flex justify-between items-center mb-5">
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

        <ButtonWithIcon
          icon={<IconAdd />}
          text="Add"
          onClick={() => navigate("/student-leave/new")}
        />
      </div>

      <DataTable
        columns={columns}
        data={leaves ? leaves.message : []}
        progressPending={lLoading}
        pagination
        highlightOnHover
        pointerOnHover
      />
    </div>
  );
};

export default StudentLeave;
