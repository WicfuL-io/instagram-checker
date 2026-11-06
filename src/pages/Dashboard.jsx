import {
  Users,
  UserMinus,
  UserCheck,
  ArrowUpRight,
  MessageCircle,
  Heart,
  FileText,
  Bookmark,
  Activity,
  Search
} from "lucide-react";

import StatCard from "../components/StatCard";
import { formatNumber } from "../utils/format";

export default function Dashboard({
  report,
  setPage
}) {
  if (!report) return null;

  const categories = [
    ["Pesan", "messages", MessageCircle],
    ["Likes", "likes", Heart],
    ["Komentar", "comments", MessageCircle],
    ["Postingan", "posts", FileText],
    ["Stories", "stories", Activity],
    ["Saved", "saved", Bookmark],
    ["Pencarian", "searches", Search]
  ];

  return (
    <>
      <div className="section-heading">
        <div>
          <h2>Overview akun</h2>
          <p>
            Ringkasan hubungan followers dari arsip Instagram.
          </p>
        </div>

        <span className="data-label">
          DATA EKSPOR
        </span>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={Users}
          title="Total Followers"
          value={formatNumber(report.followers)}
          description="Akun yang mengikuti kamu"
          color="purple"
          onClick={() => setPage("followers")}
        />

        <StatCard
          icon={ArrowUpRight}
          title="Total Following"
          value={formatNumber(report.following)}
          description="Akun yang kamu ikuti"
          color="blue"
          onClick={() => setPage("followers")}
        />

        <StatCard
          icon={UserCheck}
          title="Mutual"
          value={formatNumber(report.mutual)}
          description="Saling mengikuti"
          color="green"
          onClick={() => setPage("followers")}
        />

        <StatCard
          icon={UserMinus}
          title="Tidak Follow Back"
          value={formatNumber(report.notFollowingBack.length)}
          description="Belum mengikuti kamu kembali"
          color="orange"
          onClick={() => setPage("unfollow")}
        />
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>Statistik hubungan</h3>
              <p>Perbandingan followers dan following</p>
            </div>
            <Users size={19} />
          </div>

          <div className="relationship">
            <div className="relationship-circle">
              <strong>{formatNumber(report.mutual)}</strong>
              <span>Mutual</span>
            </div>

            <div className="relationship-bars">
              <div className="bar-item">
                <div>
                  Followers
                  <b>{formatNumber(report.followers)}</b>
                </div>
                <div className="bar-bg">
                  <i
                    className="bar-purple"
                    style={{
                      width: report.followers ? "100%" : "0%"
                    }}
                  />
                </div>
              </div>

              <div className="bar-item">
                <div>
                  Following
                  <b>{formatNumber(report.following)}</b>
                </div>
                <div className="bar-bg">
                  <i
                    className="bar-cyan"
                    style={{
                      width: `${
                        Math.max(report.followers, report.following)
                          ? report.following /
                            Math.max(report.followers, report.following) * 100
                          : 0
                      }%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>Quick Insight</h3>
              <p>Ringkasan akunmu</p>
            </div>
            <Activity size={19} />
          </div>

          <div className="quick-item">
            <div>
              <b>{formatNumber(report.notFollowingBack.length)}</b>
              <span>Akun tidak follow balik</span>
            </div>

            <button onClick={() => setPage("unfollow")}>
              <ArrowUpRight size={18} />
            </button>
          </div>

          <div className="quick-item">
            <div>
              <b>{formatNumber(report.notFollowedByYou.length)}</b>
              <span>Akun yang belum kamu follow</span>
            </div>

            <button onClick={() => setPage("followers")}>
              <ArrowUpRight size={18} />
            </button>
          </div>
        </section>
      </div>

      <div className="section-heading">
        <div>
          <h2>Kategori data ditemukan</h2>
          <p>File JSON yang terdeteksi dalam arsip.</p>
        </div>
      </div>

      <div className="category-grid">
        {categories.map(([label, key, Icon]) => {
          const item = report.categories[key];

          return (
            <div className="category-card" key={key}>
              <div className="category-title">
                <Icon size={18} />
                <span>{label}</span>
              </div>

              <strong>{item?.files || "—"}</strong>

              <small>
                {item?.files
                  ? "File ditemukan"
                  : "Tidak tersedia"}
              </small>
            </div>
          );
        })}
      </div>
    </>
  );
}