/* eslint-disable react/prop-types */
import { cilUser } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import {
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
} from "@coreui/react";
import { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";

const Dashboard = () => {
  const [progressGroup, setProgressGroup] = useState([]);
  const [totals, setTotals] = useState({ present: 0, absent: 0 });
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeButton, setActiveButton] = useState("Month");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: moment().startOf("month"),
    endDate: moment().endOf("month"),
  });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleButtonClick = (value) => {
    setActiveButton(value);
    setShowDatePicker(value === "Custom");
    const currentDate = moment();
    const ranges = {
      Day: [
        currentDate.startOf("day").format(),
        currentDate.endOf("day").format(),
      ],
      Week: [
        currentDate.startOf("week").format(),
        currentDate.endOf("week").format(),
      ],
      Month: [
        currentDate.startOf("month").format(),
        currentDate.endOf("month").format(),
      ],
      Year: [
        currentDate.startOf("year").format(),
        currentDate.endOf("year").format(),
      ],
      Custom: [startDate, endDate],
    };
    const [start, end] = ranges[value] || ranges["Month"];
    console.log(start, end, "Starting and ending ");
    setDateRange({ startDate: start, endDate: end });
  };
  // Fetch attendance summary
  const attendanceSummary = async (startDate, endDate) => {
    const student = students[selectedStudent] || {};
    try {
      const response = await axios.get(
        "/api/method/parent_portal.parent_portal.api.get_attendance_summary",
        {
          params: {
            start_date: startDate,
            end_date: endDate,
            student: student.name,
          },
        }
      );
      const { summary, total_present, total_absent } = response.data.message;
      setProgressGroup(summary);
      console.log(total_present, total_absent, "total");

      setTotals({ present: total_present, absent: total_absent });
    } catch (error) {
      console.error("Failed to fetch attendance summary:", error);
    }
  };
  // Fetch students list
  const fetchStudents = async () => {
    try {
      const response = await axios.get(
        "/api/method/parent_portal.parent_portal.api.get_student_details"
      );
      setStudents(response.data.message);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  };

  // Fetch students on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    attendanceSummary(
      dateRange.startDate.toString(),
      dateRange.endDate.toString()
    );
  }, [dateRange, selectedStudent]);

  // Header for the date range
  const DateRangeHeader = () => (
    <div className="mb-2">
      {activeButton === "Day" && (
        <div className="small text-body-secondary">Today</div>
      )}
      {activeButton !== "Day" && (
        <div className="small text-body-secondary">
          {moment(dateRange.startDate).format("DD MMMM")} -{" "}
          {moment(dateRange.endDate).format("DD MMMM YYYY")}
        </div>
      )}
    </div>
  );

  // Individual student row
  const StudentRow = ({ student, index }) => (
    <div
      className={`progress-group mb-2 p-2 rounded ${
        selectedStudent === index ? "selected" : ""
      }`}
      onClick={() =>
        setSelectedStudent((prevSelected) =>
          prevSelected === index ? null : index
        )
      }
      style={{
        cursor: "pointer",
        backgroundColor: selectedStudent === index ? "#f0f8ff" : "transparent",
      }}
    >
      <div className="progress-group-header d-flex align-items-center">
        <CIcon className="me-2" icon={cilUser} size="lg" />
        <span>{student.first_name}</span>
        <span className="ms-auto fw-semibold">
          {student.admission_registration_id}
        </span>
      </div>
    </div>
  );

  return (
    <CRow className="mx-4">
      <CCol xs>
        <CCard className="mb-4">
          <CCardHeader>Attendance</CCardHeader>
          <CCardBody>
            <CRow>
              <CCol xs={12} md={6} xl={6}>
                <CRow>
                  <CCol xs={6}>
                    <div className="border-start border-start-4 border-start-success py-1 px-3">
                      <div className="text-body-secondary text-truncate small">
                        Total Present
                      </div>
                      <div className="fs-5 fw-semibold">{totals.present}</div>
                    </div>
                  </CCol>
                  <CCol xs={6}>
                    <div className="border-start border-start-4 border-start-danger py-1 px-3 mb-3">
                      <div className="text-body-secondary text-truncate small">
                        Total Absent
                      </div>
                      <div className="fs-5 fw-semibold">{totals.absent}</div>
                    </div>
                  </CCol>
                </CRow>
                <hr className="mt-0" />
                {progressGroup.map((item, index) => (
                  <div className="progress-group mb-4" key={index}>
                    <div className="progress-group-prepend">
                      <span className="text-body-secondary small">
                        {item.title}
                      </span>
                    </div>
                    <div className="progress-group-bars">
                      <CProgress thin color="success" value={item.present} />
                      <CProgress thin color="danger" value={item.absent} />
                    </div>
                  </div>
                ))}
              </CCol>
              <CCol xs={12} md={6} xl={6}>
                <CRow>
                  <CCol xs={6}></CCol>
                  <CCol xs={6}>
                    <CButtonGroup className="float-end me-3 mb-2">
                      {["Day", "Week", "Month", "Year", "Custom"].map(
                        (value) => (
                          <CButton
                            color="outline-secondary"
                            key={value}
                            className={`"mx-0" ${
                              value == "Custom" ? "dropdown-toggle" : ""
                            }`}
                            active={value === activeButton}
                            onClick={() => handleButtonClick(value)}
                          >
                            {value}
                          </CButton>
                        )
                      )}
                    </CButtonGroup>
                    {showDatePicker && (
                      <div
                        className="dropdown-menu show p-3 border rounded"
                        style={{
                          backgroundColor: "#f8f9fa",
                          maxWidth: "300px",
                          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        <div className="mb-2">
                          <label className="me-2">Start Date:</label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="form-control d-inline-block w-auto"
                          />
                        </div>
                        <div className="mb-2">
                          <label className="me-2">End Date:</label>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="form-control d-inline-block w-auto"
                          />
                        </div>
                        <div>
                          <CButton
                            color="primary"
                            className="me-2"
                            onClick={() => {
                              setDateRange({
                                startDate,
                                endDate,
                              });
                              setShowDatePicker(false);
                            }}
                          >
                            Apply
                          </CButton>
                          <CButton
                            color="secondary"
                            onClick={() => setShowDatePicker(false)}
                          >
                            Cancel
                          </CButton>
                        </div>
                      </div>
                    )}
                    <DateRangeHeader dateRange={dateRange} />
                  </CCol>
                </CRow>

                <hr className="mt-0" />
                <div style={{ height: "340px", overflow: "auto" }}>
                  {students.map((student, index) => (
                    <StudentRow key={index} student={student} index={index} />
                  ))}
                </div>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default Dashboard;
