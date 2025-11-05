import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

// Estilos (similares, con añadidos para botones de acción)
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
  itemNotas: { fontSize: '14px', color: '#555', fontStyle: 'italic' },
  // --- ¡NUEVO! Estilos para botones de modificar/eliminar ---
  actionButtons: { display: 'flex', gap: '10px', marginTop: '10px' },
  editButton: { padding: '5px 10px', fontSize: '12px', cursor: 'pointer', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '4px' },
  deleteButton: { padding: '5px 10px', fontSize: '12px', cursor: 'pointer', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' },
  
  formContainer: { marginTop: '20px', padding: '16px', border: '1px solid #eee', borderRadius: '6px', backgroundColor: '#f9f9f9' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  formInput: { padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc', width: '95%' },
  formTextArea: { padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc', width: '95%', gridColumn: '1 / 3' },
  formButton: { padding: '8px 12px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', gridColumn: '1 / 3' },
  cancelButton: { padding: '8px 12px', cursor: 'pointer', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', gridColumn: '1 / 3', marginTop: '5px' },
  formError: { color: 'red', fontSize: '13px', marginTop: '10px' }
};

export default function CatalogoDetailPage() {
  const [objetos, setObjetos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { idCatalogo } = useParams(); 

  // --- ¡NUEVO! Estado para saber si estamos creando o modificando ---
  const [editingObjeto, setEditingObjeto] = useState(null); // null = creando, objeto = modificando

  // Estado para el formulario (usado para crear y modificar)
  const [formData, setFormData] = useState({
    nombre: '', tipo: '', anio: '', precio: '', estado: '', notas: ''
  });
  const [formError, setFormError] = useState('');

  // Cargar los objetos
  const fetchObjetos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/objetos/${idCatalogo}`);
      setObjetos(res.data);
    } catch (error) {
      console.error("Error al obtener objetos:", error);
    } finally {
      setLoading(false);
    }
  }, [idCatalogo]);

  useEffect(() => {
    fetchObjetos();
  }, [fetchObjetos]);

  // Manejador para los inputs del formulario
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // --- ¡NUEVO! Función para empezar a editar un objeto ---
  const handleStartEdit = (objeto) => {
    setEditingObjeto(objeto); // Guardamos el objeto que estamos editando
    setFormData(objeto); // Rellenamos el formulario con sus datos
    window.scrollTo(0, 0); // Llevamos la pantalla arriba al formulario
  };

  // --- ¡NUEVO! Función para cancelar la edición ---
  const handleCancelEdit = () => {
    setEditingObjeto(null); // Limpiamos el objeto en edición
    setFormData({ nombre: '', tipo: '', anio: '', precio: '', estado: '', notas: '' }); // Limpiamos el formulario
    setFormError('');
  };

  // --- ¡MODIFICADO! Esta función ahora sirve para CREAR y MODIFICAR ---
  const handleSubmitObjeto = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.nombre) {
      setFormError('El nombre del objeto es obligatorio.');
      return;
    }

    // Datos que enviaremos a la API
    const objetoData = {
      nombre: formData.nombre,
      tipo: formData.tipo || null,
      anio: formData.anio ? parseInt(formData.anio) : null,
      precio: formData.precio ? parseFloat(formData.precio) : null,
      estado: formData.estado || null,
      notas: formData.notas || null,
      id_catalogo_fk: idCatalogo
    };

    try {
      if (editingObjeto) {
        // --- Lógica de MODIFICAR (PUT) ---
        await axios.put(`http://localhost:5000/api/objetos/${editingObjeto.id_objeto}`, objetoData);
      } else {
        // --- Lógica de CREAR (POST) ---
        await axios.post('http://localhost:5000/api/objetos', objetoData);
      }

      // ¡Éxito!
      handleCancelEdit(); // Limpiamos el formulario y el estado de edición
      fetchObjetos(); // Recargamos la lista de objetos

    } catch (error) {
      console.error("Error al guardar el objeto:", error);
      setFormError('No se pudo guardar el objeto. Inténtalo de nuevo.');
    }
  };

  // --- ¡NUEVO! Función para ELIMINAR un objeto ---
  const handleDeleteObjeto = async (idObjeto) => {
    // Pedimos confirmación antes de borrar
    if (!window.confirm("¿Estás seguro de que quieres eliminar este objeto? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      // Llamamos a la API DELETE que ya funciona
      await axios.delete(`http://localhost:5000/api/objetos/${idObjeto}`);
      
      // ¡Éxito!
      fetchObjetos(); // Recargamos la lista de objetos

    } catch (error) {
      console.error("Error al eliminar el objeto:", error);
      alert("No se pudo eliminar el objeto.");
    }
  };


  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Link to="/dashboard" style={styles.backLink}>&larr; Volver a Mis Catálogos</Link>
        <h1>Objetos en Catálogo #{idCatalogo}</h1>
      </header>

      <main style={styles.main}>
        
        {/* --- ¡MODIFICADO! El formulario ahora es para Crear o Modificar --- */}
        <section style={styles.formContainer}>
          <h3>{editingObjeto ? 'Modificar Objeto' : 'Agregar Nuevo Objeto'}</h3>
          <form onSubmit={handleSubmitObjeto}>
            <div style={styles.formGrid}>
              <input
                type="text" name="nombre" placeholder="Nombre del objeto *"
                style={styles.formInput} value={formData.nombre} onChange={handleFormChange} required
              />
              <input
                type="text" name="tipo" placeholder="Tipo (ej: Moneda)"
                style={styles.formInput} value={formData.tipo} onChange={handleFormChange}
              />
              <input
                type="number" name="anio" placeholder="Año"
                style={styles.formInput} value={formData.anio} onChange={handleFormChange}
              />
              <input
                type="number" step="0.01" name="precio" placeholder="Precio (ej: 5.50)"
                style={styles.formInput} value={formData.precio} onChange={handleFormChange}
              />
              <input
                type="text" name="estado" placeholder="Estado (ej: Bueno)"
                style={styles.formInput} value={formData.estado} onChange={handleFormChange}
              />
            </div>
            <textarea
              name="notas" placeholder="Notas adicionales..."
              rows="3"
              style={{...styles.formTextArea, marginTop: '10px'}}
              value={formData.notas} onChange={handleFormChange}
            />
            <button type="submit" style={{...styles.formButton, marginTop: '10px'}}>
              {editingObjeto ? 'Guardar Cambios' : 'Agregar Objeto'}
            </button>
            {/* ¡NUEVO! Botón para cancelar la edición */}
            {editingObjeto && (
              <button type="button" onClick={handleCancelEdit} style={styles.cancelButton}>
                Cancelar Edición
              </button>
            )}
            {formError && <p style={styles.formError}>{formError}</p>}
          </form>
        </section>

        {/* --- ¡MODIFICADO! La lista de objetos ahora tiene botones --- */}
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
                    
                    {/* --- ¡NUEVO! Botones de Acción --- */}
                    <div style={styles.actionButtons}>
                      <button onClick={() => handleStartEdit(objeto)} style={styles.editButton}>
                        Modificar
                      </button>
                      <button onClick={() => handleDeleteObjeto(objeto.id_objeto)} style={styles.deleteButton}>
                        Eliminar
                      </button>
                    </div>
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
