import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DataTable from "react-data-table-component";
import "./Home.css";
import {
  CButton,
  CForm,
  CFormInput,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
} from "@coreui/react";
import moment from "moment";

const Home = () => {
  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [toggleCleared, setToggleCleared] = useState(false);
  const [fees, setFees] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  async function getFeeList() {
    const data = await axios.get(
      "/api/method/parent_portal.parent_portal.api.get_fee_list",
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    setFees(data.data.message);
    setLoading(false);
  }

  const columns = useMemo(
    () => [
      {
        name: "Student Name",
        selector: (row) => (
          <div
            onClick={() => {
              navigate(`/student-fee/${row.name}`);
            }}
          >
            {row.student_name}
          </div>
        ),
      },
      {
        name: "Date",
        selector: (row) => row.posting_date,
        sortable: true,
      },
      {
        name: "Program",
        selector: (row) => row.program,
      },
      {
        name: "Family Code",
        selector: (row) => row.family_code,
      },
      {
        name: "Total",
        selector: (row) => row.grand_total,
      },
      {
        name: "Fee Status",
        selector: (row) => {
          return (
            <div>
              {row.is_return == 1 ? (
                <span className="badge bg-secondary">Refund</span>
              ) : row.outstanding_amount == 0 ? (
                <span className="badge bg-success">Paid</span>
              ) : row.outstanding_amount > 0 &&
                moment(row.due_date).isSameOrAfter(moment(), "day") ? (
                <span className="badge bg-warning">Unpaid</span>
              ) : row.outstanding_amount > 0 &&
                moment(row.due_date).isBefore(moment(), "day") ? (
                <span className="badge bg-danger">Overdue</span>
              ) : (
                <span className="badge bg-warning">Draft</span>
              )}
            </div>
          );
        },
      },
      {
        name: "Student Status",
        selector: (row) => row.custom_status,
      },
    ],
    [fees]
  );

  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Store the selected file
  };

  const handleRowSelected = useCallback((state) => {
    setSelectedRows(state.selectedRows);
  }, []);

  const contextActions = useMemo(() => {
    const handleSubmit = async () => {
      setSubmitLoading(true);

      try {
        if (!file) {
          alert("Please select a file to upload.");
          return;
        }
        // for (let i = 0; i < selectedRows.length; i++) {
        //   const ele = selectedRows[i];

        await axios
          .post(
            "/api/method/parent_portal.parent_portal.api.make_portal_payment_record",
            {
              fees: selectedRows,
            }
          )
          .then(async (result) => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("is_private", 0); // Set 1 for private, 0 for public
            formData.append("doctype", "Portal Payment Record"); // Specify the doctype
            formData.append("docname", result.data.message.record_name); // Specify the document name (fee record)
            await axios.post("/api/method/upload_file", formData, {
              headers: {
                "Content-Type": "multipart/form-data",
                Accept: "application/json",
              },
            });
          })
          .catch((error) => console.error(error));
        setFile(null);
        setSubmitLoading(false);
        // }
        setToggleCleared(!toggleCleared);
        setIsModalVisible(false);

        // window.location.reload();
      } catch (error) {
        console.error("Error during file upload:", error);
        setSubmitLoading(false);
        alert("An error occurred. Please try again.");
      }
      // setFees(differenceBy(fees, selectedRows, 'title'));
    };
    return (
      <div className="mt-3">
        <CForm
          className="row g-12"
          onSubmit={(e) => {
            e.preventDefault();
            setIsModalVisible(true);
          }}
        >
          <div className="mb-3 col-6">
            <CFormInput
              type="file"
              id="formFile"
              required
              onChange={handleFileChange}
            />
          </div>
          <div className="mb-3 col-6 text-end">
            <CButton color="primary" type="submit">
              Submit
            </CButton>
          </div>
        </CForm>

        {/* Custom Confirmation Modal */}
        <CModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
        >
          <CModalHeader>Confirm Attachments</CModalHeader>
          <CModalBody>
            Please confirm payment slip attachments for the following fees:
            <ul>
              {selectedRows.map((row) => (
                <li key={row.name}>{row.name}</li>
              ))}
            </ul>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setIsModalVisible(false)}>
              Cancel
            </CButton>
            <CButton
              color="danger"
              onClick={handleSubmit}
              disabled={submitLoading}
            >
              {submitLoading ? "attach..." : "Confirm"}
            </CButton>
          </CModalFooter>
        </CModal>
      </div>
    );
  }, [fees, selectedRows, toggleCleared, isModalVisible]);

  useEffect(() => {
    getFeeList();
  }, []);

  return (
    <>
      <div className="body m-4 mt-0 p-2 bg-white pt-0 rounded">
        <DataTable
          title="Fee List"
          columns={columns}
          data={fees.length > 0 ? fees : []}
          progressPending={loading}
          pagination
          highlightOnHover
          pointerOnHover
          selectableRows
          contextActions={contextActions}
          onSelectedRowsChange={handleRowSelected}
          clearSelectedRows={toggleCleared}
          selectableRowDisabled={(row) => row.parent_attachment === 1}
        />
      </div>
    </>
  );
};

export default Home;
