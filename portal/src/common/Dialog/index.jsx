export function ConformationDialog({
  isModalVisible,
  setIsModalVisible,
  body,
  handleSubmit,
  agree,
}) {
  return (
    <>
      {isModalVisible && (
        <div
          className="inset-0 flex items-center justify-center z-50 h-screen"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-[100vw]">
            {/* Modal Header */}
            <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Confirm Attachments
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => setIsModalVisible(false)}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            {body}

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
              <button
                className="px-4 py-2 text-gray-700 dark:text-white bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                onClick={() => setIsModalVisible(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                onClick={handleSubmit}
                disabled={agree}
              >
                {agree ? "Wait..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
