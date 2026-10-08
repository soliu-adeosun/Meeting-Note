import * as React from "react";
import { NewLoader } from "../../../../Global/NewLoader";

require("mynotes");
require("peoplepicker");

/**
 * Unified notes list with two tabs:
 *  - My Notes: notes I created (Reporter = me), drafts + submitted
 *  - Previous Notes: submitted notes I created or attended
 */
export default class MyNotes extends React.Component<{}, {}> {
  public render(): React.ReactElement {
    return (
      <>
        <NewLoader />
        <section className="hidden" id="mynotes-page">
          <div className="AdrPage">
            {/* Tabs */}
            <div className="notes-tabs" role="tablist" aria-label="Notes views">
              <button
                type="button"
                className="notes-tab active"
                role="tab"
                id="tab-my-notes"
                data-tab="my"
                aria-selected="true"
              >
                My Notes
              </button>
              <button
                type="button"
                className="notes-tab"
                role="tab"
                id="tab-previous-notes"
                data-tab="previous"
                aria-selected="false"
              >
                Previous Notes
              </button>
            </div>

            <section className="AdrStatsGrid" id="notes-stats">
              <article>
                <span id="stat-label-total">Total Notes</span>
                <strong id="totalRequest"></strong>
              </article>
              <article id="stat-drafts">
                <span>Drafted Notes</span>
                <strong id="pendingRequest"></strong>
              </article>
              <article>
                <span id="stat-label-submitted">Submitted Notes</span>
                <strong id="completedRequest"></strong>
              </article>
            </section>

            <section className="AdrPanel">
              <div className="AdrReportControls filter-container" role="tabpanel">
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
                    />
                  </label>
                  <label className="AdrField">
                    <span>Search Note</span>
                    <input
                      placeholder="Search by Reference ID / Meeting Type"
                      id="searchInput"
                    />
                  </label>
                </div>
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
                    <tbody id="speed-data-table" />
                  </table>
                </div>
                <div id="myrequestpagination" className="pagination" />
              </div>
            </section>
          </div>
        </section>
      </>
    );
  }

  public componentDidMount(): void {
    window.loadMyNotesComponent();
  }
}