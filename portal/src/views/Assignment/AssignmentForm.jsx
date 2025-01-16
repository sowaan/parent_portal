import { cilChevronLeft } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import {
  CButton,
  CCard,
  CCol,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CRow,
} from "@coreui/react";
import { useNavigate, useParams } from "react-router-dom";
import Input from "../../components/Input";
import { useFrappeGetDoc } from "frappe-react-sdk";
import { useEffect, useState } from "react";
import axios from "axios";

const AssignmentForm = () => {
  const { slug } = useParams();
  const navigator = useNavigate();
  const [student, setStudent] = useState([]);
  const [visible, setVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const { data, error, isValidating, mutate } = useFrappeGetDoc(
    "Batch Task",
    slug
  );

  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Store the selected file
  };

  const handleSubmit = async (e) => {
    if (!selectedStudent) {
      alert("Please select a student to submit the assignment.");
      return;
    }
    e.preventDefault();
    setLoading(true);
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("is_private", 0); // Set 1 for private, 0 for public
    formData.append("optimize", true);
    formData.append("doctype", "Batch Task"); // Specify the doctype
    formData.append("docname", slug); // Specify the document name (fee record)

    try {
      const response = await axios.post("/api/method/upload_file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      });

      const file_url = response.data.message.file_url;

      await axios.post(
        "/api/method/parent_portal.parent_portal.api.submit_student_assignment",
        {
          name: slug,
          student_id: selectedStudent,
          file_url: file_url,
        }
      );
      setFile(null);
      setVisible(false);
      setLoading(false);
    } catch (error) {
      console.error("Error during file upload:", error);
      setLoading(false);
      alert("An error occurred. Please try again.");
    }
  };

  async function get_students() {
    try {
      if (data) {
        const response = await axios.get(
          "/api/method/parent_portal.parent_portal.api.get_student_details"
        );
        let matchingData = [];
        const res = response.data.message;
        for (let i = 0; i < res.length; i++) {
          for (let j = 0; j < data.students.length; j++) {
            if (
              res[i].name === data.students[j].student
              // &&
              // data.students[j].is_attach == 0
            ) {
              matchingData.push(data.students[j]);
            }
          }
        }
        setStudent(matchingData);
      }
    } catch (error) {
      console.error(
        "Failed to fetch assignments:",
        error.response || error.message
      );
    }
  }

  useEffect(() => {
    get_students();
  }, [data]);

  return (
    <div className="body flex-grow-1">
      <CRow>
        <CCol xs={12}>
          <CCard className="m-4 mt-0 p-4">
            <div className="d-flex align-items-center text-center justify-content-between">
              <div className="d-flex align-items-center text-center mb-2">
                <CButton onClick={() => navigator(-1)} className="border">
                  <CIcon icon={cilChevronLeft} />
                </CButton>
                <div className="m-2">{slug}</div>
              </div>
              <CButton
                onClick={() => setVisible(true)}
                className="btn btn-primary"
              >
                Submit Assignment
              </CButton>
            </div>
            {/* CoreUI Modal */}
            <CModal visible={visible} onClose={() => setVisible(false)}>
              <CModalHeader onClose={() => setVisible(false)}>
                <strong>Confirm Submission</strong>
              </CModalHeader>
              <CModalBody>
                <CFormSelect
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="mb-3"
                  aria-label="Large select example"
                  required
                >
                  <option value="">Select Student</option>
                  {student &&
                    student.map((item, index) => (
                      <option key={index} value={item.student}>
                        {item.student_name}
                      </option>
                    ))}
                </CFormSelect>
                <CFormInput
                  type="file"
                  id="attachment"
                  placeholder="submit assignment"
                  required
                  onChange={handleFileChange}
                  disabled={selectedStudent == ""}
                />
              </CModalBody>
              <CModalFooter>
                <CButton
                  color="primary"
                  disabled={selectedStudent == ""}
                  onClick={handleSubmit}
                >
                  Submit
                </CButton>
              </CModalFooter>
            </CModal>
            <div className="row g-12">
              <div className="mb-3 col-6">
                <Input
                  id="student_assignment"
                  value={data ? data.student_assignment : ""}
                  lable="Assignment"
                  isDisable={true}
                />
              </div>
              <div className="mb-3 col-6">
                <Input
                  id="course"
                  value={data ? data.course : ""}
                  lable="Course"
                  isDisable={true}
                />
              </div>
              <div className="mb-3 col-6">
                <Input
                  id="assignment_date"
                  value={data ? data.assignment_date : ""}
                  lable="Posting Date"
                  isDisable={true}
                />
              </div>
              <div className="mb-3 col-6">
                <Input
                  id="due_date"
                  value={data ? data.due_date : ""}
                  lable="Due Date"
                  isDisable={true}
                />
              </div>
              <div className="col-12">
                <CFormLabel htmlFor="recourse">Assignment Details</CFormLabel>
                <iframe
                  src={data ? data.recourse : ""}
                  width="100%"
                  height="500"
                  title="Assignment"
                  id="recourse"
                ></iframe>
              </div>
            </div>
          </CCard>
        </CCol>
      </CRow>
    </div>
  );
};

export default AssignmentForm;
