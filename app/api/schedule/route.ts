import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Aquí se integraría un servicio de envío de correos reales (como Resend, SendGrid o AWS SES).
    // Por ahora, simulamos el envío de la notificación por correo a la administración del laboratorio.
    console.log('--- NUEVA SOLICITUD DE TOMA A DOMICILIO ---');
    console.log(`Nombre: ${body.name}`);
    console.log(`Teléfono: ${body.phone}`);
    console.log(`Dirección: ${body.address}`);
    console.log(`Estudios: ${body.studies || 'No especificados'}`);
    console.log('--- FIN DE LA SOLICITUD ---');

    return NextResponse.json({ 
      success: true, 
      message: 'Notificación por correo simulada exitosamente.' 
    });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    return NextResponse.json(
      { success: false, message: 'Hubo un error procesando tu solicitud.' },
      { status: 500 }
    );
  }
}
