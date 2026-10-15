import * as React from "react";
import {Link, useLocation} from "react-router-dom";

interface GlobalSideNavProps {
    isOpen: boolean;
    onClose: () => void;
}

type IconName = "dashboard" | "new" | "approvals" | "form" | "timeline" | "reports" | "task" | "previous" | "alltasks" | "allnotes";

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
    if (name === "task")
        return (
            <svg viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75" />
            </svg>
        );
    if (name === "previous")
        return (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>

                );
    if (name === "alltasks")
        return (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122" />
                </svg>
        );

    if (name === "allnotes")
        return (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
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
    {path: "/", label: "New Meeting Note", icon: "new"},
    {path: "/mynotes", label: "My Meetings", icon: "form"},
    {path: "/meetingtasks", label: "View Meeting Tasks", icon: "task"},
    {path: "/allnotes", label: "All Meeting Notes", icon: "allnotes"},
    {path: "/alltasks", label: "All Meeting Tasks", icon: "alltasks"},
    
];

const GlobalSideNav: React.FC<GlobalSideNavProps> = ({isOpen, onClose}) => {
    const location = useLocation();
    const isActive = (path: string): boolean => {
        if (path === "/") {
            return location.pathname === "/" || location.pathname === "/newmeetingnote";
        }
        return location.pathname === path;
    };

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