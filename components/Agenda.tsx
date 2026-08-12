'use client';
import { useState } from 'react';
import { MapPin, Calendar as CalendarIcon, Clock, User, Phone, CheckCircle2, MessageCircle, Home } from 'lucide-react';

export default function Agenda() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    date: '',
    time: '',
    studies: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const newAppointment = {
        id: Date.now().toString(),
        ...formData,
        type: 'domicilio',
        status: 'Pendiente',
        createdAt: new Date().toISOString(),
      };
      
      const existing = JSON.parse(localStorage.getItem('labwork_appointments') || '[]');
      localStorage.setItem('labwork_appointments', JSON.stringify([newAppointment, ...existing]));

      // Simular envío de correo
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppointment),
      });

      if (response.ok) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Error enviando la solicitud:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const whatsappMessage = `Hola Labwork, acabo de agendar una toma a domicilio en la página web.%0A%0A*Paciente:* ${formData.name}%0A*Teléfono:* ${formData.phone}%0A*Dirección:* ${formData.address}%0A*Fecha:* ${formData.date}%0A*Hora:* ${formData.time}%0A*Estudios:* ${formData.studies || 'Por definir'}%0A%0AQuisiera confirmar la disponibilidad.`;
  const whatsappLink = `https://wa.me/525550101000?text=${whatsappMessage}`;

  return (
    <section id="agendar" className="py-24 bg-primary-900 text-white overflow-hidden relative">
      <div className="absolute inset-0 opacity-10">
        <svg className="absolute left-0 top-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#grid-pattern)" />
          <defs>
            <pattern id="grid-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-800 border border-primary-700 text-primary-200 text-sm font-medium mb-6">
              Servicio Especializado
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
              Toma de muestras <br />
              <span className="text-accent-400">en la comodidad de tu hogar</span>
            </h2>
            <p className="text-lg text-primary-100 mb-10 max-w-lg">
              Si no puedes trasladarte, nosotros vamos a ti. Nuestro personal capacitado acude a tu domicilio con todas las medidas de seguridad e higiene.
            </p>
            
            <ul className="space-y-6">
              {[
                { icon: User, title: 'Personal Capacitado', desc: 'Flebotomistas expertos y con equipo de protección.' },
                { icon: MapPin, title: 'Amplia Cobertura', desc: 'Servicio en toda la zona metropolitana y alrededores.' },
                { icon: Clock, title: 'Horarios Flexibles', desc: 'Elige el día y la hora que mejor se adapten a tu rutina.' }
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-800 flex items-center justify-center text-primary-300">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">{item.title}</h4>
                    <p className="text-primary-200 text-sm">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl relative text-slate-900">
            {isSubmitted ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-display font-bold text-slate-900 mb-2">¡Solicitud Registrada!</h3>
                <p className="text-slate-600 mb-6">
                  Hemos recibido tu solicitud. Para confirmar tu espacio de manera inmediata, envíanos un WhatsApp:
                </p>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-green-500/30 hover:bg-green-600 transition-all active:scale-95 mb-4"
                >
                  <MessageCircle className="w-5 h-5" />
                  Confirmar cita por WhatsApp
                </a>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="inline-flex justify-center rounded-xl bg-slate-100 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors w-full"
                >
                  Agendar otra cita
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-2xl font-display font-bold text-slate-900 mb-2">Solicitar Toma a Domicilio</h3>
                  <p className="text-sm text-slate-500 mb-6">Completa tus datos y nos pondremos en contacto para confirmar tu cita.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-slate-700">Nombre del paciente</label>
                    <input required type="text" id="name" value={formData.name} onChange={handleChange} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-primary-500 focus:ring-primary-500 bg-slate-50 focus:bg-white transition-colors" placeholder="Ej. Juan Pérez" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium text-slate-700">Teléfono</label>
                    <input required type="tel" id="phone" value={formData.phone} onChange={handleChange} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-primary-500 focus:ring-primary-500 bg-slate-50 focus:bg-white transition-colors" placeholder="Ej. 55 1234 5678" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="address" className="text-sm font-medium text-slate-700">Dirección completa</label>
                  <input required type="text" id="address" value={formData.address} onChange={handleChange} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-primary-500 focus:ring-primary-500 bg-slate-50 focus:bg-white transition-colors" placeholder="Calle, número, colonia, código postal" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="date" className="text-sm font-medium text-slate-700">Fecha preferida</label>
                    <input required type="date" id="date" value={formData.date} onChange={handleChange} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-primary-500 focus:ring-primary-500 bg-slate-50 focus:bg-white transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="time" className="text-sm font-medium text-slate-700">Hora aproximada</label>
                    <input required type="time" id="time" value={formData.time} onChange={handleChange} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-primary-500 focus:ring-primary-500 bg-slate-50 focus:bg-white transition-colors" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="studies" className="text-sm font-medium text-slate-700">Estudios requeridos (opcional)</label>
                  <textarea id="studies" value={formData.studies} onChange={handleChange} rows={2} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-primary-500 focus:ring-primary-500 bg-slate-50 focus:bg-white transition-colors" placeholder="¿Qué análisis necesitas?"></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl bg-accent-500 px-4 py-4 text-base font-bold text-white shadow-lg shadow-accent-500/30 hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Enviando...' : 'Solicitar Cita'}
                </button>
                
                <p className="text-xs text-slate-500 text-center">
                  Al solicitar la cita aceptas nuestro aviso de privacidad. Sujeta a confirmación.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
