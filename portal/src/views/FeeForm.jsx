import { useNavigate, useParams } from "react-router-dom";
import AppSidebar from "../components/AppSidebar";
import AppHeader from "../components/AppHeader";
import { useFrappeGetDoc } from "frappe-react-sdk";
import {
  CButton,
  CCard,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CRow,
} from "@coreui/react";
import Input from "../components/Input";
import DataTable from "react-data-table-component";
import { useEffect, useState } from "react";
import axios from "axios";

const columns = [
  {
    name: "Fee Category",
    selector: (row) => row.fees_category,
  },
  {
    name: "Description",
    selector: (row) => row.description,
  },
  {
    name: "Amount",
    selector: (row) => row.amount,
  },
];

const FeeForm = ({ sidebarShow, setSidebarShow }) => {
  const { slug } = useParams();
  const navigator = useNavigate();
  const { data, error, isValidating, mutate } = useFrappeGetDoc("Fees", slug);
  const [file, setFile] = useState(null);
  const [attachment, setAttachment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Store the selected file
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("is_private", 0); // Set 1 for private, 0 for public
    formData.append("doctype", "Fees"); // Specify the doctype
    formData.append("docname", slug); // Specify the document name (fee record)

    try {
      await axios.post("/api/method/upload_file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      });

      await axios
        .put("/api/method/parent_portal.parent_portal.api.set_fee_paid", {
          fee_id: slug,
        })
        .then((result) => console.log(result))
        .catch((error) => console.error(error));
      setFile(null);
      setLoading(false);
      setSuccess("File uploaded successfully.");
      setTimeout(() => {
        setSuccess("");
        navigator("/student-fee");
      }, 1000);
    } catch (error) {
      console.error("Error during file upload:", error);
      setLoading(false);
      alert("An error occurred. Please try again.");
    }
  };

  async function getFeeAttachment() {
    try {
      const response = await axios.get(
        `/api/method/parent_portal.parent_portal.api.get_fees_attachment`,
        {
          params: {
            fee_id: slug,
          },
        }
      );

      const attachments = response.data.message;

      setAttachment(attachments); // Returns an array of attachment objects
    } catch (error) {
      console.error(
        "Failed to fetch attachments:",
        error.response || error.message
      );
    }
  }

  useEffect(() => {
    getFeeAttachment();
  }, [file]);

  return (
    <div>
      <AppSidebar sidebarShow={sidebarShow} setSidebarShow={setSidebarShow} />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader sidebarShow={sidebarShow} setSidebarShow={setSidebarShow} />
        <div className="body flex-grow-1">
          <CRow>
            <CCol xs={12}>
              <CCard className="m-4 mt-0 p-4">
                <div className="badge bg-success p-3 mb-2">{success}</div>
                <CForm className="row g-12" onSubmit={handleSubmit}>
                  <div className="mb-3 col-6">
                    <CFormLabel htmlFor="formFile">Attach</CFormLabel>
                    <CFormInput
                      type="file"
                      id="formFile"
                      required
                      onChange={handleFileChange}
                      disabled={data && data.parent_attachment}
                    />
                  </div>
                  <div className="mb-3 col-6 text-end">
                    <CButton
                      color="primary"
                      type="submit"
                      disabled={loading || (data && data.parent_attachment)}
                    >
                      {loading ? "Loading ..." : "Submit"}
                    </CButton>
                  </div>
                  <div className="mb-3 col-6">
                    <Input
                      id="student_name"
                      value={data ? data.student_name : ""}
                      lable="Student Name"
                      isDisable={true}
                    />
                  </div>
                  <div className="mb-3 col-6">
                    <Input
                      id="institution"
                      value={data ? data.company : ""}
                      lable="Institution"
                      isDisable={true}
                    />
                  </div>
                  <div className="mb-3 col-6">
                    <Input
                      id="date"
                      value={data ? data.posting_date : ""}
                      lable="Date"
                      isDisable={true}
                    />
                  </div>
                  <div className="mb-3 col-6">
                    <Input
                      id="due_date"
                      value={data ? data.due_date : ""}
                      lable="Due Date"
                      isDisable={true}
                    />
                  </div>
                  <div className="mb-2 col-12">
                    {data && data.components.length > 0 ? (
                      <DataTable
                        columns={columns}
                        data={data.components}
                        pagination
                        highlightOnHover
                        pointerOnHover
                      />
                    ) : (
                      "No data found"
                    )}
                  </div>
                  <div className="mb-3 col-6">
                    <Input
                      id="total_tax"
                      value={data ? data.total_taxes_and_charges : ""}
                      lable="Total Taxes and Charges"
                      isDisable={true}
                    />
                  </div>
                  <div className="mb-3 col-6">
                    <Input
                      id="grand_total"
                      value={data ? data.grand_total : ""}
                      lable="Grand Total"
                      isDisable={true}
                    />
                  </div>
                  <hr />
                  <div className="mb-3 col-6">
                    <CFormLabel>Attachments</CFormLabel>
                    {attachment && attachment.length > 0 ? (
                      attachment.map((file, index) => (
                        <div key={index}>
                          <a
                            href={file.file_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {file.name}
                          </a>
                        </div>
                      ))
                    ) : (
                      <div>No attachments found.</div>
                    )}
                  </div>
                </CForm>
              </CCard>
            </CCol>
          </CRow>
        </div>
      </div>
    </div>
  );
};

export default FeeForm;
