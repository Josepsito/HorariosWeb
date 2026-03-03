// src/components/horarios/Horarios.tsx
import { useEffect, useState } from "react";
import "./Horarios.css";
import axios from "axios";

type Medico = {
  idMedico: number;
  especialidad: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  numConsultorio: string;
};

type Usuario = {
  idUsuario: number;
  nombre: string;
  email: string;
};

type Periodo = {
  id: number;
  horaInicio: string;
  horaFin: string;
};

type LineaPeriodo = {
  idLinea?: number;
  dia: string;
  estado: boolean;
  periodo: Periodo;
};

type Horario = {
  idhorario: number;
  medico: Medico;
  usuario: Usuario;
  lineaPeriodos: LineaPeriodo[];
};

type SelectorProps = {
  selectedId: number | null;
  onChange: (id: number) => void;
};

// Selector de Médico
function SelectMedico({ selectedId, onChange }: SelectorProps) {
  const [medicos, setMedicos] = useState<Medico[]>([]);

  useEffect(() => {
    const cargarMedicos = async () => {
      try {
        const res = await axios.get<Medico[]>("http://localhost:8083/medicos");
        setMedicos(res.data);
      } catch (error) {
        console.error("Error cargando médicos:", error);
      }
    };
    cargarMedicos();
  }, []);

  return (
    <div className="select-medico">
      <label>Médico:</label>
      <select value={selectedId ?? ""} onChange={(e) => onChange(Number(e.target.value))}>
        <option value="">Selecciona un médico</option>
        {medicos.map((m) => (
          <option key={m.idMedico} value={m.idMedico}>
            {m.nombres} {m.apellidoPaterno} ({m.especialidad})
          </option>
        ))}
      </select>
    </div>
  );
}

// Selector de Usuario
function SelectUsuario({ selectedId, onChange }: SelectorProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const res = await axios.get<Usuario[]>("http://localhost:8081/usuarios");
        setUsuarios(res.data);
      } catch (error) {
        console.error("Error cargando usuarios:", error);
      }
    };
    cargarUsuarios();
  }, []);

  return (
    <div className="select-usuario">
      <label>Usuario:</label>
      <select value={selectedId ?? ""} onChange={(e) => onChange(Number(e.target.value))}>
        <option value="">Selecciona un usuario</option>
        {usuarios.map((u) => (
          <option key={u.idUsuario} value={u.idUsuario}>
            {u.nombre} ({u.email})
          </option>
        ))}
      </select>
    </div>
  );
}

