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
                <span>Total Requests</span>
                <strong id="totalRequest"></strong>
                <p>All saved and submitted requests</p>
              </article>
              <article>
                <span>Pending Approval</span>
                <strong id="pendingRequest"></strong>
                <p>Awaiting approvals</p>
              </article>
              <article>
                <span>Closed</span>
                <strong id="completedRequest"></strong>
                <p>Fully signed off / Closed</p>
              </article>
            </section>

            <section className="AdrPanel">
              <div className="AdrPanelHeader">
                <div>
                  <h3>Recent Requests</h3>
                  <p>Most recently submitted requests across all divisions</p>
                </div>
              </div>

              <div className="AdrReportControls filter-container" role="tabpanel">
                <div className="AdrFormGrid left-filter-grid" >
                  <label className="AdrField">
                    <span>Status</span>
                    <select id="status-filter" speed-bind-query="Approval_Status" speed-operator="Eq">
                      <option value="">All</option>
                      <option value="Draft">Draft</option>
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Declined">Declined</option>
                    </select>
                  </label>
                  <label className="AdrField">
                    <span>Requestor / Ref ID</span>
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
                        <th speed-table-data="MeetingCategory">Meeting Category</th>
                        <th speed-table-data="MeetingType">Meeting Type</th>
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
