import Countdown from "../../components/Countdown.jsx";
import Schedule from "../../components/Schedule.jsx";
import { Link } from "react-router-dom";
import { useGuest } from "../../context/guestContext.jsx";

export default function Dashboard() {
  return (
    <>
      <h1>The Big Day is On Its Way!</h1>
      <Countdown />
      <Schedule />
      <Link to="/gallery"><button>Upload Photos</button></Link>
    </>
  );
}