export default function Horarios() {
  const horas: string[] = [
    "07:00","08:00","09:00","10:00","11:00",
    "12:00","13:00","14:00","15:00","16:00",
    "17:00","18:00","19:00","20:00","21:00",
    "22:00","23:00"
  ];

  const dias: string[] = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sabado","Domingo"];

  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [horario, setHorario] = useState<Horario | null>(null);

  const [selectedMedicoId, setSelectedMedicoId] = useState<number | null>(null);
  const [selectedUsuarioIdModal, setSelectedUsuarioIdModal] = useState<number | null>(null);

  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [carrito, setCarrito] = useState<LineaPeriodo[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
  const [modalModificarOpen, setModalModificarOpen] = useState(false);

  const [selectedDia, setSelectedDia] = useState<string>("");
  const [selectedPeriodoId, setSelectedPeriodoId] = useState<number | null>(null);
  const [selectedLineaId, setSelectedLineaId] = useState<number | null>(null);

  const [modDia, setModDia] = useState<string>("");
  const [modPeriodoId, setModPeriodoId] = useState<number | null>(null);

  /* ================== API ================== */
  const cargarHorarios = async () => {
    try {
      const res = await axios.get<Horario[]>("http://localhost:8084/horarios");
      setHorarios(res.data);
      if (selectedMedicoId) {
        const encontrado = res.data.find(h => h.medico.idMedico === selectedMedicoId);
        setHorario(encontrado || null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const cargarPeriodos = async () => {
    try {
      const res = await axios.get<Periodo[]>("http://localhost:8082/periodos");
      setPeriodos(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const cargarCarrito = async () => {
    try {
      const res = await axios.get<LineaPeriodo[]>("http://localhost:8085/carritoPeriodos");
      setCarrito(res.data);
    } catch (error) {
      console.error("Error cargando carrito:", error);
    }
  };

  const agregarPeriodoAlCarrito = async () => {
    if (!selectedDia || selectedPeriodoId === null) return;

    try {
      await axios.post("http://localhost:8085/carritoPeriodos", {
        dia: selectedDia,
        idPeriodo: selectedPeriodoId
      });
      setSelectedDia("");
      setSelectedPeriodoId(null);
      await cargarCarrito();
    } catch (error) {
      console.error("Error agregando línea al carrito:", error);
    }
  };

  const agregarLineasAlHorario = async () => {
    if (!selectedMedicoId || !selectedUsuarioIdModal) return;
    if (carrito.length === 0) return;

    try {
      let horarioId = horario?.idhorario;

      if (!horarioId) {
        const res = await axios.post("http://localhost:8084/horarios", {
          medicoId: selectedMedicoId,
          usuarioId: selectedUsuarioIdModal
        });

        setHorario(res.data);
        horarioId = res.data.idhorario;
      }

      await axios.post(`http://localhost:8084/horarios/lineas/${horarioId}`);
      setCarrito([]);
      await cargarHorarios();
      setModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const eliminarLinea = async () => {
    if (!horario || selectedLineaId === null) return;

    try {
      await axios.delete(`http://localhost:8084/horarios/lineas/${horario.idhorario}/${selectedLineaId}`);
      setSelectedLineaId(null);
      setModalEliminarOpen(false);
      await cargarHorarios();
    } catch (error) {
      console.error(error);
    }
  };

  const modificarLinea = async () => {
    if (!horario || selectedLineaId === null || !modDia || modPeriodoId === null) return;

    try {
      await axios.put(`http://localhost:8084/horarios/lineas/${horario.idhorario}/${selectedLineaId}`, {
        dia: modDia,
        idPeriodo: modPeriodoId
      });
      setSelectedLineaId(null);
      setModDia("");
      setModPeriodoId(null);
      setModalModificarOpen(false);
      await cargarHorarios();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    cargarHorarios();
    cargarPeriodos();
    cargarCarrito();
  }, []);

  useEffect(() => {
    if (selectedMedicoId) {
      const encontrado = horarios.find(h => h.medico.idMedico === selectedMedicoId);
      setHorario(encontrado || null);
    } else {
      setHorario(null);
    }
  }, [selectedMedicoId, horarios]);

  /* ================== HELPERS ================== */
  const calcularDuracion = (inicio: string, fin: string) =>
    Number(fin.slice(0, 2)) - Number(inicio.slice(0, 2));

  const esInicioDelBloque = (bloque: LineaPeriodo, hora: string) =>
    bloque.periodo.horaInicio.slice(0, 5) === hora;

  const obtenerBloque = (dia: string, hora: string): LineaPeriodo | undefined => {
    if (!horario) return;
    return horario.lineaPeriodos.find((p) => 
      p.estado &&
      p.dia.toLowerCase() === dia.toLowerCase() &&
      hora >= p.periodo.horaInicio.slice(0,5) &&
      hora < p.periodo.horaFin.slice(0,5)
    );
  };

  /* ================== RENDER ================== */
  return (
    <div className="schedule-container">
      {/* Selector de Médico */}
      <SelectMedico selectedId={selectedMedicoId} onChange={setSelectedMedicoId}/>

      <div className="container">
        <div className="title-container">
          <h2>Horario del Médico Seleccionado</h2>
          <button onClick={() => setModalOpen(true)}>Añadir Línea</button>
          <button onClick={() => setModalEliminarOpen(true)}>Eliminar Línea</button>
          <button onClick={() => setModalModificarOpen(true)}>Modificar Línea</button>
        </div>
      </div>

      {/* Tabla de Horario */}
      <table className="schedule-table">
        <thead>
          <tr>
            <th>Hora</th>
            {dias.map(d => <th key={d}>{d}</th>)}
          </tr>
        </thead>
        <tbody>
          {horas.map(hora => (
            <tr key={hora}>
              <td className="hora">{hora}</td>
              {dias.map(dia => {
                const bloque = obtenerBloque(dia, hora);
                if (!bloque) return <td key={dia+hora}></td>;
                if (!esInicioDelBloque(bloque, hora)) return null;
                const duracion = calcularDuracion(bloque.periodo.horaInicio, bloque.periodo.horaFin);
                return (
                  <td key={dia+hora} rowSpan={duracion}>
                    <div className="bloque">
                      <div className="bloque-medico">{horario!.medico.nombres} {horario!.medico.apellidoPaterno}</div>
                      <div className="bloque-especialidad">{horario!.medico.especialidad}</div>
                      <div className="bloque-consultorio">Consultorio {horario!.medico.numConsultorio}</div>
                      <div className="bloque-hora">{bloque.periodo.horaInicio} - {bloque.periodo.horaFin}</div>
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================== MODALES ================== */}
      {/* Modal Agregar */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Agregar Línea</h3>

            <SelectMedico selectedId={selectedMedicoId} onChange={setSelectedMedicoId}/>
            <SelectUsuario selectedId={selectedUsuarioIdModal} onChange={setSelectedUsuarioIdModal}/>

            <label>Día:</label>
            <select value={selectedDia} onChange={e => setSelectedDia(e.target.value)}>
              <option value="">Selecciona un día</option>
              {dias.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <label>Periodo:</label>
            <select value={selectedPeriodoId ?? ""} onChange={e => setSelectedPeriodoId(Number(e.target.value) || null)}>
              <option value="">Selecciona un periodo</option>
              {periodos.map(p => (
                <option key={p.id} value={p.id}>{p.horaInicio} - {p.horaFin}</option>
              ))}
            </select>

            <div className="modal-buttons">
              <button onClick={agregarPeriodoAlCarrito}>Añadir al Carrito</button>
              <button onClick={agregarLineasAlHorario}>Agregar al Horario</button>
              <button onClick={() => setModalOpen(false)}>Cancelar</button>
            </div>

            <h4>Carrito actual:</h4>
            <ul>
              {carrito.map((linea, idx) => (
                <li key={idx}>{linea.dia} — {linea.periodo.horaInicio} a {linea.periodo.horaFin}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {modalEliminarOpen && horario && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Eliminar Línea del Horario</h3>
            <label>Selecciona línea:</label>
            <select value={selectedLineaId ?? ""} onChange={e => setSelectedLineaId(Number(e.target.value) || null)}>
              <option value="">Selecciona una línea</option>
              {horario.lineaPeriodos.map(linea => (
                <option key={linea.idLinea} value={linea.idLinea}>
                  {linea.dia} - {linea.periodo.horaInicio} a {linea.periodo.horaFin}
                </option>
              ))}
            </select>
            <div className="modal-buttons">
              <button onClick={eliminarLinea}>Eliminar</button>
              <button onClick={() => setModalEliminarOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Modificar */}
      {modalModificarOpen && horario && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Modificar Línea del Horario</h3>
            <label>Selecciona línea:</label>
            <select value={selectedLineaId ?? ""} onChange={e => setSelectedLineaId(Number(e.target.value) || null)}>
              <option value="">Selecciona una línea</option>
              {horario.lineaPeriodos.map(linea => (
                <option key={linea.idLinea} value={linea.idLinea}>
                  {linea.dia} - {linea.periodo.horaInicio} a {linea.periodo.horaFin}
                </option>
              ))}
            </select>

            <label>Nuevo día:</label>
            <select value={modDia} onChange={e => setModDia(e.target.value)}>
              <option value="">Selecciona un día</option>
              {dias.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <label>Nuevo periodo:</label>
            <select value={modPeriodoId ?? ""} onChange={e => setModPeriodoId(Number(e.target.value) || null)}>
              <option value="">Selecciona un periodo</option>
              {periodos.map(p => (
                <option key={p.id} value={p.id}>{p.horaInicio} - {p.horaFin}</option>
              ))}
            </select>

            <div className="modal-buttons">
              <button onClick={modificarLinea}>Guardar Cambios</button>
              <button onClick={() => setModalModificarOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}