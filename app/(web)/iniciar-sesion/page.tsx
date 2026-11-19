import type { Metadata } from 'next';
import { LoginView } from '@/components/auth/LoginView';

export const metadata: Metadata = {
  title: 'Iniciar sesión | LabWork',
  description: 'Accede a tu cuenta de paciente de LabWork.',
};

export default function LoginPage() {
  return <LoginView />;
}