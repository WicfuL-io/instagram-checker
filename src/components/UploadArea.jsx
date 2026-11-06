import {
  UploadCloud,
  FileArchive,
  LockKeyhole
} from "lucide-react";

export default function UploadArea({
  file,
  setFile,
  onAnalyze,
  loading,
  progress,
  progressText,
  error
}) {
  return (
    <div className="upload-card">
      <div className="upload-heading">
        <div className="upload-icon">
          <UploadCloud size={26} />
        </div>

        <span className="tag">
          START ANALYSIS
        </span>

        <h2>Import data Instagram kamu</h2>

        <p>
          Upload file ekspor Instagram format ZIP
          untuk mulai mendapatkan insight akunmu.
        </p>
      </div>

      <label
        className="drop-area"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();

          const selected = event.dataTransfer.files[0];

          if (selected?.name.toLowerCase().endsWith(".zip")) {
            setFile(selected);
          }
        }}
      >
        <FileArchive size={30} />

        <strong>
          {file
            ? file.name
            : "Tarik file ZIP ke sini"}
        </strong>

        <span>
          atau klik untuk memilih file
        </span>

        <input
          type="file"
          accept=".zip,application/zip"
          hidden
          onChange={(event) => {
            const selected = event.target.files?.[0];

            if (selected?.name.toLowerCase().endsWith(".zip")) {
              setFile(selected);
            }
          }}
        />

        <span className="select-file">
          Pilih file ZIP
        </span>
      </label>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading && (
        <div className="progress-area">
          <div className="progress-text">
            <span>{progressText}</span>
            <b>{progress}%</b>
          </div>

          <div className="progress-track">
            <div style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <button
        className="primary-button analyze-button"
        disabled={!file || loading}
        onClick={onAnalyze}
      >
        <UploadCloud size={17} />

        {loading
          ? "Sedang menganalisis..."
          : "Mulai analisis"}
      </button>

      <div className="upload-security">
        <LockKeyhole size={13} />
        File diproses langsung di browser kamu.
      </div>
    </div>
  );
}