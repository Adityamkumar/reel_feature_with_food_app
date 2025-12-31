import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Bookmark, User } from 'lucide-react';
import './BottomNav.css';

const BottomNav = () => {
  return (
    <div className="bottom-nav">
      <NavLink 
        to="/" 
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <Home size={28} strokeWidth={isActive => isActive ? 3 : 2} />
        <span className="nav-label">Home</span>
      </NavLink>
      
      <NavLink 
        to="/saved" 
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <Bookmark size={28} strokeWidth={isActive => isActive ? 3 : 2} />
        <span className="nav-label">Saved</span>
      </NavLink>

      <NavLink 
        to="/profile" 
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <User size={28} strokeWidth={isActive => isActive ? 3 : 2} />
        <span className="nav-label">Profile</span>
      </NavLink>
    </div>
  );
};

export default BottomNav;
