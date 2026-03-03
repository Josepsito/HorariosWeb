// src/components/periodos/Periodos.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import "./Periodos.css";

type Periodo = {
  id?: number;
  horaInicio: string; // "HH:mm"
  horaFin: string;    // "HH:mm"
};

export default function Periodos() {
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [form, setForm] = useState<Periodo>({ horaInicio: "", horaFin: "" });
  const [selectedPeriodoId, setSelectedPeriodoId] = useState<number | null>(null);

  /* ================== API ================== */
  const cargarPeriodos = async () => {
    try {
      const res = await axios.get<Periodo[]>("http://localhost:8082/periodos");
      setPeriodos(res.data);
    } catch (error) {
      console.error("Error cargando periodos:", error);
    }
  };

  const guardarPeriodo = async () => {
    try {
      await axios.post("http://localhost:8082/periodos", form);
      setForm({ horaInicio: "", horaFin: "" });
      await cargarPeriodos();
    } catch (error) {
      console.error("Error guardando periodo:", error);
    }
  };

  const actualizarPeriodo = async () => {
    if (!selectedPeriodoId) return;
    try {
      await axios.put(`http://localhost:8082/periodos/${selectedPeriodoId}`, form);
      setForm({ horaInicio: "", horaFin: "" });
      setSelectedPeriodoId(null);
      await cargarPeriodos();
    } catch (error) {
      console.error("Error actualizando periodo:", error);
    }
  };

  const eliminarPeriodo = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8082/periodos/${id}`);
      await cargarPeriodos();
    } catch (error) {
      console.error("Error eliminando periodo:", error);
    }
  };

  useEffect(() => {
    cargarPeriodos();
  }, []);

  /* ================== RENDER ================== */
  return (
    <div className="periodos-container">
      <h2>Periodos</h2>

      {/* FORMULARIO CREAR / EDITAR */}
      <div className="periodo-form">
        <h3>{selectedPeriodoId ? "Editar Periodo" : "Agregar Periodo"}</h3>

        <input
          type="time"
          placeholder="Hora Inicio"
          value={form.horaInicio}
          onChange={(e) => setForm({ ...form, horaInicio: e.target.value })}
        />

        <input
          type="time"
          placeholder="Hora Fin"
          value={form.horaFin}
          onChange={(e) => setForm({ ...form, horaFin: e.target.value })}
        />

        <div className="form-buttons">
          {selectedPeriodoId ? (
            <button onClick={actualizarPeriodo}>Guardar Cambios</button>
          ) : (
            <button onClick={guardarPeriodo}>Guardar Periodo</button>
          )}
          <button
            onClick={() => {
              setForm({ horaInicio: "", horaFin: "" });
              setSelectedPeriodoId(null);
            }}
          >
            Cancelar
          </button>
        </div>
      </div>

      {/* LISTADO DE PERIODOS */}
      <div className="periodos-list">
        <h3>Lista de Periodos</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Hora Inicio</th>
              <th>Hora Fin</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {periodos.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.horaInicio}</td>
                <td>{p.horaFin}</td>
                <td>
                  <button
                    onClick={() => {
                      setSelectedPeriodoId(p.id!);
                      setForm({ horaInicio: p.horaInicio, horaFin: p.horaFin });
                    }}
                  >
                    Editar
                  </button>
                  <button onClick={() => eliminarPeriodo(p.id!)}>
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