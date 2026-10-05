import * as React from "react";
import { NewLoader } from "../../../../Global/NewLoader";
// import { NewLoader } from "../../../../Global/NewLoader";
// import { FilterBox } from "../../../../Global/FilterBox";
require("meetingtasks");

export default class MeetingTasks extends React.Component<{}, {}> {
  public render(): React.ReactElement {
    return (
      <>
        <NewLoader />
        <div className="hidden" id="meetingtasks-page">
          <div className="AdrPage">
            <section className="AdrStatsGrid">
              <article>
                <span>Total Tasks</span>
                <strong id="totalRequest"></strong>
              </article>
              <article>
                <span>Pending Tasks</span>
                <strong id="pendingRequest"></strong>
              </article>
              <article>
                <span>Closed Tasks</span>
                <strong id="completedRequest"></strong>
              </article>
            </section>

            <section className="AdrPanel">

              <div className="AdrReportControls filter-container" role="tabpanel">
                <div className="AdrFormGrid left-filter-grid" >
                  <label className="AdrField">
                    <span>Status</span>
                    <select id="status-filter" speed-bind-query="Approval_Status" speed-operator="Eq">
                      <option value="">All</option>
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </label>
                  <label className="AdrField">
                    <span>Task Description</span>
                    <input placeholder="Search records"  id="searchInput"/>
                  </label>
                </div>
                <button className="AdrPrimaryButton" type="button" id="exportToExcel"><span>⇩</span> Export to Excel</button>

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
    window.loadMeetingTasksComponent();
  }
}
