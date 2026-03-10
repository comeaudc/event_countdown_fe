import Gallery from "../../components/Gallery/Gallery";
import MediaUploader from "../../components/MediaUploader/MediaUploader";
import HomeButton from "../../components/HomeButton/HomeButton";

export default function MediaPage() {
  return (
    <div className="media-page">
      <HomeButton />
      <MediaUploader />
      <Gallery />
    </div>
  );
}
