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
      // 👇 --- ¡CAMBIO REALIZADO AQUÍ! --- 👇
      const response = await axios.post("http://localhost:5000/api/registro", {
        nombre_usuario: formData.nombre,
        email: formData.email,
        password: formData.password, // Antes decía "contraseña"
      });
      //_
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
      <header className="main-header">
      </header>

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
}