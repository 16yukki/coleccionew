// 1. Importar las librerías
const express = require('express');
const { Pool } = require('pg');
// const bcrypt = require('bcrypt'); // <-- ¡ELIMINADO!
const cors = require('cors'); // Importamos cors (lo necesitarás para el frontend)

// 2. Inicializar la aplicación
const app = express();
const PORT = 5000;

// 3. Configurar la conexión a la base de datos
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'coleccionew',
  password: 'BBss2211', // ¡RECUERDA PONER TU CONTRASEÑA REAL AQUÍ!
  port: 5432,
});

// --- Función de Autodiagnóstico ---
async function testDbConnection() {
  try {
    const client = await pool.connect();
    console.log("✅ ¡Conexión a la base de datos exitosa!");
    client.release();
    return true;
  } catch (err) {
    console.error("❌ ERROR FATAL: No se pudo conectar a la base de datos.");
    console.error("Error detallado:", err.message);
    return false;
  }
}

// 4. Middleware
app.use(express.json()); 
app.use(cors()); // Habilitamos CORS para el frontend

// 5. Rutas de la API (Usuarios)
app.post('/api/registro', async (req, res) => {
  try {
    const { nombre_usuario, email, password } = req.body;
    
    // --- ¡CAMBIO! Ya no encriptamos la contraseña ---
    // const salt = await bcrypt.genSalt(10);
    // const contraseña_hash = await bcrypt.hash(password, salt); 
    
    // --- ¡CAMBIO! Usamos la columna "contraseña" y guardamos el password en texto plano ---
    const nuevoUsuarioQuery = `
      INSERT INTO usuarios (nombre_usuario, email, contraseña) 
      VALUES ($1, $2, $3) 
      RETURNING id_usuario, nombre_usuario, email;
    `;
    // Pasamos el password directamente
    const nuevoUsuarioResult = await pool.query(nuevoUsuarioQuery, [nombre_usuario, email, password]);
    const usuarioCreado = nuevoUsuarioResult.rows[0];
    
    // Creamos su colección principal
    const nuevaColeccionQuery = `
      INSERT INTO colecciones (nombre, id_usuario_fk)
      VALUES ($1, $2)
      RETURNING id_coleccion;
    `;
    await pool.query(nuevaColeccionQuery, [`Colección de ${usuarioCreado.nombre_usuario}`, usuarioCreado.id_usuario]);
    res.status(201).json({
      message: 'Usuario y colección principal creados exitosamente',
      usuario: usuarioCreado
    });
  } catch (err) {
    console.error("--- ERROR DETALLADO EN REGISTRO ---", err);
    res.status(500).send('Error en el servidor al registrar');
  }
});

// --- ¡RUTA DE LOGIN ACTUALIZADA! ---
app.post('/api/login', async (req, res) => {
    console.log("Petición recibida en /api/login");
    try {
        const { email, password } = req.body;

        // 1. Buscar al usuario
        const usuarioQuery = "SELECT * FROM usuarios WHERE email = $1";
        const usuarioResult = await pool.query(usuarioQuery, [email]);

        if (usuarioResult.rows.length === 0) {
            return res.status(400).json({ message: "Credenciales inválidas" });
        }
        const usuario = usuarioResult.rows[0];

        // 2. Comparar la contraseña
        // --- ¡CAMBIO! Comparamos el texto plano directamente ---
        const esValida = (password === usuario.contraseña); 
        if (!esValida) {
            return res.status(400).json({ message: "Credenciales inválidas" });
        }

        // 3. Buscar la colección del usuario
        const coleccionQuery = "SELECT id_coleccion FROM colecciones WHERE id_usuario_fk = $1";
        const coleccionResult = await pool.query(coleccionQuery, [usuario.id_usuario]);
        
        const id_coleccion = coleccionResult.rows[0]?.id_coleccion; 

        // 4. Enviar respuesta exitosa
        res.status(200).json({
            message: "Inicio de sesión exitoso",
            usuario: {
                id_usuario: usuario.id_usuario,
                nombre_usuario: usuario.nombre_usuario,
                email: usuario.email,
                id_coleccion: id_coleccion 
            }
        });

    } catch (err) {
        console.error("--- ERROR DETALLADO EN LOGIN ---", err);
        res.status(500).send("Error en el servidor al iniciar sesión");
    }
});


