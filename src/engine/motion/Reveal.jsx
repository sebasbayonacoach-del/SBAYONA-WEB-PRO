// Reveal - contenedor de entrada con fade-up (+ stagger opcional) al entrar en
// el viewport (Requirements 11.1, 11.2, 11.3; reduced-motion R23.2).
//
// Deriva toda su animacion de las variantes de `variants.js` (que a su vez salen
// de `motionTokens`), por lo que aqui no se declara ninguna duracion ni curva.

import { motion } from 'framer-motion'
import { revealUp, stagger } from './variants.js'
import { useCapabilities } from '../hooks/useCapabilities.js'

/**
 * Revela su contenido con un fade-up (opacidad + translateY) al entrar en el
 * viewport (R11.1), disparandose una sola vez gracias a `viewport={{ once }}`
 * (R11.3). Si se pasa `staggerChildren`, actua como contenedor que escalona la
 * aparicion de sus hijos (R11.2).
 *
 * Para que el escalonado funcione, cada hijo debe declarar `variants={revealUp}`
 * SIN su propio `initial`/`whileInView`, de modo que herede el estado del
 * contenedor. Dos formas equivalentes de conseguirlo:
 *
 *   // a) hijos como motion.* con la variante compartida
 *   <Reveal staggerChildren={0.08}>
 *     {items.map((it) => (
 *       <motion.li key={it.id} variants={revealUp}>{it.label}</motion.li>
 *     ))}
 *   </Reveal>
 *
 *   // b) items independientes envueltos en <Reveal> hijos (cada uno revela solo)
 *   <div>
 *     {items.map((it) => <Reveal as="li" key={it.id}>{it.label}</Reveal>)}
 *   </div>
 *
 * Con `reducedMotion` activo (R23.2) el contenido se renderiza YA visible, sin
 * variantes ni animacion de entrada.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children Contenido a revelar.
 * @param {keyof JSX.IntrinsicElements} [props.as='div'] Etiqueta a renderizar (via `motion[as]`).
 * @param {number} [props.staggerChildren] Retraso entre hijos, en segundos; activa el modo contenedor.
 * @param {number} [props.delay] Retraso antes de iniciar el reveal, en segundos.
 * @param {string} [props.className] Clases CSS.
 * @returns {JSX.Element}
 */
export function Reveal({
  children,
  as = 'div',
  staggerChildren,
  delay,
  className,
  ...rest
}) {
  const { reducedMotion } = useCapabilities()

  // Reduced-motion (R23.2): contenido visible al instante, sin animar.
  if (reducedMotion) {
    const Tag = as
    return (
      <Tag className={className} {...rest}>
        {children}
      </Tag>
    )
  }

  const MotionTag = motion[as] ?? motion.div
  const isContainer = typeof staggerChildren === 'number'
  // Contenedor => solo orquesta (stagger); elemento simple => fade-up (revealUp).
  const variants = isContainer ? stagger(staggerChildren) : revealUp
  // `delay` opcional: se aporta como default de transicion sin pisar los tokens
  // de duracion/curva definidos dentro de la variante.
  const transition = typeof delay === 'number' ? { delay } : undefined

  return (
    <MotionTag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 'some', margin: '0px 0px 48px 0px' }}
      transition={transition}
      {...rest}
    >
      {children}
    </MotionTag>
  )
}
