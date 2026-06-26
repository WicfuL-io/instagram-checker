function StatsCards({ stats, openModal }) {
  const cards = [
    {
      title: "Followers",
      value: stats.followers,
      key: "followers",
      icon: "👥",
    },
    {
      title: "Following",
      value: stats.following,
      key: "following",
      icon: "➡️",
    },
    {
      title: "Mutual",
      value: stats.mutual,
      key: "mutual",
      icon: "🤝",
    },
  ];

  return (
    <div className="stats-grid">
      {cards.map((card) => (
        <div
          key={card.key}
          className="stat-card"
          onClick={() => openModal(card.key)}
        >
          <div className="stat-icon">
            {card.icon}
          </div>

          <div className="stat-title">
            {card.title}
          </div>

          <div className="stat-number">
            {card.value}
          </div>

          <div className="stat-footer">
            Klik untuk melihat daftar
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatsCards;