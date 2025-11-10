import React, { useState } from 'react'
// ¡NUEVO! Importamos Link para la navegación
import { useNavigate, Link } from 'react-router-dom' 
import axios from 'axios'
import './LoginPage.css' // crea este archivo con los estilos (ejemplo más abajo)

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setLoading(true)

    try {
      const response = await axios.post(
        'http://localhost:5000/api/login',
        { email, password }
        // , { withCredentials: true } // descomentá si usás cookies
      )

      // Suponemos que el backend devuelve { usuario: {...}, token?: '...' }
      const usuario = response.data?.usuario ?? response.data
      localStorage.setItem('usuario', JSON.stringify(usuario))
      if (response.data?.token) localStorage.setItem('token', response.data.token)

      // Redirigir al dashboard sin recargar
      navigate('/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      const serverMsg = err.response?.data?.message || err.message || 'Error en el servidor'
      setErrorMessage(serverMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page-root">
      <header className="main-header">
        <h2 className="brand">
          Coleccio <span>New</span>
        </h2>
      </header>

      <div className="login-container">
        <h1 id="form-title">Bienvenido</h1>
        <p id="form-subtitle">Iniciá sesión para continuar</p>

        <form id="loginForm" onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            id="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="login-input"
            aria-label="Email"
          />

          <input
            type="password"
            id="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input"
            aria-label="Contraseña"
          />

          <button
            type="submit"
            id="mainBtn"
            className="primary-btn"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Mensaje de error */}
        <p id="error-message" className="error-message" role="alert" aria-live="polite">
          {errorMessage}
        </p>

        {/* --- ¡NUEVO! Enlace para registrarse --- */}
        <p className="register-prompt">
          ¿No tenés una cuenta?{" "}
          <Link to="/registro" className="register-link">
            Registrate acá
          </Link>
        </p>

      </div>
    </div>
  )
}