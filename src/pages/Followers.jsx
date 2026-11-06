
import { useMemo, useState } from "react";
import {
  Download,
  Search,
  Users,
  UserPlus,
  UserCheck,
  UserMinus,
  UserX,
} from "lucide-react";

import { formatNumber } from "../utils/format";

export default function Followers({ report }) {
  const [tab, setTab] = useState("followers");
  const [search, setSearch] = useState("");

  const lists = {
    followers: report?.followersList || [],
    following: report?.followingList || [],
    mutual: report?.mutualList || [],
    notback: report?.notFollowingBack || [],
    notyou: report?.notFollowedByYou || [],
  };

  const tabs = [
    {
      id: "followers",
      label: "Followers",
      count: report?.followers ?? lists.followers.length,
      icon: Users,
    },
    {
      id: "following",
      label: "Following",
      count: report?.following ?? lists.following.length,
      icon: UserPlus,
    },
    {
      id: "mutual",
      label: "Mutual",
      count: report?.mutual ?? lists.mutual.length,
      icon: UserCheck,
    },
    {
      id: "notback",
      label: "Tidak Follow Back",
      count: lists.notback.length,
      icon: UserMinus,
    },
    {
      id: "notyou",
      label: "Belum Kamu Follow",
      count: lists.notyou.length,
      icon: UserX,
    },
  ];

  const activeTab = tabs.find((item) => item.id === tab);

  const currentList = useMemo(() => {
    const keyword = search.toLowerCase().replace(/^@/, "").trim();

    return (lists[tab] || []).filter((item) =>
      String(item?.username || "")
        .toLowerCase()
        .includes(keyword)
    );
  }, [tab, search, report]);

  const exportCSV = () => {
    if (!currentList.length) return;

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = [
      ["username"],
      ...currentList.map((item) => [item.username]),
    ];

    const csv = rows.map((row) => row.map(escapeCSV).join(",")).join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `instatrack-${tab}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="section-heading followers-heading">
        <div>
          <span className="eyebrow">INSTAGRAM ANALYTICS</span>
          <h2>Followers & Following</h2>
          <p>Kelola dan analisis hubungan akun Instagram kamu.</p>
        </div>
      </div>

      <div className="followers-overview">
        <div className="followers-overview-icon">
          <Users size={23} />
        </div>

        <div className="followers-overview-info">
          <span>Total Followers</span>
          <strong>{formatNumber(report?.followers || 0)}</strong>
          <small>Jumlah akun yang mengikuti kamu</small>
        </div>

        <div className="followers-overview-decoration">
          <Users size={75} />
        </div>
      </div>

      <section className="panel table-panel followers-panel">
        <div className="tab-list">
          {tabs.map(({ id, label, count, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={tab === id ? "selected" : ""}
              onClick={() => {
                setTab(id);
                setSearch("");
              }}
            >
              <Icon size={15} />
              <span>{label}</span>
              <b>{formatNumber(count)}</b>
            </button>
          ))}
        </div>

        <div className="followers-content">
          <div className="followers-content-heading">
            <div>
              <h3>Daftar {activeTab?.label}</h3>
              <p>
                {formatNumber(currentList.length)} akun ditemukan
              </p>
            </div>

            <span className="followers-result-badge">
              {formatNumber(currentList.length)} akun
            </span>
          </div>

          <div className="table-toolbar">
            <div className="search-input">
              <Search size={17} />

              <input
                type="search"
                placeholder="Cari username..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <button
              type="button"
              className="secondary-button followers-export"
              onClick={exportCSV}
              disabled={!currentList.length}
            >
              <Download size={15} />
              Export CSV
            </button>
          </div>

          <div className="followers-table-wrapper">
            <div className="table-header">
              <span>NO</span>
              <span>USERNAME</span>
              <span>STATUS</span>
            </div>

            <div className="table-body">
              {currentList.slice(0, 1000).map((item, index) => (
                <div className="table-row" key={`${item.username}-${index}`}>
                  <span>{index + 1}</span>

                  <div className="followers-user">
                    <div className="followers-user-avatar">
                      {(item.username || "?").charAt(0).toUpperCase()}
                    </div>

                    <b>@{item.username}</b>
                  </div>

                  <span className="detected">
                    <span className="status-dot" />
                    Terdeteksi
                  </span>
                </div>
              ))}

              {!currentList.length && (
                <div className="empty-table followers-empty">
                  <div className="followers-empty-icon">
                    <Search size={25} />
                  </div>

                  <strong>
                    {search
                      ? "Username tidak ditemukan"
                      : "Tidak ada akun ditemukan"}
                  </strong>

                  <p>
                    {search
                      ? "Coba gunakan kata kunci pencarian yang berbeda."
                      : "Belum ada data akun untuk kategori ini."}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="table-footer">
            Menampilkan{" "}
            {formatNumber(Math.min(currentList.length, 1000))} dari{" "}
            {formatNumber(currentList.length)} akun.
          </div>
        </div>
      </section>
    </>
  );
}
