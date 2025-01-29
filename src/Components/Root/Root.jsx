import { Outlet } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import './Root.module.css'

function Root() {
  return (
    <div>
      <header>
        <nav>
          <ul>
            <li><NavLink to='/' className={({isActive})=> isActive ? "activeNavLink" : "inactiveNavLink"}>Home</NavLink></li>
            <li><NavLink to='/about' className={({isActive})=> isActive ? "activeNavLink" : "inactiveNavLink"}>About</NavLink></li>
          </ul>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Root;