import { useEffect, useState } from "react";
import axios from "axios";
import "./Medicos.css";

type Medico = {
  idMedico?: number;
  especialidad: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string; // YYYY-MM-DD
  numConsultorio: string;
  cmp: string;
};

function Medicos() {
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [form, setForm] = useState<Medico>({
    especialidad: "",
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    fechaNacimiento: "",
    numConsultorio: "",
    cmp: "",
  });

  /* ================== API ================== */
  const cargarMedicos = async () => {
    try {
      const res = await axios.get<Medico[]>("http://localhost:8083/medicos");
      setMedicos(res.data);
    } catch (error) {
      console.error("Error cargando médicos:", error);
    }
  };

  const guardarMedico = async () => {
    try {
      await axios.post("http://localhost:8083/medicos", form);
      setForm({
        especialidad: "",
        nombres: "",
        apellidoPaterno: "",
        apellidoMaterno: "",
        fechaNacimiento: "",
        numConsultorio: "",
        cmp: "",
      });
      await cargarMedicos();
    } catch (error) {
      console.error("Error guardando médico:", error);
    }
  };

  /* ================== LIFE CYCLE ================== */
  useEffect(() => {
    cargarMedicos();
  }, []);

  /* ================== RENDER ================== */
  return (
    <div className="medicos-container">
      <h2>Médicos</h2>

      {/* FORMULARIO CREAR */}
      <div className="medico-form">
        <h3>Agregar Médico</h3>

        <input
          type="text"
          placeholder="Nombres"
          value={form.nombres}
          onChange={(e) => setForm({ ...form, nombres: e.target.value })}
        />

        <input
          type="text"
          placeholder="Apellido Paterno"
          value={form.apellidoPaterno}
          onChange={(e) => setForm({ ...form, apellidoPaterno: e.target.value })}
        />

        <input
          type="text"
          placeholder="Apellido Materno"
          value={form.apellidoMaterno}
          onChange={(e) => setForm({ ...form, apellidoMaterno: e.target.value })}
        />

        <input
          type="text"
          placeholder="Especialidad"
          value={form.especialidad}
          onChange={(e) => setForm({ ...form, especialidad: e.target.value })}
        />

        <input
          type="date"
          placeholder="Fecha de Nacimiento"
          value={form.fechaNacimiento}
          onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })}
        />

        <input
          type="text"
          placeholder="Número de Consultorio"
          value={form.numConsultorio}
          onChange={(e) => setForm({ ...form, numConsultorio: e.target.value })}
        />

        <input
          type="text"
          placeholder="CMP"
          value={form.cmp}
          onChange={(e) => setForm({ ...form, cmp: e.target.value })}
        />

        <button onClick={guardarMedico}>Guardar Médico</button>
      </div>

      {/* LISTADO DE MÉDICOS */}
      <div className="medicos-list">
        <h3>Lista de Médicos</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombres</th>
              <th>Ap. Paterno</th>
              <th>Ap. Materno</th>
              <th>Especialidad</th>
              <th>Fecha Nac.</th>
              <th>Consultorio</th>
              <th>CMP</th>
            </tr>
          </thead>
          <tbody>
            {medicos.map((m) => (
              <tr key={m.idMedico}>
                <td>{m.idMedico}</td>
                <td>{m.nombres}</td>
                <td>{m.apellidoPaterno}</td>
                <td>{m.apellidoMaterno}</td>
                <td>{m.especialidad}</td>
                <td>{m.fechaNacimiento}</td>
                <td>{m.numConsultorio}</td>
                <td>{m.cmp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Medicos;