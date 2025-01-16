import { cilChevronLeft } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import {
  CButton,
  CCard,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
} from "@coreui/react";
import axios from "axios";
import { useFrappeGetDoc } from "frappe-react-sdk";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const StudentLeaveForm = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [group, setGroup] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  const [reason, setReason] = useState("");
  const [attachment, setAttachment] = useState(null);
  const { data } = useFrappeGetDoc("Student Leave Application", slug);

  async function setFieldsValues() {
    setFromDate(data.from_date);
    setToDate(data.to_date);
    setReason(data.reason);
    setSelectedStudent(data.student);
    setSelectedGroup(data.student_group);
  }

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

  async function getGroups(student) {
    try {
      let response = await axios.get(
        "/api/method/parent_portal.parent_portal.api.get_student_group",
        {
          params: {
            student: student,
          },
        }
      );
      setGroup(response.data.message);
    } catch (error) {
      console.error("Failed to fetch groups:", error.response || error.message);
    }
  }

  async function submitLeaveApplication(e) {
    e.preventDefault();

    try {
      let response = await axios.post(
        "/api/method/parent_portal.parent_portal.api.submit_student_leave_application",
        {
          student: selectedStudent,
          from_date: fromDate,
          to_date: toDate,
          reason: reason,
          student_group: selectedGroup,
        }
      );

      console.log("Leave application submitted:", response.data.message);

      // Handle missing attachment case
      if (!attachment) {
        alert("Please select a file to upload.");
        return;
      }

      // Upload attachment
      console.log("Uploading attachment:", attachment);

      const formData = new FormData();
      formData.append("file", attachment);
      formData.append("is_private", 0); // Marking the file as public

      formData.append("doctype", "Student Leave Application");
      formData.append("docname", response.data.message.name); // Use the name from response

      const fileResponse = await axios.post(
        "/api/method/upload_file",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
        }
      );

      console.log("Attachment uploaded:", fileResponse.data.message);

      // Navigate to the specific student's leave application
      navigate(`/student-leave/${response.data.message.name}`);
    } catch (error) {
      // Improved error handling
      console.error(
        "Failed to submit leave application:",
        error.response?.data?.message || error.message
      );
      alert(
        `Error: ${
          error.response?.data?.message || "An unexpected error occurred."
        }`
      );
    }
  }

  useEffect(() => {
    if (slug) {
      setFieldsValues();
    }
  }, [data]);

  useEffect(() => {
    getStudents();
  }, []);

  return (
    <CCol xs={12}>
      <CCard className="m-4 mt-0 p-4">
        <CForm onSubmit={(e) => submitLeaveApplication(e)}>
          <div className="d-flex align-items-center text-center justify-content-between mb-2">
            <div className="d-flex align-items-center text-center mb-2">
              <CButton onClick={() => navigate(-1)} className="border">
                <CIcon icon={cilChevronLeft} />
              </CButton>
              <div className="m-2">{slug}</div>
            </div>
            <CButton type="submit" disabled={slug} className="btn btn-primary">
              Submit Leave
            </CButton>
          </div>
          <div className="row g-12">
            <div className="mb-3 col-6">
              <CFormLabel htmlFor="select_student">Student</CFormLabel>
              <CFormSelect
                required
                id="select_student"
                aria-label="Select student"
                disabled={slug}
                value={selectedStudent}
                onChange={async (e) => {
                  setSelectedStudent(e.target.value);
                  await getGroups(e.target.value);
                }}
              >
                <option value="">Student</option>
                {students.map((student, index) => (
                  <option key={index} value={student.name}>
                    {student.first_name}
                  </option>
                ))}
              </CFormSelect>
            </div>
            <div className="mb-3 col-6">
              <CFormLabel htmlFor="from_date">From Date</CFormLabel>
              <CFormInput
                type="date"
                required
                id="from_date"
                placeholder="From Date"
                disabled={slug}
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                }}
              />
            </div>
            {selectedStudent !== "" ? (
              <div className="mb-3 col-6">
                <CFormLabel htmlFor="student_group">Student Group</CFormLabel>
                <CFormSelect
                  required
                  id="student_group"
                  aria-label="Student Group"
                  disabled={slug}
                  value={selectedGroup}
                  onChange={(e) => {
                    setSelectedGroup(e.target.value);
                  }}
                >
                  <option value="">Group</option>
                  {group.map((group, index) => (
                    <option key={index} value={group}>
                      {group}
                    </option>
                  ))}
                </CFormSelect>
              </div>
            ) : (
              ""
            )}
            <div className="mb-3 col-6">
              <CFormLabel htmlFor="to_date">To Date</CFormLabel>
              <CFormInput
                type="date"
                required
                id="to_date"
                placeholder="To Date"
                disabled={slug}
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                }}
              />
            </div>
            <div className="mb-3 col-6">
              <CFormLabel htmlFor="reason">Reason</CFormLabel>
              <CFormTextarea
                id="reason"
                required
                spellCheck
                disabled={slug}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                }}
              ></CFormTextarea>
            </div>
            <div className="mb-3 col-6">
              <CFormLabel htmlFor="attach">Attachment</CFormLabel>
              <CFormInput
                type="file"
                required
                id="attach"
                disabled={slug}
                onChange={(e) => setAttachment(e.target.files[0])}
              />
            </div>
          </div>
        </CForm>
      </CCard>
    </CCol>
  );
};

export default StudentLeaveForm;
