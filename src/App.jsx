import "./App.css";
import { Routes, Route } from "react-router-dom";
import Invite from "./pages/Invite/Invite";
import Dashboard from "./pages/Dashboard/Dashboard";
import Gallery from "./pages/Gallery/Gallery";

function App() {
  return (
    <>
      <Routes>
        <Route path="/invite/:token" element={<Invite />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/gallery" element={<Gallery />} />
      </Routes>
    </>
  );
}

export default App;
