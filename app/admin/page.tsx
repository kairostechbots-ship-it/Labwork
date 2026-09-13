'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Activity, Clock3, CheckCircle, XCircle, MapPin, Phone, Calendar as CalendarIcon, User, Search, Trash2, Building2, Home, Plus, X } from 'lucide-react';

interface Appointment {
  id: string;
  name: string;
  phone: string;
  type?: 'sucursal' | 'domicilio'; // Opcional por registros anteriores
  branch?: string;
  address?: string;
  date?: string;
  time?: string;
  studies: string;
  status: 'Pendiente' | 'Confirmada' | 'Cancelada';
  createdAt: string;
}

export default function AdminAgenda() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newAppt, setNewAppt] = useState({
    name: '',
    phone: '',
    type: 'sucursal' as 'sucursal' | 'domicilio',
    branch: 'Sucursal Centro',
    address: '',
    date: '',
    time: '',
    studies: ''
  });

  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem('labwork_appointments');
    if (stored) {
      setAppointments(JSON.parse(stored));
    }
  }, []);

  const updateStatus = (id: string, newStatus: Appointment['status']) => {
    const updated = appointments.map(app => 
      app.id === id ? { ...app, status: newStatus } : app
    );
    setAppointments(updated);
    localStorage.setItem('labwork_appointments', JSON.stringify(updated));
  };

  const deleteAppointment = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta solicitud?')) {
      const updated = appointments.filter(app => app.id !== id);
      setAppointments(updated);
      localStorage.setItem('labwork_appointments', JSON.stringify(updated));
    }
  };

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const appointment: Appointment = {
      id: Date.now().toString(),
      name: newAppt.name,
      phone: newAppt.phone,
      type: newAppt.type,
      branch: newAppt.type === 'sucursal' ? newAppt.branch : '',
      address: newAppt.type === 'domicilio' ? newAppt.address : '',
      date: newAppt.date,
      time: newAppt.time,
      studies: newAppt.studies,
      status: 'Confirmada', // Defaults to confirmed when created by admin
      createdAt: new Date().toISOString(),
    };

    const updated = [appointment, ...appointments];
    setAppointments(updated);
    localStorage.setItem('labwork_appointments', JSON.stringify(updated));
    setShowModal(false);
    setNewAppt({
      name: '', phone: '', type: 'sucursal', branch: 'Sucursal Centro', address: '', date: '', time: '', studies: ''
    });
  };

  const filteredAppointments = appointments.filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    app.phone.includes(searchTerm)
  );

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
              <Activity className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-xl text-slate-900">
              Panel Administrativo
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/google-calendar" className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
              Google Calendar
            </Link>
            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">
              Volver al sitio web
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">Agenda General</h1>
            <p className="text-slate-600">
              Gestiona las citas en sucursal y tomas a domicilio. (Datos almacenados localmente)
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar paciente o teléfono..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm"
              />
            </div>
            
            <button 
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium text-sm shadow-sm whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Nueva Cita
            </button>
          </div>
        </div>

        {appointments.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Sin solicitudes</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              Aún no hay citas registradas. Las nuevas solicitudes de toma a domicilio aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredAppointments.map((app) => (
              <div key={app.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center">
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Info Paciente */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between md:justify-start gap-4">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <User className="w-5 h-5 text-primary-500" />
                        {app.name}
                      </h3>
                      {app.type === 'sucursal' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider border border-blue-200">
                          <Building2 className="w-3 h-3" /> Sucursal
                        </span>
                      )}
                      {(app.type === 'domicilio' || !app.type) && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold uppercase tracking-wider border border-purple-200">
                          <Home className="w-3 h-3" /> Domicilio
                        </span>
                      )}
                      
                      {app.status === 'Pendiente' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider border border-amber-200">
                          <Clock3 className="w-3.5 h-3.5" /> Pendiente
                        </span>
                      )}
                      {app.status === 'Confirmada' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider border border-green-200">
                          <CheckCircle className="w-3.5 h-3.5" /> Confirmada
                        </span>
                      )}
                      {app.status === 'Cancelada' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider border border-red-200">
                          <XCircle className="w-3.5 h-3.5" /> Cancelada
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <a href={`tel:${app.phone}`} className="hover:text-primary-600">{app.phone}</a>
                    </div>
                    
                    {app.type === 'sucursal' ? (
                      <div className="flex items-start gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span><span className="font-medium text-slate-800">Acudirá a:</span> {app.branch}</span>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span><span className="font-medium text-slate-800">Visitar en:</span> {app.address}</span>
                      </div>
                    )}

                    {(app.date || app.time) && (
                      <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                        <CalendarIcon className="w-4 h-4 text-primary-500" />
                        <span>Fecha preferida: {app.date} a las {app.time}</span>
                      </div>
                    )}
                  </div>

                  {/* Info Estudios */}
                  <div className="space-y-4 md:border-l md:border-slate-100 md:pl-6">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Estudios Solicitados</p>
                      <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 min-h-[60px]">
                        {app.studies || 'No especificó estudios'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">
                        Recibido el {new Date(app.createdAt).toLocaleDateString('es-MX', { 
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex flex-row md:flex-col justify-end gap-2 shrink-0 md:pl-6 md:border-l md:border-slate-100">
                  {app.status !== 'Confirmada' && (
                    <button 
                      onClick={() => updateStatus(app.id, 'Confirmada')}
                      className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 font-medium text-sm transition-colors border border-green-200"
                    >
                      <CheckCircle className="w-4 h-4" /> Confirmar
                    </button>
                  )}
                  {app.status !== 'Cancelada' && (
                    <button 
                      onClick={() => updateStatus(app.id, 'Cancelada')}
                      className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 font-medium text-sm transition-colors border border-slate-200"
                    >
                      <XCircle className="w-4 h-4" /> Cancelar
                    </button>
                  )}
                  <button 
                    onClick={() => deleteAppointment(app.id)}
                    className="flex-none inline-flex items-center justify-center p-2 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Eliminar registro"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Nueva Cita */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between z-10 rounded-t-3xl">
                <h3 className="text-xl font-bold text-slate-900">Agregar Nueva Cita</h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleAddAppointment} className="p-6 space-y-6">
                <div className="flex p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setNewAppt({...newAppt, type: 'sucursal'})}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                      newAppt.type === 'sucursal' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    En Sucursal
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAppt({...newAppt, type: 'domicilio'})}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                      newAppt.type === 'domicilio' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    A Domicilio
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Nombre del paciente</label>
                    <input required type="text" value={newAppt.name} onChange={e => setNewAppt({...newAppt, name: e.target.value})} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-primary-500 focus:ring-primary-500 bg-slate-50 focus:bg-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Teléfono</label>
                    <input required type="tel" value={newAppt.phone} onChange={e => setNewAppt({...newAppt, phone: e.target.value})} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-primary-500 focus:ring-primary-500 bg-slate-50 focus:bg-white" />
                  </div>
                </div>

                {newAppt.type === 'sucursal' ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Sucursal</label>
                    <select value={newAppt.branch} onChange={e => setNewAppt({...newAppt, branch: e.target.value})} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-primary-500 focus:ring-primary-500 bg-slate-50 focus:bg-white">
                      <option value="Sucursal Centro">Sucursal Centro</option>
                      <option value="Sucursal Plaza Norte">Sucursal Plaza Norte</option>
                      <option value="Sucursal Sur">Sucursal Sur</option>
                    </select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Dirección completa</label>
                    <input required type="text" value={newAppt.address} onChange={e => setNewAppt({...newAppt, address: e.target.value})} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-primary-500 focus:ring-primary-500 bg-slate-50 focus:bg-white" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Fecha</label>
                    <input required type="date" value={newAppt.date} onChange={e => setNewAppt({...newAppt, date: e.target.value})} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-primary-500 focus:ring-primary-500 bg-slate-50 focus:bg-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Hora</label>
                    <input required type="time" value={newAppt.time} onChange={e => setNewAppt({...newAppt, time: e.target.value})} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-primary-500 focus:ring-primary-500 bg-slate-50 focus:bg-white" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Estudios / Notas</label>
                  <textarea value={newAppt.studies} onChange={e => setNewAppt({...newAppt, studies: e.target.value})} rows={2} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-primary-500 focus:ring-primary-500 bg-slate-50 focus:bg-white"></textarea>
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 px-4 py-3 text-white bg-primary-600 hover:bg-primary-700 rounded-xl font-medium transition-colors">
                    Guardar Cita
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
