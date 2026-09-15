import sgMail from '@sendgrid/mail';
import { getEmailEnvironment } from '@/lib/env';

type AppointmentEmail = {
  id: string;
  patientName: string;
  email: string | null;
  phone: string;
  requestedDate: string;
  requestedTime: string;
  status: string;
};

const labels: Record<string, string> = {
  pending: 'recibida', confirmed: 'confirmada', cancelled: 'cancelada', completed: 'completada', updated: 'actualizada',
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character]!);
}

export async function sendAppointmentNotifications(appointment: AppointmentEmail, event: keyof typeof labels) {
  const environment = getEmailEnvironment();
  if (!environment) return { status: 'not-configured' as const };
  sgMail.setApiKey(environment.SENDGRID_API_KEY);
  const subject = `Cita ${labels[event]} - ${appointment.patientName}`;
  const text = [
    `La cita de ${appointment.patientName} fue ${labels[event]}.`,
    `Fecha: ${appointment.requestedDate}`,
    `Hora: ${appointment.requestedTime.slice(0, 5)}`,
    `Teléfono: ${appointment.phone}`,
    `Folio: ${appointment.id}`,
  ].join('\n');
  const recipients = new Set([environment.LABWORK_NOTIFICATION_EMAIL]);
  if (appointment.email) recipients.add(appointment.email);
  try {
    await sgMail.send([...recipients].map((to) => ({
      to,
      from: { email: environment.SENDGRID_FROM_EMAIL, name: environment.SENDGRID_FROM_NAME },
      subject,
      text,
      html: `<h2>${escapeHtml(subject)}</h2><p>${escapeHtml(text).replaceAll('\n', '<br>')}</p>`,
    })));
    return { status: 'sent' as const };
  } catch (error) {
    console.error('SendGrid appointment notification failed', error);
    return { status: 'error' as const };
  }
}
