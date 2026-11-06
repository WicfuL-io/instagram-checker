import { useState } from "react";

import {
  Menu,
  FileArchive,
  Check,
  X
} from "lucide-react";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import UploadArea from "./components/UploadArea";

import Dashboard from "./pages/Dashboard";
import Followers from "./pages/Followers";
import Messages from "./pages/Messages";
import Interactions from "./pages/Interactions";
import Content from "./pages/Content";
import Saved from "./pages/Saved";
import ActivityPage from "./pages/Activity";
import Privacy from "./pages/Privacy";

import { parseInstagramZip } from "./services/instagramParser";
import { formatDate, formatFileSize } from "./utils/format";

const pageNames = {
  overview: "Dashboard",
  followers: "Followers & Following",
  unfollow: "Follow Back",
  messages: "Messages",
  interactions: "Interactions",
  content: "Content",
  saved: "Saved",
  activity: "Activity",
  privacy: "Privacy"
};

export default function App() {
  const [page, setPage] = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);

  const [file, setFile] = useState(null);
  const [report, setReport] = useState(null);

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");

  const [error, setError] = useState("");

  async function handleAnalyze() {
    if (!file) return;

    setLoading(true);
    setError("");

    try {
      const result = await parseInstagramZip(file, (value, message) => {
        setProgress(value);
        setProgressText(message);
      });

      setReport(result);
      setPage("overview");
    } catch (err) {
      setError(err.message || "Gagal membaca arsip Instagram.");
    } finally {
      setLoading(false);
    }
  }

  function clearReport() {
    setReport(null);
    setFile(null);
    setPage("overview");
    setProgress(0);
  }

  function renderPage() {
    if (!report) return null;

    switch (page) {
      case "overview":
        return (
          <Dashboard
            report={report}
            setPage={setPage}
          />
        );

      case "followers":
        return <Followers report={report} />;

      case "unfollow":
        return (
          <Followers
            report={{
              ...report,
              followers: report.followers,
              following: report.following,
              mutual: report.mutual
            }}
            initialTab="notback"
          />
        );

      case "messages":
        return <Messages report={report} />;

      case "interactions":
        return <Interactions report={report} />;

      case "content":
        return <Content report={report} />;

      case "saved":
        return <Saved report={report} />;

      case "activity":
        return <ActivityPage report={report} />;

      case "privacy":
        return (
          <Privacy
            report={report}
            onClear={clearReport}
          />
        );

      default:
        return <Dashboard report={report} setPage={setPage} />;
    }
  }

  return (
    <div className="app-shell">
      <Sidebar
        page={page}
        setPage={setPage}
        open={mobileOpen}
        setOpen={setMobileOpen}
      />

      <main className="main-area">
        <Header
          title={pageNames[page]}
          setOpen={setMobileOpen}
        />

        <div className="page-content">
          <div className="welcome-heading">
            <div>
              <div className="eyebrow">
                INSTAGRAM DATA ANALYTICS
              </div>

              <h1>
                {page === "overview"
                  ? "Pahami akunmu lebih dalam."
                  : pageNames[page]}
              </h1>

              <p>
                Analisis data Instagram milikmu dalam satu tempat.
              </p>
            </div>

            {report && (
              <button
                className="secondary-button"
                onClick={() => {
                  setFile(null);
                  setReport(null);
                  setPage("overview");
                }}
              >
                <X size={15} />
                Ganti arsip
              </button>
            )}
          </div>

          {!report ? (
            <UploadArea
              file={file}
              setFile={setFile}
              onAnalyze={handleAnalyze}
              loading={loading}
              progress={progress}
              progressText={progressText}
              error={error}
            />
          ) : (
            <>
              <div className="file-banner">
                <FileArchive size={21} />

                <div>
                  <b>{report.fileName}</b>
                  <small>
                    {formatFileSize(report.fileSize)}
                    {" · "}
                    {formatDate(report.processedAt)}
                  </small>
                </div>

                <span>
                  <Check size={13} />
                  ANALISIS SELESAI
                </span>
              </div>

              {renderPage()}
            </>
          )}

          <footer className="app-footer">
            <span>© 2026 InstaTrack</span>
            <span>Private · Local-first analytics</span>
          </footer>
        </div>
      </main>
    </div>
  );
}