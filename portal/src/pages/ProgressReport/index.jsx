import axios from "axios";
import { useFrappeGetCall } from "frappe-react-sdk";
import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { CardClass, TableHeaderClass } from "../../common/CommonClasses";
import SelectField from "../../components/Fields/SelectField";

const ProgressReport = () => {
  const [results, setResults] = useState([]);
  const [course, setCourse] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const { data: students, isLoading: sLoading } = useFrappeGetCall(
    "parent_portal.parent_portal.api.get_student_details"
  );
  const { data: group, isLoading: gLoading } = useFrappeGetCall(
    "parent_portal.parent_portal.api.get_assessment_groups"
  );
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [allRows, setAllRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  async function getResults() {
    try {
      setIsLoading(true);
      let response = await axios.get(
        "/api/method/parent_portal.parent_portal.api.get_student_results",
        {
          params: {
            student: selectedStudent,
            group: selectedGroup,
            course: selectedCourse,
          },
        }
      );
      setResults(response.data.message);
      const allRowsData = response.data.message
        .filter((result) => result.details)
        .flatMap((result) =>
          result.details.map((details) => ({
            student_name: result.student_name,
            course: result.course,
            schedule_date: result.schedule_date,
            assessment_group: result.assessment_group,
            assessment_criteria: details.assessment_criteria,
            maximum_score: details.maximum_score,
            score: details.score,
            grade: details.grade,
          }))
        );
      setAllRows(allRowsData);
      setIsLoading(false);
    } catch (error) {
      console.error(
        "Failed to fetch results:",
        error.response || error.message
      );
    }
  }

  async function getCourse() {
    let value = [];
    for (let i = 0; i < results.length; i++) {
      if (!value.includes(results[i].course)) {
        value.push(results[i].course);
      }
    }
    setCourse(value);
  }

  useEffect(() => {
    getResults();
    getCourse();
  }, []);

  // Define columns for the table
  const columns = [
    {
      name: <div className={TableHeaderClass}>Student Name</div>,
      selector: (row) => (
        <div className={TableHeaderClass}>{row.student_name}</div>
      ),
      sortable: true,
      maxWidth: "120px",
    },
    {
      name: <div className={TableHeaderClass}>Course</div>,
      selector: (row) => (
        <p className="text-black dark:text-white">{row.course}</p>
      ),
      sortable: true,
      maxWidth: "120px",
    },
    {
      name: <div className={TableHeaderClass}>Schedule Date</div>,
      selector: (row) => (
        <p className="text-black dark:text-white">{row.schedule_date}</p>
      ),
      sortable: true,
    },
    {
      name: <div className={TableHeaderClass}>Assessment Group</div>,
      selector: (row) => (
        <p className="text-black dark:text-white">{row.assessment_group}</p>
      ),
      sortable: true,
    },
    {
      name: <div className={TableHeaderClass}>Assessment Criteria</div>,
      selector: (row) => (
        <p className="text-black dark:text-white">{row.assessment_criteria}</p>
      ),
      sortable: true,
    },
    {
      name: <div className={TableHeaderClass}>Maximum Score</div>,
      selector: (row) => (
        <p className="text-black dark:text-white">{row.maximum_score}</p>
      ),
      sortable: true,
    },
    {
      name: <div className={TableHeaderClass}>Score</div>,
      selector: (row) => (
        <p className="text-black dark:text-white">{row.score}</p>
      ),
      sortable: true,
    },
    {
      name: <div className={TableHeaderClass}>Grade</div>,
      selector: (row) => (
        <p className="text-black dark:text-white">{row.grade}</p>
      ),
      sortable: true,
    },
  ];

  return (
    <div className={CardClass}>
      <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row justify-between items-center">
        <div className="flex flex-col gap-5.5 sm:flex-row">
          <div className="w-full sm:w-47.5">
            <SelectField
              label=""
              selectedOption={selectedStudent}
              onChange={(e) => {
                setSelectedStudent(e.target.value);
                getCourse();
              }}
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
          </div>
          <div className="w-full sm:w-47.5">
            <SelectField
              label=""
              selectedOption={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              options={
                <>
                  <option value="">Group</option>
                  {group &&
                    group.message.map((group, index) => (
                      <option key={index} value={group}>
                        {group}
                      </option>
                    ))}
                </>
              }
            />
          </div>
          <div className="w-full sm:w-47.5">
            <SelectField
              label=""
              selectedOption={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              options={
                <>
                  <option value="">Course</option>
                  {course.map((course, index) => (
                    <option key={index} value={course}>
                      {course}
                    </option>
                  ))}
                </>
              }
            />
          </div>
        </div>
        <button
          onClick={() => getResults()}
          className="inline-flex float-end items-center justify-center gap-2.5 rounded-lg bg-primary py-3 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
        >
          Filter
        </button>
      </div>
      <hr className="mb-5.5" />

      <DataTable
        columns={columns}
        data={allRows}
        pagination
        pointerOnHover
        progressPending={isLoading}
      />
    </div>
  );
};

export default ProgressReport;
