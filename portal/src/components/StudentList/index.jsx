const StudentList = ({
  students,
  selectedStudent,
  setSelectedStudent,
  isStudentLoading,
}) => {
  return (
    <div className="col-span-12 max-h-[73vh] overflow-auto rounded-xl border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <h4 className="mb-6 px-7.5 text-xl font-semibold text-black dark:text-white">
        Students
      </h4>

      <div>
        {isStudentLoading ? (
          <>
            <div className=" bg-gray-3 dark:bg-meta-4 cursor-pointer h-20 w-full mb-2"></div>
            <div className=" bg-gray-3 dark:bg-meta-4 cursor-pointer h-20 w-full mb-2"></div>
            <div className=" bg-gray-3 dark:bg-meta-4 cursor-pointer h-20 w-full mb-2"></div>
          </>
        ) : (
          students.map((chat, index) => (
            <div
              key={index}
              onClick={() =>
                setSelectedStudent((prevSelected) =>
                  prevSelected === index ? null : index
                )
              }
              className={`flex items-center gap-5 py-3 px-7.5 hover:bg-gray-3 dark:hover:bg-meta-4 cursor-pointer ${selectedStudent == index ? "bg-gray-3 dark:bg-meta-4" : ""}`}
            >
              <div className="relative h-14 w-14 rounded-full">
                <div className="flex h-12 w-12 rounded-full bg-sky-950 text-center items-center justify-center text-white font-black">
                  {chat && chat.first_name[0]}
                </div>
              </div>

              <div className="flex flex-1 items-center justify-between">
                <div>
                  <h5 className="font-medium text-black dark:text-white">
                    {chat.first_name}
                  </h5>
                  <p>
                    <span className="text-sm text-black dark:text-white">
                      {chat.admission_registration_id}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentList;
