import * as React from "react";
import ClientButton from "../../../../Global/ClientButton";
import CustomPeoplePicker from "../../../../Global/CustomPeoplePicker";
// import CustomPeoplePicker from "../../../../Global/CustomPeoplePicker";
// import { NewLoader } from "../../../../Global/NewLoader";
// import CustomPeoplePicker from "../../../../Global/CustomPeoplePicker";
import { NewLoader } from "../../../../Global/NewLoader";
// import "../../../../Assets/css/newpage.css";

require("newnote");

export default class NewNote extends React.Component<{}, {}> {
  public render(): React.ReactElement {
    return (
      <>
        <NewLoader />
        <section className="hidden" id="newrequest-page">
          <div className="AdrPage">
            <div>
              <section className="AdrFormSection">
                <div className="AdrFormGrid">
                  <label className="AdrField">
                    <span className="meeting-date-label">
                      Meeting Date
                      <span className="required">*</span>
                      <span className="week hide-week">
                        Week: <b id="week-number" speed-bind="MeetingWeek">32</b>
                      </span>
                    </span>
                    <input type="date" speed-bind-validate="MeetingDate" />
                  </label>

                  <label className="AdrField">
                    <span className="meeting-type-label">
                      Meeting Type
                      <span className="required">*</span>
                      <span id="duration-container" className="week hide-week">
                        Required Time: <b id="duration" speed-bind="RequiredTime">0</b>
                      </span>
                    </span>
                    <select id="meeting-category" speed-bind-validate="MeetingCategory">
                    </select>
                    <div className="hidden top-space" id="meeting-type-container">
                      {/* <select id="meeting-type-selector" speed-bind-validate="MeetingType">
                      </select> */}
                    </div>
                  </label>
                </div>

                <div className="AdrFormGrid">
                  <label className="AdrField">
                    <span className="meeting-date-label">
                      Start Time / End Time
                      <span className="required">*</span>
                    </span>
                    <div className="time-pair">
                      <input type="time" id="start-time" />
                      <input type="time" id="end-time" />
                    </div>
                  </label>

                  <label className="AdrField">
                    <span className="meeting-date-label">
                      Time Keeper
                      <span className="required">*</span>
                    </span>
                    <CustomPeoplePicker
                        validate-control="false"
                        custom-people="TimeKeeper"
                      />
                  </label>
                </div>
              </section>

              {/* Main body */}
              <div className="body">
                {/* Attendance trio */}
                <div className="attendance-row">
                  <section className="card">
                    <div className="card-head">Attendance</div>
                    <div className="card-body person-list">
                      <CustomPeoplePicker
                        validate-control="false"
                        custom-people="Attendees"
                        multiple
                      />
                    </div>
                  </section>
                  
                  <section className="card">
                    <div className="card-head">Time-Off</div>
                    <div className="card-body">
                       <CustomPeoplePicker
                        validate-control="false"
                        custom-people="TimeOff"
                        multiple
                      />
                    </div>
                  </section>
                </div>
                <section className="card agenda-block">
                    <div className="card-head">
                      Absentees
                      <button type="button" id="add-absentee-btn" className="icon-btn" title="Add Absentee" style={{width: 22, height: 22, fontSize: 13}}>+</button>
                    </div>
                    <div className="card-body">
                      <table
                        className="AdrTable"
                        id="absentees-table"
                        speed-json="false"
                        speed-validate-mode="true"
                        speed-bind-table="Absentees"
                        speed-bind-auto="false"
                      >
                        <thead>
                          <tr>
                            <th speed-array-prop="person">Person</th>
                            <th speed-array-prop="reason">Reason</th>
                            <th
                            speed-array-prop="action"
                            speed-exclude-result="true"
                          >
                            Action
                          </th>
                          </tr>
                        </thead>
                        <tbody id="absentees-container" />
                      </table>
                    </div>
                  </section>
                {/* Presenter / Engagement */}
                <div className="people-row">
                  <section className="card">
                    <div className="card-head">Presenter</div>
                    <div className="card-body chip-list">
                      <div className="chip">
                         <CustomPeoplePicker
                            validate-control="true"
                            custom-people="Presenter"
                            speed-validate-msg="Please select a presenter"
                            multiple
                          />
                      </div>
                    </div>
                  </section>
                  <section className="card">
                    <div className="card-head">Engagement Participant</div>
                    <div className="card-body chip-list">
                      <div className="chip">
                         <CustomPeoplePicker
                            validate-control="false"
                            custom-people="EngagementParticipant"
                            speed-validate-msg="Please select engagement participants"
                            multiple
                          />
                      </div>
                    </div>
                  </section>
                </div>
                {/* Agenda */}
                <section className="card agenda-block">
                  <div className="card-head">
                    Agenda
                    <button type="button" id="add-agenda-btn" className="icon-btn" title="Add Agenda" style={{width: 22, height: 22, fontSize: 13}}>+</button>
                  </div>
                  <div className="card-body">
                    <table
                      className="AdrTable"
                      id="agenda-table"
                      speed-json="false"
                      speed-validate-mode="true"
                      speed-bind-table="Agenda"
                      speed-bind-auto="false"
                    >
                      <thead>
                        <tr>
                          <th speed-array-prop="agenda">Agenda</th>
                          <th
                            speed-array-prop="action"
                            speed-exclude-result="true"
                            >Action</th>
                        </tr>
                      </thead>
                      <tbody id="agenda-container" />
                    </table>
                  </div>
                </section>

                {/* Discussion points */}
                <section className="card agenda-block">
                  <div className="card-head">Discussion Points
                    <button type="button" id="add-discussion-button" className="icon-btn" title="Add Discussion" style={{width: 22, height: 22, fontSize: 13}}>+</button>
                  </div>
                  <div className="card-body">
                     <table
                      className="AdrTable"
                      id="discussion-table"
                      speed-json="false"
                      speed-validate-mode="true"
                      speed-bind-table="Discussion"
                      speed-bind-auto="false"
                    >
                      <thead>
                        <tr>
                          <th speed-array-prop="discussion">Discussion</th>
                          <th
                            speed-array-prop="action"
                            speed-exclude-result="true"
                            >Action</th>
                        </tr>
                      </thead>
                      <tbody id="discussion-container" />
                    </table>
                  </div>
                </section>
                {/* Action items – list + modal form */}
                <section className="card actions-block">
                  <div className="card-head">
                    Action Items
                    <button
                      type="button"
                      id="open-action-modal-btn"
                      className="icon-btn"
                      title="Add action item"
                      style={{ width: 22, height: 22, fontSize: 13 }}
                    >
                      +
                    </button>
                  </div>
                  <div className="card-body" style={{ padding: 0 }}>
                    <div className="actions-blank" id="actions-list" />
                  </div>
                </section>

                {/* Action item modal */}
                <div id="action-item-modal" className="ai-modal hidden" aria-hidden="true">
                  <div className="ai-modal-backdrop" id="action-modal-backdrop" />
                  <div className="ai-modal-panel" role="dialog" aria-labelledby="action-modal-title">
                    <div className="ai-modal-head">
                      <h3 id="action-modal-title">Add Action Item</h3>
                      <button type="button" className="ai-modal-close" id="close-action-modal" title="Close">
                        ×
                      </button>
                    </div>
                    <div className="ai-modal-body">
                      <div className="ai-form-grid">
                        <label className="ai-field">
                          <span>Assign to</span>
                          <select id="action-type" className="form-select">
                            <option value="">Select type…</option>
                            <option value="Division">Division</option>
                            <option value="Person">Person</option>
                          </select>
                        </label>
                        <label className="ai-field">
                          <span>Assignee</span>
                          <div id="action-assignee-container">
                            <select id="action-assignee" className="form-select" disabled>
                              <option value="">Select type first…</option>
                            </select>
                          </div>
                        </label>
                        <label className="ai-field ai-field-full">
                          <span>Task</span>
                          <textarea id="action-task" rows={3} placeholder="What needs to be done?" />
                        </label>
                        <label className="ai-field">
                          <span>Due date</span>
                          <input type="date" id="action-due-date" />
                        </label>
                        <label className="ai-field ai-field-full">
                          <span>Action plan <em>(optional)</em></span>
                          <textarea id="action-plan" rows={2} placeholder="How will this be done?" />
                        </label>
                      </div>
                    </div>
                    <div className="ai-modal-foot">
                      <button type="button" className="ai-btn ai-btn-ghost" id="cancel-action-modal">
                        Cancel
                      </button>
                      <button type="button" className="ai-btn ai-btn-primary" id="add-task-btn">
                        Add item
                      </button>
                    </div>
                  </div>
                </div>

                {/* AOB */}
                <section className="card aob-block">
                  <div className="card-head">AOB</div>
                  <div className="card-body">
                    <textarea speed-bind="AOB" placeholder="Any other business…" />
                  </div>
                </section>
              </div>
            </div>


            <div className="AdrFormActions">
              <a href="#/" className="AdrSecondaryButton" type="button">
                Cancel
              </a>
              <ClientButton
                func="NewNoteComponent.confirmSubmit"
                clax="AdrSecondaryButton draftbtn"
                prop="Draft"
                attr="id='draftbtn"
              >
                Save for Later
              </ClientButton>

              <ClientButton
                func="NewNoteComponent.confirmSubmit"
                clax="AdrPrimaryButton"
                prop="submit"
                attr=""
              >
                Submit
              </ClientButton>
            </div>
          </div>
        </section>
      </>
    );
  }

  public componentDidMount(): void {
    window.loadNewNoteComponent();
  }
}