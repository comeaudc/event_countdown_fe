import "./App.css";
import { Routes, Route } from "react-router-dom";
import Invite from "./pages/Invite/Invite";
import Dashboard from "./pages/Dashboard/Dashboard";

function App() {
  return (
    <>
      <Routes>
        <Route path="" element={<Invite />} />
        <Route path="" element={<Dashboard />} />
        <Route path="" element={<Gallery />} />
      </Routes>
    </>
  );
}

export default App;
