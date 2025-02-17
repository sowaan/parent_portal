import axios from "axios";
import { useFrappeGetCall } from "frappe-react-sdk";
import { useEffect, useState } from "react";
import { CardClass, InputWithoutIconClass } from "../common/CommonClasses";
import SelectField from "../components/Fields/SelectField";
import Card from "../components/Card";

const Lectures = () => {
  const [lecture, setLecture] = useState([]);
  // const [students, setStudents] = useState([]);
  const { data: students, isLoading: sLoading } = useFrappeGetCall(
    "parent_portal.parent_portal.api.get_student_details"
  );
  const [courses, setCourses] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [titleFilter, setTitleFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");

  const handleDateChange = (e) => setSelectedDate(e.target.value);
  const handleStudentChange = (e) => setSelectedStudent(e.target.value);
  const handleTitleChange = (e) => setTitleFilter(e.target.value);
  const handleCourseChange = (e) => setCourseFilter(e.target.value);

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
    getLectures({});
  }, []);

  return (
    <div className={CardClass}>
      <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
        <div className="w-full sm:w-47.5">
          <SelectField
            label=""
            selectedOption={selectedStudent}
            onChange={handleStudentChange}
            required={true}
            // disabled={slug}
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
        <div className="w-full sm:w-47.5">
          <div className="relative">
            <input
              className={`${InputWithoutIconClass} date-picker-input`}
              type="date"
              name="date"
              id="date"
              value={selectedDate}
              onChange={handleDateChange}
            />
          </div>
        </div>
        <div className="w-full sm:w-47.5">
          <div className="relative">
            <input
              className={InputWithoutIconClass}
              value={titleFilter}
              onChange={handleTitleChange}
              placeholder="Title"
              type="text"
              name="title"
              id="title"
            />
          </div>
        </div>
        <div className="w-full sm:w-47.5">
          <SelectField
            label=""
            selectedOption={courseFilter}
            onChange={handleCourseChange}
            required={true}
            // disabled={slug}
            options={
              <>
                <option value="">Select Course</option>
                {[...courses].map((course, index) => (
                  <option key={index} value={course}>
                    {course}
                  </option>
                ))}
              </>
            }
          />
        </div>
        <button
          onClick={applyFilters}
          className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-primary py-3 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
        >
          Filter
        </button>
      </div>
      <hr className="mb-5.5" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 xxl:grid-cols-4">
        {lecture.map((item, index) => {
          return (
            <div className="col-span-1" key={index}>
              <Card
                document={
                  <iframe
                    src={item.resource}
                    height={160}
                    className="card-img-top rounded-t-lg max-w-sm w-full"
                  ></iframe>
                }
                title={item.title}
                description={item.description}
                readMore={item.resource}
                buttonText="View"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Lectures;