// 6. Rutas de la API (Catálogos)
app.post('/api/catalogos', async (req, res) => {
  // ... (código existente) ...
  try {
    const { nombre, descripcion, id_coleccion_fk } = req.body;
    const nuevoCatalogoQuery = `
            INSERT INTO catalogos (nombre, descripcion, id_coleccion_fk)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
    const nuevoCatalogoResult = await pool.query(nuevoCatalogoQuery, [nombre, descripcion, id_coleccion_fk]);
    res.status(201).json({
      message: "Catálogo creado exitosamente",
      catalogo: nuevoCatalogoResult.rows[0]
    });
  } catch (err) {
    console.error("--- ERROR DETALLADO AL CREAR CATÁLOGO ---", err);
    res.status(500).send("Error en el servidor al crear el catálogo");
  }
});

app.get('/api/catalogos/:id_coleccion', async (req, res) => {
  // ... (código existente) ...
  try {
    const { id_coleccion } = req.params;
    const obtenerCatalogosQuery = `
            SELECT * FROM catalogos WHERE id_coleccion_fk = $1;
        `;
    const resultado = await pool.query(obtenerCatalogosQuery, [id_coleccion]);
    res.status(200).json(resultado.rows);
  } catch (err) {
    console.error("--- ERROR DETALLADO AL OBTENER CATÁLOGOS ---", err);
    res.status(500).send("Error en el servidor al obtener los catálogos");
  }
});


// 7. Rutas de la API (Objetos)
app.post('/api/objetos', async (req, res) => {
  // ... (código existente) ...
  try {
    const { nombre, tipo, anio, precio, estado, notas, id_catalogo_fk } = req.body;
    const nuevoCatalogoQuery = `
            INSERT INTO objetos (nombre, tipo, anio, precio, estado, notas, id_catalogo_fk)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
    const nuevoCatalogoResult = await pool.query(nuevoCatalogoQuery, [nombre, tipo, anio, precio, estado, notas, id_catalogo_fk]);
    res.status(201).json({
      message: "Objeto agregado exitosamente",
      objeto: nuevoCatalogoResult.rows[0]
    });
  } catch (err) {
    console.error("--- ERROR DETALLADO AL AGREGAR OBJETO ---", err);
    res.status(500).send("Error en el servidor al agregar el objeto");
  }
});

app.get('/api/objetos/:id_catalogo', async (req, res) => {
  // ... (código existente) ...
  try {
    const { id_catalogo } = req.params;
    const obtenerObjetosQuery = `
            SELECT * FROM objetos WHERE id_catalogo_fk = $1;
        `;
    const resultado = await pool.query(obtenerObjetosQuery, [id_catalogo]);
    res.status(200).json(resultado.rows);
  } catch (err) {
    console.error("--- ERROR DETALLADO AL OBTENER OBJETOS ---", err);
    res.status(500).send("Error en el servidor al obtener los objetos");
  }
});

app.put('/api/objetos/:id_objeto', async (req, res) => {
  // ... (código existente) ...
  try {
    const { id_objeto } = req.params;
    const { nombre, tipo, anio, precio, estado, notas, id_catalogo_fk } = req.body;
    const modificarObjetoQuery = `
            UPDATE objetos
            SET nombre = $1, tipo = $2, anio = $3, precio = $4, estado = $5, notas = $6, id_catalogo_fk = $7
            WHERE id_objeto = $8
            RETURNING *; 
        `;
    const resultado = await pool.query(modificarObjetoQuery, [nombre, tipo, anio, precio, estado, notas, id_catalogo_fk, id_objeto]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: "Objeto no encontrado" });
    }
    res.status(200).json({
      message: "Objeto modificado exitosamente",
      objeto: resultado.rows[0]
    });
  } catch (err) {
    console.error("--- ERROR DETALLADO AL MODIFICAR OBJETO ---", err);
    res.status(500).send("Error en el servidor al modificar el objeto");
  }
});

app.delete('/api/objetos/:id_objeto', async (req, res) => {
  // ... (código existente) ...
  try {
    const { id_objeto } = req.params;
    const eliminarFotosQuery = "DELETE FROM fotos WHERE id_objeto_fk = $1";
    await pool.query(eliminarFotosQuery, [id_objeto]);
    console.log(`Fotos asociadas al objeto ${id_objeto} eliminadas (si existían).`);
    const eliminarObjetoQuery = "DELETE FROM objetos WHERE id_objeto = $1 RETURNING *;";
    const resultado = await pool.query(eliminarObjetoQuery, [id_objeto]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: "Objeto no encontrado" });
    }
    res.status(200).json({
      message: "Objeto eliminado exitosamente",
      objeto_eliminado: resultado.rows[0]
    });
  } catch (err) {
    console.error("--- ERROR DETALLADO AL ELIMINAR OBJETO ---", err);
    res.status(500).send("Error en el servidor al eliminar el objeto");
  }
});


// 8. --- Iniciar el servidor SOLO si la conexión a la BD es exitosa ---
async function startServer() {
  if (await testDbConnection()) {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    });
  } else {
    console.log("🔴 El servidor no se iniciará debido al error de conexión.");
  }
}

startServer();

