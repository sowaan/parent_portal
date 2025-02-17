import axios from "axios";
import { useFrappeGetCall, useFrappeGetDoc } from "frappe-react-sdk";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CardClass } from "../../common/CommonClasses";
import Breadcrumb from "../../common/Breadcrumb";
import SelectField from "../../components/Fields/SelectField";
import SelectDateField from "../../components/Fields/SelectDateField";
import TextAreaField from "../../components/Fields/TextAreaField";
import AttachField from "../../components/Fields/AttachField";

const StudentLeaveForm = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState("");
  const { data: students, isLoading: sLoading } = useFrappeGetCall(
    "parent_portal.parent_portal.api.get_student_details"
  );
  const { data: groups, isLoading: gLoading } = useFrappeGetCall(
    "parent_portal.parent_portal.api.get_student_group",
    {
      student: selectedStudent ? selectedStudent : null,
    }
  );
  const [group, setGroup] = useState([]);
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

  // async function getGroups(student) {
  //   try {
  //     let response = await axios.get(
  //       "/api/method/parent_portal.parent_portal.api.get_student_group",
  //       {
  //         params: {
  //           student: student,
  //         },
  //       }
  //     );
  //     setGroup(response.data.message);
  //   } catch (error) {
  //     console.error("Failed to fetch groups:", error.response || error.message);
  //   }
  // }

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

  return (
    <>
      <Breadcrumb parent="student-fee" pageName={slug ?? "New"} />
      <div className={CardClass}>
        <form onSubmit={(e) => submitLeaveApplication(e)}>
          <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
            <div className="flex flex-col gap-9">
              <SelectField
                label="Student"
                selectedOption={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                required={true}
                disabled={slug}
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
            <div className="flex flex-col gap-9">
              {selectedStudent !== "" ? (
                <SelectField
                  label="Group"
                  selectedOption={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  required={selectedStudent !== ""}
                  disabled={slug}
                  options={
                    <>
                      <option value="">Select Group</option>
                      {groups &&
                        groups.message.map((group, index) => (
                          <option key={index} value={group}>
                            {group}
                          </option>
                        ))}
                    </>
                  }
                />
              ) : (
                ""
              )}
            </div>
            <div className="flex flex-col gap-9">
              <SelectDateField
                label="From Date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                required={true}
                disabled={slug}
              />
            </div>
            <div className="flex flex-col gap-9">
              <SelectDateField
                label="To Date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                required={true}
                disabled={slug}
              />
            </div>
            <div className="flex flex-col gap-9">
              <AttachField
                label={"Attachment"}
                onChange={(e) => setAttachment(e.target.files[0])}
                disabled={slug}
                required={true}
              />
            </div>
            <div className="flex flex-col gap-9">
              <TextAreaField
                label={"Reason"}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required={true}
                disabled={slug}
              />
            </div>
          </div>
          {!slug ? (
            <button
              type="submit"
              disabled={slug}
              className="inline-flex my-4 items-center justify-center gap-2.5 rounded-xl bg-primary py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
            >
              Submit Leave
            </button>
          ) : (
            ""
          )}
        </form>
      </div>
    </>
  );
};

export default StudentLeaveForm;
