import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCardText,
  CCardTitle,
  CCol,
  CFormInput,
  CFormSelect,
  CRow,
} from "@coreui/react";
import axios from "axios";
import { useEffect, useState } from "react";

const Lectures = () => {
  const [lecture, setLecture] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [titleFilter, setTitleFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");

  const handleDateChange = (e) => setSelectedDate(e.target.value);
  const handleStudentChange = (e) => setSelectedStudent(e.target.value);
  const handleTitleChange = (e) => setTitleFilter(e.target.value);
  const handleCourseChange = (e) => setCourseFilter(e.target.value);

  // Fetch students list
  async function fetchStudents() {
    try {
      const response = await axios.get(
        "/api/method/parent_portal.parent_portal.api.get_student_details"
      );
      setStudents(response.data.message);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  }

  async function getLectures(filters) {
    try {
      const response = await axios.get(
        "/api/method/parent_portal.parent_portal.api.get_lectures_for_students",
        { params: filters }
      );
      setLecture(response.data.message);
      // all course in lectures push into setCourses
      const course = new Set();
      response.data.message.forEach((lecture) => {
        course.add(lecture.course);
      });
      setCourses(course);
      console.log("Courses", courses);
    } catch (error) {
      console.error(
        "Failed to fetch lectures:",
        error.response || error.message
      );
    }
  }

  const applyFilters = () => {
    const filters = {
      student: selectedStudent || undefined,
      date: selectedDate || undefined,
      title: titleFilter || undefined,
      course: courseFilter || undefined,
    };
    getLectures(filters); // Passing the filters to the API
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    getLectures({});
  }, []);

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
                  onChange={handleStudentChange}
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
                <div className="date-picker">
                  <div className="date-picker-input-group">
                    <input
                      type="date"
                      autoComplete="off"
                      placeholder="Select date"
                      className="date-picker-input"
                      value={selectedDate}
                      onChange={handleDateChange}
                    />
                  </div>
                </div>
              </CCol>
              <CCol xs>
                <CFormInput
                  type="text"
                  placeholder="Title"
                  value={titleFilter}
                  onChange={handleTitleChange}
                />
              </CCol>
              <CCol xs>
                <CFormSelect
                  aria-label="Select course"
                  value={courseFilter}
                  onChange={handleCourseChange}
                >
                  <option value="">Course</option>
                  {courses.map((course, index) => (
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
                  onClick={applyFilters}
                >
                  Filter
                </CButton>
              </CCol>
            </CRow>
          </CCardHeader>
          <CCardBody>
            <CRow>
              {lecture.map((item, index) => {
                return (
                  <CCol key={index} sm={6} xl={4} xxl={3}>
                    <CCard style={{ width: "18rem" }}>
                      <iframe
                        src={item.resource}
                        height={160}
                        className="card-img-top"
                      ></iframe>
                      <CCardBody>
                        <CCardTitle>{item.title}</CCardTitle>
                        <CCardText>{item.description}</CCardText>
                        <CButton
                          color="primary"
                          target="_blank"
                          href={item.resource}
                        >
                          View
                        </CButton>
                      </CCardBody>
                    </CCard>
                  </CCol>
                );
              })}
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default Lectures;
