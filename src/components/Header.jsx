import {
  Menu,
  LockKeyhole
} from "lucide-react";

export default function Header({
  title,
  setOpen
}) {
  return (
    <header className="header">
      <div className="header-left">
        <button
          className="menu-button icon-button"
          onClick={() => setOpen(true)}
        >
          <Menu size={21} />
        </button>

        <div className="breadcrumb">
          Workspace <span>/</span> <b>{title}</b>
        </div>
      </div>

      <div className="header-right">
        <div className="secure-label">
          <LockKeyhole size={14} />
          LOCAL PROCESSING
        </div>

        <div className="avatar">
          IT
        </div>
      </div>
    </header>
  );
}