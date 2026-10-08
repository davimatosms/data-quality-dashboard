interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="state-message" role="alert">
      <h2>Não foi possível carregar os dados</h2>
      <p>{message}</p>
      {onRetry ? (
        <button className="button button-secondary" type="button" onClick={onRetry}>
          Tentar novamente
        </button>
      ) : null}
    </div>
  )
}
