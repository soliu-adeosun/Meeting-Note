import * as React from "react";
import { NewLoader } from "../../../../Global/NewLoader";
import "../../../../Assets/css/viewnote.css";

require("viewnote");

/**
 * Read-only meeting note detail view.
 * Mirrors every section from NewNote in a polished minutes layout.
 * Data is injected by viewnote.js into the #vn-* placeholders.
 */
export default class ViewNote extends React.Component<{}, {}> {
  public render(): React.ReactElement {
    return (
      <>
        <NewLoader />
        <div className="hidden" id="viewnote-page">
          <div className="vn-page">
            {/* ── Hero ─────────────────────────────────────────── */}
            <header className="vn-hero">
              <div className="vn-hero-top">
                <a href="#/mynotes" className="vn-back" title="Back to My Notes">
                  ← Back to My Notes
                </a>
                <div className="vn-hero-actions">
                  {/* <button type="button" className="vn-btn vn-btn-ghost hidden" id="vn-print-btn">
                    Print
                  </button> */}
                </div>
              </div>

              <div className="vn-hero-main">
                <div className="vn-title-block">
                  <p className="vn-eyebrow">Meeting Note</p>
                  <h1 className="vn-title" id="vn-title">
                    —
                  </h1>
                  <p className="vn-ref">
                    Ref: <span id="vn-reference">—</span>
                  </p>
                </div>
                <div className="vn-badge-stack">
                  <span className="vn-status" id="vn-status">
                    —
                  </span>
                  <span className="vn-pill" id="vn-category-pill">
                    —
                  </span>
                </div>
              </div>

              {/* Meta strip */}
              <div className="vn-meta">
                <div className="vn-meta-item">
                  <span className="vn-meta-label">Date</span>
                  <strong id="vn-date">—</strong>
                </div>
                <div className="vn-meta-item">
                  <span className="vn-meta-label">Week</span>
                  <strong id="vn-week">—</strong>
                </div>
                <div className="vn-meta-item">
                  <span className="vn-meta-label">Type</span>
                  <strong id="vn-type">—</strong>
                </div>
                <div className="vn-meta-item">
                  <span className="vn-meta-label">Time</span>
                  <strong>
                    <span id="vn-start">—</span>
                    <span className="vn-time-sep">–</span>
                    <span id="vn-end">—</span>
                  </strong>
                </div>
                <div className="vn-meta-item">
                  <span className="vn-meta-label">Duration</span>
                  <strong id="vn-duration">—</strong>
                </div>
                <div className="vn-meta-item">
                  <span className="vn-meta-label">Reporter</span>
                  <strong id="vn-reporter">—</strong>
                </div>
              </div>
            </header>

            {/* ── Body ─────────────────────────────────────────── */}
            <div className="vn-body">
              {/* People row */}
              <section className="vn-card vn-span-2">
                <div className="vn-card-head">
                  <h2>People</h2>
                </div>
                <div className="vn-people-grid">
                  <div className="vn-people-block">
                    <h3>Time Keeper</h3>
                    <div className="vn-chips" id="vn-timekeeper" />
                  </div>
                  <div className="vn-people-block">
                    <h3>Attendees</h3>
                    <div className="vn-chips" id="vn-attendees" />
                  </div>
                  <div className="vn-people-block">
                    <h3>Time Off</h3>
                    <div className="vn-chips" id="vn-timeoff" />
                  </div>
                  <div className="vn-people-block">
                    <h3>Presenters</h3>
                    <div className="vn-chips" id="vn-presenters" />
                  </div>
                  <div className="vn-people-block">
                    <h3>Engagement Participants</h3>
                    <div className="vn-chips" id="vn-engagement" />
                  </div>
                </div>
              </section>

              {/* Absentees */}
              <section className="vn-card vn-span-2">
                <div className="vn-card-head">
                  <h2>Absentees</h2>
                  <span className="vn-count" id="vn-absentees-count">
                    0
                  </span>
                </div>
                <div className="vn-card-body">
                  <div id="vn-absentees-empty" className="vn-empty hidden">
                    No absentees recorded.
                  </div>
                  <table className="vn-table" id="vn-absentees-table">
                    <thead>
                      <tr>
                        <th style={{ width: "40%" }}>Person</th>
                        <th>Reason</th>
                      </tr>
                    </thead>
                    <tbody id="vn-absentees" />
                  </table>
                </div>
              </section>

              {/* Agenda */}
              <section className="vn-card">
                <div className="vn-card-head">
                  <h2>Agenda</h2>
                  <span className="vn-count" id="vn-agenda-count">
                    0
                  </span>
                </div>
                <div className="vn-card-body">
                  <ol className="vn-agenda-list" id="vn-agenda" />
                  <div id="vn-agenda-empty" className="vn-empty hidden">
                    No agenda items.
                  </div>
                </div>
              </section>

              {/* Discussion */}
              <section className="vn-card">
                <div className="vn-card-head">
                  <h2>Discussion Points</h2>
                  <span className="vn-count" id="vn-discussion-count">
                    0
                  </span>
                </div>
                <div className="vn-card-body">
                  <div className="vn-discussion-list" id="vn-discussion" />
                  <div id="vn-discussion-empty" className="vn-empty hidden">
                    No discussion points.
                  </div>
                </div>
              </section>

              {/* Tasks / Action items */}
              <section className="vn-card vn-span-2">
                <div className="vn-card-head">
                  <h2>Action Items</h2>
                  <span className="vn-count" id="vn-tasks-count">
                    0
                  </span>
                </div>
                <div className="vn-card-body">
                  <div id="vn-tasks-empty" className="vn-empty hidden">
                    No action items.
                  </div>
                  <table className="vn-table" id="vn-tasks-table">
                    <thead>
                      <tr>
                        <th>Assignee</th>
                        <th>Email</th>
                        <th>Task</th>
                        <th>Due Date</th>
                        <th>Action Plan</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody id="vn-tasks" />
                  </table>
                </div>
              </section>

              {/* AOB */}
              <section className="vn-card vn-span-2">
                <div className="vn-card-head">
                  <h2>Any Other Business</h2>
                </div>
                <div className="vn-card-body">
                  <p className="vn-aob" id="vn-aob">
                    —
                  </p>
                </div>
              </section>
            </div>

            {/* Footer actions */}
            <footer className="vn-footer">
              <a href="#/mynotes" className="vn-btn vn-btn-secondary">
                Back to My Notes
              </a>
            </footer>
          </div>
        </div>
      </>
    );
  }

  public componentDidMount(): void {
    window.loadViewNoteComponent();
  }
}