'use client';
import { useState } from 'react';
import { MapPin, Phone, Clock, Navigation } from 'lucide-react';

const branches = [
  {
    id: 'centro',
    name: 'Sucursal Centro',
    address: 'Av. Principal 123, Centro Histórico',
    phone: '(555) 0101-0001',
    hours: 'Lunes a Sábado: 7:00 am - 4:00 pm',
    mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15050.418465053075!2d-99.1413!3d19.4326!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85ce045c48b21ad9%3A0xbd8d2345e54d720b!2sCiudad%20de%20M%C3%A9xico%2C%20CDMX!5e0!3m2!1ses-419!2smx!4v1655000000000!5m2!1ses-419!2smx'
  },
  {
    id: 'norte',
    name: 'Sucursal Plaza Norte',
    address: 'Blvd. Norte 456, Local 12, Col. Las Torres',
    phone: '(555) 0102-0002',
    hours: 'Lunes a Sábado: 7:00 am - 3:00 pm',
    mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15045.1!2d-99.16!3d19.48!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDI4JzQ4LjAiTiA5OcKwMDknMzYuMCJX!5e0!3m2!1ses-419!2smx!4v1655000000000!5m2!1ses-419!2smx'
  },
  {
    id: 'sur',
    name: 'Sucursal Sur',
    address: 'Av. Insurgentes Sur 789, Col. Jardines',
    phone: '(555) 0103-0003',
    hours: 'Lunes a Domingo: 7:00 am - 2:00 pm',
    mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15060.2!2d-99.18!3d19.33!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDE5JzQ4LjAiTiA5OcKwMTAnNDguMCJX!5e0!3m2!1ses-419!2smx!4v1655000000000!5m2!1ses-419!2smx'
  }
];

export default function Branches() {
  const [activeBranch, setActiveBranch] = useState(branches[0]);

  return (
    <section id="sucursales" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
            Nuestras Sucursales
          </h2>
          <p className="text-lg text-slate-600">
            Encuentra el laboratorio Labwork más cercano a ti. Estamos en puntos estratégicos para tu conveniencia.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 flex flex-col gap-4">
            {branches.map((branch) => (
              <button
                key={branch.id}
                onClick={() => setActiveBranch(branch)}
                className={`text-left p-6 rounded-2xl border transition-all ${
                  activeBranch.id === branch.id
                    ? 'border-accent-500 bg-white shadow-md ring-1 ring-accent-500'
                    : 'border-slate-200 bg-white hover:border-primary-300 hover:bg-slate-50'
                }`}
              >
                <h3 className="text-lg font-bold text-slate-900 mb-3">{branch.name}</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600">{branch.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-accent-500 flex-shrink-0" />
                    <span className="text-sm text-slate-600">{branch.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-accent-500 flex-shrink-0" />
                    <span className="text-sm text-slate-600">{branch.hours}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="lg:col-span-2 h-[500px] lg:h-auto min-h-[500px] rounded-3xl overflow-hidden shadow-lg border border-slate-200 relative bg-slate-200">
            <iframe
              src={activeBranch.mapSrc}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full"
              title={`Mapa de ubicación ${activeBranch.name}`}
            ></iframe>
            
            <div className="absolute bottom-6 left-6 right-6 md:right-auto bg-white p-4 rounded-xl shadow-lg border border-slate-100 flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-slate-900">{activeBranch.name}</p>
                <p className="text-xs text-slate-500">Indicaciones disponibles en Maps</p>
              </div>
              <a 
                href={activeBranch.mapSrc}
                target="_blank"
                rel="noreferrer"
                className="flex-shrink-0 w-10 h-10 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center hover:bg-primary-100 transition-colors"
              >
                <Navigation className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
