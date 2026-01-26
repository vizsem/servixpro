import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Pastikan HANYA index.css yang diimpor, App.css harus dihapus
import './index.css' 
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)