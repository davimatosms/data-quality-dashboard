import { Link } from 'react-router-dom'

export function EmptyState() {
  return (
    <div className="state-message">
      <h2>Nenhuma fonte cadastrada</h2>
      <p>Cadastre uma fonte para começar a acompanhar a qualidade dos dados.</p>
      <Link className="button button-primary" to="/sources/new">Cadastrar fonte</Link>
    </div>
  )
}
