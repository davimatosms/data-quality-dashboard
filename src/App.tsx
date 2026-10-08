import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { SourceDetailsPage } from './pages/SourceDetailsPage'
import { SourceFormPage } from './pages/SourceFormPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/sources/new" element={<SourceFormPage />} />
          <Route path="/sources/:id" element={<SourceDetailsPage />} />
          <Route path="/sources/:id/edit" element={<SourceFormPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
