import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DataTable from "react-data-table-component";
import AppSidebar from "../components/AppSidebar";
import AppHeader from "../components/AppHeader";

const PaidFee = ({ sidebarShow, setSidebarShow }) => {
  const navigate = useNavigate();
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  async function getFeeList() {
    const data = await axios.get(
      "/api/method/parent_portal.parent_portal.api.get_fee_list?isPaid=1",
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
          />
        </div>
      </div>
    </div>
  );
};

export default PaidFee;
