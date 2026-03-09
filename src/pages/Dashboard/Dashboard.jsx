import Countdown from "../../components/Countdown/Countdown.jsx";
import Schedule from "../../components/Schedule.jsx";
import { Link } from "react-router-dom";
import Hero from "../../components/Hero/Hero.jsx";
import { useGuest } from "../../context/guestContext.jsx";

export default function Dashboard() {
  return (
    <>
      <Hero />
      <Countdown />
      <Schedule />
      <Link to="/gallery">
        <button>Upload Photos</button>
      </Link>
    </>
  );
}
