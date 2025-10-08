// ====== Dependencias ======
const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

// ====== Inicializar servidor ======
const app = express();
const PORT = process.env.PORT || 10000;

// ====== Middleware ======
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("prueba"));

// ====== Conexión a MySQL (solo si está disponible) ======
let con;

try {
  con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "5IV8",
    port: 3306,
  });

  con.connect((err) => {
    if (err) {
      console.log("⚠️ No se pudo conectar a MySQL local. Es posible que estés en Render.");
    } else {
      console.log("✅ Conectado a MySQL local.");
    }
  });
} catch (error) {
  console.log("⚠️ Error al inicializar la conexión MySQL:", error.message);
}

// ====== Rutas ======

// Agregar usuario
app.post("/agregarUsuario", (req, res) => {
  if (!con || con.state === "disconnected") {
    return res.status(503).send("Base de datos no disponible.");
  }

  const nombre = req.body.nombre;
  const id = req.body.id;

  con.query(
    "INSERT INTO usuario (id_usuario, nombre) VALUES (?, ?)",
    [id, nombre],
    (err, respuesta) => {
      if (err) {
        console.log("Error al insertar:", err);
        return res.status(500).send("Error al insertar usuario");
      }
      return res.send(`<h1>Usuario agregado:</h1> ${nombre}`);
    }
  );
});

// Consultar usuarios
app.get("/obtenerUsuario", (req, res) => {
  if (!con || con.state === "disconnected") {
    return res.status(503).send("Base de datos no disponible.");
  }

  con.query("SELECT * FROM usuario", (err, respuesta) => {
    if (err) {
      console.log("ERROR: ", err);
      return res.status(500).send("Error al obtener usuarios");
    }

    let userHTML = "";
    respuesta.forEach((user, i) => {
      userHTML += `<tr><td>${i + 1}</td><td>${user.nombre}</td></tr>`;
    });

    return res.send(`
      <table border="1" cellpadding="5">
        <tr><th>#</th><th>Nombre</th></tr>
        ${userHTML}
      </table>
    `);
  });
});

// Borrar usuario
app.post("/borrarUsuario", (req, res) => {
  if (!con || con.state === "disconnected") {
    return res.status(503).send("Base de datos no disponible.");
  }

  const id = req.body.id;

  con.query(
    "DELETE FROM usuario WHERE id_usuario = ?",
    [id],
    (err, resultado) => {
      if (err) {
        console.error("Error al borrar el usuario:", err);
        return res.status(500).send("Error al borrar el usuario");
      }
      if (resultado.affectedRows === 0) {
        return res.status(404).send("Usuario no encontrado");
      }
      return res.send(`Usuario con ID ${id} borrado correctamente`);
    }
  );
});

// ====== Iniciar servidor ======
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
