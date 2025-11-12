import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

// Estilos (similares, con añadidos para la imagen)
const styles = {
  container: { maxWidth: 900, margin: '40px auto', padding: 24, fontFamily: 'sans-serif', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
  header: { borderBottom: '1px solid #eee', paddingBottom: '16px' },
  backLink: { textDecoration: 'none', color: '#007bff', marginBottom: '10px', display: 'inline-block', fontSize: '14px' },
  main: { marginTop: 24 },
  objetoList: { listStyle: 'none', paddingLeft: 0 },
  objetoItem: { 
    display: 'flex', // <-- ¡NUEVO! Para poner la imagen al lado del texto
    gap: '15px',     // <-- ¡NUEVO! Espacio entre imagen y texto
    padding: '15px', 
    border: '1px solid #ddd', 
    borderRadius: '4px', 
    marginBottom: '10px' 
  },
  // --- ¡NUEVO! Estilo para la imagen ---
  itemImage: {
    width: '100px',
    height: '100px',
    objectFit: 'cover', // Para que la imagen se vea bien
    borderRadius: '4px',
    backgroundColor: '#eee' // Color de fondo mientras carga
  },
  itemContent: {
    flex: 1 // Para que el texto ocupe el espacio restante
  },
  loadingText: { fontStyle: 'italic', color: '#777' },
  itemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  itemNombre: { fontSize: '18px', fontWeight: 'bold' },
  itemTipo: { fontSize: '14px', color: '#555' },
  itemDetalles: { fontSize: '14px', color: '#333' },
  itemNotas: { fontSize: '14px', color: '#555', fontStyle: 'italic' },
  actionButtons: { display: 'flex', gap: '10px', marginTop: '10px' },
  editButton: { padding: '5px 10px', fontSize: '12px', cursor: 'pointer', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '4px' },
  deleteButton: { padding: '5px 10px', fontSize: '12px', cursor: 'pointer', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' },
  
  formContainer: { marginTop: '20px', padding: '16px', border: '1px solid #eee', borderRadius: '6px', backgroundColor: '#f9f9f9' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  formInput: { padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc', width: '95%' },
  // --- ¡NUEVO! Estilo para el input de foto ---
  formInputFile: { gridColumn: '1 / 3', fontSize: '14px' },
  formTextArea: { padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc', width: '95%', gridColumn: '1 / 3' },
  formButton: { padding: '8px 12px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', gridColumn: '1 / 3' },
  cancelButton: { padding: '8px 12px', cursor: 'pointer', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', gridColumn: '1 / 3', marginTop: '5px' },
  formError: { color: 'red', fontSize: '13px', marginTop: '10px' }
};

export default function CatalogoDetailPage() {
  const [objetos, setObjetos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { idCatalogo } = useParams(); 

  const [editingObjeto, setEditingObjeto] = useState(null); 

  const [formData, setFormData] = useState({
    nombre: '', tipo: '', anio: '', precio: '', estado: '', notas: ''
  });
  const [formError, setFormError] = useState('');
  
  // --- ¡NUEVO! Estado para guardar el archivo de la foto ---
  const [fotoArchivo, setFotoArchivo] = useState(null);

  // Cargar los objetos (ahora trae la foto_url)
  const fetchObjetos = useCallback(async () => {
    try {
      setLoading(true);
      // Esta API ya trae la 'foto_url' gracias al JOIN que hicimos en el backend
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

  // Manejador para los inputs de texto
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // --- ¡NUEVO! Manejador para el input de la foto ---
  const handleFotoChange = (e) => {
    setFotoArchivo(e.target.files[0]); // Guardamos el primer archivo que el usuario seleccione
  };

  // Función para empezar a editar
  const handleStartEdit = (objeto) => {
    setEditingObjeto(objeto); 
    setFormData({
        nombre: objeto.nombre || '',
        tipo: objeto.tipo || '',
        anio: objeto.anio || '',
        precio: objeto.precio || '',
        estado: objeto.estado || '',
        notas: objeto.notas || ''
    });
    setFotoArchivo(null); // Limpiamos el selector de foto al empezar a editar
    window.scrollTo(0, 0); 
  };

  // Función para cancelar la edición
  const handleCancelEdit = () => {
    setEditingObjeto(null); 
    setFormData({ nombre: '', tipo: '', anio: '', precio: '', estado: '', notas: '' }); 
    setFotoArchivo(null);
    setFormError('');
  };

  // --- ¡MODIFICADO! Esta función ahora sube la foto primero ---
  const handleSubmitObjeto = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.nombre) {
      setFormError('El nombre del objeto es obligatorio.');
      return;
    }

    let fotoUrlParaGuardar = null;

    try {
      // --- PASO A: Subir la foto (si hay una) ---
      if (fotoArchivo) {
        console.log("Subiendo foto...");
        const formDataFoto = new FormData();
        formDataFoto.append('foto', fotoArchivo); // 'foto' debe coincidir con upload.single('foto') en el backend

        const resFoto = await axios.post('http://localhost:5000/api/upload', formDataFoto, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        fotoUrlParaGuardar = resFoto.data.url; // Guardamos la URL que nos devolvió el backend
        console.log("Foto subida exitosamente:", fotoUrlParaGuardar);
      }

      // --- PASO B: Guardar los datos del objeto (incluida la URL de la foto) ---
      
      // Si estamos editando y no subimos una foto nueva, usamos la que ya tenía
      if (editingObjeto && !fotoUrlParaGuardar) {
        fotoUrlParaGuardar = editingObjeto.foto_url;
      }
      
      const objetoData = {
        nombre: formData.nombre,
        tipo: formData.tipo || null,
        anio: formData.anio ? parseInt(formData.anio) : null,
        precio: formData.precio ? parseFloat(formData.precio) : null,
        estado: formData.estado || null,
        notas: formData.notas || null,
        id_catalogo_fk: parseInt(idCatalogo),
        fotoUrl: fotoUrlParaGuardar // <-- ¡Enviamos la URL al backend!
      };

      if (editingObjeto) {
        // --- Lógica de MODIFICAR (PUT) ---
        // (Nota: nuestra API PUT actual no actualiza la foto, solo el texto.
        // Lo dejamos así por simplicidad por ahora)
        await axios.put(`http://localhost:5000/api/objetos/${editingObjeto.id_objeto}`, objetoData);
      } else {
        // --- Lógica de CREAR (POST) ---
        await axios.post('http://localhost:5000/api/objetos', objetoData);
      }

      // ¡Éxito!
      handleCancelEdit(); // Limpiamos el formulario
      fetchObjetos(); // Recargamos la lista de objetos

    } catch (error) {
      console.error("Error al guardar el objeto:", error);
      setFormError('No se pudo guardar el objeto. Inténtalo de nuevo.');
    }
  };

  // Función para ELIMINAR
  const handleDeleteObjeto = async (idObjeto) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este objeto? Esta acción no se puede deshacer.")) {
        try {
          await axios.delete(`http://localhost:5000/api/objetos/${idObjeto}`);
          fetchObjetos(); 
        } catch (error) {
          console.error("Error al eliminar el objeto:", error);
          alert("No se pudo eliminar el objeto.");
        }
    }
  };


  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Link to="/dashboard" style={styles.backLink}>&larr; Volver a Mis Catálogos</Link>
        <h1>Objetos en Catálogo #{idCatalogo}</h1>
      </header>

      <main style={styles.main}>
        
        {/* --- ¡MODIFICADO! El formulario ahora tiene campo de foto --- */}
        <section style={styles.formContainer}>
          <h3>{editingObjeto ? 'Modificar Objeto' : 'Agregar Nuevo Objeto'}</h3>
          <form onSubmit={handleSubmitObjeto}>
            <div style={styles.formGrid}>
              <input type="text" name="nombre" placeholder="Nombre del objeto *" style={styles.formInput} value={formData.nombre} onChange={handleFormChange} required />
              <input type="text" name="tipo" placeholder="Tipo (ej: Moneda)" style={styles.formInput} value={formData.tipo} onChange={handleFormChange} />
              <input type="number" name="anio" placeholder="Año" style={styles.formInput} value={formData.anio} onChange={handleFormChange} />
              <input type="number" step="0.01" name="precio" placeholder="Precio (ej: 5.50)" style={styles.formInput} value={formData.precio} onChange={handleFormChange} />
              <input type="text" name="estado" placeholder="Estado (ej: Bueno)" style={styles.formInput} value={formData.estado} onChange={handleFormChange} />
            </div>
            
            <textarea name="notas" placeholder="Notas adicionales..." rows="3" style={{...styles.formTextArea, marginTop: '10px'}} value={formData.notas} onChange={handleFormChange} />
            
            {/* --- ¡NUEVO! Campo para subir la foto --- */}
            {/* (Solo lo mostramos al crear, para simplificar. La edición de foto es más compleja) */}
            {!editingObjeto && (
              <div style={{marginTop: '10px'}}>
                <label style={{fontSize: '14px', display: 'block', marginBottom: '5px'}}>Foto Principal</label>
                <input 
                  type="file" 
                  name="foto" 
                  onChange={handleFotoChange} 
                  style={styles.formInputFile}
                />
              </div>
            )}

            <button type="submit" style={{...styles.formButton, marginTop: '10px'}}>
              {editingObjeto ? 'Guardar Cambios' : 'Agregar Objeto'}
            </button>
            {editingObjeto && (
              <button type="button" onClick={handleCancelEdit} style={styles.cancelButton}>
                Cancelar Edición
              </button>
            )}
            {formError && <p style={styles.formError}>{formError}</p>}
          </form>
        </section>

        {/* --- ¡MODIFICADO! La lista de objetos ahora muestra la foto --- */}
        <section style={{ marginTop: 20 }}>
          <h3>Mis Objetos</h3>
          {loading ? (
            <p style={styles.loadingText}>Cargando objetos...</p>
          ) : (
            <ul style={styles.objetoList}>
              {objetos.length > 0 ? (
                objetos.map(objeto => (
                  <li key={objeto.id_objeto} style={styles.objetoItem}>
                    
                    {objeto.foto_url ? (
                      <img src={objeto.foto_url} alt={objeto.nombre} style={styles.itemImage} />
                    ) : (
                      // Placeholder si no hay foto
                      <div style={{...styles.itemImage, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888'}}>
                        <span>Sin foto</span>
                      </div>
                    )}

                    <div style={styles.itemContent}>
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
                      
                      <div style={styles.actionButtons}>
                        <button onClick={() => handleStartEdit(objeto)} style={styles.editButton}>
                          Modificar
                        </button>
                        <button onClick={() => handleDeleteObjeto(objeto.id_objeto)} style={styles.deleteButton}>
                          Eliminar
                        </button>
                      </div>
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