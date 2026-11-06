import {
  ArrowUpRight
} from "lucide-react";

export default function StatCard({
  icon: Icon,
  title,
  value,
  description,
  color,
  onClick
}) {
  return (
    <button
      className="stat-card"
      onClick={onClick}
      type="button"
    >
      <div className={`stat-icon ${color}`}>
        <Icon size={21} />
      </div>

      <span className="stat-title">
        {title}
      </span>

      <strong className="stat-value">
        {value}
      </strong>

      <small className="stat-description">
        {description}
      </small>

      <ArrowUpRight
        className="stat-arrow"
        size={17}
      />
    </button>
  );
}