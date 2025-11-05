// client/src/components/DashboardPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);

  // --- Estados para los catálogos ---
  const [catalogos, setCatalogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nuevoCatalogoNombre, setNuevoCatalogoNombre] = useState('');
  const [formError, setFormError] = useState(''); // Para mostrar errores del formulario

  // Estilos (combinando los tuyos con los necesarios para lo nuevo)
  const styles = {
    container: { maxWidth: 900, margin: '40px auto', padding: 24, fontFamily: 'sans-serif', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '16px' },
    logoutButton: { padding: '8px 12px', cursor: 'pointer', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' },
    main: { marginTop: 24 },
    userInfoSection: { marginTop: 20, padding: 16, border: '1px solid #eee', borderRadius: 6, backgroundColor: '#f8f9fa' },
    pre: { whiteSpace: 'pre-wrap', backgroundColor: '#e9ecef', padding: '10px', borderRadius: '4px' },
    catalogoList: { listStyle: 'none', paddingLeft: 0 },
    catalogoItem: { padding: '10px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '10px', cursor: 'pointer' },
    loadingText: { fontStyle: 'italic', color: '#777' },
    formContainer: { marginTop: '20px', padding: '16px', border: '1px solid #eee', borderRadius: '6px', backgroundColor: '#f9f9f9' },
    formInput: { padding: '8px', fontSize: '14px', marginRight: '10px', borderRadius: '4px', border: '1px solid #ccc' },
    formButton: { padding: '8px 12px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' },
    formError: { color: 'red', fontSize: '13px', marginTop: '10px' }
  };

  // --- Función para cargar catálogos (useCallback) ---
  const fetchCatalogos = useCallback(async (idColeccion) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/catalogos/${idColeccion}`);
      setCatalogos(response.data || []);
    } catch (error) {
      console.error("Error al obtener catálogos:", error);
      setCatalogos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // useEffect: auth + cargar catálogos
  useEffect(() => {
    const raw = localStorage.getItem('usuario');
    if (!raw) {
      navigate('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(raw);
      setUsuario(parsedUser);

      if (parsedUser.id_coleccion) {
        fetchCatalogos(parsedUser.id_coleccion);
      } else {
        console.error("No se encontró id_coleccion en localStorage. Vuelve a iniciar sesión.");
        setLoading(false);
      }
    } catch (err) {
      console.warn('Error parseando usuario en localStorage', err);
      localStorage.removeItem('usuario');
      navigate('/login');
    }
  }, [navigate, fetchCatalogos]);

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  // --- Crear nuevo catálogo ---
  const handleCrearCatalogo = async (event) => {
    event.preventDefault();
    setFormError('');

    const nombreTrim = (nuevoCatalogoNombre || '').trim();
    if (!nombreTrim) {
      setFormError('El nombre del catálogo no puede estar vacío.');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/catalogos', {
        nombre: nombreTrim,
        descripcion: '',
        id_coleccion_fk: usuario.id_coleccion
      });

      setNuevoCatalogoNombre('');
      // recargar catálogos para obtener el id real y datos actualizados
      fetchCatalogos(usuario.id_coleccion);
    } catch (error) {
      console.error("Error al crear el catálogo:", error);
      setFormError('No se pudo crear el catálogo. Inténtalo de nuevo.');
    }
  };

  // --- NUEVO: Navegar a detalle del catálogo ---
  const handleOpenCatalogo = useCallback((catalogo) => {
    // soporta distintas formas de id que tu backend pueda devolver
    const id = catalogo.id_catalogo ?? catalogo.id ?? catalogo._id;
    if (!id) {
      console.error('Catalogo sin id:', catalogo);
      return;
    }
    navigate(`/catalogo/${id}`);
  }, [navigate]);

  // keyboard handler para accesibilidad (Enter para abrir)
  const handleKeyOpen = (e, catalogo) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpenCatalogo(catalogo);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Dashboard</h1>
        {usuario && <span>Hola, {usuario.nombre_usuario || usuario.email}!</span>}
        <button onClick={handleLogout} style={styles.logoutButton}>
          Cerrar sesión
        </button>
      </header>

      <main style={styles.main}>
        {usuario ? (
          <div>
            <h2>Bienvenido, {usuario.nombre_usuario || usuario.email || 'usuario'} 🎉</h2>
            <p>Tu sesión está activa. ¡Aquí puedes empezar a gestionar tu colección!</p>

            {/* Formulario para crear catálogo */}
            <section style={styles.formContainer}>
              <h3>Crear Nuevo Catálogo</h3>
              <form onSubmit={handleCrearCatalogo}>
                <input
                  type="text"
                  placeholder="Nombre del catálogo"
                  style={styles.formInput}
                  value={nuevoCatalogoNombre}
                  onChange={(e) => setNuevoCatalogoNombre(e.target.value)}
                />
                <button type="submit" style={styles.formButton}>
                  Crear
                </button>
                {formError && <p style={styles.formError}>{formError}</p>}
              </form>
            </section>

            {/* Lista de catálogos (ahora navegable) */}
            <section style={{ marginTop: 20 }}>
              <h3>Mis Catálogos</h3>
              {loading ? (
                <p style={styles.loadingText}>Cargando catálogos...</p>
              ) : (
                <ul style={styles.catalogoList}>
                  {catalogos.length > 0 ? (
                    catalogos.map(catalogo => {
                      const key = catalogo.id_catalogo ?? catalogo.id ?? catalogo._id ?? `${catalogo.nombre}-${Math.random()}`;
                      return (
                        <li
                          key={key}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleOpenCatalogo(catalogo)}
                          onKeyDown={(e) => handleKeyOpen(e, catalogo)}
                          style={{
                            ...styles.catalogoItem,
                            display: 'block',
                            background: '#fff',
                            transition: 'transform 0.08s ease',
                          }}
                          aria-label={`Abrir catálogo ${catalogo.nombre}`}
                          // simple hover effect accesible desde inline styles:
                          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                          <strong>{catalogo.nombre}</strong>
                          {catalogo.descripcion && <p style={{margin: '5px 0 0', fontSize: '14px', color: '#555'}}>{catalogo.descripcion}</p>}
                        </li>
                      );
                    })
                  ) : (
                    <p>No tienes ningún catálogo. ¡Crea uno!</p>
                  )}
                </ul>
              )}
            </section>

            <section style={styles.userInfoSection}>
              <h3>Datos del usuario (desde localStorage)</h3>
              <pre style={styles.pre}>{JSON.stringify(usuario, null, 2)}</pre>
            </section>
          </div>
        ) : (
          <div>Cargando perfil...</div>
        )}
      </main>
    </div>
  );
}
