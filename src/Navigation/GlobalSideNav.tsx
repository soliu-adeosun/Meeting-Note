import * as React from "react";
import {Link, useLocation} from "react-router-dom";

interface GlobalSideNavProps {
    isOpen: boolean;
    onClose: () => void;
}

type IconName = "dashboard" | "new" | "approvals" | "form" | "timeline" | "reports";

const NavIcon: React.FC<{name: IconName}> = ({name}) => {
    if (name === "dashboard")
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 11 12 3l9 8" />
                <path d="M5 10v11h14V10" />
                <path d="M9 21v-7h6v7" />
            </svg>
        );
    if (name === "new")
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
            </svg>
        );
    if (name === "approvals")
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 12l2 2 4-4" />
                <path d="M5 4h14v16H5z" />
            </svg>
        );
    if (name === "form")
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 4h14v16H5z" />
                <path d="M8 8h8M8 12h8M8 16h5" />
            </svg>
        );
    if (name === "timeline")
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" />
            </svg>
        );
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 20h16" />
            <path d="M7 17V9M12 17V4M17 17v-6" />
        </svg>
    );
};

const NAV_ITEMS: {path: string; label: string; icon: IconName}[] = [
    {path: "/", label: "Dashboard", icon: "dashboard"},
    {path: "/newrequest", label: "New Meeting Note", icon: "new"},
    {path: "/report", label: "Report", icon: "reports"},
];

const GlobalSideNav: React.FC<GlobalSideNavProps> = ({isOpen, onClose}) => {
    const location = useLocation();
    const isActive = (path: string): boolean => location.pathname === path;

    return (
        <>
            <div className={`AdrSidebarOverlay${isOpen ? " show" : ""}`} onClick={onClose} aria-hidden="true" />

            <aside className={`AdrSidebar${isOpen ? " open" : ""}`} aria-label="Main navigation">
                <div className="AdrBrand">
                    <span className="AdrBrandMark">
                        <svg
                            viewBox="160 135 365 385"
                            width="22"
                            height="23"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                        >
                            <polygon
                                fill="white"
                                points="325.29,377.98 275.34,513.01 191.61,513.01 220.29,435.6"
                            />
                            <polygon
                                fill="white"
                                points="357.8,377.98 407.75,513.01 491.49,513.01 462.8,435.6"
                            />
                            <path
                                fill="white"
                                fillRule="evenodd"
                                d="M425.58 144.05l90.89 250.67c-48.07,-12.82 -98.22,-20.54 -149.86,-22.48l-24.75 -193.1 -0.61 0 -24.75 193.03c-51.62,1.82 -101.78,9.4 -149.86,22.1l92.54 -250.21 -1.32 0 168.96 0 -1.24 0z"
                            />
                        </svg>
                    </span>
                    <div>
                        <h1>Meeting Note</h1>
                    </div>
                </div>

                <nav aria-label="Section navigation">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            id={item.icon}
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className={`AdrNavItem${isActive(item.path) ? " active" : ""}`}
                            aria-current={isActive(item.path) ? "page" : undefined}
                        >
                            <span>
                                <NavIcon name={item.icon} />
                            </span>
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </aside>
        </>
    );
};

export default GlobalSideNav;
