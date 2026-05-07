import { supabase } from '../supabase'

export async function enviarEmailPedido({ emailComprador, emailVendedor, producto, precio, talla }) {
  await supabase.functions.invoke('enviar-email', {
    body: {
      to: emailComprador,
      subject: '¡Tu pedido en Berishop está confirmado!',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #000;">¡Pedido realizado con éxito!</h1>
          <p>Hola, tu pedido ha sido registrado correctamente en Berishop.</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin: 0 0 10px 0;">${producto}</h2>
            <p style="margin: 5px 0;">Talla: ${talla}</p>
            <p style="margin: 5px 0; font-size: 24px; font-weight: bold;">${precio} €</p>
          </div>
          <p>Tu artículo está pendiente de verificación de autenticidad. Te notificaremos cuando el proceso esté completado.</p>
          <p style="color: #666; font-size: 12px;">Berishop — Marketplace de zapatillas de edición limitada</p>
        </div>
      `
    }
  })

  await supabase.functions.invoke('enviar-email', {
    body: {
      to: emailVendedor,
      subject: '¡Tienes una nueva venta en Berishop!',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #000;">¡Nueva venta!</h1>
          <p>Alguien ha comprado uno de tus artículos en Berishop.</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin: 0 0 10px 0;">${producto}</h2>
            <p style="margin: 5px 0;">Talla: ${talla}</p>
            <p style="margin: 5px 0; font-size: 24px; font-weight: bold;">${precio} €</p>
          </div>
          <p>El artículo pasará por verificación de autenticidad antes de ser entregado al comprador.</p>
          <p style="color: #666; font-size: 12px;">Berishop — Marketplace de zapatillas de edición limitada</p>
        </div>
      `
    }
  })
}

export async function enviarEmailVerificacion({ emailComprador, producto, resultado }) {
  const aprobado = resultado === 'APROBADO'
  
  await supabase.functions.invoke('enviar-email', {
    body: {
      to: emailComprador,
      subject: aprobado ? '✅ Tu pedido ha sido verificado' : '❌ Tu pedido ha sido rechazado',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: ${aprobado ? '#16a34a' : '#dc2626'};">
            ${aprobado ? '¡Verificación aprobada!' : 'Verificación rechazada'}
          </h1>
          <p>El resultado de la verificación de autenticidad de tu pedido es:</p>
          <div style="background: ${aprobado ? '#f0fdf4' : '#fef2f2'}; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin: 0 0 10px 0;">${producto}</h2>
            <p style="font-size: 18px; font-weight: bold; color: ${aprobado ? '#16a34a' : '#dc2626'};">
              ${aprobado ? '✅ APROBADO — El artículo es auténtico' : '❌ RECHAZADO — El artículo no ha pasado la verificación'}
            </p>
          </div>
          ${aprobado ? '<p>Tu pedido será enviado en breve.</p>' : '<p>El importe será reembolsado en los próximos días.</p>'}
          <p style="color: #666; font-size: 12px;">Berishop — Marketplace de zapatillas de edición limitada</p>
        </div>
      `
    }
  })
}