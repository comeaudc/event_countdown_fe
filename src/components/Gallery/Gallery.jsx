import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useMedia } from "../../context/mediaContext/mediaContext.jsx";
import "./Gallery.css";

export default function Gallery() {
  const { mediaItems, setMediaItems } = useMedia();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [editing, setEditing] = useState(null);

  const galleryRef = useRef(null);

  const fetchMedia = async () => {
    const token = localStorage.getItem("inviteToken");
    try {
      const res = await axios.get(
        `http://localhost:3000/api/photos?page=${page}&limit=20`,
        { headers: { authorization: token } }
      );
      if (res.data.length === 0) setHasMore(false);
      setMediaItems((prev) => [...prev, ...res.data]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [page]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 500
      ) {
        if (hasMore) setPage((p) => p + 1);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore]);

  const saveCaption = async (id, caption) => {
    const token = localStorage.getItem("inviteToken");
    try {
      await axios.put(
        `http://localhost:3000/api/photos/${id}`,
        { caption },
        { headers: { authorization: token } }
      );
      setMediaItems((prev) =>
        prev.map((item) => (item._id === id ? { ...item, caption } : item))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const setSpans = (el) => {
    const gallery = galleryRef.current;
    if (!gallery) return;
    const rowHeight = parseInt(
      window.getComputedStyle(gallery).getPropertyValue("grid-auto-rows")
    );
    const rowGap = parseInt(
      window.getComputedStyle(gallery).getPropertyValue("gap")
    );
    const span = Math.ceil((el.offsetHeight + rowGap) / (rowHeight + rowGap));
    el.parentElement.style.gridRowEnd = `span ${span}`;
  };

  return (
    <div className="gallery-grid" ref={galleryRef}>
      {mediaItems.map((item) => (
        <div key={item._id} className="gallery-card">
          {item.type.startsWith("video") ? (
            <div className="video-wrapper">
              <video
                src={item.url}
                controls
                preload="metadata"
                onLoadedMetadata={(e) => setSpans(e.target)}
              />
              <div className="video-overlay">▶</div>
            </div>
          ) : (
            <img
              src={item.url}
              alt="media"
              loading="lazy"
              onLoad={(e) => setSpans(e.target)}
            />
          )}

          {editing === item._id ? (
            <input
              autoFocus
              className="caption-input"
              defaultValue={item.caption || ""}
              onBlur={(e) => {
                saveCaption(item._id, e.target.value);
                setEditing(null);
              }}
            />
          ) : (
            <div
              className="caption-display"
              onClick={() => setEditing(item._id)}
            >
              {item.caption || "Add caption..."}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}