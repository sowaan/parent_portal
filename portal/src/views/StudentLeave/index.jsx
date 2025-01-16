import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormSelect,
  CRow,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { cilPlus } from "@coreui/icons";
import { useNavigate } from "react-router-dom";

const StudentLeave = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

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

  async function getStudentLeave(student) {
    try {
      setLoading(true);
      let response = await axios.get(
        "/api/method/parent_portal.parent_portal.api.get_student_leave_applications",
        {
          params: {
            student: student,
          },
        }
      );
      setLeaves(response.data.message);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(
        "Failed to fetch student leave:",
        error.response || error.message
      );
    }
  }

  useEffect(() => {
    getStudents();
    getStudentLeave();
  }, []);

  const columns = useMemo(
    () => [
      {
        name: "ID",
        selector: (row) => (
          <div
            onClick={() => {
              navigate(`/student-leave/${row.name}`);
            }}
          >
            {row.name}
          </div>
        ),
      },
      {
        name: "Student Name",
        selector: (row) => row.student_name,
      },
      {
        name: "From Date",
        selector: (row) => row.from_date,
        sortable: true,
      },
      {
        name: "To Date",
        selector: (row) => row.to_date,
      },
    ],
    [leaves]
  );

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
                    getStudentLeave(e.target.value);
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
                <CButton
                  color="primary"
                  onClick={() => navigate("/student-leave/new")}
                  style={{ float: "right" }}
                >
                  <CIcon icon={cilPlus} className="nav-icon" /> Add
                </CButton>
              </CCol>
            </CRow>
          </CCardHeader>
          <CCardBody>
            <DataTable
              columns={columns}
              data={leaves.length > 0 ? leaves : []}
              progressPending={loading}
              pagination
              highlightOnHover
              pointerOnHover
            />
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default StudentLeave;
