import { useState } from "react";
import axios from "axios";
import { useFrappeGetCall } from "frappe-react-sdk";
import { CardClass } from "../common/CommonClasses";
import SelectField from "../components/Fields/SelectField";

const Timetable = () => {
  // const [batch, setBatch] = useState([]);
  const { data: batch, isLoading: bLoading } = useFrappeGetCall(
    "parent_portal.parent_portal.api.get_student_batch"
  );
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [timeTable, setTimeTable] = useState();
  const [error, setError] = useState("");

  let lastDay = "";

  // async function fetchStudentBatch() {
  //   try {
  //     const response = await axios.get(
  //       "/api/method/parent_portal.parent_portal.api.get_student_batch"
  //     );
  //     setBatch(response.data.message);
  //   } catch (error) {
  //     console.error("Failed to fetch batch:", error);
  //   }
  // }

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

  return (
    // make table using this data
    <div className={CardClass}>
      <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
        <div className="w-full sm:w-47.5">
          <SelectField
            label=""
            selectedOption={selectedBatch}
            onChange={(e) => {
              setSelectedBatch(e.target.value);
              fetchTimetable(e.target.value);
            }}
            // disabled={slug}
            options={
              <>
                <option value="">Select Batch</option>
                {batch &&
                  batch.message.map((val, index) => (
                    <option key={index} value={val}>
                      {val}
                    </option>
                  ))}
              </>
            }
          />
        </div>
      </div>
      {timeTable ? (
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className=" text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Day
              </th>
              <th scope="col" className="px-6 py-3">
                Instructor Name
              </th>
              <th scope="col" className="px-6 py-3">
                Start Date
              </th>
              <th scope="col" className="px-6 py-3">
                End Date
              </th>
              <th scope="col" className="px-6 py-3">
                Course
              </th>
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
                  <tr
                    key={index}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200"
                  >
                    <td
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                      {showDay ? item.day : ""}
                    </td>
                    <td className="px-6 py-4">{item.instructor_name}</td>
                    <td className="px-6 py-4">{item.start_date}</td>
                    <td className="px-6 py-4">{item.end_date}</td>
                    <td className="px-6 py-4">{item.course}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      ) : (
        <div>{error ? JSON.stringify(error) : "Please Select Batch"}</div>
      )}
    </div>
  );
};

export default Timetable;
