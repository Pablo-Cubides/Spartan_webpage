import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'El mensaje no puede estar vacío' }, { status: 400 });
    }

    // Create mailto link that opens user's email client
    const mailtoLink = `mailto:spartanmarketcol@gmail.com?subject=Contacto desde Spartan Club&body=${encodeURIComponent(message)}`;

    // Return success with the mailto link
    // The client will need to handle opening this link
    return NextResponse.json({ 
      success: true, 
      message: 'Redirigiendo a tu cliente de correo...',
      mailtoLink 
    });

  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json({ error: 'Error al procesar el mensaje' }, { status: 500 });
  }
}
