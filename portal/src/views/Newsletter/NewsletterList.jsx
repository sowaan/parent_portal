import { useFrappeGetDocList } from "frappe-react-sdk";
import { useMemo } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";

const NewsletterList = () => {
  const navigate = useNavigate();
  const { data, error, isValidating, mutate } = useFrappeGetDocList(
    "Newsletter",
    {
      fields: ["name", "subject", "message"],
      filters: { for_parent: 1 },
    }
  );

  const columns = useMemo(
    () => [
      {
        name: "ID",
        selector: (row) => (
          <div
            onClick={() => {
              navigate(`/newsletter/${row.name}`);
            }}
          >
            {row.name}
          </div>
        ),
      },
      {
        name: "Subject",
        selector: (row) => row.subject,
      },
    ],
    [data]
  );

  if (isValidating) {
    return <>Loading</>;
  }

  if (error) {
    return <>{JSON.stringify(error)}</>;
  }

  return (
    <div className="body m-4 mt-0 p-2 bg-white pt-0 rounded">
      <DataTable
        title="Assignments"
        columns={columns}
        data={data.length > 0 ? data : []}
        progressPending={isValidating}
        pagination
        highlightOnHover
        pointerOnHover
      />
    </div>
  );
};

export default NewsletterList;
