import { useState } from "react";
import axios from "axios";
import loadImage from "blueimp-load-image";
import { useMedia } from "../../context/mediaContext/mediaContext.jsx";
import "./MediaUploader.css";

export default function MediaUploader() {
  const { setMediaItems } = useMedia();
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({});

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  // prevent duplicates
  function preventDuplicates(existing, incoming) {
    return incoming.filter(
      (newFile) =>
        !existing.some(
          (file) => file.name === newFile.name && file.size === newFile.size,
        ),
    );
  }

  // fix image orientation
  async function fixOrientation(file) {
    if (!file.type.startsWith("image/")) return file;
    return new Promise((resolve) => {
      loadImage(
        file,
        (canvas) => {
          if (canvas.toBlob) {
            canvas.toBlob(
              (blob) =>
                resolve(new File([blob], file.name, { type: file.type })),
              file.type,
            );
          } else resolve(file);
        },
        { orientation: true, canvas: true },
      );
    });
  }

  // generate video thumbnail
  function generateVideoThumbnail(file) {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.src = URL.createObjectURL(file);
      video.currentTime = 1;
      video.addEventListener("loadeddata", () => {
        const canvas = document.createElement("canvas");
        canvas.width = 200;
        canvas.height = 150;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => resolve(URL.createObjectURL(blob)),
          "image/jpeg",
        );
      });
    });
  }

  async function handleFiles(selectedFiles) {
    const array = Array.from(selectedFiles).filter(
      (f) =>
        f.size <= MAX_FILE_SIZE &&
        (f.type.startsWith("image/") || f.type.startsWith("video/")),
    );

    const deduped = preventDuplicates(files, array);
    const fixedFiles = await Promise.all(deduped.map(fixOrientation));
    const newPreviews = await Promise.all(
      fixedFiles.map((file) =>
        file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : generateVideoThumbnail(file),
      ),
    );

    setFiles((prev) => [...prev, ...fixedFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  }

  function handleDrop(e) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  async function uploadMedia() {
    if (!files.length) return;
    setUploading(true);
    const token = localStorage.getItem("inviteToken");

    try {
      const uploaded = await Promise.all(
        files.map((file, index) => {
          const formData = new FormData();
          formData.append("media", file);

          return axios
            .post(
              "https://event-countdown-be.onrender.com/api/photos",
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                  authorization: token,
                },
                onUploadProgress: (event) => {
                  const percent = Math.round(
                    (event.loaded * 100) / event.total,
                  );
                  setProgress((prev) => ({ ...prev, [index]: percent }));
                },
              },
            )
            .then((res) => res.data);
        }),
      );

      setMediaItems((prev) => [...uploaded, ...prev]);

      // clear previews/files
      setFiles([]);
      setPreviews([]);
      setProgress({});
      alert("Upload complete!");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  // global progress
  const globalProgress =
    files.length > 0
      ? Math.round(
          Object.values(progress).reduce((a, b) => a + b, 0) / files.length,
        )
      : 0;

  return (
    <div className="media-upload">
      <label
        className="upload-dropzone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="upload-text">
          <h3>Upload Photos & Videos</h3>
          <p>Tap to select or drag files here</p>
        </div>
      </label>

      {files.length > 0 && (
        <>
          <div className="preview-grid">
            {files.map((file, i) => (
              <div key={i} className="preview-card">
                <img src={previews[i]} alt="preview" />
              </div>
            ))}
          </div>

          <button
            className="upload-btn"
            disabled={uploading}
            onClick={uploadMedia}
          >
            {uploading ? "Uploading..." : `Upload ${files.length} Files`}
          </button>

          <div className="global-progress-bar">
            <div
              className="global-progress-fill"
              style={{ width: `${globalProgress}%` }}
            />
          </div>
        </>
      )}
    </div>
  );
}
