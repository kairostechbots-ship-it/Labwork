
import AppointmentWizard from '@/components/appointments/AppointmentWizard';

export const metadata = {
  title: 'Agendar cita | LabWork',
  description:
    'Agenda tu cita para estudios de laboratorio en una sucursal de LabWork.',
};

export default function AgendarPage() {
  return <AppointmentWizard />;
}
