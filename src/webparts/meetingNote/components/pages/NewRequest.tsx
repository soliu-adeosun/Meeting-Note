import * as React from "react";
import ClientButton from "../../../../Global/ClientButton";
import CustomPeoplePicker from "../../../../Global/CustomPeoplePicker";
// import CustomPeoplePicker from "../../../../Global/CustomPeoplePicker";
// import { NewLoader } from "../../../../Global/NewLoader";
// import CustomPeoplePicker from "../../../../Global/CustomPeoplePicker";
import { NewLoader } from "../../../../Global/NewLoader";
// import "../../../../Assets/css/newpage.css";

require("newrequest");

export default class NewRequest extends React.Component<{}, {}> {
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
                      <input type="time" id="start-time" speed-bind-validate="StartTime" />
                      <input type="time" id="end-time" speed-bind-validate="EndTime" />
                    </div>
                  </label>

                  <label className="AdrField">
                    <span className="meeting-date-label">
                      Duration
                      <span className="required">*</span>
                    </span>
                    <input type="text" id="duration" readOnly speed-bind-validate="Duration" />
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
                {/* Task items */}
                
                <section className="card actions-block">
                  <div className="card-head">
                    Task Items
                    <button
                      type="button"
                      id="add-task-btn"
                      className="icon-btn"
                      title="Add Task"
                      style={{ width: 22, height: 22, fontSize: 13 }}
                    >
                      +
                    </button>
                  </div>

                  <div className="card-body" style={{ padding: 0 }}>
                    <table className="actions-table">
                      <thead>
                        <tr>
                          <th>Subdivision / Person</th>
                          <th>Task</th>
                          <th>Due Date</th>
                          <th>Action Plan</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <select id="action-type" className="form-select">
                              <option value="">Select...</option>
                              <option value="Division">Division</option>
                              <option value="Person">Person</option>
                            </select>

                            <div id="action-assignee-container" style={{ marginTop: 6 }} />
                          </td>

                          <td>
                            <textarea id="action-task" placeholder="Task" />
                          </td>

                          <td>
                            <input type="date" id="action-due-date" />
                          </td>

                          <td>
                            <textarea id="action-plan" placeholder="Action plan" />
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="actions-blank" />
                  </div>
                </section>

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
                func="NewRequestComponent.confirmSubmit"
                clax="AdrSecondaryButton draftbtn"
                prop="Draft"
                attr="id='draftbtn"
              >
                Save for Later
              </ClientButton>

              <ClientButton
                func="NewRequestComponent.confirmSubmit"
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
    window.loadNewRequestComponent();
  }
}
