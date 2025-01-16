import {
  CCard,
  CCarousel,
  CCarouselCaption,
  CCarouselItem,
  CImage,
} from "@coreui/react";
import { useFrappeGetDoc } from "frappe-react-sdk";
import { useParams } from "react-router-dom";

const GalleryView = () => {
  const { slug } = useParams();
  const { data } = useFrappeGetDoc("School Gallery", slug);

  return (
    <CCard className="m-4 mt-0">
      <CCarousel controls indicators>
        {data &&
          data.gallery_attachments.map((image, index) => (
            <CCarouselItem key={index}>
              <CImage
                className="d-block w-100"
                src={image.image}
                alt={"slide " + index}
              />
              <CCarouselCaption className="d-none d-md-block">
                <h5>{data.title}</h5>
                <p>{data.description}</p>
              </CCarouselCaption>
            </CCarouselItem>
          ))}
      </CCarousel>
    </CCard>
  );
};

export default GalleryView;
