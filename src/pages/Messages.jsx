
import { useMemo, useState } from "react";

import {
  MessageCircle,
  MessagesSquare,
  Users,
  Search,
  ChevronDown,
  ChevronUp,
  UserRound,
  Clock,
  Image,
  Video,
  Mic,
  Share2,
  Phone,
  Smile,
  MessageSquareText,
  X,
} from "lucide-react";

export default function Messages({ report }) {
  const [search, setSearch] = useState("");
  const [expandedConversation, setExpandedConversation] = useState(null);
  const [sortBy, setSortBy] = useState("most");

  const conversations = report?.conversations ?? [];
  const totals = report?.messageTotals ?? {};

  const totalMessages =
    totals.messages ??
    conversations.reduce(
      (total, conversation) =>
        total + (Number(conversation.messageCount) || 0),
      0
    );

  const totalParticipants = useMemo(() => {
    const people = new Set();

    conversations.forEach((conversation) => {
      (conversation.participants ?? []).forEach((person) => {
        if (person) people.add(person);
      });

      Object.keys(conversation.people ?? {}).forEach((person) => {
        if (person && person !== "Tidak diketahui") {
          people.add(person);
        }
      });
    });

    return people.size;
  }, [conversations]);

  const filteredConversations = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    let result = conversations.map((conversation) => {
      const messages = conversation.messages ?? [];

      const filteredMessages = keyword
        ? messages.filter((message) => {
            const content = String(message.content ?? "").toLowerCase();
            const sender = String(message.sender ?? "").toLowerCase();

            return (
              content.includes(keyword) ||
              sender.includes(keyword) ||
              String(conversation.title ?? "")
                .toLowerCase()
                .includes(keyword) ||
              (conversation.participants ?? []).some((person) =>
                String(person).toLowerCase().includes(keyword)
              )
            );
          })
        : messages;

      return {
        ...conversation,
        visibleMessages: filteredMessages,
      };
    });

    if (keyword) {
      result = result.filter(
        (conversation) =>
          conversation.visibleMessages.length > 0 ||
          String(conversation.title ?? "")
            .toLowerCase()
            .includes(keyword) ||
          (conversation.participants ?? []).some((person) =>
            String(person).toLowerCase().includes(keyword)
          )
      );
    }

    if (sortBy === "most") {
      result.sort(
        (a, b) => (b.messageCount || 0) - (a.messageCount || 0)
      );
    } else if (sortBy === "recent") {
      result.sort(
        (a, b) =>
          (b.lastMessageAt || 0) - (a.lastMessageAt || 0)
      );
    } else if (sortBy === "oldest") {
      result.sort(
        (a, b) =>
          (a.firstMessageAt || 0) - (b.firstMessageAt || 0)
      );
    } else if (sortBy === "least") {
      result.sort(
        (a, b) => (a.messageCount || 0) - (b.messageCount || 0)
      );
    }

    return result;
  }, [conversations, search, sortBy]);

  function formatNumber(value) {
    return (Number(value) || 0).toLocaleString("id-ID");
  }

  function formatDate(timestamp) {
    if (!timestamp) return "Waktu tidak tersedia";

    const date = new Date(Number(timestamp));

    if (Number.isNaN(date.getTime())) {
      return "Waktu tidak tersedia";
    }

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  function formatShortDate(timestamp) {
    if (!timestamp) return "—";

    const date = new Date(Number(timestamp));

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  function getMessageIcon(type) {
    switch (type) {
      case "photo":
        return Image;
      case "video":
        return Video;
      case "audio":
        return Mic;
      case "shared":
        return Share2;
      case "call":
        return Phone;
      case "text":
        return MessageSquareText;
      default:
        return MessageCircle;
    }
  }

  function getMessageTypeLabel(type) {
    const labels = {
      text: "Pesan teks",
      photo: "Foto",
      video: "Video",
      audio: "Audio",
      shared: "Konten dibagikan",
      call: "Panggilan",
      other: "Aktivitas lainnya",
    };

    return labels[type] ?? "Pesan";
  }

  function getMessageDescription(message) {
    if (message.content?.trim()) {
      return message.content;
    }

    const descriptions = [];

    if (message.hasPhoto) descriptions.push("Mengirim foto");
    if (message.hasVideo) descriptions.push("Mengirim video");
    if (message.hasAudio) descriptions.push("Mengirim audio");
    if (message.hasShare) descriptions.push("Membagikan konten");
    if (message.hasCall) descriptions.push("Melakukan panggilan");

    return descriptions.length
      ? descriptions.join(" · ")
      : "Pesan tanpa teks";
  }

  function getConversationPreview(conversation) {
    const messages = conversation.messages ?? [];

    if (!messages.length) return "Belum ada pesan";

    const lastMessage = messages.reduce((latest, current) => {
      return (current.timestamp || 0) > (latest.timestamp || 0)
        ? current
        : latest;
    }, messages[0]);

    return getMessageDescription(lastMessage);
  }

  function toggleConversation(id) {
    setExpandedConversation((current) =>
      String(current) === String(id) ? null : id
    );
  }

  const mediaTotal =
    (Number(totals.types?.photos) || 0) +
    (Number(totals.types?.videos) || 0) +
    (Number(totals.types?.audio) || 0);

  return (
    <div className="messages-page">
      {/* Header */}
      <div className="section-heading messages-heading">
        <div>
          <span className="eyebrow">INSTAGRAM ANALYTICS</span>

          <div className="messages-title">
            <div className="messages-heading-icon">
              <MessageCircle size={22} />
            </div>
            <h2>Messages Analytics</h2>
          </div>

          <p>
            Analisis seluruh percakapan dan aktivitas pesan dari arsip
            Instagram.
          </p>
        </div>
      </div>

      {/* Statistik utama */}
      <div className="messages-stat-grid">
        <StatCard
          icon={MessagesSquare}
          label="Total Pesan"
          value={totalMessages}
          description="Seluruh pesan yang terbaca"
          color="purple"
        />

        <StatCard
          icon={Users}
          label="Peserta"
          value={totalParticipants}
          description="Peserta yang teridentifikasi"
          color="cyan"
        />

        <StatCard
          icon={MessageCircle}
          label="Percakapan"
          value={conversations.length}
          description="Thread percakapan ditemukan"
          color="blue"
        />

        <StatCard
          icon={Image}
          label="Media"
          value={mediaTotal}
          description="Foto, video, dan audio"
          color="pink"
        />
      </div>

      {/* Jenis aktivitas */}
      <section className="panel messages-type-panel">
        <div className="messages-panel-heading">
          <div>
            <span className="messages-section-label">RINGKASAN AKTIVITAS</span>
            <h3>Jenis Aktivitas Pesan</h3>
            <p>Rincian tipe pesan yang ditemukan dalam arsip.</p>
          </div>
        </div>

        <div className="messages-type-grid">
          <TypeStat
            icon={MessageSquareText}
            label="Teks"
            value={totals.types?.text}
            color="purple"
          />
          <TypeStat
            icon={Image}
            label="Foto"
            value={totals.types?.photos}
            color="pink"
          />
          <TypeStat
            icon={Video}
            label="Video"
            value={totals.types?.videos}
            color="blue"
          />
          <TypeStat
            icon={Mic}
            label="Audio"
            value={totals.types?.audio}
            color="cyan"
          />
          <TypeStat
            icon={Share2}
            label="Dibagikan"
            value={totals.types?.shared}
            color="orange"
          />
          <TypeStat
            icon={Smile}
            label="Reaksi"
            value={totals.types?.reactions}
            color="yellow"
          />
          <TypeStat
            icon={Phone}
            label="Panggilan"
            value={totals.types?.calls}
            color="green"
          />
          <TypeStat
            icon={MessageCircle}
            label="Lainnya"
            value={totals.types?.other}
            color="slate"
          />
        </div>
      </section>

      {/* Toolbar */}
      <section className="panel messages-toolbar">
        <div className="messages-toolbar-heading">
          <div>
            <span className="messages-section-label">ARSIP INSTAGRAM</span>
            <h3>Riwayat Percakapan</h3>
            <p>
              Menampilkan {formatNumber(filteredConversations.length)} dari{" "}
              {formatNumber(conversations.length)} percakapan.
            </p>
          </div>

          <div className="messages-result-count">
            <MessagesSquare size={16} />
            {formatNumber(filteredConversations.length)}
          </div>
        </div>

        <div className="messages-filter-row">
          <div className="messages-search">
            <Search size={18} />

            <input
              type="search"
              placeholder="Cari percakapan, pengirim, atau isi pesan..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Hapus pencarian"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="messages-sort">
            <label htmlFor="messages-sort-select">Urutkan</label>
            <select
              id="messages-sort-select"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="most">Pesan terbanyak</option>
              <option value="least">Pesan paling sedikit</option>
              <option value="recent">Aktivitas terbaru</option>
              <option value="oldest">Aktivitas terlama</option>
            </select>
          </div>
        </div>
      </section>

      {/* Daftar percakapan */}
      <div className="messages-conversation-list">
        {filteredConversations.length === 0 ? (
          <div className="panel messages-empty">
            <div className="messages-empty-icon">
              <Search size={25} />
            </div>
            <h3>Tidak ada percakapan ditemukan</h3>
            <p>Coba kata kunci lain atau hapus pencarian.</p>

            {search && (
              <button type="button" onClick={() => setSearch("")}>
                Hapus pencarian
              </button>
            )}
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const expanded =
              String(expandedConversation) === String(conversation.id);

            const messages = conversation.visibleMessages ?? [];
            const participants = conversation.participants ?? [];
            const people = Object.entries(conversation.people ?? {});

            return (
              <article
                className={`panel message-conversation ${
                  expanded ? "is-expanded" : ""
                }`}
                key={conversation.id}
              >
                <button
                  type="button"
                  className="message-conversation-header"
                  onClick={() => toggleConversation(conversation.id)}
                  aria-expanded={expanded}
                >
                  <div className="conversation-avatar">
                    <UserRound size={22} />
                  </div>

                  <div className="conversation-info">
                    <strong>
                      {conversation.title || "Percakapan tanpa nama"}
                    </strong>

                    <div className="conversation-meta">
                      <span>
                        <MessagesSquare size={13} />
                        {formatNumber(conversation.messageCount)} pesan
                      </span>

                      <span>
                        <Users size={13} />
                        {formatNumber(participants.length)} peserta
                      </span>
                    </div>

                    <p>{getConversationPreview(conversation)}</p>
                  </div>

                  <div className="conversation-last-date">
                    <span>
                      {formatShortDate(conversation.lastMessageAt)}
                    </span>

                    <div className="conversation-toggle-icon">
                      {expanded ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </div>
                  </div>
                </button>

                {expanded && (
                  <div className="conversation-detail">
                    {/* Peserta */}
                    <section className="conversation-detail-section">
                      <div className="conversation-detail-heading">
                        <Users size={16} />
                        <h4>Peserta Percakapan</h4>
                      </div>

                      <div className="participant-list">
                        {participants.length ? (
                          participants.map((person, index) => (
                            <span
                              className="participant-chip"
                              key={`${person}-${index}`}
                            >
                              <UserRound size={13} />
                              {person}
                            </span>
                          ))
                        ) : (
                          <span className="message-muted">
                            Peserta tidak tersedia.
                          </span>
                        )}
                      </div>
                    </section>

                    {/* Ringkasan */}
                    <section className="conversation-summary">
                      <div>
                        <span>Pesan pertama</span>
                        <strong>
                          {formatDate(conversation.firstMessageAt)}
                        </strong>
                      </div>

                      <div>
                        <span>Pesan terakhir</span>
                        <strong>
                          {formatDate(conversation.lastMessageAt)}
                        </strong>
                      </div>

                      <div>
                        <span>Total pesan</span>
                        <strong>
                          {formatNumber(conversation.messageCount)}
                        </strong>
                      </div>
                    </section>

                    {/* Pengirim */}
                    {people.length > 0 && (
                      <section className="conversation-detail-section">
                        <div className="conversation-detail-heading">
                          <ActivityIcon />
                          <h4>Aktivitas Pengirim</h4>
                        </div>

                        <div className="sender-list">
                          {people
                            .sort((a, b) => Number(b[1]) - Number(a[1]))
                            .map(([person, count]) => {
                              const percentage =
                                Number(conversation.messageCount) > 0
                                  ? (Number(count) /
                                      Number(conversation.messageCount)) *
                                    100
                                  : 0;

                              return (
                                <div className="sender-row" key={person}>
                                  <div className="sender-info">
                                    <span>{person}</span>
                                    <strong>
                                      {formatNumber(count)} pesan
                                    </strong>
                                  </div>

                                  <div className="sender-progress">
                                    <span
                                      style={{
                                        width: `${Math.min(
                                          100,
                                          percentage
                                        )}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </section>
                    )}

                    {/* Isi pesan */}
                    <section className="conversation-detail-section">
                      <div className="conversation-message-heading">
                        <div className="conversation-detail-heading">
                          <MessageCircle size={16} />
                          <h4>Isi Percakapan</h4>
                        </div>

                        <span>
                          {formatNumber(messages.length)} pesan ditampilkan
                        </span>
                      </div>

                      <div className="conversation-message-list">
                        {messages.length === 0 ? (
                          <p className="message-muted">
                            Tidak ada pesan yang cocok dengan pencarian.
                          </p>
                        ) : (
                          messages.map((message, index) => {
                            const Icon = getMessageIcon(message.type);

                            return (
                              <div
                                className="message-item"
                                key={`${conversation.id}-${index}`}
                              >
                                <div className="message-avatar">
                                  <UserRound size={16} />
                                </div>

                                <div className="message-body">
                                  <div className="message-meta">
                                    <strong>
                                      {message.sender || "Tidak diketahui"}
                                    </strong>

                                    <span>
                                      <Clock size={12} />
                                      {formatDate(message.timestamp)}
                                    </span>
                                  </div>

                                  <p className="message-text">
                                    {getMessageDescription(message)}
                                  </p>

                                  <div className="message-bottom-meta">
                                    <span className="message-type-label">
                                      <Icon size={13} />
                                      {getMessageTypeLabel(message.type)}
                                    </span>

                                    {message.reactions?.length > 0 && (
                                      <span className="message-reactions">
                                        <Smile size={13} />
                                        {message.reactions.length} reaksi
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </section>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      {/* Informasi */}
      <div className="panel messages-information">
        <div className="messages-information-icon">
          <MessageCircle size={19} />
        </div>

        <div>
          <h3>Informasi Analisis</h3>
          <p>
            Data percakapan diambil dari file JSON dalam arsip Instagram.
            Informasi yang ditampilkan mengikuti data yang berhasil dibaca
            parser, termasuk peserta, pengirim, waktu pesan, isi teks,
            tipe media, reaksi, dan aktivitas percakapan.
          </p>
          <p>
            File media asli belum ditampilkan langsung pada halaman ini.
            Parser saat ini menyimpan indikator jenis media, bukan lokasi
            file lampiran.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, description, color }) {
  return (
    <div className="panel messages-stat-card">
      <div className={`messages-stat-icon ${color}`}>
        <Icon size={21} />
      </div>

      <span className="messages-stat-label">{label}</span>

      <strong>{Number(value || 0).toLocaleString("id-ID")}</strong>

      <p>{description}</p>
    </div>
  );
}

function TypeStat({ icon: Icon, label, value, color }) {
  return (
    <div className="messages-type-item">
      <div className={`messages-type-icon ${color}`}>
        <Icon size={18} />
      </div>

      <div>
        <span>{label}</span>
        <strong>{Number(value || 0).toLocaleString("id-ID")}</strong>
      </div>
    </div>
  );
}

function ActivityIcon() {
  return <MessagesSquare size={16} />;
}
