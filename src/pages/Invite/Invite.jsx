import { useParams, useNavigate } from "react-router-dom";
import { useGuest } from "../../context/guestContext/guestContext.jsx";
import axios from "axios";
import { useEffect } from "react";
import "./Invite.css";

export default function Invite() {
  const { guest, setGuest } = useGuest();
  const nav = useNavigate();
  const { token } = useParams();

  async function getUserData() {
    try {
      let res = await axios.get(
        `https://event-countdown-be.onrender.com/api/invite/${token}`,
      );
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
      if (e.target.value === "Yes") {
        await axios.post(
          `https://event-countdown-be.onrender.com/api/rsvp`,
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
    <div className="invite-container">
      <div className="invite-card fade-in">
        <h1 className="invite-greeting">Hi {guest.name}!!!</h1>
        <h2 className="invite-subtitle">
          You are invited to Dylan & Christina's Wedding 💍
        </h2>

        <fieldset className="rsvp-fieldset">
          <legend>
            <strong>RSVP</strong>
          </legend>
          <form className="rsvp-form">
            <input
              onClick={handleRSVP}
              type="button"
              value="Yes"
              className="rsvp-button yes"
            />
            <input
              onClick={handleRSVP}
              type="button"
              value="No"
              className="rsvp-button no"
            />
          </form>
        </fieldset>
      </div>
    </div>
  ) : (
    <div className="invite-container">
      <h1 className="loading-text">Loading...</h1>
    </div>
  );
}
