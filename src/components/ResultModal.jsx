import { useEffect, useMemo, useState } from "react";

function ResultModal({ open, onClose, title, users = [] }) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) return;

    const handleKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      user.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(filteredUsers.join("\n"));
      alert("Daftar username berhasil disalin.");
    } catch {
      alert("Gagal menyalin.");
    }
  };

  const copyOne = async (username) => {
    try {
      await navigator.clipboard.writeText(username);
      alert(username + " berhasil disalin.");
    } catch {
      alert("Gagal menyalin.");
    }
  };

  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">

          <div>

            <h2>{title}</h2>

            <small>
              Total : {filteredUsers.length}
            </small>

          </div>

          <button
            className="close-btn"
            onClick={onClose}
          >
            ✕
          </button>

        </div>

        <div className="modal-tools">

          <input
            type="text"
            placeholder="Cari username..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <button
            className="copy-btn"
            onClick={copyAll}
          >
            Copy Semua
          </button>

        </div>

        <div className="user-list">

          {filteredUsers.length === 0 && (

            <div className="empty">
              Tidak ada data.
            </div>

          )}

          {filteredUsers.map((user, index) => (

            <div
              key={index}
              className="user-item"
            >

              <span>
                {user}
              </span>

              <button
                onClick={() => copyOne(user)}
              >
                Copy
              </button>

            </div>

          ))}

        </div>

      </div>
    </div>
  );
}

export default ResultModal;