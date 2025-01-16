import axios from "axios";
import moment from "moment";
import { useEffect, useState } from "react";
import HTMLRenderer from "react-html-renderer";
import { useParams } from "react-router-dom";

const Newsletter = () => {
  const { slug } = useParams();
  const [doc, setDoc] = useState({});

  async function getLatestNewsletter() {
    try {
      await axios
        .get(
          "/api/method/parent_portal.parent_portal.api.get_latest_newsletter",
          {
            params: {
              name: slug,
            },
          }
        )
        .then((response) => {
          setDoc(response.data.message);
        });
    } catch (error) {
      console.error(
        "Failed to fetch newsletter:",
        error.response || error.message
      );
    }
  }

  useEffect(() => {
    getLatestNewsletter();
  }, []);

  return (
    <div className="body m-4 mt-0 p-2 bg-white rounded">
      <h1
        style={{
          fontWeight: "700",
          fontSize: "1.5em",
          textAlign: "center",
          margin: "1em",
          color: "#333",
        }}
      >
        {doc && doc.subject}
      </h1>
      <p
        style={{
          textAlign: "center",
          lineHeight: "1.7",
          color: "#7c7c7c",
        }}
      >
        {doc &&
          moment(doc.modified, "YYYY-MM-DD HH:mm:ss.SSSSSS").format(
            "MMMM DD, YYYY"
          )}
      </p>
      <div className="longform blog-text p-2 pt-0">
        <HTMLRenderer html={doc && doc.message} />
      </div>
    </div>
  );
};

export default Newsletter;
