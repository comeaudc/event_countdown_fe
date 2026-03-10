import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useMedia } from "../../context/mediaContext/mediaContext.jsx";
import "./Gallery.css";

export default function Gallery() {
  const { mediaItems, setMediaItems } = useMedia();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [editing, setEditing] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  const galleryRef = useRef(null);
  const scrollTimeout = useRef(null);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const fetchMedia = useCallback(async () => {
    const token = localStorage.getItem("inviteToken");
    try {
      const res = await axios.get(
        `http://localhost:3000/api/photos?page=${page}&limit=20`,
        { headers: { authorization: token } }
      );

      if (res.data.length === 0) setHasMore(false);

      setMediaItems((prev) => {
        const combined = page === 1 ? [...res.data, ...prev] : [...prev, ...res.data];
        const unique = new Map();
        combined.forEach((item) => unique.set(item._id, item));
        return Array.from(unique.values());
      });
    } catch (err) {
      console.error("Gallery fetch error:", err);
    }
  }, [page, setMediaItems]);

  useEffect(() => { fetchMedia(); }, [fetchMedia]);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollTimeout.current) return;
      scrollTimeout.current = setTimeout(() => {
        scrollTimeout.current = null;
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 400) {
          if (hasMore) setPage((p) => p + 1);
        }
      }, 200);
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
      const el = document.getElementById(`card-${id}`);
      if (el) setSpans(el);
    } catch (err) {
      console.error("Save caption error:", err);
    }
  };

  const setSpans = (el) => {
    if (!el) return;
    const gallery = galleryRef.current;
    if (!gallery) return;

    const rowHeight = parseInt(window.getComputedStyle(gallery).getPropertyValue("grid-auto-rows"));
    const rowGap = parseInt(window.getComputedStyle(gallery).getPropertyValue("gap"));

    const span = Math.ceil((el.scrollHeight + rowGap) / (rowHeight + rowGap));
    el.style.gridRowEnd = `span ${span}`;
  };

  const openModal = (index) => { setModalIndex(index); setModalOpen(true); };
  const closeModal = () => setModalOpen(false);
  const prevModal = () => setModalIndex((i) => (i > 0 ? i - 1 : i));
  const nextModal = () => setModalIndex((i) => (i < mediaItems.length - 1 ? i + 1 : i));

  const handleTouchStart = (e) => { touchStartX.current = e.changedTouches[0].screenX; };
  const handleTouchMove = (e) => { touchEndX.current = e.changedTouches[0].screenX; };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextModal();
      else prevModal();
    }
  };

  return (
    <>
      <div className="gallery-grid" ref={galleryRef}>
        {mediaItems.map((item, i) => {
          const mediaType = item.type || "image";
          return (
            <div key={item._id} className="gallery-card" id={`card-${item._id}`}>
              <div className="card-content">
                {mediaType.startsWith("video") ? (
                  <div className="video-wrapper" onClick={() => openModal(i)}>
                    <video
                      src={item.imageUrl}
                      controls
                      preload="metadata"
                      onLoadedMetadata={(e) => setSpans(e.target.closest(".gallery-card"))}
                    />
                    <div className="video-overlay">▶</div>
                  </div>
                ) : (
                  <img
                    src={item.imageUrl}
                    alt="media"
                    loading="lazy"
                    onLoad={(e) => setSpans(e.target.closest(".gallery-card"))}
                    onClick={() => openModal(i)}
                  />
                )}
                {editing === item._id ? (
                  <input
                    autoFocus
                    className="caption-input"
                    defaultValue={item.caption || ""}
                    onBlur={(e) => { saveCaption(item._id, e.target.value); setEditing(null); }}
                    onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
                  />
                ) : (
                  <div className="caption-display" onClick={() => setEditing(item._id)}>
                    {item.caption || "Add caption..."}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal with sliding */}
      {modalOpen && mediaItems[modalIndex] && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="modal-slide">
              {mediaItems[modalIndex].type.startsWith("video") ? (
                <video src={mediaItems[modalIndex].imageUrl} controls autoPlay className="modal-media" />
              ) : (
                <img src={mediaItems[modalIndex].imageUrl} alt="modal" className="modal-media" />
              )}
              <div className="modal-caption">{mediaItems[modalIndex].caption || "No caption"}</div>
            </div>
            <button className="modal-close" onClick={closeModal}>✕</button>
            <button className="modal-prev" onClick={prevModal}>‹</button>
            <button className="modal-next" onClick={nextModal}>›</button>
          </div>
        </div>
      )}
    </>
  );
}