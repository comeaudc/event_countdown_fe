import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useMedia } from "../../context/mediaContext/mediaContext.jsx";
import "./Gallery.css";

export default function Gallery() {
  const { mediaItems, setMediaItems } = useMedia();

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const startX = useRef(0);
  const startY = useRef(0);

  const fetchMedia = async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    const token = localStorage.getItem("inviteToken");

    try {
      const res = await axios.get(
        `http://localhost:3000/api/photos?page=${page}&limit=20`,
        { headers: { authorization: token } }
      );

      if (res.data.length === 0) setHasMore(false);

      setMediaItems((prev) => {
        const existing = new Set(prev.map((i) => i._id));
        const filtered = res.data.filter((i) => !existing.has(i._id));
        return [...prev, ...filtered];
      });
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchMedia();
  }, [page]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 600
      ) {
        if (!loading && hasMore) setPage((p) => p + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  const saveCaption = async (id, caption) => {
    const token = localStorage.getItem("inviteToken");

    try {
      await axios.put(
        `http://localhost:3000/api/photos/${id}`,
        { caption },
        { headers: { authorization: token } }
      );

      setMediaItems((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, caption } : item
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const openViewer = (index) => {
    setViewerIndex(index);
    setViewerOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeViewer = () => {
    setViewerOpen(false);
    document.body.style.overflow = "auto";
  };

  const next = () =>
    setViewerIndex((i) => (i + 1) % mediaItems.length);

  const prev = () =>
    setViewerIndex((i) => (i - 1 + mediaItems.length) % mediaItems.length);

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - startX.current;
    const dy = e.changedTouches[0].clientY - startY.current;

    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) prev();
      else next();
    }

    if (dy > 120) closeViewer();
  };

  useEffect(() => {
    const handleKeys = (e) => {
      if (!viewerOpen) return;

      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") closeViewer();
    };

    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, [viewerOpen]);

  const current = mediaItems[viewerIndex];

  return (
    <>
      <div className="gallery-container">
        {mediaItems.map((item, index) => (
          <div key={item._id} className="gallery-card">

            {item.type === "video" ? (
              <video
                src={item.imageUrl}
                preload="metadata"
                onClick={() => openViewer(index)}
              />
            ) : (
              <img
                src={item.imageUrl}
                alt="media"
                loading="lazy"
                onClick={() => openViewer(index)}
              />
            )}

            {editing === item._id ? (
              <input
                autoFocus
                className="caption-input"
                defaultValue={item.caption || ""}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    saveCaption(item._id, e.target.value);
                    setEditing(null);
                  }
                  if (e.key === "Escape") setEditing(null);
                }}
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

      {loading && <div className="gallery-loading">Loading...</div>}

      {viewerOpen && current && (
        <div
          className="viewer"
          onClick={closeViewer}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button className="viewer-close" onClick={closeViewer}>
            ✕
          </button>

          <button
            className="viewer-nav left"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
          >
            ‹
          </button>

          <button
            className="viewer-nav right"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
          >
            ›
          </button>

          <div
            className="viewer-content"
            onClick={(e) => e.stopPropagation()}
          >
            {current.type === "video" ? (
              <video src={current.imageUrl} controls autoPlay />
            ) : (
              <img src={current.imageUrl} alt="media" />
            )}

            <div className="viewer-caption">
              {current.caption}
            </div>
          </div>
        </div>
      )}
    </>
  );
}