Berishop — Marketplace de Sneakers de Edición Limitada 👟

Berishop es una plataforma web completa de compraventa especializada en el mercado de reventa de zapatillas exclusivas. El proyecto soluciona las carencias del mercado actual mediante un catálogo avanzado, herramientas de gestión para vendedores y un sistema de verificación de autenticidad gestionado por administradores.

Este proyecto constituye mi Trabajo de Fin de Grado (TFG) para el ciclo de Grado Superior en Desarrollo de Aplicaciones Web (DAW) en el IES Isidra de Guzmán.

🚀 URL de producción: https://tfg-berishop.vercel.app

✨ Funcionalidades Principales

👤 Gestión de Usuarios y Roles

Tres perfiles diferenciados: Cliente, Vendedor y Administrador.

Autenticación segura: Registro e inicio de sesión con email/contraseña y Google OAuth 2.0.

Perfiles públicos: Visualización de reputación, media de estrellas y anuncios activos de vendedores.

🛒 Experiencia de Compra

Catálogo avanzado: Filtros en tiempo real por marca, talla, precio y búsqueda libre, con ordenación dinámica.

Sistema de pedidos: Flujo transparente de estados (Pendiente, En verificación, Completado, Cancelado).

Valoraciones: Sistema de reseñas con puntuación de 1 a 5 estrellas tras completar una compra.

🛠️ Herramientas para Vendedores

Gestión de inventario: CRUD completo de anuncios con soporte para múltiples imágenes y carrusel interactivo.

Monedero Virtual: Acumulación automática de saldo tras ventas aprobadas (comisión del 8%) y sistema de retiro por IBAN.

Edición completa: Posibilidad de modificar precios, estados e imágenes de anuncios publicados.

🛡️ Administración y Seguridad

Panel de verificación: Los administradores validan manualmente la autenticidad de cada par antes de finalizar la transacción.

Seguridad de datos: Implementación de Row Level Security (RLS) en PostgreSQL para garantizar la privacidad de los datos.

🛠️ Stack Tecnológico


Frontend - React.js (Vite) + Tailwind CSS v4

Backend (BaaS) - Supabase (PostgreSQL, Auth, Storage)

Lógica Serverless - Supabase Edge Functions

Notificaciones - Brevo API (Correos transaccionales)

Despliegue - Vercel (CI/CD desde GitHub)



🚀 Instalación Local

Si deseas ejecutar el proyecto en tu entorno local, sigue estos pasos:

Clonar el repositorio:

git clone [https://github.com/SergioBeri8/TFG-Berishop.git](https://github.com/SergioBeri8/TFG-Berishop.git)
cd TFG-Berishop


Instalar dependencias:

npm install


Configurar variables de entorno:
Crea un archivo .env en la raíz con tus credenciales de Supabase:

VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima


Iniciar servidor de desarrollo:

npm run dev


👨‍💻 Autor

Sergio Berigüete Domínguez - GitHub

TFG DAW - Mayo 2026

Tutora: María Isabel Cabrera Carmona