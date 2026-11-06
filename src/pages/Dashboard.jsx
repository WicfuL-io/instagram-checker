
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
  Search,
  FolderOpen,
  ChevronRight,
  ChartNoAxesCombined,
} from "lucide-react";

import StatCard from "../components/StatCard";
import { formatNumber } from "../utils/format";

export default function Dashboard({ report, setPage }) {
  if (!report) return null;

  const categories = [
    {
      label: "Pesan",
      key: "messages",
      icon: MessageCircle,
      color: "purple",
      value: report.messageTotals?.messages,
      description: "Total pesan",
      isMessage: true,
    },
    {
      label: "Likes",
      key: "likes",
      icon: Heart,
      color: "pink",
    },
    {
      label: "Komentar",
      key: "comments",
      icon: MessageCircle,
      color: "cyan",
    },
    {
      label: "Postingan",
      key: "posts",
      icon: FileText,
      color: "blue",
    },
    {
      label: "Stories",
      key: "stories",
      icon: Activity,
      color: "orange",
    },
    {
      label: "Saved",
      key: "saved",
      icon: Bookmark,
      color: "purple",
    },
    {
      label: "Pencarian",
      key: "searches",
      icon: Search,
      color: "green",
    },
  ];

  const followers = Number(report.followers) || 0;
  const following = Number(report.following) || 0;
  const mutual = Number(report.mutual) || 0;
  const notFollowingBack = report.notFollowingBack?.length || 0;
  const notFollowedByYou = report.notFollowedByYou?.length || 0;

  const maxRelationship = Math.max(followers, following, 1);
  const followerWidth = (followers / maxRelationship) * 100;
  const followingWidth = (following / maxRelationship) * 100;

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div className="dashboard-hero-content">
          <span className="dashboard-eyebrow">
            <span className="dashboard-eyebrow-dot" />
            INSTAGRAM ANALYTICS
          </span>

          <h2>Overview Akun</h2>

          <p>
            Pantau statistik followers, aktivitas akun, dan data yang
            berhasil ditemukan dari arsip Instagram kamu.
          </p>
        </div>

        <div className="dashboard-export-label">
          <span className="dashboard-export-icon">
            <FolderOpen size={17} />
          </span>
          <span>
            <strong>Data ekspor</strong>
            <small>Arsip berhasil dibaca</small>
          </span>
        </div>
      </section>

      <section className="dashboard-stats-grid">
        <StatCard
          icon={Users}
          title="Total Followers"
          value={formatNumber(followers)}
          description="Akun yang mengikuti kamu"
          color="purple"
          onClick={() => setPage("followers")}
        />

        <StatCard
          icon={ArrowUpRight}
          title="Total Following"
          value={formatNumber(following)}
          description="Akun yang kamu ikuti"
          color="blue"
          onClick={() => setPage("followers")}
        />

        <StatCard
          icon={UserCheck}
          title="Mutual"
          value={formatNumber(mutual)}
          description="Saling mengikuti"
          color="green"
          onClick={() => setPage("followers")}
        />

        <StatCard
          icon={UserMinus}
          title="Tidak Follow Back"
          value={formatNumber(notFollowingBack)}
          description="Belum mengikuti kamu kembali"
          color="orange"
          onClick={() => setPage("unfollow")}
        />
      </section>

      <section className="dashboard-insight-grid">
        <div className="dashboard-panel relationship-panel">
          <div className="dashboard-panel-heading">
            <div className="dashboard-panel-title">
              <span className="dashboard-panel-icon purple">
                <Users size={18} />
              </span>
              <div>
                <h3>Statistik hubungan</h3>
                <p>Perbandingan followers dan following</p>
              </div>
            </div>

            <span className="dashboard-panel-tag">RELATIONSHIP</span>
          </div>

          <div className="dashboard-relationship-content">
            <div className="dashboard-mutual-circle">
              <div className="dashboard-mutual-inner">
                <strong>{formatNumber(mutual)}</strong>
                <span>Mutual</span>
              </div>
            </div>

            <div className="dashboard-relationship-bars">
              <div className="dashboard-bar-item">
                <div className="dashboard-bar-label">
                  <span>
                    <i className="dashboard-legend purple-bg" />
                    Followers
                  </span>
                  <strong>{formatNumber(followers)}</strong>
                </div>

                <div className="dashboard-bar-track">
                  <span
                    className="dashboard-bar-fill purple-fill"
                    style={{ width: `${followerWidth}%` }}
                  />
                </div>
              </div>

              <div className="dashboard-bar-item">
                <div className="dashboard-bar-label">
                  <span>
                    <i className="dashboard-legend cyan-bg" />
                    Following
                  </span>
                  <strong>{formatNumber(following)}</strong>
                </div>

                <div className="dashboard-bar-track">
                  <span
                    className="dashboard-bar-fill cyan-fill"
                    style={{ width: `${followingWidth}%` }}
                  />
                </div>
              </div>

              <div className="dashboard-relationship-note">
                <Activity size={15} />
                <span>
                  {followers > following
                    ? "Jumlah followers lebih banyak daripada following."
                    : followers < following
                      ? "Jumlah following lebih banyak daripada followers."
                      : "Jumlah followers dan following seimbang."}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-panel quick-insight-panel">
          <div className="dashboard-panel-heading">
            <div className="dashboard-panel-title">
              <span className="dashboard-panel-icon cyan">
                <ChartNoAxesCombined size={18} />
              </span>
              <div>
                <h3>Quick Insight</h3>
                <p>Ringkasan hubungan akun</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="dashboard-quick-item"
            onClick={() => setPage("unfollow")}
          >
            <span className="dashboard-quick-icon orange">
              <UserMinus size={19} />
            </span>

            <span className="dashboard-quick-info">
              <strong>{formatNumber(notFollowingBack)}</strong>
              <small>Akun tidak follow balik</small>
            </span>

            <span className="dashboard-quick-arrow">
              <ArrowUpRight size={18} />
            </span>
          </button>

          <button
            type="button"
            className="dashboard-quick-item"
            onClick={() => setPage("followers")}
          >
            <span className="dashboard-quick-icon blue">
              <UserCheck size={19} />
            </span>

            <span className="dashboard-quick-info">
              <strong>{formatNumber(notFollowedByYou)}</strong>
              <small>Belum kamu follow kembali</small>
            </span>

            <span className="dashboard-quick-arrow">
              <ArrowUpRight size={18} />
            </span>
          </button>

          <div className="dashboard-quick-footer">
            <span className="dashboard-footer-pulse" />
            Ringkasan berdasarkan data ekspor
          </div>
        </div>
      </section>

      <section className="dashboard-category-section">
        <div className="dashboard-section-heading">
          <div>
            <span className="dashboard-section-eyebrow">
              ARSIP INSTAGRAM
            </span>
            <h3>Kategori data ditemukan</h3>
            <p>
              Ringkasan file dan aktivitas yang berhasil terdeteksi dalam
              arsip Instagram.
            </p>
          </div>

          <span className="dashboard-category-total">
            <FolderOpen size={15} />
            {categories.length} kategori
          </span>
        </div>

        <div className="dashboard-category-grid">
          {categories.map((category) => {
            const Icon = category.icon;
            const item = report.categories?.[category.key];

            const value = category.isMessage
              ? category.value
              : item?.files;

            const available =
              value !== undefined && value !== null && Number(value) > 0;

            return (
              <div
                className="dashboard-category-card"
                key={category.key}
              >
                <div className="dashboard-category-top">
                  <span
                    className={`dashboard-category-icon ${category.color}`}
                  >
                    <Icon size={19} />
                  </span>

                  <span
                    className={`dashboard-category-status ${
                      available ? "available" : "unavailable"
                    }`}
                  >
                    <i />
                    {available ? "Tersedia" : "Kosong"}
                  </span>
                </div>

                <div className="dashboard-category-info">
                  <span>{category.label}</span>
                  <strong>
                    {available ? formatNumber(value) : "—"}
                  </strong>
                  <small>
                    {category.isMessage
                      ? category.description
                      : available
                        ? "File ditemukan"
                        : "Tidak tersedia"}
                  </small>
                </div>

                <div className="dashboard-category-bottom">
                  <span>
                    {category.isMessage ? "Aktivitas pesan" : "Data arsip"}
                  </span>
                  <ChevronRight size={16} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
