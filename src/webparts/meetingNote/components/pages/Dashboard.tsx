import * as React from "react";
import { NewLoader } from "../../../../Global/NewLoader";
// import {useNavigate} from "react-router-dom";
// import { NewLoader } from "../../../../Global/NewLoader";
// import ClientButton from "../../../../Global/ClientButton";

require("dashboard");

export default class Dashboard extends React.Component<{}, {}> {
  public render(): React.ReactElement {
    return (
        <>
            <NewLoader />
            <div className="hidden" id="dashboard-page">
                <div className="AdrPage">
                    <section className="AdrHero">
                        <div>
                            <h2>Application Development Requests</h2>
                        </div>
                        {/* <button className="AdrPrimaryButton" type="button">+ New Request</button> */}
                    </section>

                    <section className="AdrStatsGrid">
                        <article>
                            <span>Total Requests</span>
                            <strong id="totalRequest"></strong>
                            <p>All submitted requests</p>
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
                        <div id='dashboard-tabs' />
                        <div className="table-wrap">
                            <div className="norequest hidden text-center py-6 text-gray-500 text-sm sm:text-base">
                                No entries at the moment...
                            </div>
                            <div className="AdrTableShell hidden" id="tasktable">
                                <table className="AdrTable">
                                    <thead>
                                        <tr>
                                            <th>S/N</th>
                                            <th speed-table-data="WorkflowRequestID">Request ID</th>
                                            <th speed-table-data="ProcessName">Process Name</th>
                                            <th speed-table-data="Title">Requestor</th>
                                            <th speed-table-data="Division">Division</th>
                                            <th speed-table-data="RequestCreated">Date</th>
                                            <th speed-table-data="Approval_Status">Status</th>
                                            <th speed-table-data="Modified">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody id="speed-data-table">
                                    </tbody>
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
    window.loadDashboardComponent();
  }
}
