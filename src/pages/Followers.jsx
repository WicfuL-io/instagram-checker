import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { formatNumber } from "../utils/format";

export default function Followers({ report }) {
  const [tab, setTab] = useState("followers");
  const [search, setSearch] = useState("");

  const lists = {
    followers: report.followersList,
    following: report.followingList,
    mutual: report.mutualList,
    notback: report.notFollowingBack,
    notyou: report.notFollowedByYou
  };

  const currentList = useMemo(() => {
    return (lists[tab] || []).filter((item) =>
      item.username.includes(search.toLowerCase().replace("@", ""))
    );
  }, [tab, search, report]);

  const exportCSV = () => {
    const rows = [
      "username",
      ...currentList.map((item) => `"${item.username}"`)
    ];

    const blob = new Blob(
      ["\uFEFF" + rows.join("\n")],
      { type: "text/csv;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `instatrack-${tab}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const tabs = [
    ["followers", "Followers", report.followers],
    ["following", "Following", report.following],
    ["mutual", "Mutual", report.mutual],
    ["notback", "Tidak Follow Back", report.notFollowingBack.length],
    ["notyou", "Belum Kamu Follow", report.notFollowedByYou.length]
  ];

  return (
    <>
      <div className="section-heading">
        <div>
          <h2>Followers & Following</h2>
          <p>Analisis hubungan akun Instagram.</p>
        </div>
      </div>

      <section className="panel table-panel">
        <div className="tab-list">
          {tabs.map(([id, label, count]) => (
            <button
              key={id}
              className={tab === id ? "selected" : ""}
              onClick={() => {
                setTab(id);
                setSearch("");
              }}
            >
              {label}
              <b>{formatNumber(count)}</b>
            </button>
          ))}
        </div>

        <div className="table-toolbar">
          <div className="search-input">
            <Search size={17} />

            <input
              placeholder="Cari username..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <button
            className="secondary-button"
            onClick={exportCSV}
            disabled={!currentList.length}
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>

        <div className="table-header">
          <span>NO</span>
          <span>USERNAME</span>
          <span>STATUS</span>
        </div>

        <div className="table-body">
          {currentList.slice(0, 1000).map((item, index) => (
            <div className="table-row" key={item.username}>
              <span>{index + 1}</span>
              <b>@{item.username}</b>
              <span className="detected">Terdeteksi</span>
            </div>
          ))}

          {!currentList.length && (
            <div className="empty-table">
              Tidak ada akun yang ditemukan.
            </div>
          )}
        </div>

        <div className="table-footer">
          Menampilkan {formatNumber(Math.min(currentList.length, 1000))}
          {" "}dari {formatNumber(currentList.length)} akun.
        </div>
      </section>
    </>
  );
}