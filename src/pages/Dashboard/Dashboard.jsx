import Countdown from "../../components/Countdown";
import { useGuest } from "../../context/guestContext.jsx";
export default function Dashboard() {
  return (
    <>
      <h1>The Big Day is On Its Way!</h1>
      <Countdown />
    </>
  );
}
