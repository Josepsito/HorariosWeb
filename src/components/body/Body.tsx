import { useEffect, useState } from "react";
import "./Body.css";
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

function Body() {
  const medicoId = 1;

  const horas: string[] = [
    "07:00","08:00","09:00","10:00","11:00",
    "12:00","13:00","14:00","15:00","16:00",
    "17:00","18:00","19:00","20:00","21:00",
    "22:00","23:00"
  ];

  const dias: string[] = [
    "Lunes","Martes","Miércoles","Jueves","Viernes","Sabado","Domingo"
  ];

  const [horario, setHorario] = useState<Horario | null>(null);
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [carrito, setCarrito] = useState<LineaPeriodo[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
  const [modalModificarOpen, setModalModificarOpen] = useState(false); // <-- Modal modificar
  const [selectedDia, setSelectedDia] = useState<string>("");
  const [selectedPeriodoId, setSelectedPeriodoId] = useState<number | null>(null);
  const [selectedLineaId, setSelectedLineaId] = useState<number | null>(null); 

  const [modDia, setModDia] = useState<string>("");
  const [modPeriodoId, setModPeriodoId] = useState<number | null>(null);

  /* ================== API ================== */
  const cargarHorario = async () => {
    try {
      const res = await axios.get<Horario[]>("http://localhost:8084/horarios");
      const encontrado = res.data.find(h => h.medico.idMedico === medicoId);
      setHorario(encontrado || null);
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

      console.log(res.data)

      setCarrito(res.data);
    } catch (error) {
      console.error("Error cargando carrito:", error);
    }
  };

  const agregarPeriodoAlCarrito = async () => {
    if (!selectedDia || selectedPeriodoId === null) return;

    const lineaRequest = {
      dia: selectedDia,
      idPeriodo: selectedPeriodoId
    };

    try {
      await axios.post("http://localhost:8085/carritoPeriodos", lineaRequest);
      setSelectedDia("");
      setSelectedPeriodoId(null);
      await cargarCarrito();
    } catch (error) {
      console.error("Error agregando línea al carrito:", error);
    }
  };

  const agregarLineasAlHorario = async () => {

  if (carrito.length === 0) return;

  try {
    let horarioId = horario?.idhorario;

    // 🟢 crear horario si no existe
    if (!horarioId) {
      const res = await axios.post("http://localhost:8084/horarios", {
        medicoId,
        usuarioId: 1
      });

      setHorario(res.data);
      horarioId = res.data.idhorario;
    }

    // 🟢 aquí llamas al backend que lee el carrito desde su MS
    await axios.post(
      `http://localhost:8084/horarios/lineas/${horarioId}`
    );

    // 🟢 limpiar estado local
    setCarrito([]);

    await cargarHorario();
    setModalOpen(false);

  } catch (error) {
    console.error("Error agregando líneas al horario:", error);
  }
};

  const eliminarLinea = async () => {
    if (!horario || selectedLineaId === null) return;

    try {
      await axios.delete(`http://localhost:8084/horarios/lineas/${horario.idhorario}/${selectedLineaId}`);
      setSelectedLineaId(null);
      setModalEliminarOpen(false);
      await cargarHorario();
    } catch (error) {
      console.error("Error eliminando línea:", error);
    }
  };

  const modificarLinea = async () => {
    if (!horario || selectedLineaId === null || !modDia || modPeriodoId === null) return;

    const request = {
      dia: modDia,
      idPeriodo: modPeriodoId
    };

    try {
      await axios.put(`http://localhost:8084/horarios/lineas/${horario.idhorario}/${selectedLineaId}`, request);
      setSelectedLineaId(null);
      setModDia("");
      setModPeriodoId(null);
      setModalModificarOpen(false);
      await cargarHorario();
    } catch (error) {
      console.error("Error modificando línea:", error);
    }
  };

  useEffect(() => {
    cargarHorario();
    cargarPeriodos();
    cargarCarrito();
  }, []);

  /* ================== HELPERS ================== */
  const calcularDuracion = (inicio: string, fin: string) =>
  Number(fin.slice(0, 2)) - Number(inicio.slice(0, 2));

  const esInicioDelBloque = (bloque: LineaPeriodo, hora: string) =>
    bloque.periodo.horaInicio.slice(0, 5) === hora;

  const obtenerBloque = (dia: string, hora: string): LineaPeriodo | undefined => {
    if (!horario) return;

    return horario.lineaPeriodos.find(p => {
      const inicio = p.periodo.horaInicio.slice(0, 5);
      const fin = p.periodo.horaFin.slice(0, 5);

      return (
        p.estado &&
        p.dia.toLowerCase() === dia.toLowerCase() &&
        hora >= inicio &&
        hora < fin
      );
    });
};

  /* ================== RENDER ================== */
  return (
  <div className="schedule-container">
    <div className="container">
      <div className="title-container">
        <h2>Mi Horario</h2>
        <button onClick={() => setModalOpen(true)}>Añadir Línea</button>
        <button onClick={() => setModalEliminarOpen(true)}>Eliminar Línea</button>
        <button onClick={() => setModalModificarOpen(true)}>Modificar Línea</button>
      </div>
    </div>

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

        if (!bloque) return <td key={dia + hora}></td>;

        const inicio = bloque.periodo.horaInicio.slice(0, 5);
        const fin = bloque.periodo.horaFin.slice(0, 5);

        if (!esInicioDelBloque(bloque, hora)) return null;

        const duracion = calcularDuracion(inicio, fin);

        return (
          <td key={dia + hora} rowSpan={duracion}>
            <div className="bloque">

              <div className="bloque-medico">
                {horario!.medico.nombres} {horario!.medico.apellidoPaterno}
              </div>

              <div className="bloque-especialidad">
                {horario!.medico.especialidad}
              </div>

              <div className="bloque-consultorio">
                Consultorio {horario!.medico.numConsultorio}
              </div>

              <div className="bloque-hora">
                {inicio} - {fin}
              </div>

            </div>
          </td>
        );
      })}
    </tr>
  ))}
