import { NavLink, Outlet } from 'react-router-dom'
import '../App.css'

export function AppLayout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <NavLink className="brand" to="/">
          <span className="brand-mark" aria-hidden="true">DQ</span>
          <span className="brand-copy">
            <strong>Data Quality</strong>
            <span>Observabilidade de dados</span>
          </span>
        </NavLink>
        <nav className="app-nav" aria-label="Navegação principal">
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/sources/new">Nova fonte</NavLink>
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
