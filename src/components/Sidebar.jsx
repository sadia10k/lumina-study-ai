import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <nav className="glass-panel sidebar">
      <div className="sidebar-header">
        <h2>Lumina Study AI</h2>
        <p className="subtitle">Active Recall Engine</p>
      </div>

      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
          <span className="icon">📄</span> Generator Hub
        </NavLink>
        
        <NavLink to="/notes" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
          <span className="icon">📝</span> Study Notes
        </NavLink>

        <NavLink to="/flashcards" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
          <span className="icon">📇</span> Flashcards
        </NavLink>
        
        <NavLink to="/quiz" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
          <span className="icon">🧠</span> Active Recall Quiz
        </NavLink>
      </div>

      <div className="sidebar-footer">
        <p>Powered by Gemini</p>
      </div>
    </nav>
  );
};

export default Sidebar;
