import GuestProvider from "./guestContext/guestContext";
import { MediaProvider } from "./mediaContext/mediaContext";

export default function AppProvider({ children }) {
  return (
    <>
      <MediaProvider>
        <GuestProvider>{children}</GuestProvider>
      </MediaProvider>
    </>
  );
}
