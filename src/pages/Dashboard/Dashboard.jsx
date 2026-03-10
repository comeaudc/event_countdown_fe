import Countdown from "../../components/Countdown/Countdown.jsx";
import Schedule from "../../components/Schedule.jsx";
import { Link } from "react-router-dom";
import Hero from "../../components/Hero/Hero.jsx";

export default function Dashboard() {
  return (
    <div className="dashboard">
      <Hero />

      <Countdown />

      <Schedule />

      <div className="upload-section">
        <Link to="/gallery">
          <button className="upload-button">Upload Photos</button>
        </Link>
      </div>
    </div>
  );
}