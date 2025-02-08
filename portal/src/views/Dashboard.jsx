import { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import CardDataStats from "../components/CardDataStats";
import {
  IconDollar,
  IconDollaronHand,
  IconFillUser,
  IconFillUsers,
} from "../common/Icons";
import StudentList from "../components/StudentList";
import AttendanceChart from "../components/Chart/AttendanceChart";
import { useFrappeGetCall } from "frappe-react-sdk";

const Dashboard = () => {
  const { data: unpaid_fees_number } = useFrappeGetCall(
    "parent_portal.parent_portal.api.total_unpaid_fees"
  );
  const { data: paid_fees_number } = useFrappeGetCall(
    "parent_portal.parent_portal.api.total_paid_fees"
  );
  const { data: studentList, isStudentLoading } = useFrappeGetCall(
    "parent_portal.parent_portal.api.get_student_details"
  );

  const [progressGroup, setProgressGroup] = useState([]);
  const [presents, setPresents] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [absents, setAbsents] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [totals, setTotals] = useState({ present: 0, absent: 0 });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: moment().startOf("month"),
    endDate: moment().endOf("month"),
  });
  // Fetch attendance summary
  const attendanceSummary = async (startDate, endDate) => {
    const student = (studentList && studentList.message[selectedStudent]) || {};
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
      const { summary, presents, absents, total_present, total_absent } =
        response.data.message;
      setProgressGroup(summary);
      setPresents(presents);
      setAbsents(absents);
      setTotals({ present: total_present, absent: total_absent });
    } catch (error) {
      console.error("Failed to fetch attendance summary:", error);
    }
  };

  useEffect(() => {
    attendanceSummary(
      dateRange.startDate.toString(),
      dateRange.endDate.toString()
    );
  }, [dateRange, selectedStudent]);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardDataStats
          title="Total Presents"
          total={totals.present}
          rate=""
          levelUp={totals.present > totals.absent}
          levelDown={totals.present < totals.absent}
        >
          <IconFillUsers />
        </CardDataStats>
        <CardDataStats
          title="Total Absents"
          total={totals.absent}
          rate=""
          levelUp={totals.absent > totals.present}
          levelDown={totals.absent < totals.present}
        >
          <IconFillUser className="fill-primary dark:fill-white" />
        </CardDataStats>
        <CardDataStats
          title="Total Paid Fees"
          total={paid_fees_number ? paid_fees_number.message : "..."}
          rate=""
          levelDown
        >
          <IconDollaronHand className="fill-primary dark:fill-white" />
        </CardDataStats>
        <CardDataStats
          title="Total UnPaid Fees"
          total={unpaid_fees_number ? unpaid_fees_number.message : "..."}
          rate=""
          levelUp
        >
          <IconDollar className="fill-primary dark:fill-white" />
        </CardDataStats>
      </div>
      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <AttendanceChart
          presents={presents}
          absents={absents}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
        <StudentList
          students={studentList ? studentList.message : []}
          selectedStudent={selectedStudent}
          setSelectedStudent={setSelectedStudent}
        />
      </div>
    </>
  );

  // return (
  // <CRow className="mx-4">
  //   <CCol xs>
  //     <CCard className="mb-4">
  //       <CCardHeader>Attendance</CCardHeader>
  //       <CCardBody>
  //         <CRow>
  //           <CCol xs={12} md={6} xl={6}>
  //             <CRow>
  //               <CCol xs={6}>
  //                 <div className="border-start border-start-4 border-start-success py-1 px-3">
  //                   <div className="text-body-secondary text-truncate small">
  //                     Total Present
  //                   </div>
  //                   <div className="fs-5 fw-semibold">{totals.present}</div>
  //                 </div>
  //               </CCol>
  //               <CCol xs={6}>
  //                 <div className="border-start border-start-4 border-start-danger py-1 px-3 mb-3">
  //                   <div className="text-body-secondary text-truncate small">
  //                     Total Absent
  //                   </div>
  //                   <div className="fs-5 fw-semibold">{totals.absent}</div>
  //                 </div>
  //               </CCol>
  //             </CRow>
  //             <hr className="mt-0" />
  //             {progressGroup.map((item, index) => (
  //               <div className="progress-group mb-4" key={index}>
  //                 <div className="progress-group-prepend">
  //                   <span className="text-body-secondary small">
  //                     {item.title}
  //                   </span>
  //                 </div>
  //                 <div className="progress-group-bars">
  //                   <CProgress thin color="success" value={item.present} />
  //                   <CProgress thin color="danger" value={item.absent} />
  //                 </div>
  //               </div>
  //             ))}
  //           </CCol>
  //           <CCol xs={12} md={6} xl={6}>
  //             <CRow>
  //               <CCol xs={6}></CCol>
  //               <CCol xs={6}>
  //                 <CButtonGroup className="float-end me-3 mb-2">
  //                   {["Day", "Week", "Month", "Year", "Custom"].map(
  //                     (value) => (
  //                       <CButton
  //                         color="outline-secondary"
  //                         key={value}
  //                         className={`"mx-0" ${
  //                           value == "Custom" ? "dropdown-toggle" : ""
  //                         }`}
  //                         active={value === activeButton}
  //                         onClick={() => handleButtonClick(value)}
  //                       >
  //                         {value}
  //                       </CButton>
  //                     )
  //                   )}
  //                 </CButtonGroup>
  //                 {showDatePicker && (
  //                   <div
  //                     className="dropdown-menu show p-3 border rounded"
  //                     style={{
  //                       backgroundColor: "#f8f9fa",
  //                       maxWidth: "300px",
  //                       boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  //                     }}
  //                   >
  //                     <div className="mb-2">
  //                       <label className="me-2">Start Date:</label>
  //                       <input
  //                         type="date"
  //                         value={startDate}
  //                         onChange={(e) => setStartDate(e.target.value)}
  //                         className="form-control d-inline-block w-auto"
  //                       />
  //                     </div>
  //                     <div className="mb-2">
  //                       <label className="me-2">End Date:</label>
  //                       <input
  //                         type="date"
  //                         value={endDate}
  //                         onChange={(e) => setEndDate(e.target.value)}
  //                         className="form-control d-inline-block w-auto"
  //                       />
  //                     </div>
  //                     <div>
  //                       <CButton
  //                         color="primary"
  //                         className="me-2"
  //                         onClick={() => {
  //                           setDateRange({
  //                             startDate,
  //                             endDate,
  //                           });
  //                           setShowDatePicker(false);
  //                         }}
  //                       >
  //                         Apply
  //                       </CButton>
  //                       <CButton
  //                         color="secondary"
  //                         onClick={() => setShowDatePicker(false)}
  //                       >
  //                         Cancel
  //                       </CButton>
  //                     </div>
  //                   </div>
  //                 )}
  //                 <DateRangeHeader dateRange={dateRange} />
  //               </CCol>
  //             </CRow>

  //             <hr className="mt-0" />
  //             <div style={{ height: "340px", overflow: "auto" }}>
  //               {students.map((student, index) => (
  //                 <StudentRow key={index} student={student} index={index} />
  //               ))}
  //             </div>
  //           </CCol>
  //         </CRow>
  //       </CCardBody>
  //     </CCard>
  //   </CCol>
  // </CRow>
  // );
};

export default Dashboard;
