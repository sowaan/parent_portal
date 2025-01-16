import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormSelect,
  CRow,
} from "@coreui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";

const ProgressReport = () => {
  const [results, setResults] = useState([]);
  const [course, setCourse] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [group, setGroup] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [allRows, setAllRows] = useState([]);

  async function getStudents() {
    try {
      let response = await axios.get(
        "/api/method/parent_portal.parent_portal.api.get_student_details"
      );

      setStudents(response.data.message);
    } catch (error) {
      console.error(
        "Failed to fetch students:",
        error.response || error.message
      );
    }
  }

  async function getGroups() {
    try {
      let response = await axios.get(
        "/api/method/parent_portal.parent_portal.api.get_assessment_groups"
      );
      setGroup(response.data.message);
    } catch (error) {
      console.error("Failed to fetch groups:", error.response || error.message);
    }
  }

  async function getResults() {
    try {
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
    getStudents();
    getGroups();
  }, []);

  useEffect(() => {
    getResults();
    getCourse();
  }, []);

  // Define columns for the table
  const columns = [
    {
      name: "Student Name",
      selector: (row) => row.student_name,
      sortable: true,
      maxWidth: "120px",
    },
    {
      name: "Course",
      selector: (row) => row.course,
      sortable: true,
      maxWidth: "120px",
    },
    {
      name: "Schedule Date",
      selector: (row) => row.schedule_date,
      sortable: true,
    },
    {
      name: "Assessment Group",
      selector: (row) => row.assessment_group,
      sortable: true,
    },
    {
      name: "Assessment Criteria",
      selector: (row) => row.assessment_criteria,
      sortable: true,
    },
    {
      name: "Maximum Score",
      selector: (row) => row.maximum_score,
      sortable: true,
    },
    {
      name: "Score",
      selector: (row) => row.score,
      sortable: true,
    },
    {
      name: "Grade",
      selector: (row) => row.grade,
      sortable: true,
    },
  ];

  return (
    <CRow className="mx-4">
      <CCol xs>
        <CCard className="mb-4">
          <CCardHeader>
            <CRow>
              <CCol xs>
                <CFormSelect
                  aria-label="Select student"
                  value={selectedStudent}
                  onChange={(e) => {
                    setSelectedStudent(e.target.value);
                    getCourse();
                  }}
                >
                  <option value="">Student</option>
                  {students.map((student, index) => (
                    <option key={index} value={student.name}>
                      {student.first_name}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol xs>
                <CFormSelect
                  aria-label="Select Group"
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                >
                  <option value="">Group</option>
                  {group.map((group, index) => (
                    <option key={index} value={group}>
                      {group}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol xs>
                <CFormSelect
                  aria-label="Select course"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <option value="">Course</option>
                  {course.map((course, index) => (
                    <option key={index} value={course}>
                      {course}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol xs>
                <CButton
                  color="primary"
                  style={{ float: "right" }}
                  onClick={() => getResults()}
                >
                  Filter
                </CButton>
              </CCol>
            </CRow>
          </CCardHeader>
          <CCardBody>
            <DataTable
              columns={columns}
              data={allRows}
              pagination
              striped
              highlightOnHover
            />
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default ProgressReport;
