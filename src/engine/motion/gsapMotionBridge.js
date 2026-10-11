/* Single audited boundary for GSAP: no route, provider, or shared shell
   imports GSAP directly. All work remains scoped, responsive and revertible.
   In Vitest/jsdom matchMedia can be absent, so plugin registration is browser-only. */
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

export function ensureGsapReady() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  gsap.registerPlugin(ScrollTrigger, useGSAP)
  return true
}

export { gsap, ScrollTrigger, useGSAP }
