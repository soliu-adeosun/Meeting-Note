import * as React from "react";
import { NewLoader } from "../../../../Global/NewLoader";

require("viewtask");

/**
 * Single meeting task detail.
 * Status is editable unless the task is already Completed.
 */
export default class ViewTask extends React.Component<{}, {}> {
  public render(): React.ReactElement {
    return (
      <>
        <NewLoader />
        <div className="hidden" id="viewtask-page">
          <div className="vn-page">
            <header className="vn-hero">
              <div className="vn-hero-top">
                <a href="#/" className="vn-back" id="vt-back-link">
                  ← Back to Meeting Tasks
                </a>
              </div>

              <div className="vn-hero-main">
                <div className="vn-title-block">
                  <p className="vn-eyebrow">Action Item</p>
                  <h1 className="vn-title" id="vt-task-title">
                    —
                  </h1>
                  <p className="vn-ref">
                    Meeting: <span id="vt-reference">—</span>
                  </p>
                </div>
                <div className="vn-badge-stack">
                  <span className="vn-status" id="vt-status-badge">
                    —
                  </span>
                </div>
              </div>

              <div className="vn-meta" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
                <div className="vn-meta-item">
                  <span className="vn-meta-label">Assignee</span>
                  <strong id="vt-name">—</strong>
                </div>
                <div className="vn-meta-item">
                  <span className="vn-meta-label">Type</span>
                  <strong id="vt-type">—</strong>
                </div>
                <div className="vn-meta-item">
                  <span className="vn-meta-label">Email</span>
                  <strong id="vt-email">—</strong>
                </div>
                <div className="vn-meta-item">
                  <span className="vn-meta-label">Due Date</span>
                  <strong id="vt-due">—</strong>
                </div>
              </div>
            </header>

            <div className="vn-body" style={{ gridTemplateColumns: "1fr" }}>
              <section className="vn-card">
                <div className="vn-card-head">
                  <h2>Task</h2>
                </div>
                <div className="vn-card-body">
                  <p className="vn-aob" id="vt-task-body">
                    —
                  </p>
                </div>
              </section>

              <section className="vn-card">
                <div className="vn-card-head">
                  <h2>Action Plan</h2>
                </div>
                <div className="vn-card-body">
                  <p className="vn-aob" id="vt-action-plan">
                    —
                  </p>
                </div>
              </section>

              <section className="vn-card">
                <div className="vn-card-head">
                  <h2>Update Status</h2>
                </div>
                <div className="vn-card-body">
                  <label className="vt-status-field">
                    <span>Status</span>
                    <select id="vt-status-select" className="vt-status-select">
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </label>
                  <p className="vt-status-hint" id="vt-status-hint">
                    You can change the status until this task is marked Completed.
                  </p>
                  <div className="vt-status-actions">
                    <button
                      type="button"
                      className="vn-btn vn-btn-secondary"
                      id="vt-save-status"
                    >
                      Save Status
                    </button>
                  </div>
                </div>
              </section>
            </div>

            <footer className="vn-footer">
              <a href="#/" className="vn-btn vn-btn-secondary" id="vt-footer-back">
                Back
              </a>
              <a href="#" className="vn-btn vn-btn-secondary" id="vt-open-note">
                Open Meeting Note
              </a>
            </footer>
          </div>
        </div>
      </>
    );
  }

  public componentDidMount(): void {
    window.loadViewTaskComponent();
  }
}