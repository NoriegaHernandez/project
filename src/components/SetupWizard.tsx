import { useState, useEffect } from 'react';
import { supabase, Carrera, Materia } from '../lib/supabase';
import { Settings, Plus, Trash2, Save } from 'lucide-react';

interface SetupWizardProps {
  onComplete: () => void;
}

export default function SetupWizard({ onComplete }: SetupWizardProps) {
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [activeTab, setActiveTab] = useState<'carreras' | 'materias'>('carreras');
  const [loading, setLoading] = useState(false);

  const [newCarrera, setNewCarrera] = useState({ nombre: '', codigo: '' });
  const [newMateria, setNewMateria] = useState({ nombre: '', codigo: '', semestre: 1, carrera_id: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: carrerasData } = await supabase.from('carreras').select('*').order('nombre');
    const { data: materiasData } = await supabase.from('materias').select('*').order('nombre');

    if (carrerasData) setCarreras(carrerasData);
    if (materiasData) setMaterias(materiasData);
  };

  const addCarrera = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('carreras').insert({
        nombre: newCarrera.nombre,
        codigo: newCarrera.codigo || null,
      });

      if (error) {
        console.error('Error anadiendo carrera:', error);
        alert(`Error al agregar carrera: ${error.message}`);
        return;
      }

      setNewCarrera({ nombre: '', codigo: '' });
      loadData();
    } catch (error: any) {
      console.error('Error anadiendo carrera:', error);
      alert(`Error al agregar carrera: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteCarrera = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta carrera?')) return;
    try {
      await supabase.from('carreras').delete().eq('id', id);
      loadData();
    } catch (error) {
      console.error('Error borrando carrera:', error);
    }
  };

  const addMateria = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('materias').insert({
        nombre: newMateria.nombre,
        codigo: newMateria.codigo || null,
        semestre: newMateria.semestre,
        carrera_id: newMateria.carrera_id || null,
      });

      if (error) {
        console.error('Error anadiendo materia:', error);
        alert(`Error al agregar materia: ${error.message}`);
        return;
      }

      setNewMateria({ nombre: '', codigo: '', semestre: 1, carrera_id: '' });
      loadData();
    } catch (error: any) {
      console.error('Error anadiendo materia:', error);
      alert(`Error al agregar materia: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteMateria = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta materia?')) return;
    try {
      await supabase.from('materias').delete().eq('id', id);
      loadData();
    } catch (error) {
      console.error('Error eliminando materia:', error);
    }
  };


  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-8 h-8 text-slate-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Configuración del Sistema</h2>
          <p className="text-sm text-gray-600">
            Administra carreras y materias del instituto
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('carreras')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'carreras'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          Carreras
        </button>
        <button
          onClick={() => setActiveTab('materias')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'materias'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          Materias
        </button>
      </div>

      {activeTab === 'carreras' && (
        <div className="space-y-6">
          <form onSubmit={addCarrera} className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h3 className="font-semibold text-gray-800">Agregar Carrera</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                required
                placeholder="Nombre de la carrera"
                value={newCarrera.nombre}
                onChange={(e) => setNewCarrera({ ...newCarrera, nombre: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Código (opcional)"
                value={newCarrera.codigo}
                onChange={(e) => setNewCarrera({ ...newCarrera, codigo: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </button>
          </form>

          <div className="space-y-2">
            {carreras.map((carrera) => (
              <div key={carrera.id} className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{carrera.nombre}</p>
                  {carrera.codigo && <p className="text-sm text-gray-600">Código: {carrera.codigo}</p>}
                </div>
                <button
                  onClick={() => deleteCarrera(carrera.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'materias' && (
        <div className="space-y-6">
          <form onSubmit={addMateria} className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h3 className="font-semibold text-gray-800">Agregar Materia</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                required
                placeholder="Nombre de la materia"
                value={newMateria.nombre}
                onChange={(e) => setNewMateria({ ...newMateria, nombre: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Código (opcional)"
                value={newMateria.codigo}
                onChange={(e) => setNewMateria({ ...newMateria, codigo: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                required
                min="1"
                placeholder="Semestre"
                value={newMateria.semestre}
                onChange={(e) => setNewMateria({ ...newMateria, semestre: parseInt(e.target.value) })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={newMateria.carrera_id}
                onChange={(e) => setNewMateria({ ...newMateria, carrera_id: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sin carrera específica</option>
                {carreras.map((carrera) => (
                  <option key={carrera.id} value={carrera.id}>
                    {carrera.nombre}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </button>
          </form>

          <div className="space-y-2">
            {materias.map((materia) => (
              <div key={materia.id} className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{materia.nombre}</p>
                  <p className="text-sm text-gray-600">
                    Semestre {materia.semestre}
                    {materia.codigo && ` • Código: ${materia.codigo}`}
                  </p>
                </div>
                <button
                  onClick={() => deleteMateria(materia.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 pt-6 border-t">
        <button
          onClick={onComplete}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          <Save className="w-5 h-5" />
          Guardar y Continuar
        </button>
      </div>
    </div>
  );
}
