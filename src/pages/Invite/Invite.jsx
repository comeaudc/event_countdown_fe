import { useParams, useNavigate } from "react-router-dom";
import { useGuest } from "../../context/guestContext/guestContext";
import axios from "axios";
import { useEffect } from "react";

export default function Invite() {
  const { guest, setGuest } = useGuest();
  const nav = useNavigate();
  const { token } = useParams();

  async function getUserData() {
    try {
      let res = await axios.get(`http://localhost:3000/api/invite/${token}`);

      setGuest(res.data);

      if (res.data.rsvp) {
        localStorage.setItem("inviteToken", token);
        nav("/");
      }
    } catch (error) {
      console.error(error);
      alert(`${error.message}`);
    }
  }

  async function handleRSVP(e) {
    try {
      if (e.target.value == "Yes") {
        await axios.post(
          `http://localhost:3000/api/rsvp`,
          { attending: true },
          { headers: { authorization: token } },
        );
        localStorage.setItem("inviteToken", token);
        nav("/");
      } else {
        window.location.href =
          "https://www.youtube.com/watch?v=Aq5WXmQQooo&pp=ygUJcmljayByb2xs";
      }
    } catch (error) {
      console.error(error.message);
    }
  }

  useEffect(() => {
    getUserData();
  }, [token]);

  return guest ? (
    <>
      <h1>Hi {guest.name}!!!</h1>
      <h1>You are invited to Dylan & Christinas Wedding! 💍</h1>
      <fieldset>
        <legend>
          <strong>RSVP</strong>
        </legend>
        <form>
          <input onClick={handleRSVP} type="button" value="Yes" />
          <input onClick={handleRSVP} type="button" value="No" />
        </form>
      </fieldset>
    </>
  ) : (
    <h1>Loading</h1>
  );
}
