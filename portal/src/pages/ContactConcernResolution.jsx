import { useFrappeGetCall } from "frappe-react-sdk";
import { CardClass, TableHeaderClass } from "../common/CommonClasses";

const ContactConcernResolution = () => {
  const { data, isLoading } = useFrappeGetCall(
    "parent_portal.parent_portal.api.get_contact_concern_resolution"
  );

  const info = data?.message;

  if (isLoading) {
    return <div className={CardClass}>Loading...</div>;
  }

  if (!info) {
    return <div className={CardClass}>Unable to load this page right now.</div>;
  }

  return (
    <div className={CardClass}>
      <div dangerouslySetInnerHTML={{ __html: info.intro_text }} />

      <div className="overflow-x-auto my-4">
        <table className="w-full border border-stroke dark:border-strokedark">
          <thead>
            <tr>
              <th className={`${TableHeaderClass} border p-2 text-left`}>Section</th>
              <th className={`${TableHeaderClass} border p-2 text-left`}>Contact Email</th>
              <th className={`${TableHeaderClass} border p-2 text-left`}>Section Head</th>
            </tr>
          </thead>
          <tbody>
            {info.sections.map((row, idx) => (
              <tr key={idx}>
                <td className="border p-2 text-black dark:text-white">{row.section}</td>
                <td className="border p-2 text-black dark:text-white">
                  <a href={`mailto:${row.contact_email}`}>{row.contact_email}</a>
                </td>
                <td className="border p-2 text-black dark:text-white">{row.section_head}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div dangerouslySetInnerHTML={{ __html: info.steps_text }} />

      {info.google_form_link && (
        <div className="my-4">
          <a
            href={info.google_form_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-primary py-2 px-4 text-sm font-medium text-primary hover:bg-primary hover:text-white"
          >
            Click Here to fill the form
          </a>
        </div>
      )}

      <div dangerouslySetInnerHTML={{ __html: info.closing_text }} />
    </div>
  );
};

export default ContactConcernResolution;