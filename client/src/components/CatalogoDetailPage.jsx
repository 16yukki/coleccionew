import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

// Estilos similares a DashboardPage
const styles = {
  container: { maxWidth: 900, margin: '40px auto', padding: 24, fontFamily: 'sans-serif', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
  header: { borderBottom: '1px solid #eee', paddingBottom: '16px' },
  backLink: { textDecoration: 'none', color: '#007bff', marginBottom: '10px', display: 'inline-block', fontSize: '14px' },
  main: { marginTop: 24 },
  objetoList: { listStyle: 'none', paddingLeft: 0 },
  objetoItem: { padding: '15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '10px' },
  loadingText: { fontStyle: 'italic', color: '#777' },
  itemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  itemNombre: { fontSize: '18px', fontWeight: 'bold' },
  itemTipo: { fontSize: '14px', color: '#555' },
  itemDetalles: { fontSize: '14px', color: '#333' },
  itemNotas: { fontSize: '14px', color: '#555', fontStyle: 'italic' }
};

export default function CatalogoDetailPage() {
  const [objetos, setObjetos] = useState([]);
  const [catalogoNombre, setCatalogoNombre] = useState(''); // Estado para el nombre del catálogo
  const [loading, setLoading] = useState(true);
  const { idCatalogo } = useParams(); // Obtenemos el ID del catálogo desde la URL

  // Usamos useCallback para que la función no se recree innecesariamente
  const fetchObjetos = useCallback(async () => {
    try {
      setLoading(true);
      // Llamamos a la API que ya funciona (GET /api/objetos/:id_catalogo)
      const res = await axios.get(`http://localhost:5000/api/objetos/${idCatalogo}`);
      setObjetos(res.data);
      // (Aquí podríamos hacer otra llamada para buscar el nombre del catálogo,
      // pero por ahora nos centramos en los objetos)
    } catch (error) {
      console.error("Error al obtener objetos:", error);
    } finally {
      setLoading(false);
    }
  }, [idCatalogo]);

  useEffect(() => {
    // Cuando el componente se carga, busca los objetos
    fetchObjetos();
  }, [fetchObjetos]);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Link to="/dashboard" style={styles.backLink}>&larr; Volver a Mis Catálogos</Link>
        <h1>Objetos en Catálogo #{idCatalogo}</h1>
      </header>

      <main style={styles.main}>
        {/* Más adelante aquí pondremos el formulario para crear un nuevo objeto */}
        
        <section style={{ marginTop: 20 }}>
          <h3>Mis Objetos</h3>
          {loading ? (
            <p style={styles.loadingText}>Cargando objetos...</p>
          ) : (
            <ul style={styles.objetoList}>
              {objetos.length > 0 ? (
                objetos.map(objeto => (
                  <li key={objeto.id_objeto} style={styles.objetoItem}>
                    <div style={styles.itemHeader}>
                      <span style={styles.itemNombre}>{objeto.nombre}</span>
                      <span style={styles.itemTipo}>{objeto.tipo || 'Sin tipo'}</span>
                    </div>
                    <p style={styles.itemDetalles}>
                      Año: {objeto.anio || 'N/A'} | 
                      Estado: {objeto.estado || 'N/A'} | 
                      Precio: ${objeto.precio || '0.00'}
                    </p>
                    {objeto.notas && <p style={styles.itemNotas}>Notas: {objeto.notas}</p>}
                  </li>
                ))
              ) : (
                <p>No tienes ningún objeto en este catálogo. ¡Crea uno!</p>
              )}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}