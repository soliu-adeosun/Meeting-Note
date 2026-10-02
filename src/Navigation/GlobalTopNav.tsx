import * as React from "react";
import {useLocation} from "react-router-dom";

interface GlobalTopNavProps {
    onToggleSidebar: () => void;
}

// Maps each route to the title shown in the topbar.
const PAGE_TITLES: Record<string, string> = {
    "/": "Dashboard",
    "/newrequest": "",
    "/approverequest": "My Approvals",
    "/viewrequest": "Data Requirement Gathering Form",
    "/report": "Report",
};

const GlobalTopNav: React.FC<GlobalTopNavProps> = ({onToggleSidebar}) => {
    const location = useLocation();
    const title = PAGE_TITLES[location.pathname] ?? "";

    return (
        <div className="AdrTopbar">
            <div className="AdrTopbarLeft">
                <button className="AdrMenuButton" onClick={onToggleSidebar} type="button" aria-label="Open menu">
                    <span /><span /><span />
                </button>
                <h2 className="AdrTopbarTitle">{title}</h2>
            </div>
            <div className="AdrUser">
                <img className="user-avatar" />
                <div>
                    <strong id="currentusername"></strong>
                </div>
            </div>
        </div>
    );
};

export default GlobalTopNav;
