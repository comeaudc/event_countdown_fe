import { createContext, useContext, useState } from "react";

const GuestContext = createContext();

export default function GuestProvider({ children }) {
  const [guest, setGuest] = useState(null);

  const value = { guest, setGuest };
  return (
    <GuestContext.Provider value={value}>{children}</GuestContext.Provider>
  );
}

export function useGuest() {
  return useContext(GuestContext);
}
