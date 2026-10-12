import * as React from "react";
import { NewLoader } from "../../../../Global/NewLoader";

require("alltasks");

/**
 * Admin-style list of ALL meeting tasks (any assignee).
 */
export default class AllTasks extends React.Component<{}, {}> {
  public render(): React.ReactElement {
    return (
      <>
        <NewLoader />
        <div className="hidden" id="alltasks-page">
          <div className="AdrPage">
            <section className="AdrStatsGrid">
              <article>
                <span>Total Tasks</span>
                <strong id="totalRequest"></strong>
              </article>
              <article>
                <span>Not Started / In Progress</span>
                <strong id="pendingRequest"></strong>
              </article>
              <article>
                <span>Completed</span>
                <strong id="completedRequest"></strong>
              </article>
            </section>

            <section className="AdrPanel">
              <div className="AdrReportControls filter-container" role="tabpanel">
                <div className="AdrFormGrid left-filter-grid three-column">
                  <label className="AdrField">
                    <span>Status</span>
                    <select id="status-filter">
                      <option value="">All</option>
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </label>
                  <label className="AdrField">
                    <span>Search</span>
                    <input
                      placeholder="Search task / assignee / meeting ID"
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
                        <th speed-table-data="Task">Description</th>
                        <th speed-table-data="Title">Task Category</th>
                        <th speed-table-data="Name">Assignee</th>
                        <th speed-table-data="ReferenceID">Meeting ID</th>
                        <th speed-table-data="DueDate">Due Date</th>
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
    window.loadAllTasksComponent();
  }
}