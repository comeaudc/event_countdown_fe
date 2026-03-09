import "./App.css";
import { Routes, Route } from "react-router-dom";
import Invite from "./pages/Invite/Invite";
import Dashboard from "./pages/Dashboard/Dashboard";
import MediaPage from "./pages/MediaPage/MediaPage.jsx";

function App() {
  return (
    <>
      <Routes>
        <Route path="/invite/:token" element={<Invite />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/gallery" element={<MediaPage />} />
      </Routes>
    </>
  );
}

export default App;
