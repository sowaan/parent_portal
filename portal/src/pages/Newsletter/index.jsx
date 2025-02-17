import { CCard, CCardBody, CCardFooter, CCol } from "@coreui/react";
import moment from "moment";
import HTMLRenderer from "react-html-renderer";
import { useNavigate, useParams } from "react-router-dom";
import { CardClass } from "../../common/CommonClasses";
import { useFrappeGetCall } from "frappe-react-sdk";

const Newsletter = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: doc, isLoading: docLoading } = useFrappeGetCall(
    "parent_portal.parent_portal.api.get_latest_newsletter",
    {
      name: slug,
    }
  );

  // async function getLatestNewsletter() {
  //   try {
  //     await axios
  //       .get(
  //         "/api/method/parent_portal.parent_portal.api.get_latest_newsletter",
  //         {
  //           params: {
  //             name: slug,
  //           },
  //         }
  //       )
  //       .then((response) => {
  //         setDoc(response.data.message);
  //       });
  //   } catch (error) {
  //     console.error(
  //       "Failed to fetch newsletter:",
  //       error.response || error.message
  //     );
  //   }
  // }

  // useEffect(() => {
  //   getLatestNewsletter();
  // }, []);

  return (
    <div className={CardClass}>
      <h1 className="text-black dark:text-white text-center m-4 font-bold text-2xl">
        {doc && doc.message.subject}
      </h1>
      <p
        className="text-[#7c7c7c] text-center leading-[1.7]">
        {doc &&
          moment(doc.message.modified, "YYYY-MM-DD HH:mm:ss.SSSSSS").format(
            "MMMM DD, YYYY"
          )}
      </p>
      <div className="longform blog-text p-2 pt-0">
        <HTMLRenderer html={doc && doc.message.message} />
      </div>
      <div
        className="text-center mb-4"
        style={{ cursor: "pointer" }}
        onClick={() => navigate("/newsletter/list")}
      >
        View More
      </div>
    </div>
  );
};

export default Newsletter;
