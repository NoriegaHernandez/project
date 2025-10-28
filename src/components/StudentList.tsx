
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, AlertTriangle, Edit, UserX } from 'lucide-react';
import RiskFactorForm from './RiskFactorForm';

interface RegistroEstudiante {
  id: string;
  estudiante: {
    numero_control: string;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
  };
  materia: {
    nombre: string;
  };
  semestre: number;
  calificacion_final: number | null;
  estado: string;
  cantidad_riesgos: number;
}

interface CategoriaFactorRiesgo {
  id: string;
  nombre: string;
  descripcion: string;
}

export default function StudentList() {
  const [registros, setRegistros] = useState<RegistroEstudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [registroSeleccionado, setRegistroSeleccionado] = useState<RegistroEstudiante | null>(null);
  const [registroBaja, setRegistroBaja] = useState<RegistroEstudiante | null>(null);
  const [categorias, setCategorias] = useState<CategoriaFactorRiesgo[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [observacionesBaja, setObservacionesBaja] = useState('');
  const [procesandoBaja, setProcesandoBaja] = useState(false);
  const [filtro, setFiltro] = useState<'all' | 'reprobado' | 'baja'>('all');

  useEffect(() => {
    cargarRegistros();
    cargarCategorias();
  }, [filtro]);

  const cargarCategorias = async () => {
    const { data } = await supabase
      .from('categorias_factores_riesgo')
      .select('*')
      .order('nombre');
    if (data) setCategorias(data);
  };

  const cargarRegistros = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('registros_estudiante_materia')
        .select(`
          id,
          semestre,
          calificacion_final,
          estado,
          estudiantes!inner (
            numero_control,
            nombre,
            apellido_paterno,
            apellido_materno
          ),
          materias!inner (
            nombre
          )
        `)
        .order('creado_en', { ascending: false });

      if (filtro !== 'all') {
        query = query.eq('estado', filtro);
      }

      const { data, error } = await query;

      if (error) throw error;

      const registrosConRiesgos = await Promise.all(
        (data || []).map(async (registro: any) => {
          const { count } = await supabase
            .from('factores_riesgo_estudiante')
            .select('id', { count: 'exact', head: true })
            .eq('registro_estudiante_materia_id', registro.id);

          return {
            id: registro.id,
            estudiante: registro.estudiantes,
            materia: registro.materias,
            semestre: registro.semestre,
            calificacion_final: registro.calificacion_final,
            estado: registro.estado,
            cantidad_riesgos: count || 0,
          };
        })
      );

      setRegistros(registrosConRiesgos);
    } catch (error) {
      console.error('Error cargando registros:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDarDeBaja = async () => {
    if (!registroBaja || !categoriaSeleccionada) return;

    setProcesandoBaja(true);
    try {
      // Buscar o crear el factor de riesgo
      const { data: existingFactor } = await supabase
        .from('factores_riesgo')
        .select('id')
        .eq('categoria_id', categoriaSeleccionada)
        .maybeSingle();

      let factorId: string;

      if (existingFactor) {
        factorId = existingFactor.id;
      } else {
        const categoria = categorias.find(c => c.id === categoriaSeleccionada);
        const { data: newFactor, error } = await supabase
          .from('factores_riesgo')
          .insert({
            categoria_id: categoriaSeleccionada,
            nombre: categoria?.nombre || 'Factor de baja',
            descripcion: categoria?.descripcion,
          })
          .select()
          .single();

        if (error) throw error;
        factorId = newFactor.id;
      }

      // Registrar el factor de riesgo
      await supabase.from('factores_riesgo_estudiante').insert({
        registro_estudiante_materia_id: registroBaja.id,
        factor_riesgo_id: factorId,
        severidad: 'alta',
        observaciones: observacionesBaja || 'Baja del estudiante',
      });

      // Actualizar el estado a 'baja'
      const { error: updateError } = await supabase
        .from('registros_estudiante_materia')
        .update({ estado: 'baja' })
        .eq('id', registroBaja.id);

      if (updateError) throw updateError;

      alert('Estudiante dado de baja exitosamente');
      setRegistroBaja(null);
      setCategoriaSeleccionada('');
      setObservacionesBaja('');
      cargarRegistros();
    } catch (error) {
      console.error('Error al dar de baja:', error);
      alert('Error al dar de baja al estudiante');
    } finally {
      setProcesandoBaja(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const estilos = {
      aprobado: 'bg-green-100 text-green-800 border-green-200',
      reprobado: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      baja: 'bg-red-100 text-red-800 border-red-200',
      en_progreso: 'bg-blue-100 text-blue-800 border-blue-200',
    };

    const etiquetas = {
      aprobado: 'Aprobado',
      reprobado: 'Reprobado',
      baja: 'Deserción',
      en_progreso: 'En progreso',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${estilos[estado as keyof typeof estilos]}`}>
        {etiquetas[estado as keyof typeof etiquetas] || estado}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Cargando estudiantes...</div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Registros de Estudiantes</h2>
              <p className="text-sm text-gray-600">
                {registros.length} registro{registros.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFiltro('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtro === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltro('reprobado')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtro === 'reprobado'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Reprobados
            </button>
            <button
              onClick={() => setFiltro('baja')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtro === 'baja'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Deserción
            </button>
          </div>
        </div>

        {registros.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No hay registros para mostrar
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Número de Control
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Estudiante
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Materia
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Semestre
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Calificación
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Riesgos
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {registros.map((registro) => (
                  <tr key={registro.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {registro.estudiante.numero_control}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {registro.estudiante.apellido_paterno} {registro.estudiante.apellido_materno},{' '}
                      {registro.estudiante.nombre}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {registro.materia.nombre}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {registro.semestre}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {registro.calificacion_final !== null ? (
                        <span className={registro.calificacion_final >= 70 ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}>
                          {registro.calificacion_final.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {getEstadoBadge(registro.estado)}
                    </td>
                    <td className="px-4 py-3">
                      {registro.cantidad_riesgos > 0 ? (
                        <span className="flex items-center gap-1 text-orange-600 text-sm font-medium">
                          <AlertTriangle className="w-4 h-4" />
                          {registro.cantidad_riesgos}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Ninguno</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setRegistroSeleccionado(registro)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                        >
                          <Edit className="w-4 h-4" />
                          Riesgos
                        </button>
                        {registro.estado !== 'baja' && (
                          <button
                            onClick={() => setRegistroBaja(registro)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                          >
                            <UserX className="w-4 h-4" />
                            Dar de baja
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para gestionar factores de riesgo */}
      {registroSeleccionado && (
        <RiskFactorForm
          recordId={registroSeleccionado.id}
          studentName={`${registroSeleccionado.estudiante.apellido_paterno} ${registroSeleccionado.estudiante.apellido_materno}, ${registroSeleccionado.estudiante.nombre}`}
          onSuccess={() => {
            setRegistroSeleccionado(null);
            cargarRegistros();
          }}
          onCancel={() => setRegistroSeleccionado(null)}
        />
      )}

      {/* Modal para dar de baja */}
      {registroBaja && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-red-600 text-white px-6 py-4 rounded-t-lg">
              <div className="flex items-center gap-3">
                <UserX className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-bold">Dar de Baja a Estudiante</h2>
                  <p className="text-sm opacity-90 mt-1">
                    {registroBaja.estudiante.apellido_paterno} {registroBaja.estudiante.apellido_materno},{' '}
                    {registroBaja.estudiante.nombre}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Atención:</strong> Esta acción cambiará el estado del estudiante a "Deserción" y registrará
                  el motivo de la baja.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo de la baja (Factor de Riesgo) *
                </label>
                <select
                  required
                  value={categoriaSeleccionada}
                  onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Seleccionar motivo de baja</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
                {categoriaSeleccionada && (
                  <p className="text-xs text-gray-600 mt-1">
                    {categorias.find(c => c.id === categoriaSeleccionada)?.descripcion}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones adicionales
                </label>
                <textarea
                  value={observacionesBaja}
                  onChange={(e) => setObservacionesBaja(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Detalles adicionales sobre la baja del estudiante..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setRegistroBaja(null);
                    setCategoriaSeleccionada('');
                    setObservacionesBaja('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDarDeBaja}
                  disabled={!categoriaSeleccionada || procesandoBaja}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 font-medium"
                >
                  {procesandoBaja ? 'Procesando...' : 'Confirmar Baja'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}