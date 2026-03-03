/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  User, 
  Stethoscope, 
  Calendar, 
  Activity, 
  ChevronLeft, 
  Save, 
  Trash2,
  Smile,
  Meh,
  Frown,
  AlertCircle,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

interface Evolution {
  id?: number;
  date: string;
  description: string;
}

interface Patient {
  id?: number;
  name: string;
  age: string;
  start_date: string;
  injury_date: string;
  history: string;
  diagnosis: string;
  evaluation: string;
  pain_level: number;
  sports_activity: string;
  objective: string;
  evolutions: Evolution[];
  sessions_count?: number;
}

// --- Components ---

const PainScale = ({ value, onChange }: { value: number; onChange: (val: number) => void }) => {
  const faces = [
    { level: 1, icon: <Smile className="text-green-500" />, label: "Muy Bien" },
    { level: 2, icon: <Smile className="text-green-400" />, label: "Bien" },
    { level: 3, icon: <Smile className="text-lime-400" />, label: "Leve" },
    { level: 4, icon: <Meh className="text-yellow-400" />, label: "Molesto" },
    { level: 5, icon: <Meh className="text-yellow-500" />, label: "Moderado" },
    { level: 6, icon: <Meh className="text-orange-400" />, label: "Fuerte" },
    { level: 7, icon: <Frown className="text-orange-500" />, label: "Muy Fuerte" },
    { level: 8, icon: <Frown className="text-red-400" />, label: "Intenso" },
    { level: 9, icon: <Frown className="text-red-500" />, label: "Extremo" },
    { level: 10, icon: <AlertCircle className="text-red-700" />, label: "Inaguantable" },
  ];

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {faces.map((f) => (
        <button
          key={f.level}
          type="button"
          onClick={() => onChange(f.level)}
          className={`flex flex-col items-center p-2 rounded-lg border transition-all ${
            value === f.level 
              ? 'bg-blue-50 border-blue-500 scale-105 shadow-sm' 
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-2xl mb-1">{f.icon}</div>
          <span className="text-[10px] font-bold">{f.level}</span>
        </button>
      ))}
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, [searchTerm]);

  const fetchPatients = async () => {
    try {
      const res = await fetch(`/api/patients?search=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      setPatients(data);
    } catch (err) {
      console.error("Error fetching patients:", err);
    }
  };

  const handleAddPatient = () => {
    setCurrentPatient({
      name: '',
      age: '',
      start_date: new Date().toISOString().split('T')[0],
      injury_date: '',
      history: '',
      diagnosis: '',
      evaluation: '',
      pain_level: 1,
      sports_activity: '',
      objective: '',
      evolutions: [{ date: new Date().toISOString().split('T')[0], description: '' }]
    });
    setView('form');
  };

  const handleEditPatient = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/patients/${id}`);
      const data = await res.json();
      setCurrentPatient(data);
      setView('form');
    } catch (err) {
      console.error("Error fetching patient details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPatient) return;

    setLoading(true);
    try {
      const method = currentPatient.id ? 'PUT' : 'POST';
      const url = currentPatient.id ? `/api/patients/${currentPatient.id}` : '/api/patients';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentPatient)
      });

      if (res.ok) {
        setView('list');
        fetchPatients();
      }
    } catch (err) {
      console.error("Error saving patient:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar este paciente?")) return;
    try {
      await fetch(`/api/patients/${id}`, { method: 'DELETE' });
      fetchPatients();
    } catch (err) {
      console.error("Error deleting patient:", err);
    }
  };

  const addEvolution = () => {
    if (!currentPatient) return;
    setCurrentPatient({
      ...currentPatient,
      evolutions: [
        ...currentPatient.evolutions,
        { date: new Date().toISOString().split('T')[0], description: '' }
      ]
    });
  };

  const updateEvolution = (index: number, field: keyof Evolution, value: string) => {
    if (!currentPatient) return;
    const newEvolutions = [...currentPatient.evolutions];
    newEvolutions[index] = { ...newEvolutions[index], [field]: value };
    setCurrentPatient({ ...currentPatient, evolutions: newEvolutions });
  };

  const removeEvolution = (index: number) => {
    if (!currentPatient) return;
    const newEvolutions = currentPatient.evolutions.filter((_, i) => i !== index);
    setCurrentPatient({ ...currentPatient, evolutions: newEvolutions });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100">
      {/* Header / Logo */}
      <header className="pt-12 pb-8 flex flex-col items-center">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 rotate-3">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <div className="text-5xl font-black tracking-tighter flex flex-col leading-none">
            <span className="text-blue-600">KINESIO</span>
            <span className="text-gray-900">MED</span>
          </div>
        </div>
        <p className="text-gray-400 text-sm font-medium tracking-widest uppercase mt-2">Centro de Rehabilitación</p>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-20">
        <AnimatePresence mode="wait">
          {view === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar paciente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg"
                />
              </div>

              {/* Add Button */}
              <button
                onClick={handleAddPatient}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20"
              >
                <Plus className="w-6 h-6" />
                Agregar Paciente
              </button>

              {/* Patient List */}
              <div className="space-y-4">
                {patients.map((p) => (
                  <motion.div
                    layout
                    key={p.id}
                    className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group relative"
                    onClick={() => handleEditPatient(p.id!)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-black group-hover:text-blue-600 transition-colors">
                          {p.name}
                        </h3>
                        
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-gray-500">
                            <Stethoscope className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium">{p.diagnosis || 'Sin diagnóstico'}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-gray-500">
                            <Clock className="w-4 h-4 text-orange-500" />
                            <span className="text-xs">{p.sessions_count || 0} sesiones realizadas</span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-500">
                            <Activity className="w-4 h-4 text-red-500" />
                            <span className="text-xs">Nivel de dolor: <span className="font-bold">{p.pain_level}/10</span></span>
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(p.id!);
                        }}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
                {patients.length === 0 && !loading && (
                  <div className="text-center py-12 text-gray-400">
                    No se encontraron pacientes
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4 mb-8">
                <button
                  onClick={() => setView('list')}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold">
                  {currentPatient?.id ? 'Editar Ficha' : 'Nueva Ficha Médica'}
                </h2>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-600 flex items-center gap-2">
                      <User className="w-4 h-4" /> Nombre y Apellido
                    </label>
                    <input
                      required
                      type="text"
                      value={currentPatient?.name}
                      onChange={(e) => setCurrentPatient({ ...currentPatient!, name: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-600">Edad</label>
                    <input
                      type="number"
                      value={currentPatient?.age}
                      onChange={(e) => setCurrentPatient({ ...currentPatient!, age: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Fecha de Inicio
                    </label>
                    <input
                      type="date"
                      value={currentPatient?.start_date}
                      onChange={(e) => setCurrentPatient({ ...currentPatient!, start_date: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Fecha de Lesión
                    </label>
                    <input
                      type="date"
                      value={currentPatient?.injury_date}
                      onChange={(e) => setCurrentPatient({ ...currentPatient!, injury_date: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600">Antecedentes / Cirugías</label>
                  <textarea
                    value={currentPatient?.history}
                    onChange={(e) => setCurrentPatient({ ...currentPatient!, history: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600">Diagnóstico</label>
                  <input
                    type="text"
                    value={currentPatient?.diagnosis}
                    onChange={(e) => setCurrentPatient({ ...currentPatient!, diagnosis: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600">Evaluación</label>
                  <textarea
                    value={currentPatient?.evaluation}
                    onChange={(e) => setCurrentPatient({ ...currentPatient!, evaluation: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none min-h-[100px]"
                  />
                </div>

                {/* Pain Scale */}
                <div className="space-y-2 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <label className="text-sm font-bold text-gray-600 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-red-500" /> Escala Subjetiva del Dolor
                  </label>
                  <PainScale 
                    value={currentPatient?.pain_level || 1} 
                    onChange={(val) => setCurrentPatient({ ...currentPatient!, pain_level: val })} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600">Actividad Deportiva</label>
                  <input
                    type="text"
                    value={currentPatient?.sports_activity}
                    onChange={(e) => setCurrentPatient({ ...currentPatient!, sports_activity: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600">Objetivo</label>
                  <textarea
                    value={currentPatient?.objective}
                    onChange={(e) => setCurrentPatient({ ...currentPatient!, objective: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none min-h-[80px]"
                  />
                </div>

                {/* Evolution Section */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-500" /> Evolución
                    </h3>
                    <button
                      type="button"
                      onClick={addEvolution}
                      className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {currentPatient?.evolutions.map((ev, idx) => (
                      <div key={idx} className="flex gap-4 items-start p-4 bg-gray-50 rounded-2xl border border-gray-100 relative group">
                        <div className="w-32 shrink-0">
                          <input
                            type="date"
                            value={ev.date}
                            onChange={(e) => updateEvolution(idx, 'date', e.target.value)}
                            className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                          />
                        </div>
                        <div className="flex-1">
                          <textarea
                            placeholder="Descripción de la sesión..."
                            value={ev.description}
                            onChange={(e) => updateEvolution(idx, 'description', e.target.value)}
                            className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none min-h-[60px]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeEvolution(idx)}
                          className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? 'Guardando...' : 'Guardar Ficha'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('list')}
                    className="px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
