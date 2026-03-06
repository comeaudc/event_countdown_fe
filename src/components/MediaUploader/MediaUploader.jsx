import { useState } from "react";
import axios from "axios";
import loadImage from "blueimp-load-image";
import "./MediaUploader.css"

export default function MediaUploader() {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [progress, setProgress] = useState({});
  const [uploading, setUploading] = useState(false);

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  // Prevent duplicate files
  function preventDuplicates(existing, incoming) {
    return incoming.filter(
      newFile =>
        !existing.some(
          file => file.name === newFile.name && file.size === newFile.size
        )
    );
  }

  // Fix image orientation for photos
  async function fixOrientation(file) {
    if (!file.type.startsWith("image/")) return file;

    return new Promise(resolve => {
      loadImage(
        file,
        canvas => {
          if (canvas.toBlob) {
            canvas.toBlob(blob => {
              resolve(new File([blob], file.name, { type: file.type }));
            }, file.type);
          } else resolve(file);
        },
        { orientation: true, canvas: true }
      );
    });
  }

  // Generate a thumbnail for videos
  function generateVideoThumbnail(file) {
    return new Promise(resolve => {
      const video = document.createElement("video");
      video.src = URL.createObjectURL(file);
      video.currentTime = 1; // Grab a frame at 1s

      video.addEventListener("loadeddata", () => {
        const canvas = document.createElement("canvas");
        canvas.width = 200;
        canvas.height = 150;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
          resolve(URL.createObjectURL(blob));
        }, "image/jpeg");
      });
    });
  }

  // Handle new files
  async function handleFiles(selectedFiles) {
    const array = Array.from(selectedFiles);

    const validFiles = array.filter(file => {
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/"))
        return false;
      if (file.size > MAX_FILE_SIZE) return false;
      return true;
    });

    const deduped = preventDuplicates(files, validFiles);
    const fixedFiles = await Promise.all(deduped.map(fixOrientation));

    const newPreviews = await Promise.all(
      fixedFiles.map(async file => {
        if (file.type.startsWith("image/")) return URL.createObjectURL(file);
        else return await generateVideoThumbnail(file);
      })
    );

    setFiles(prev => [...prev, ...fixedFiles]);
    setPreviews(prev => [...prev, ...newPreviews]);
  }

  function handleDrop(e) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  function removeFile(index) {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[index];
      return newProgress;
    });
  }

  async function uploadMedia() {
    if (!files.length) return;
    setUploading(true);

    const token = localStorage.getItem("inviteToken");

    try {
      await Promise.all(
        files.map((file, index) => {
          const formData = new FormData();
          formData.append("media", file);

          return axios.post("http://localhost:3000/api/photos", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              authorization: token,
            },
            onUploadProgress: event => {
              const percent = Math.round((event.loaded * 100) / event.total);
              setProgress(prev => ({ ...prev, [index]: percent }));
            },
          });
        })
      );

      // Reset after upload
      setTimeout(() => {
        setFiles([]);
        setPreviews([]);
        setProgress({});
        alert("Upload complete!");
      }, 250);
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
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          capture="environment"
          hidden
          onChange={e => handleFiles(e.target.files)}
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
                {progress[i] !== undefined && progress[i] < 100 && (
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${progress[i]}%` }}
                    />
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
            {uploading ? "Uploading..." : `Upload ${files.length} Files`}
          </button>
        </>
      )}
    </div>
  );
}