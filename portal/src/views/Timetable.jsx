import { CCard, CCardHeader, CCol, CFormSelect, CRow } from "@coreui/react";
import { useEffect, useState } from "react";
import axios from "axios";

const Timetable = () => {
  const [batch, setBatch] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [timeTable, setTimeTable] = useState();
  const [error, setError] = useState("");

  let lastDay = "";

  async function fetchStudentBatch() {
    try {
      const response = await axios.get(
        "/api/method/parent_portal.parent_portal.api.get_student_batch"
      );
      setBatch(response.data.message);
    } catch (error) {
      console.error("Failed to fetch batch:", error);
    }
  }

  async function fetchTimetable(batch) {
    try {
      const response = await axios.get(
        "/api/method/parent_portal.parent_portal.api.get_timetable",
        {
          params: {
            batch: batch,
          },
        }
      );
      setTimeTable(response.data.message);
    } catch (error) {
      setTimeTable();
      setError(error.response.data);
    }
  }

  useEffect(() => {
    fetchStudentBatch();
  }, []);

  return (
    // make table using this data
    <CRow className="mx-4">
      <CCol xs>
        <CCard className="mb-4">
          <CCardHeader>
            <CRow>
              <CCol>
                {timeTable && timeTable.title ? timeTable.title : "Timetable"}
              </CCol>
              <CCol>
                <CFormSelect
                  aria-label="Select course"
                  value={selectedBatch}
                  onChange={(e) => {
                    setSelectedBatch(e.target.value);
                    fetchTimetable(e.target.value);
                  }}
                >
                  <option value="">Batch</option>
                  {batch.map((val, index) => (
                    <option key={index} value={val}>
                      {val}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
            </CRow>
          </CCardHeader>
          {timeTable ? (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Instructor Name</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Course</th>
                </tr>
              </thead>
              <tbody>
                {timeTable &&
                  timeTable.timetable_details.map((item, index) => {
                    const showDay = item.day !== lastDay; // Check if the day should be displayed
                    if (showDay) {
                      lastDay = item.day; // Update the last rendered day
                    }
                    return (
                      <tr key={index}>
                        <td>{showDay ? item.day : ""}</td>
                        <td>{item.instructor_name}</td>
                        <td>{item.start_date}</td>
                        <td>{item.end_date}</td>
                        <td>{item.course}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          ) : (
            <div>{error ? JSON.stringify(error) : "Please Select Batch"}</div>
          )}
        </CCard>
      </CCol>
    </CRow>
  );
};

export default Timetable;