</tbody>
    </table>

    {/* MODAL AGREGAR */}
    {modalOpen && (
      <div className="modal-backdrop">
        <div className="modal">

          <h3>Agregar Línea</h3>

          <label>Día:</label>
          <select
            value={selectedDia}
            onChange={e => setSelectedDia(e.target.value)}
          >
            <option value="">Selecciona un día</option>
            {dias.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <label>Periodo:</label>
          <select
            value={selectedPeriodoId?.toString() ?? ""}
            onChange={e =>
              setSelectedPeriodoId(
                e.target.value ? Number(e.target.value) : null
              )
            }
          >
            <option value="">Selecciona un periodo</option>
            {periodos.map(p => (
              <option key={p.id} value={p.id}>
                {p.horaInicio} - {p.horaFin}
              </option>
            ))}
          </select>

          <div className="modal-buttons">
            <button onClick={agregarPeriodoAlCarrito}>
              Añadir al Carrito
            </button>

            <button onClick={agregarLineasAlHorario}>
              Agregar al Horario
            </button>

            <button onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
          </div>

          <h4>Carrito actual:</h4>

          <ul>
            {carrito.map((linea, idx) => (
              <li key={idx}>
                {linea.dia} — {linea.periodo.horaInicio} a {linea.periodo.horaFin}
              </li>
            ))}
          </ul>

        </div>
      </div>
    )}

    {/* MODAL ELIMINAR */}
    {modalEliminarOpen && horario && (
      <div className="modal-backdrop">
        <div className="modal">

          <h3>Eliminar Línea del Horario</h3>

          <label>Selecciona línea:</label>
          <select
            value={selectedLineaId ?? ""}
            onChange={e =>
              setSelectedLineaId(
                e.target.value ? Number(e.target.value) : null
              )
            }
          >
            <option value="">Selecciona una línea</option>

            {horario.lineaPeriodos.map(linea => (
              <option key={linea.idLinea} value={linea.idLinea}>
                {linea.dia} - {linea.periodo.horaInicio} a {linea.periodo.horaFin}
              </option>
            ))}
          </select>

          <div className="modal-buttons">
            <button onClick={eliminarLinea}>Eliminar</button>
            <button onClick={() => setModalEliminarOpen(false)}>
              Cancelar
            </button>
          </div>

        </div>
      </div>
    )}

    {/* MODAL MODIFICAR */}
    {modalModificarOpen && horario && (
      <div className="modal-backdrop">
        <div className="modal">

          <h3>Modificar Línea del Horario</h3>

          <label>Selecciona línea:</label>
          <select
            value={selectedLineaId ?? ""}
            onChange={e =>
              setSelectedLineaId(
                e.target.value ? Number(e.target.value) : null
              )
            }
          >
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
          <select
            value={modPeriodoId ?? ""}
            onChange={e =>
              setModPeriodoId(
                e.target.value ? Number(e.target.value) : null
              )
            }
          >
            <option value="">Selecciona un periodo</option>

            {periodos.map(p => (
              <option key={p.id} value={p.id}>
                {p.horaInicio} - {p.horaFin}
              </option>
            ))}
          </select>

          <div className="modal-buttons">
            <button onClick={modificarLinea}>Guardar Cambios</button>
            <button onClick={() => setModalModificarOpen(false)}>
              Cancelar
            </button>
          </div>

        </div>
      </div>
    )}

  </div>
);
}

export default Body;