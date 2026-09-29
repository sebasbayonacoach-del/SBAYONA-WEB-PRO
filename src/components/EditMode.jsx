// EditMode — modo selección (?edit=1) para que Sebastián marque elementos.
// Solo existe con ?edit=1 en la URL (importado con lazy desde App.jsx):
// el visitante normal no descarga ni ejecuta nada de este fichero.
// En modo edición los clics SELECCIONAN (no navegan): para cambiar de página
// se edita la URL. Escape limpia la selección.
//
// v2 a prueba de errores: vista previa EN VIVO del mensaje exacto que se
// copiará, aviso si el cambio está vacío y confirmación real de copia
// (se lee el portapapeles de vuelta cuando el navegador lo permite).
import { useEffect, useState } from 'react'
import '../styles/edit-mode.css'

/** Describe un elemento de forma que el agente lo localice sin ambigüedad. */
function describeElement(el) {
  if (!el || el === document.body || el === document.documentElement) return null
  const tag = el.tagName
  let selector = tag.toLowerCase()
  if (el.id) {
    selector += `#${el.id}`
  } else {
    const classes = (el.className?.toString?.() || '').split(/\s+/).filter(Boolean).slice(0, 2)
    if (classes.length) selector += `.${classes.join('.')}`
  }
  const text = (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 80)
  const href = typeof el.getAttribute === 'function' ? el.getAttribute('href') : null
  return { selector, text, href }
}

export default function EditMode() {
  const [sel, setSel] = useState(null)
  const [change, setChange] = useState('')
  const [copyState, setCopyState] = useState('idle')

  useEffect(() => {
    document.body.classList.add('bayona-editing')
    let last = null
    function onClick(e) {
      if (e.target.closest('#bayona-edit-panel')) return
      e.preventDefault()
      e.stopPropagation()
      const info = describeElement(e.target)
      if (!info) return
      if (last && last.style) last.style.outline = ''
      last = e.target
      e.target.style.outline = '2px solid #f4a261'
      setSel({ ...info, path: window.location.pathname })
      setChange('')
      setCopyState('idle')
    }
    function onKey(e) {
      if (e.key === 'Escape') {
        if (last && last.style) last.style.outline = ''
        last = null
        setSel(null)
      }
    }
    document.addEventListener('click', onClick, true)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('bayona-editing')
      if (last && last.style) last.style.outline = ''
    }
  }, [])

  function buildMessage(currentChange) {
    if (!sel) return ''
    return (
      `Página: ${sel.path}\n` +
      `Elemento: ${sel.selector}${sel.href ? ` (${sel.href})` : ''}\n` +
      `Texto actual: "${sel.text}"\n` +
      `CAMBIO: ${currentChange.trim() || '(sin describir)'}`
    )
  }

  async function copy() {
    if (!sel) return
    if (change.trim().length < 3) {
      setCopyState('empty')
      return
    }
    const message = buildMessage(change)
    let ok = false
    try {
      await navigator.clipboard.writeText(message)
      ok = true
    } catch {
      ok = false
    }
    if (!ok) {
      try {
        const ta = document.createElement('textarea')
        ta.value = message
        ta.setAttribute('readonly', '')
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        ok = document.execCommand('copy')
        ta.remove()
      } catch {
        ok = false
      }
    }
    // Confirmación real: se lee de vuelta cuando el navegador lo permite.
    // (Se normalizan los saltos: el portapapeles puede devolver \r\n.)
    if (ok) {
      try {
        const back = await navigator.clipboard.readText()
        ok = back.replace(/\r\n/g, '\n') === message
      } catch {
        // Sin permiso de lectura: se asume el writeText/execCommand previo.
      }
    }
    setCopyState(ok ? 'ok' : 'fail')
  }

  if (!sel) {
    return (
      <div id="bayona-edit-panel" className="bayona-edit-hint" role="status">
        Modo selección: clica cualquier elemento (los enlaces no navegan aquí; cambia de página con la URL)
      </div>
    )
  }

  const preview = buildMessage(change)

  return (
    <div id="bayona-edit-panel" className="bayona-edit-panel" role="dialog" aria-label="Elemento seleccionado">
      <div className="bayona-edit-row">
        <span className="bayona-edit-label">Página</span>
        <strong>{sel.path}</strong>
      </div>
      <div className="bayona-edit-row">
        <span className="bayona-edit-label">Elemento</span>
        <code>{sel.selector}</code>
      </div>
      {sel.text ? (
        <div className="bayona-edit-row">
          <span className="bayona-edit-label">Texto</span>
          <span>“{sel.text}”</span>
        </div>
      ) : null}
      <textarea
        className="bayona-edit-input"
        rows={3}
        placeholder="Describe el cambio que quieres aquí…"
        value={change}
        onChange={(e) => {
          setChange(e.target.value)
          setCopyState('idle')
        }}
      />
      <pre className="bayona-edit-preview" aria-label="Vista previa del mensaje">
        {preview}
      </pre>
      {copyState === 'empty' ? (
        <p className="bayona-edit-warn" role="alert">
          Escribe primero qué cambio quieres (mínimo 3 letras).
        </p>
      ) : null}
      {copyState === 'fail' ? (
        <p className="bayona-edit-warn" role="alert">
          No se pudo copiar solo: selecciona el texto de arriba y cópialo a mano (Ctrl+C).
        </p>
      ) : null}
      <div className="bayona-edit-actions">
        <button type="button" className="bayona-edit-copy" onClick={copy}>
          {copyState === 'ok' ? 'Copiado ✓' : 'Copiar'}
        </button>
        <button type="button" className="bayona-edit-close" onClick={() => setSel(null)}>
          Cerrar
        </button>
      </div>
    </div>
  )
}
