import { useState } from "react";
import axios from "axios";
import loadImage from "blueimp-load-image";
import { FaPlay } from "react-icons/fa"; // For play overlay on videos
import "./MediaUploader.css"

export default function MediaUploader() {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0); // global progress

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  function preventDuplicates(existing, incoming) {
    return incoming.filter(
      (newFile) =>
        !existing.some(
          (file) => file.name === newFile.name && file.size === newFile.size
        )
    );
  }

  async function fixOrientation(file) {
    if (!file.type.startsWith("image/")) return file;

    return new Promise((resolve) => {
      loadImage(
        file,
        (canvas) => {
          if (canvas.toBlob) {
            canvas.toBlob((blob) => {
              resolve(new File([blob], file.name, { type: file.type }));
            }, file.type);
          } else resolve(file);
        },
        { orientation: true, canvas: true }
      );
    });
  }

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
        canvas.toBlob((blob) => {
          resolve(URL.createObjectURL(blob));
        }, "image/jpeg");
      });
    });
  }

  async function handleFiles(selectedFiles) {
    const array = Array.from(selectedFiles);

    const validFiles = array.filter(
      (file) =>
        (file.type.startsWith("image/") || file.type.startsWith("video/")) &&
        file.size <= MAX_FILE_SIZE
    );

    const deduped = preventDuplicates(files, validFiles);
    const fixedFiles = await Promise.all(deduped.map(fixOrientation));

    const newPreviews = await Promise.all(
      fixedFiles.map(async (file) => {
        if (file.type.startsWith("image/")) return URL.createObjectURL(file);
        return await generateVideoThumbnail(file);
      })
    );

    setFiles((prev) => [...prev, ...fixedFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  }

  function handleDrop(e) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function uploadMedia() {
    if (!files.length) return;
    setUploading(true);
    setProgress(0);

    const token = localStorage.getItem("inviteToken");

    try {
      let totalSize = files.reduce((sum, f) => sum + f.size, 0);
      let uploadedBytes = 0;

      await Promise.all(
        files.map((file) =>
          axios.post("http://localhost:3000/api/photos", Object.assign(new FormData(), {append: (k,v)=>formData.append(k,v)}), {
            headers: {
              "Content-Type": "multipart/form-data",
              authorization: token,
            },
            onUploadProgress: (event) => {
              uploadedBytes += event.loaded;
              const percent = Math.round((uploadedBytes / totalSize) * 100);
              setProgress(percent > 100 ? 100 : percent);
            },
          })
        )
      );

      // Clear all previews
      setFiles([]);
      setPreviews([]);
      setProgress(0);
      alert("Upload complete!");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  }

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
          capture="environment"
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
            {previews.map((src, i) => (
              <div key={i} className="preview-card">
                <img src={src} alt="preview" />
                {files[i].type.startsWith("video/") && (
                  <div className="video-overlay">
                    <FaPlay />
                  </div>
                )}
                <button className="remove-btn" onClick={() => removeFile(i)}>
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            className="upload-btn"
            disabled={uploading}
            onClick={uploadMedia}
          >
            {uploading
              ? `Uploading ${progress}%`
              : `Upload ${files.length} Files`}
          </button>

          {uploading && (
            <div className="global-progress-bar">
              <div
                className="global-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}