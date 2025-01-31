import React from 'react';
import { Outlet } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import styles from './Root.module.css';
import { Menu, X } from 'lucide-react'
import { useState } from 'react';

function Root() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <p className={styles.logo}>Reddit Client</p>
          <ul className={styles.desktopNav}>
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive
                    ? `${styles.navLink} ${styles.activeNavLink}`
                    : `${styles.navLink}`
                }
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  isActive
                    ? `${styles.navLink} ${styles.activeNavLink}`
                    : `${styles.navLink}`
                }
              >
                About
              </NavLink>
            </li>
          </ul>
          <button 
            className={styles.menuButton}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <ul className={styles.mobileNav}>
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    isActive
                      ? `${styles.navLink} ${styles.activeNavLink}`
                      : styles.navLink
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    isActive
                      ? `${styles.navLink} ${styles.activeNavLink}`
                      : styles.navLink
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </NavLink>
              </li>
            </ul>
          )}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Root;