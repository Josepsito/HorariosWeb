import './App.css'
import Horarios from './components/body/clases/Horarios'
import Medicos from './components/body/clases/Medicos'
import Periodos from './components/body/clases/Periodos'
import Usuarios from './components/body/clases/Usuarios'
import Header from './components/Header'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'


function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/horarios" element={<Horarios />} />
        <Route path="/medicos" element={<Medicos />} />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/periodos" element={<Periodos />} />
        {/* Puedes agregar más rutas */}
        <Route path="/" element={<div>Bienvenido al sistema</div>} />
      </Routes>
    </Router>
  )
}

export default App