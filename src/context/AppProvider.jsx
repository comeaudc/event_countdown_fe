import GuestProvider from "./guestContext/guestContext";

export default function AppProvider({ children }) {
  return (
    <>
      <GuestProvider>{children}</GuestProvider>
    </>
  );
}
