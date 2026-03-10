import { Link } from "react-router-dom";
import "./HomeButton.css";
import { FaHome } from "react-icons/fa"; // Font Awesome home icon

export default function HomeButton() {
  return (
    <Link to="/" className="gallery-home-button" title="Home">
      <FaHome />
    </Link>
  );
}