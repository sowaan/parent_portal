import {
  CCard,
  CCardBody,
  CCardText,
  CCardTitle,
  CCarousel,
  CCarouselItem,
  CImage,
} from "@coreui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Gallery = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState([]);

  async function getGallery() {
    try {
      await axios
        .get("/api/method/parent_portal.parent_portal.api.get_student_gallery")
        .then((response) => {
          setValues(response.data.message);
        });
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getGallery();
  }, []);

  return (
    <CCard className="m-4 mt-0 p-4">
      {values.length > 0
        ? values.map((value, index) => (
            <CCard
              key={index}
              onClick={() => navigate(`/gallery/${value.name}`)}
              style={{ width: "18rem", cursor: "pointer" }}
            >
              <CCarousel>
                {value.images.map((image, index) => (
                  <CCarouselItem key={index}>
                    <CImage
                      className="d-block w-100"
                      style={{ height: "200px" }}
                      src={image.image}
                      alt={"slide " + index}
                    />
                  </CCarouselItem>
                ))}
              </CCarousel>
              <CCardBody>
                <CCardTitle>{value.title}</CCardTitle>
                <CCardText>{value.description}</CCardText>
              </CCardBody>
            </CCard>
          ))
        : ""}
    </CCard>
  );
};

export default Gallery;
