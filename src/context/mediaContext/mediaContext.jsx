// MediaContext.jsx
import { createContext, useContext, useState } from "react";

const MediaContext = createContext();

export const useMedia = () => useContext(MediaContext);

export const MediaProvider = ({ children }) => {
  const [mediaItems, setMediaItems] = useState([]);
  return (
    <MediaContext.Provider value={{ mediaItems, setMediaItems }}>
      {children}
    </MediaContext.Provider>
  );
};
