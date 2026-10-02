import * as React from 'react';
import type { IMeetingNoteProps } from './IMeetingNoteProps';

import {Route, Routes, HashRouter} from "react-router-dom";
import {Layout} from "../../../Global/Layout";
import Dashboard from './pages/Dashboard';
import NewRequest from "./pages/NewRequest";
import Report from './pages/Report';
import ViewRequest from './pages/ViewRequest';
import ApproveRequest from './pages/ApproveRequest';
import { HelmetProvider } from "react-helmet-async";

require('main');

declare global {
    interface Window {
        globalProp: any;
        loadDashboardComponent: () => void;
        loadNewRequestComponent: () => void;
        loadReportComponent : () => void;
        loadViewRequestComponent : () => void;
        loadApproveRequestComponent : () => void;
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
                      <Route index element={<Dashboard />} />
                      <Route path="newrequest" element={<NewRequest />} />
                      <Route path="report" element={<Report />} />
                      <Route path="viewrequest" element={<ViewRequest />} />
                      <Route path="approverequest" element={<ApproveRequest />} />
                  </Route>
              </Routes>
          </HashRouter>
          </HelmetProvider>
      </>
    );
  }
}
