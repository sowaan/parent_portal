import { useNavigate, useParams } from "react-router-dom";
import Input from "../../components/Input";
import { useFrappeGetDoc } from "frappe-react-sdk";
import { useEffect, useState } from "react";
import axios from "axios";
import Breadcrumb from "../../common/Breadcrumb";
import { AttachFileClass } from "../../common/CommonClasses";
import SelectField from "../../components/Fields/SelectField";

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
    <>
      <Breadcrumb parent="assignment" pageName={slug} />
      <div className="rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="m-4 mt-0 p-4">
          {!visible && (
            <button
              onClick={() => setVisible(true)}
              className="py-2 px-4 bg-gray rounded-xl text-center font-medium text-primary "
            >
              Submit Assignment
            </button>
          )}

          {visible && (
            <form onSubmit={handleSubmit}>
              <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row  items-end">
                <div className="w-full">
                  <SelectField
                    label="Student"
                    selectedOption={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    required={true}
                    options={
                      <>
                        <option value="">Select Student</option>
                        {student &&
                          student.map((item, index) => (
                            <option key={index} value={item.student}>
                              {item.student_name}
                            </option>
                          ))}
                      </>
                    }
                  />
                </div>
                <div className="w-full">
                  <input
                    className={`${AttachFileClass} w-full`}
                    type="file"
                    id="attachment"
                    placeholder="submit assignment"
                    required={true}
                    onChange={handleFileChange}
                    disabled={selectedStudent == ""}
                  />
                </div>
              </div>
              <button
                onClick={() => setVisible(false)}
                className="inline-flex mr-4 items-center justify-center gap-2.5 rounded-xl bg-gray py-2 px-10 text-center font-medium text-black hover:bg-opacity-90 lg:px-8 xl:px-10"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-primary py-2 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
              >
                Submit
              </button>
              <hr className="my-5.5" />
            </form>
          )}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-2 xxl:grid-cols-4">
            <div className="w-full">
              <Input
                id="student_assignment"
                value={data ? data.student_assignment : ""}
                lable="Assignment"
                isDisable={true}
              />
            </div>
            <div className="w-full">
              <Input
                id="course"
                value={data ? data.course : ""}
                lable="Course"
                isDisable={true}
              />
            </div>
            <div className="w-full">
              <Input
                id="assignment_date"
                value={data ? data.assignment_date : ""}
                lable="Posting Date"
                isDisable={true}
              />
            </div>
            <div className="w-full">
              <Input
                id="due_date"
                value={data ? data.due_date : ""}
                lable="Due Date"
                isDisable={true}
              />
            </div>
          </div>
          <hr className="my-5.5" />
          <div className="w-full">
            <label htmlFor="recourse">Assignment Details</label>
            <iframe
              src={data ? data.recourse : ""}
              width="100%"
              height="500"
              title="Assignment"
              id="recourse"
            ></iframe>
          </div>
        </div>
      </div>
    </>
  );
};

export default AssignmentForm;
