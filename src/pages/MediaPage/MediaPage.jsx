import Gallery from "../../components/Gallery/Gallery";
import MediaUploader from "../../components/MediaUploader/MediaUploader";

export default function MediaPage() {
  return (
    <div className="media-page">
      <MediaUploader />
      <Gallery />
    </div>
  );
}
