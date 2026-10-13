/**
 * El contacto: una ventana para mandar ideas, errores u opiniones, que llegan
 * por mail. Se abre con el botón de la esquina superior derecha del inicio.
 *
 * La app es estática (no tiene servidor), así que el mensaje se manda por
 * FormSubmit, que lo reenvía al mail de CONTACTO. El primer mensaje que
 * recibe un mail nuevo llega con un enlace para activarlo; hasta entonces,
 * FormSubmit no reenvía nada. Si el envío falla, la ventana ofrece mandarlo
 * desde el programa de correo, con el texto ya escrito.
 *
 * Además del texto se puede dejar un mail para recibir respuesta y, si se
 * acepta (viene marcado, y la ventana dice qué incluye), la sección en la que
 * se estaba y el navegador, que para un error ayudan más que la descripción.
 * El campo `_honey` está oculto: si un bot lo completa, FormSubmit descarta
 * el mensaje.
 *
 * Lo escrito sobrevive a cerrar la ventana sin querer: el componente queda
 * montado, y sólo se limpia al enviar.
 */
import { useEffect, useRef, useState } from 'preact/hooks'

import { NOMBRE_SECCION, type Seccion } from '../dominio/ruta'
import { Dialogo } from './Modal'

export const CONTACTO = 'msparta@fi.uba.ar'
const ENVIO = `https://formsubmit.co/ajax/${CONTACTO}`

const TIPOS = ['Idea', 'Error', 'Opinión', 'Otro'] as const
type Tipo = (typeof TIPOS)[number]

type Estado = 'escribiendo' | 'enviando' | 'enviado' | 'error'

/** La sección y el navegador, para el mensaje. */
function contexto(seccion: Seccion): string {
  const nombre = seccion === 'menu' ? 'Inicio' : NOMBRE_SECCION[seccion]
  return `${nombre} · ${innerWidth}×${innerHeight} · ${navigator.userAgent}`
}

/** El mismo mensaje, para el programa de correo, si falla el envío. */
function enlaceMail(tipo: Tipo, mensaje: string): string {
  const asunto = encodeURIComponent(`${tipo} sobre la app de Probabilidad`)
  return `mailto:${CONTACTO}?subject=${asunto}&body=${encodeURIComponent(mensaje)}`
}

type Props = {
  abierto: boolean
  /** Dónde se estaba al abrirla, para el contexto. */
  seccion: Seccion
  onCerrar: () => void
}

export function Contacto({ abierto, seccion, onCerrar }: Props) {
  const [tipo, setTipo] = useState<Tipo>('Idea')
  const [mensaje, setMensaje] = useState('')
  const [mail, setMail] = useState('')
  const [adjuntar, setAdjuntar] = useState(true)
  const [estado, setEstado] = useState<Estado>('escribiendo')
  const trampa = useRef<HTMLInputElement>(null)
  const texto = useRef<HTMLTextAreaElement>(null)

  // Al abrir, el foco va al texto; si el último envío ya salió, se empieza de nuevo.
  useEffect(() => {
    if (!abierto) return
    if (estado === 'enviado') setEstado('escribiendo')
    const t = setTimeout(() => texto.current?.focus(), 0)
    return () => clearTimeout(t)
  }, [abierto])

  const listo = mensaje.trim().length > 0 && estado !== 'enviando'

  async function enviar(e?: Event): Promise<void> {
    e?.preventDefault()
    if (!listo) return
    setEstado('enviando')
    try {
      const r = await fetch(ENVIO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: `${tipo} · app de Probabilidad`,
          _template: 'table',
          _captcha: 'false',
          _honey: trampa.current?.value ?? '',
          ...(mail.trim() ? { _replyto: mail.trim(), mail: mail.trim() } : {}),
          tipo,
          mensaje: mensaje.trim(),
          ...(adjuntar ? { contexto: contexto(seccion) } : {}),
        }),
      })
      const datos = (await r.json().catch(() => ({}))) as { success?: string | boolean }
      if (!r.ok || String(datos.success) !== 'true') throw new Error('no se envió')
      setEstado('enviado')
      setMensaje('')
    } catch {
      setEstado('error')
    }
  }

  const enviado = estado === 'enviado'

  return (
    <Dialogo
      abierto={abierto}
      titulo={enviado ? 'Gracias' : 'Contacto'}
      clase="modal--contacto"
      onCerrar={onCerrar}
      acciones={
        enviado ? (
          <button class="boton boton--acento" onClick={onCerrar}>
            Cerrar
          </button>
        ) : (
          <>
            <button class="boton" onClick={onCerrar}>
              Cancelar
            </button>
            <button class="boton boton--acento" disabled={!listo} onClick={() => void enviar()}>
              {estado === 'enviando' ? 'Enviando…' : 'Enviar'}
            </button>
          </>
        )
      }
    >
      {enviado ? (
        <p class="contacto__gracias">El mensaje llegó. Lo voy a leer con atención.</p>
      ) : (
        <form class="contacto" onSubmit={(e) => void enviar(e)}>
          <p class="contacto__intro">
            Ideas para mejorar la app, errores en un ejercicio o en la interfaz, opiniones: lo que
            quieras contar llega directo a mi mail.
          </p>

          <fieldset class="contacto__tipos">
            <legend class="sr-solo">Sobre qué es</legend>
            {TIPOS.map((t) => (
              <label key={t} class={'chip-opcion' + (t === tipo ? ' chip-opcion--activa' : '')}>
                <input
                  class="sr-solo"
                  type="radio"
                  name="contacto-tipo"
                  value={t}
                  checked={t === tipo}
                  onChange={() => setTipo(t)}
                />
                {t}
              </label>
            ))}
          </fieldset>

          <label class="contacto__campo">
            <span class="contacto__rotulo">Mensaje</span>
            <textarea
              ref={texto}
              class="entrada contacto__texto"
              rows={6}
              maxLength={5000}
              value={mensaje}
              placeholder={tipo === 'Error' ? 'Qué pasó, dónde, y qué esperabas que pasara.' : 'Contame.'}
              onInput={(e) => setMensaje((e.target as HTMLTextAreaElement).value)}
              onKeyDown={(e) => {
                // Ctrl+Enter (o Cmd+Enter) envía, como en un chat.
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) void enviar()
              }}
            />
          </label>

          <label class="contacto__campo">
            <span class="contacto__rotulo">
              Tu mail <span class="contacto__opcional">(opcional, si querés respuesta)</span>
            </span>
            <input
              class="entrada"
              type="email"
              autoComplete="email"
              value={mail}
              onInput={(e) => setMail((e.target as HTMLInputElement).value)}
            />
          </label>

          <label class="contacto__adjuntar">
            <input type="checkbox" checked={adjuntar} onChange={() => setAdjuntar((a) => !a)} />
            <span>
              Incluir la sección en la que estás, el tamaño de la ventana y el navegador. Ayuda a
              encontrar errores; no incluye tu progreso.
            </span>
          </label>

          {/* Para bots: oculto a la vista y al teclado. */}
          <input
            ref={trampa}
            class="contacto__trampa"
            type="text"
            name="_honey"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          {estado === 'error' && (
            <p class="contacto__error" role="alert">
              No se pudo enviar.{' '}
              <a class="enlace" href={enlaceMail(tipo, mensaje)}>
                Mandalo desde tu correo
              </a>{' '}
              o escribime a {CONTACTO}.
            </p>
          )}
        </form>
      )}
    </Dialogo>
  )
}
