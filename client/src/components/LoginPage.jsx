<<<<<<< HEAD
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

        {/* Mensaje de error (aria-live para lectores de pantalla) */}
        <p id="error-message" className="error-message" role="alert" aria-live="polite">
          {errorMessage}
        </p>
      </div>
    </div>
  )
=======
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const [isFlipped, setIsFlipped] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const toggleCard = () => {
    setErrorMessage("");
    setIsFlipped(!isFlipped);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/login", {
        email: formData.email,
        password: formData.password,
      });

      const usuario = response.data?.usuario ?? response.data;
      localStorage.setItem("usuario", JSON.stringify(usuario));
      if (response.data?.token)
        localStorage.setItem("token", response.data.token);

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      const serverMsg =
        err.response?.data?.message || err.message || "Error en el servidor";
      setErrorMessage(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  // --- REGISTER ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      // Log de control
      console.log("Enviando al backend:", {
        nombre_usuario: formData.nombre,
        email: formData.email,
        password: formData.password,
      });

      // Enviamos al endpoint correcto
      const response = await axios.post("http://localhost:5000/api/registro", {
        nombre_usuario: formData.nombre,
        email: formData.email,
        password: formData.password, // se guarda en "contraseña" en la BD por lógica del backend
      });

      const usuario = response.data?.usuario ?? response.data;
      localStorage.setItem("usuario", JSON.stringify(usuario));
      if (response.data?.token)
        localStorage.setItem("token", response.data.token);

      navigate("/dashboard");
    } catch (err) {
      console.error("Register error:", err);
      const serverMsg =
        err.response?.data?.message || err.message || "Error en el servidor";
      setErrorMessage(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-root">
    

      <div className="scene">
        <div className={`card ${isFlipped ? "is-flipped" : ""}`}>
          {/* FRONT - LOGIN */}
          <div className="card-face card-front">
            <h2>
              Iniciar sesión en <span>ColeccioNew</span>
            </h2>
            <p>Ingresá tus datos para continuar</p>

            <form onSubmit={handleLogin}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="submit"
                className="btn"
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? "Ingresando..." : "Iniciar sesión"}
              </button>
            </form>

            <p>
              ¿No tenés cuenta?{" "}
              <span onClick={toggleCard} className="toggle-link">
                Registrate
              </span>
            </p>
            {errorMessage && (
              <p className="error-message" role="alert">
                {errorMessage}
              </p>
            )}
          </div>

          {/* BACK - REGISTER */}
          <div className="card-face card-back">
            <h2>
              Crear cuenta en <span>ColeccioNew</span>
            </h2>
            <p>Registrate para empezar</p>

            <form onSubmit={handleRegister}>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre completo"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="submit"
                className="btn"
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? "Registrando..." : "Registrarse"}
              </button>
            </form>

            <p>
              ¿Ya tenés cuenta?{" "}
              <span onClick={toggleCard} className="toggle-link">
                Iniciá sesión
              </span>
            </p>
            {errorMessage && (
              <p className="error-message" role="alert">
                {errorMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
>>>>>>> 790e021 (actualizacion del login)
}
