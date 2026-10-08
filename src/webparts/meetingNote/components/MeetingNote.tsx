import * as React from 'react';
import type { IMeetingNoteProps } from './IMeetingNoteProps';

import {Route, Routes, HashRouter, Navigate} from "react-router-dom";
import {Layout} from "../../../Global/Layout";
import NewNote from "./pages/NewNote";
import MeetingTasks from './pages/MeetingTasks';
import MyNotes from './pages/MyNotes';
import ViewNote from './pages/ViewNote';
import ViewTask from './pages/ViewTask';
import { HelmetProvider } from "react-helmet-async";

require('main');

declare global {
    interface Window {
        globalProp: any;
        loadNewNoteComponent: () => void;
        loadMeetingTasksComponent: () => void;
        loadPreviousNotesComponent: () => void;
        loadMyNotesComponent: () => void;
        loadViewNoteComponent: () => void;
        loadViewTaskComponent: () => void;
    }
}

export default class AppDev extends React.Component<IMeetingNoteProps> {
  public render(): React.ReactElement<IMeetingNoteProps> {
    const {} = this.props;

    return (
      <>
      <HelmetProvider>
          <HashRouter>
              <Routes>
                  <Route path="/" element={<Layout />}>
                        <Route index element={<MeetingTasks />} />
                        <Route path="newmeetingnote" element={<NewNote />} />
                        <Route path="previousnotes" element={<Navigate to="/mynotes?tab=previous" replace />} />
                        <Route path="mynotes" element={<MyNotes />} />
                        <Route path="viewnote" element={<ViewNote />} />
                        <Route path="viewtask" element={<ViewTask />} />
                  </Route>
              </Routes>
          </HashRouter>
          </HelmetProvider>
      </>
    );
  }
}