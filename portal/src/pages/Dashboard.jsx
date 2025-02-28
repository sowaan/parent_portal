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
import { toast } from "react-toastify";

const Dashboard = () => {
  const { data: unpaid_fees_number } = useFrappeGetCall(
    "parent_portal.parent_portal.api.total_unpaid_fees"
  );
  const { data: paid_fees_number } = useFrappeGetCall(
    "parent_portal.parent_portal.api.total_paid_fees"
  );
  const { data: studentList, isLoading } = useFrappeGetCall(
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
      toast.error(`Failed to fetch attendance summary: ${error}`);
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
          isStudentLoading={isLoading}
        />
      </div>
    </>
  );
};

export default Dashboard;
