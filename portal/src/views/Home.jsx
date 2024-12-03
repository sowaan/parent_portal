import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DataTable from "react-data-table-component";
import AppSidebar from "../components/AppSidebar";
import AppHeader from "../components/AppHeader";
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

const Home = ({ sidebarShow, setSidebarShow }) => {
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
        name: "Id",
        cell: (row) => (
          <div
            onClick={() => {
              navigate(`/student-fee/${row.name}`);
            }}
            className="sc-fAUdSK sc-dntaoT sc-ivxoEo dLHSn dQcPXM bOmZtP rdt_TableCell"
          >
            <div>{row.name}</div>
          </div>
        ),
        style: {
          minWidth: "200px",
        },
        button: true,
        sortable: true,
      },
      {
        name: "Date",
        selector: (row) => row.posting_date,
        sortable: true,
      },
      {
        name: "Student Name",
        selector: (row) => row.student_name,
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
    <div>
      <AppSidebar sidebarShow={sidebarShow} setSidebarShow={setSidebarShow} />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader sidebarShow={sidebarShow} setSidebarShow={setSidebarShow} />
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
      </div>
    </div>
  );
};

export default Home;
