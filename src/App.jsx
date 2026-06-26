import { useState } from "react";
import { parseInstagramZip } from "./utils/instagramParser";

import UploadForm from "./components/UploadForm";
import StatsCards from "./components/StatsCards";
import ResultModal from "./components/ResultModal";
import GuideModal from "./components/GuideModal";
import Footer from "./components/Footer";

function App() {
  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [modal, setModal] = useState("");

  const openModal = (name) => setModal(name);

  const closeModal = () => setModal("");

  const handleUpload = async (file) => {
    if (!file) return;

    setLoading(true);

    setError("");

    try {
      const result = await parseInstagramZip(file);

      setStats(result);
    } catch (err) {
      console.error(err);

      setError(
        "ZIP tidak valid atau bukan file export Instagram."
      );
    }

    setLoading(false);
  };

  return (
    <div className="container">

      <header className="header">

        <h1>Instagram Analytics</h1>

        <p>Follower & Following Relationship</p>

      </header>

      <UploadForm
        onUpload={handleUpload}
        loading={loading}
        openGuide={() => openModal("guide")}
      />

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {loading && (
        <div className="loading">
          Memproses ZIP...
        </div>
      )}

      {stats && (
        <>
          <StatsCards
            stats={stats}
            openModal={openModal}
          />

          <div className="actions">

            <button
              onClick={() => openModal("notback")}
            >
              Tidak Follow Balik
            </button>

            <button
              onClick={() => openModal("younot")}
            >
              Kamu Tidak Follow Balik
            </button>

          </div>
        </>
      )}

      {/* FOLLOWERS */}

      {stats && (
        <ResultModal
          title="Followers"
          open={modal === "followers"}
          onClose={closeModal}
          users={stats.followersList}
        />
      )}

      {/* FOLLOWING */}

      {stats && (
        <ResultModal
          title="Following"
          open={modal === "following"}
          onClose={closeModal}
          users={stats.followingList}
        />
      )}

      {/* MUTUAL */}

      {stats && (
        <ResultModal
          title="Mutual"
          open={modal === "mutual"}
          onClose={closeModal}
          users={stats.mutualList}
        />
      )}

      {/* NOT FOLLOW BACK */}

      {stats && (
        <ResultModal
          title="Tidak Follow Balik"
          open={modal === "notback"}
          onClose={closeModal}
          users={stats.notFollowingBack}
        />
      )}

      {/* YOU DON'T FOLLOW */}

      {stats && (
        <ResultModal
          title="Kamu Tidak Follow Balik"
          open={modal === "younot"}
          onClose={closeModal}
          users={stats.notFollowedByYou}
        />
      )}

      <GuideModal
        open={modal === "guide"}
        onClose={closeModal}
      />

      <Footer />

    </div>
  );
}

export default App;