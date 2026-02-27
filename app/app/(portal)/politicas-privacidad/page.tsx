import React from 'react';
import Link from 'next/link';

export const metadata = {
    title: 'Políticas de Privacidad | Emprende',
    description: 'Políticas de privacidad y manejo de datos de la aplicación Emprende.',
};

export default function PoliticasPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <Link href="/" className="text-blue-600 hover:text-blue-800 mb-8 inline-block">
                    &larr; Volver al inicio
                </Link>

                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl mb-8">
                    Políticas de Privacidad de Emprende
                </h1>

                <div className="prose prose-blue prose-lg text-slate-500">
                    <p><strong>Última actualización:</strong> Febrero de 2026</p>

                    <h2>1. Introducción</h2>
                    <p>
                        Bienvenido a Emprende ("nosotros", "nuestro", o la "Aplicación"). Valoramos su privacidad y estamos
                        comprometidos a proteger sus datos personales. Esta Política de Privacidad explica cómo recopilamos,
                        usamos, revelamos y salvaguardamos su información cuando visita o utiliza nuestra aplicación
                        móvil y sitio web.
                    </p>

                    <h2>2. Información que recopilamos</h2>
                    <p>
                        Al utilizar nuestra plataforma para la gestión de su negocio, podríamos recopilar el siguiente tipo de información:
                    </p>
                    <ul>
                        <li><strong>Información proporcionada por el usuario:</strong> Nombre, correo electrónico y contraseñas (cifradas) al registrarse, así como información comercial ingresada voluntariamente (inventario, precios, ventas).</li>
                        <li><strong>Información financiera:</strong> Datos transaccionales y de suscripción para fines estadísticos propios de su negocio. Todas las transacciones de pago para nuestras suscripciones se procesan mediante terceros autorizados (Ej. Mercado Pago) y no almacenamos datos de tarjetas de crédito en nuestros servidores directos.</li>
                    </ul>

                    <h2>3. Uso de su información</h2>
                    <p>
                        Tener información precisa nos permite proporcionarle una experiencia fluida, eficiente y personalizada. Específicamente, podríamos utilizar la información recopilada a través de la Aplicación para:
                    </p>
                    <ul>
                        <li>Crear y administrar su cuenta comercial.</li>
                        <li>Gestionar las métricas de sus ventas, inventario y finanzas en su panel personalizado.</li>
                        <li>Mejorar nuestra aplicación mediante análisis de uso general y retroalimentación interactiva (como el uso de nuestros comandos de voz NLP).</li>
                        <li>Responder a sus correos electrónicos de atención al cliente y resolver problemas técnicos.</li>
                    </ul>

                    <h2>4. Seguridad de los datos</h2>
                    <p>
                        Utilizamos medidas de seguridad administrativas, técnicas y físicas, incluyendo cifrado SSL en tránsito y contraseñas encriptadas mediante algoritmos fuertes (`bcrypt`), para proteger su información personal. Aunque tomamos precauciones razonables para asegurar la información, tenga en cuenta que ningún sistema en Internet es invulnerable.
                    </p>

                    <h2>5. Retención y eliminación de datos</h2>
                    <p>
                        Retenemos la información que recopilamos durante el tiempo necesario para proporcionar los servicios solicitados por el usuario. Usted tiene derecho a solicitar en cualquier momento la eliminación total de su cuenta y todos los datos asociados al comercio. Este procedimiento puede realizarse comunicándose a nuestro soporte técnico.
                    </p>

                    <h2>6. Modificaciones a esta Política</h2>
                    <p>
                        Podemos actualizar esta Política de Privacidad de vez en cuando. Le notificaremos de cualquier cambio publicando la nueva Política en el sitio web de la aplicación.
                    </p>

                    <h2>7. Contacto</h2>
                    <p>
                        Si tiene preguntas o comentarios sobre esta Política de Privacidad, por favor, póngase en contacto con nosotros a través de los canales de la plataforma oficial AT-SIT.
                    </p>
                </div>
            </div>
        </div>
    );
}
