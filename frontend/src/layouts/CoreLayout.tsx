/**
 * CoreLayout - Premium layout without traditional sidebar
 * Clean, minimal, focused on content with Straxis Design System
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import { Dock } from '../components/core/Dock';
import './CoreLayout.css';

const CoreLayout: React.FC = () => {
  return (
    <div className="core-layout">
      {/* Main Content Area */}
      <main className="core-content">
        <Outlet />
      </main>

      {/* Floating Dock Navigation */}
      <Dock />
    </div>
  );
};

export default CoreLayout;
