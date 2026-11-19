import type { Metadata } from 'next';
import { RegisterView } from '@/components/auth/RegisterView';

export const metadata: Metadata = {
  title: 'Crear cuenta | LabWork',
  description: 'Regístrate en el portal de pacientes de LabWork.',
};

export default function RegisterPage() {
  return <RegisterView />;
}