// src/components/usuarios/Usuarios.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import "./Usuarios.css";

type Usuario = {
  idUsuario?: number;
  nombre: string;
  email: string;
  contrasenia: string;
  fechaCreacion?: string; // ISO string
};

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [form, setForm] = useState<Usuario>({
    nombre: "",
    email: "",
    contrasenia: "",
  });

  const [selectedUsuarioId, setSelectedUsuarioId] = useState<number | null>(null);

  /* ================== API ================== */
  const cargarUsuarios = async () => {
    try {
      const res = await axios.get<Usuario[]>("http://localhost:8081/usuarios");
      setUsuarios(res.data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    }
  };

  const guardarUsuario = async () => {
    try {
      await axios.post("http://localhost:8081/usuarios", form);
      setForm({ nombre: "", email: "", contrasenia: "" });
      await cargarUsuarios();
    } catch (error) {
      console.error("Error guardando usuario:", error);
    }
  };

  const eliminarUsuario = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8081/usuarios/${id}`);
      await cargarUsuarios();
    } catch (error) {
      console.error("Error eliminando usuario:", error);
    }
  };

  const actualizarUsuario = async () => {
    if (!selectedUsuarioId) return;
    try {
      await axios.put(`http://localhost:8081/usuarios/${selectedUsuarioId}`, form);
      setForm({ nombre: "", email: "", contrasenia: "" });
      setSelectedUsuarioId(null);
      await cargarUsuarios();
    } catch (error) {
      console.error("Error actualizando usuario:", error);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  /* ================== RENDER ================== */
  return (
    <div className="usuarios-container">
      <h2>Usuarios</h2>

      {/* FORMULARIO CREAR / EDITAR */}
      <div className="usuario-form">
        <h3>{selectedUsuarioId ? "Editar Usuario" : "Agregar Usuario"}</h3>

        <input
          type="text"
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        />

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={form.contrasenia}
          onChange={(e) => setForm({ ...form, contrasenia: e.target.value })}
        />

        <div className="form-buttons">
          {selectedUsuarioId ? (
            <button onClick={actualizarUsuario}>Guardar Cambios</button>
          ) : (
            <button onClick={guardarUsuario}>Guardar Usuario</button>
          )}
          <button
            onClick={() => {
              setForm({ nombre: "", email: "", contrasenia: "" });
              setSelectedUsuarioId(null);
            }}
          >
            Cancelar
          </button>
        </div>
      </div>

      {/* LISTADO DE USUARIOS */}
      <div className="usuarios-list">
        <h3>Lista de Usuarios</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Contraseña</th>
              <th>Fecha Creación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.idUsuario}>
                <td>{u.idUsuario}</td>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td>{u.contrasenia}</td>
                <td>{u.fechaCreacion ? new Date(u.fechaCreacion).toLocaleDateString() : ""}</td>
                <td>
                  <button
                    onClick={() => {
                      setSelectedUsuarioId(u.idUsuario!);
                      setForm({ nombre: u.nombre, email: u.email, contrasenia: u.contrasenia });
                    }}
                  >
                    Editar
                  </button>
                  <button onClick={() => eliminarUsuario(u.idUsuario!)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}