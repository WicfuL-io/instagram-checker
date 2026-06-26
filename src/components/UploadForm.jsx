import { useRef, useState } from "react";

function UploadForm({ onUpload, loading, openGuide }) {
  const inputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFile = (file) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".zip")) {
      alert("Silakan pilih file ZIP Instagram.");
      return;
    }

    setSelectedFile(file);
  };

  const handleInput = (e) => {
    handleFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
  };

  const analyze = () => {
    if (!selectedFile) {
      alert("Pilih file ZIP terlebih dahulu.");
      return;
    }

    onUpload(selectedFile);
  };

  return (
    <div className="upload-section">

      <button
        type="button"
        className="guide-btn"
        onClick={openGuide}
      >
        📖 Panduan ZIP
      </button>

      <div
        className="drop-zone"
        onDrop={handleDrop}
        onDragOver={handleDrag}
      >
        <h3>Upload Instagram ZIP</h3>

        <p>Drag & Drop file ZIP ke sini</p>
        <p>atau</p>

        <button
          type="button"
          className="choose-btn"
          onClick={() => inputRef.current.click()}
        >
          Pilih File
        </button>

        <input
          ref={inputRef}
          type="file"
          accept=".zip"
          hidden
          onChange={handleInput}
        />

        {selectedFile && (
          <div className="selected-file">
            <strong>File:</strong>
            <br />
            {selectedFile.name}
            <br />
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </div>
        )}
      </div>

      <button
        type="button"
        className="analyze-btn"
        onClick={analyze}
        disabled={loading}
      >
        {loading ? "Processing..." : "Analyze"}
      </button>
    </div>
  );
}

export default UploadForm;