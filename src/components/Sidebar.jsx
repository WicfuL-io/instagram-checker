import {
    LayoutDashboard,
    Users,
    UserMinus,
    MessageCircle,
    Heart,
    FileText,
    Bookmark,
    Activity,
    ShieldCheck,
    X
} from "lucide-react";

const navigation = [
    {
        group: "WORKSPACE",
        items: [
            ["overview", "Dashboard", LayoutDashboard],
            ["followers", "Followers", Users],
            ["unfollow", "Follow Back", UserMinus]
        ]
    },
    {
        group: "INSIGHTS",
        items: [
            ["messages", "Messages", MessageCircle],
            ["interactions", "Interactions", Heart],
            ["content", "Content", FileText],
            ["saved", "Saved", Bookmark],
            ["activity", "Activity", Activity]
        ]
    },
    {
        group: "SYSTEM",
        items: [
            ["privacy", "Privacy", ShieldCheck]
        ]
    }
];

export default function Sidebar({
    page,
    setPage,
    open,
    setOpen
}) {
    return (
        <>
            <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
                <div className="brand">
                    <div className="brand-icon">
                        <span className="instagram-icon">
                            <i className="bi bi-instagram"></i>
                        </span>
                    </div>

                    <div>
                        <strong>
                            insta<span>track</span>
                        </strong>

                        <small>INSIGHT STUDIO</small>
                    </div>

                    <button
                        className="mobile-close icon-button"
                        onClick={() => setOpen(false)}
                    >
                        <X size={19} />
                    </button>
                </div>

                <div className="workspace">
                    <span className="online-dot" />
                    Personal Workspace
                </div>

                {navigation.map((group) => (
                    <div className="nav-group" key={group.group}>
                        <div className="nav-label">
                            {group.group}
                        </div>

                        {group.items.map(([id, label, Icon]) => (
                            <button
                                key={id}
                                className={`nav-item ${page === id ? "active" : ""}`}
                                onClick={() => {
                                    setPage(id);
                                    setOpen(false);
                                }}
                            >
                                <Icon size={18} />
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>
                ))}

                <div className="sidebar-footer">
                    <ShieldCheck size={18} />

                    <div>
                        <b>Private by design</b>
                        <small>Data diproses lokal</small>
                    </div>
                </div>
            </aside>

            {open && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setOpen(false)}
                />
            )}
        </>
    );
}