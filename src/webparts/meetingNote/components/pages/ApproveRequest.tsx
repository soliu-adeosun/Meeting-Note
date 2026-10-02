import * as React from "react";
import ClientButton from "../../../../Global/ClientButton";
import { NewLoader } from "../../../../Global/NewLoader";
// import { NewLoader } from "../../../../Global/NewLoader";
// import CustomPeoplePicker from "../../../../Global/CustomPeoplePicker";

require("approverequest");
require("peoplepicker");

export default class ApproveRequest extends React.Component<{}, {}> {
  public render(): React.ReactElement {
    return (
      <>
        <NewLoader />
        <section className="hidden" id="approval-page">
          <div className="AdrPage">
            <section className="AdrCompactHero">
              <div>
                <span className="AdrEyebrow">Approve Request</span>
                <h3>APPROVAL PAGE</h3>
              </div>
            </section>

            <section className="AdrFormSection">
              <div className="AdrFormGrid">
                <label className="AdrField">
                  <span>Request Type</span>
                  <input readOnly type="text" speed-bind="RequestType" />
                  <div id="modificationTypeContainer" />
                </label>
              </div>

              <div className="AdrFormGrid top-space hidden" id="minorModificationFields">
                <label className="AdrField" id="modificationProcessNameField">
                  <span>Process Name</span>
                  <div id="modificationProcessNameContainer" />
                </label>

                <label
                  className="AdrField"
                  id="modificationApplicationLinkField"
                >
                  <span>Link to Application</span>
                  <div id="modificationApplicationLinkContainer" />
                </label>

                <label
                  className="AdrField"
                  id="modificationCurrentFunctionalityField"
                >
                  <span>
                    Current functionality (What does the system do today?)
                  </span>
                  <div id="modificationCurrentFunctionalityContainer" />
                </label>

                <label
                  className="AdrField"
                  id="modificationWhatShouldChangeField"
                >
                  <span>What should change?</span>
                  <div id="modificationWhatShouldChangeContainer" />
                </label>

                <label className="AdrField" id="modificationReasonField">
                  <span>
                    Reason / justification (Why is this change needed?)
                  </span>
                  <div id="modificationReasonContainer" />
                </label>

                <label
                  className="AdrField"
                  id="modificationSystemsAffectedField"
                >
                  <span>Systems / users affected</span>
                  <div id="modificationSystemsAffectedContainer" />
                </label>

                <label className="AdrField" id="modificationDateNeededField">
                  <span>Date needed</span>
                  <div id="modificationDateNeededContainer" />
                </label>
              </div>
            </section>

            <div id="mainRequestFormWrapper" className="hidden">
              <section className="AdrFormSection">
                <div className="AdrSectionHeader">
                  <span>1</span>
                  <div>
                    <h3>Process Overview</h3>
                    {/* <p>Request owner and submission date.</p> */}
                  </div>
                </div>
                <div className="AdrFormGrid">
                  <label className="AdrField">
                    <span>
                      What is the name of the process you want to automate?
                    </span>
                    <input
                      readOnly
                      placeholder="Enter text"
                      speed-bind="ProcessName"
                    />
                  </label>
                  <label className="AdrField">
                    <span>How often does this process happen?</span>
                    <input
                      type="text"
                      readOnly
                      name="period"
                      speed-bind="Period"
                      id="period"
                    />
                  </label>

                  <label className="AdrField">
                    <span>Date Required</span>
                    <input
                      type="text"
                      readOnly
                      placeholder="Enter text"
                      speed-bind="DateRequired"
                    />
                  </label>
                  <label className="AdrField">
                    <span>
                      Which divisions/units/teams are involved in this process?
                    </span>
                    <select
                      id="divisionsInvolved"
                      className="js-select2"
                      multiple
                      speed-bind="DivisionsInvolved"
                      speed-bind-class="MainRequest"
                      speed-list-repeat="RSDivisions"
                      speed-no-default="true"
                    >
                      <option value="{{Title}}">
                        {"{{"}Title{"}}"}
                      </option>
                    </select>
                  </label>
                </div>

                <div className="table-wrapper">
                  <div className="tableLabel">
                    <span>Step-by-step description of the process</span>
                    {/* <button
                    className="AdrAddButton"
                    id="stepByStepButton"
                    type="button"
                  >
                    + Add New Row
                  </button> */}
                  </div>
                  <div className="AdrTableShell">
                    <table
                      className="AdrTable"
                      id="stepByStepTable"
                      speed-serialno="true"
                      speed-validate-mode="false"
                      speed-bind-table="StepByStepProcess"
                    >
                      <thead>
                        <tr>
                          <th>Stage</th>
                          <th speed-array-prop="description">
                            What Happens (describe clearly)
                          </th>
                          <th speed-array-prop="actors">
                            Who Does It / Who Is Involved
                          </th>
                          <th speed-array-prop="template">Who To Be Notified</th>
                        </tr>
                      </thead>
                      <tbody id="stepByStepDescription" />
                    </table>
                  </div>
                </div>

                <div className="AdrFormGrid">
                  <label className="AdrField">
                    <span>
                      Are there any existing automated systems already handling
                      part of this process?
                    </span>
                    <textarea
                      readOnly
                      placeholder="Enter text"
                      speed-bind="ExistingLink"
                    />
                  </label>

                  <label className="AdrField">
                    <span>What marks the process as complete?</span>
                    <textarea
                      readOnly
                      placeholder="Enter text"
                      speed-bind="CriteriaForCompletion"
                    />
                  </label>

                  <label className="AdrField">
                    <span>
                      Are there any related processes that connect to this one?
                    </span>
                    <input
                      readOnly
                      type="text"
                      id="isProcessRelated"
                      speed-bind="IsProcessRelated"
                    />
                    <div id="relatedProcessContainer" />
                  </label>
                  <label className="AdrField">
                    <span>
                      Attach relevant forms and flowchart for this process
                    </span>
                    <div speed-file-bind="SupportingDocuments" data-view-only />
                  </label>
                </div>
              </section>

              <section className="AdrFormSection">
                <div className="AdrSectionHeader">
                  <span>2</span>
                  <div>
                    <h3>Data & Information Requirements</h3>
                    {/* <p>Request owner and submission date.</p> */}
                  </div>
                </div>

                <div className="AdrFormGrid">
                  <label className="AdrField">
                    <span>
                      Do you require any information to be automatically pulled
                      from another system?
                    </span>
                    <input
                      readOnly
                      type="text"
                      speed-bind="PullDataFromAnotherSystem"
                    />
                    <div id="pullDataContainer" />
                  </label>

                  {/* <label className="AdrField">
                  <span>How long should records be kept in the system?</span>
                  <input readOnly type="text" speed-bind="RetentionPeriod" />

                  <div id="retentionContainer" />
                </label> */}
                </div>
              </section>

              <section className="AdrFormSection">
                <div className="AdrSectionHeader">
                  <span>3</span>
                  <div>
                    <h3>Approvals, Reviews & Workflow Routing</h3>
                    {/* <p>Request owner and submission date.</p> */}
                  </div>
                </div>

                <div className="AdrFormGrid">
                  <label className="AdrField">
                    <span>
                      Does this process require any approvals or sign-offs?
                    </span>
                    <input
                      readOnly
                      type="text"
                      speed-bind="IsApprovalsNeeded"
                    />
                  </label>
                </div>

                <div className="table-wrapper" id="approvalStagesContainer">
                  <div className="tableLabel">
                    <span>List all approval stages in order</span>
                    {/* <button
                    className="AdrAddButton"
                    id="addApproverButton"
                    type="button"
                  >
                    + Add New Row
                  </button> */}
                  </div>
                  <div className="AdrTableShell">
                    <table
                      className="AdrTable"
                      id="approvalTable"
                      speed-serialno="true"
                      speed-validate-mode="false"
                      speed-bind-table="Approvers"
                    >
                      <thead>
                        <tr>
                          <th>Stage</th>
                          <th speed-array-prop="approver">
                            Approver (Job Title)
                          </th>
                          <th speed-array-prop="reason">
                            What Triggers This Approval?
                          </th>
                          <th speed-array-prop="approved">
                            What Happens If Approved?
                          </th>
                          <th speed-array-prop="declined">
                            What Happens If Declined?
                          </th>
                        </tr>
                      </thead>
                      <tbody id="approvalStages" />
                    </table>
                  </div>
                </div>
                <div className="AdrFormGrid">
                  <label className="AdrField">
                    <span>
                      Are there any conditions that change the approval path?
                    </span>
                    <input
                      readOnly
                      type="text"
                      id="retentionPeriod"
                      speed-bind="ConditionalApproval"
                    />

                    <div id="approvalsContainer" />
                  </label>

                  {/* <label className="AdrField">
                  <span>
                    What is the maximum time allowed at each approval stage
                  </span>
                  <input readOnly
                    placeholder="Enter number in hours"
                    type="number"
                    speed-bind="MaxApprovalTime"
                  />
                </label> */}

                  <label className="AdrField">
                    <span>
                      Who can delegate or act on behalf of an approver when they
                      are unavailable?
                    </span>
                    <input
                      readOnly
                      placeholder="Enter text"
                      type="text"
                      speed-bind="Delegate"
                    />
                  </label>
                </div>
              </section>

              <section className="AdrFormSection">
                <div className="AdrSectionHeader">
                  <span>4</span>
                  <div>
                    <h3>User Roles & Access Control</h3>
                    {/* <p>Request owner and submission date.</p> */}
                  </div>
                </div>

                <div className="AdrFormGrid">
                  <label className="AdrField">
                    <span>
                      Apart from the ones listed in Section 1, are there other users of this system?
                      <span className="required">*</span>
                    </span>
                    <input
                      readOnly
                      type="text"
                      id="isOtherUsersNeeded"
                      speed-bind="IsOtherUsersNeeded"
                    />
                  </label>
                </div>

                <div className="table-wrapper" id="userAccessContainer">
                  <div className="tableLabel">
                    <span>
                      Who are the different types of users of this system?
                    </span>
                    {/* <button
                    className="AdrAddButton"
                    id="addUserAccessButton"
                    type="button"
                  >
                    + Add New Row
                  </button> */}
                  </div>
                  <div className="AdrTableShell">
                    <table
                      className="AdrTable"
                      id="userAccess"
                      speed-serialno="true"
                      speed-validate-mode="false"
                      speed-bind-table="UserAccess"
                    >
                      <thead>
                        <tr>
                          <th>S/N</th>
                          <th speed-array-prop="role">
                            User Type / Role (e.g Requestor)
                          </th>
                          <th speed-array-prop="feature">
                            What Can They Do in the System? (e.g. Submit new
                            requests, view own submissions, edit before
                            submission)
                          </th>
                          <th speed-array-prop="user">
                            Who Belongs to This Group? (e.g. All Staff)
                          </th>
                        </tr>
                      </thead>
                      <tbody id="userAccessBody" />
                    </table>
                  </div>
                </div>

                <div className="AdrFormGrid">
                  <label className="AdrField">
                    <span>
                      Are there records that some users should NOT be able to
                      see?
                    </span>
                    <textarea
                      readOnly
                      placeholder="Enter text"
                      name="revokeUser"
                      id="revokeUser"
                      speed-bind="RevokeUser"
                    ></textarea>
                  </label>

                  <label className="AdrField">
                    <span>
                      Who should be the Process Owner (main overseer) of this
                      system?
                    </span>
                    <input
                      readOnly
                      placeholder="Enter text"
                      type="text"
                      speed-bind="ProcessOwner"
                    />
                  </label>
                </div>
              </section>

              <section className="AdrFormSection">
                <div className="AdrSectionHeader">
                  <span>5</span>
                  <div>
                    <h3>Other Features</h3>
                    {/* <p>Request owner and submission date.</p> */}
                  </div>
                </div>

                <div className="AdrTableShell">
                  <table className="AdrTable" id="extraFeaturesTable">
                    <thead>
                      <tr>
                        <th>Check box if needed</th>
                        <th>Feature</th>
                        <th>Note</th>
                      </tr>
                    </thead>
                    <tbody />
                  </table>
                </div>

                <div className="AdrFormGrid">
                  <label className="AdrField">
                    <span>
                      Are there any features not listed above that you think the
                      system should have?
                    </span>
                    <textarea
                      readOnly
                      placeholder="Enter text"
                      name="otherFeatures"
                      id="otherFeatures"
                      speed-bind="OtherFeatures"
                    ></textarea>
                  </label>
                </div>

                <div className="table-wrapper">
                  <div className="tableLabel">
                    <span>
                      What reports/summaries/analytics do you need from this
                      system?
                    </span>
                    {/* <button
                    className="AdrAddButton"
                    id="addReportButton"
                    type="button"
                  >
                    + Add New Row
                  </button> */}
                  </div>
                  <div className="AdrTableShell">
                    <table
                      className="AdrTable"
                      id="reportTable"
                      speed-serialno="true"
                      speed-validate-mode="false"
                      speed-bind-table="Reports"
                    >
                      <thead>
                        <tr>
                          <th>S/N</th>
                          <th speed-array-prop="name">
                            Report Name / Description
                          </th>
                          <th speed-array-prop="users">Who needs it?</th>
                          <th speed-array-prop="interval">
                            How often? (Daily/Weekly/Monthly/On Demand)
                          </th>
                        </tr>
                      </thead>
                      <tbody id="reportsBody" />
                    </table>
                  </div>
                </div>
              </section>
            </div>

            <div id="approverSection" className="AdrFormSection" />
            <div id="devApproverSection" className="AdrFormSection" />


            <section className="AdrFormSection">
              <div className="commentContainer">
                <label className="AdrField">
                  <span>Comment</span>
                  <textarea
                    id="approvercomment"
                    speed-bind-validate="Comment"
                    speed-include-control="false"
                    speed-as-static="true"
                    speed-validate-type="Comment"
                    speed-event-switch="false"
                    speed-validate-msg="Please tell us why you want to decline this process!"
                  />
                </label>
              </div>
            </section>
            <div className="AdrFormActions">
              <a
                href="#/"
                className="AdrSecondaryButton center-text"
                type="button"
              >
                Cancel
              </a>
              <ClientButton
                func="ApproveRequestComponent.confirmSubmit"
                clax="AdrSecondaryButton"
                prop="Declined"
                attr="id='declineBtn'"
              >
                Decline
              </ClientButton>

              <ClientButton
                func="ApproveRequestComponent.confirmSubmit"
                clax="AdrSecondaryButton"
                prop="Revise"
              >
                More Info
              </ClientButton>

              <ClientButton
                func="ApproveRequestComponent.confirmSubmit"
                clax="AdrPrimaryButton"
                prop="Approved"
              >
                Approve
              </ClientButton>
            </div>

            <section className="AdrFormSection">
              <div className="AdrSectionHeader">
                <div>
                  <h3>Audit Log</h3>
                </div>
              </div>

              <div className="AdrTableShell">
                <table className="AdrTable">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Stage</th>
                      <th>Action</th>
                      <th>Comment</th>
                      <th>Action Time</th>
                    </tr>
                  </thead>
                  <tbody id="logs" />
                </table>
              </div>
            </section>
          </div>
        </section>
      </>
    );
  }

  public componentDidMount(): void {
    window.loadApproveRequestComponent();
  }
}
