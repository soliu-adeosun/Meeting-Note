import * as React from "react";
import { NewLoader } from "../../../../Global/NewLoader";
// import {useNavigate} from "react-router-dom";
// import { NewLoader } from "../../../../Global/NewLoader";
// import ClientButton from "../../../../Global/ClientButton";

require("previousnotes");

export default class PreviousNotes extends React.Component<{}, {}> {
  public render(): React.ReactElement {
    return (
      <>
        <NewLoader />
        <div className="hidden" id="previousnotes-page">
          <div className="AdrPage">

            <section className="AdrPanel">
              <div
                className="AdrReportControls filter-container"
                role="tabpanel"
              >
                <div className="AdrFormGrid left-filter-grid three-column">
                  <label className="AdrField">
                    <span>Meeting Category</span>
                    <select
                      id="status-filter"
                      speed-bind-query="MeetingCategory"
                      speed-operator="Eq"
                    >
                      <option value="">All</option>
                      <option value="Division/Unit Meeting">
                        Division/Unit Meeting
                      </option>
                      <option value="Organizational Meeting">
                        Organizational Meeting
                      </option>
                      <option value="Strategy Meeting">Strategy Meeting</option>
                      <option value="Committee Meeting">
                        Committee Meeting
                      </option>
                      <option value="Adhoc Meeting">Adhoc Meeting</option>
                    </select>
                  </label>
                  <label className="AdrField">
                    <span>Meeting Type</span>
                    <select
                      id="status-filter-type"
                      speed-bind-query="MeetingType"
                      speed-operator="Eq"
                    ></select>
                  </label>
                  <label className="AdrField">
                    <span>Search Note</span>
                    <input
                      placeholder="Search by Reference ID/Meeting Type"
                      id="searchInput"
                    />
                  </label>
                </div>
                {/* <button className="AdrPrimaryButton" type="button" id="exportToExcel"><span>⇩</span> Export to Excel</button> */}
              </div>

              <div className="table-wrap">
                <div className="norequest hidden text-center py-6 text-gray-500 text-sm sm:text-base">
                  No entries at the moment...
                </div>
                <div className="AdrTableShell hidden" id="tasktable">
                  <table className="AdrTable">
                    <thead>
                      <tr>
                        <th>S/N</th>
                        <th speed-table-data="ReferenceID">Meeting ID</th>
                        <th speed-table-data="MeetingCategory">
                          Meeting Category
                        </th>
                        <th speed-table-data="MeetingType">Meeting Type</th>
                        <th speed-table-data="MeetingDate">Meeting Date</th>
                        <th speed-table-data="Status">Status</th>
                      </tr>
                    </thead>
                    <tbody id="speed-data-table"></tbody>
                  </table>
                </div>
                <div id="myrequestpagination" className="pagination" />
              </div>
            </section>
          </div>
        </div>
      </>
    );
  }

  public componentDidMount(): void {
    window.loadPreviousNotesComponent();
  }
}
