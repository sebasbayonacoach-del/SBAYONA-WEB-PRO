import {fireEvent,render,screen,within} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import {afterEach,describe,expect,it,vi} from 'vitest'
import Checkout from './Checkout.jsx'
import {extraServices,membershipPlans,sessionServices} from '../config/offerings.js'
import {PENDING_LEAD_KEY} from '../lib/conversion/whatsappBridge.js'

function renderCheckout(initial='/checkout'){
 return render(<MemoryRouter initialEntries={[initial]}><Checkout/></MemoryRouter>)
}
function link(){
 return screen.getByRole('link',{name:'Abrir solicitud en WhatsApp'})
}
function message(){
 const url=new URL(link().href)
 expect(url.origin).toBe('https://wa.me')
 expect(url.pathname).toBe('/34641698332')
 expect(link()).toHaveAttribute('target','_blank')
 expect(link()).toHaveAttribute('rel','noopener noreferrer')
 return url.searchParams.get('text')
}

describe('Checkout · solicitud real sin cobro ficticio',()=>{
 afterEach(()=>{vi.restoreAllMocks();localStorage.clear()})
 it('mantiene el catálogo canónico y recalcula precios de extras',()=>{
  renderCheckout()
  expect(screen.getAllByRole('radio')).toHaveLength(membershipPlans.length)
  expect(screen.getAllByRole('checkbox')).toHaveLength(extraServices.length)
  const virtual=screen.getByRole('combobox',{name:/clase virtual 1:1/i})
  expect(within(virtual).getAllByRole('option').map(x=>Number(x.value)))
   .toEqual(sessionServices.find(x=>x.id==='virtual-1to1').quantities)
  fireEvent.click(screen.getByRole('radio',{name:/rendimiento/i}))
  fireEvent.change(virtual,{target:{value:'2'}})
  fireEvent.click(screen.getByRole('checkbox',{name:/masaje deportivo/i}))
  expect(screen.getByText('$649.000 COP')).toBeInTheDocument()
  expect(screen.getByText('≈ €151')).toBeInTheDocument()
 })
 it('prepara la solicitud directamente y no requiere datos personales',()=>{
  const popup=vi.spyOn(window,'open')
  renderCheckout()
  expect(screen.getByRole('textbox',{name:/nombre/i})).not.toBeRequired()
  expect(screen.queryByRole('textbox',{name:/^email$/i})).not.toBeInTheDocument()
  expect(screen.queryByRole('textbox',{name:/^whatsapp$/i})).not.toBeInTheDocument()
  expect(message()).toContain('Plan base: RAÍZ — $149.000 COP')
  expect(message()).toContain('no constituye pago, pedido, inscripción, disponibilidad ni acceso confirmados')
  expect(message()).not.toContain('Email:')
  expect(message()).not.toContain('WhatsApp:')
  fireEvent.click(link())
  expect(popup).not.toHaveBeenCalled()
  expect(localStorage.getItem(PENDING_LEAD_KEY)).toBeNull()
  expect(document.body.textContent).not.toMatch(/número de tarjeta|cvv|pagar ahora/i)
 })
 it('prepara el resumen detallado sin duplicar el WhatsApp del remitente',()=>{
  renderCheckout()
  fireEvent.change(screen.getByRole('textbox',{name:/nombre/i}),{target:{value:'Ada Lovelace'}})
  fireEvent.change(screen.getByRole('combobox',{name:/clase virtual 1:1/i}),{target:{value:'2'}})
  fireEvent.click(screen.getByRole('checkbox',{name:/masaje deportivo/i}))
  const text=message()
  expect(text).toContain('Nombre: Ada Lovelace')
  expect(text).toContain('Plan base: RAÍZ — $149.000 COP')
  expect(text).toContain('- Clase virtual 1:1 extra: 2 × $35.000')
  expect(text).toContain('- Masaje deportivo: $80.000')
  expect(text).toContain('Mi camino: $299.000 COP (≈ €70 · ≈ $75 USD)')
  expect(text).not.toContain('Email:')
  expect(text).not.toContain('WhatsApp:')
 })
 it('respeta los 4 precios oficiales y no afirma ninguna transacción',()=>{
  membershipPlans.forEach(plan=>{
   const {unmount}=renderCheckout()
   fireEvent.click(screen.getByRole('radio',{name:new RegExp(plan.name,'i')}))
   const summary=document.querySelector('.order-summary')
   expect(within(summary).getByText('BAYONA '+plan.name)).toBeInTheDocument()
   expect(within(summary).getAllByText(plan.priceDisplay+' COP').length).toBeGreaterThanOrEqual(2)
   const text=message()
   expect(text).toContain('Plan base: '+plan.name+' — '+plan.priceDisplay+' '+plan.currency)
   expect(text).toContain('Mi camino: '+plan.priceDisplay+' COP')
   expect(text).toContain('no constituye pago, pedido, inscripción, disponibilidad ni acceso confirmados')
   unmount()
  })
 })
 it('precarga el plan real y rechaza ids desconocidos',()=>{
  const a=renderCheckout('/checkout?plan=FUERZA')
  expect(screen.getByRole('radio',{name:/fuerza/i})).toBeChecked()
  expect(within(document.querySelector('.order-summary')).getByText('BAYONA FUERZA')).toBeInTheDocument()
  a.unmount()
  renderCheckout('/checkout?plan=INVENTADO')
  expect(screen.getByRole('radio',{name:/raíz/i})).toBeChecked()
 })
 it('la consulta siempre es voluntaria, sin mensajes de venta ni contactos almacenados',()=>{
  renderCheckout()
  expect(screen.getByText(/sin pago, inscripción ni reserva automática/i)).toBeInTheDocument()
  expect(screen.queryByText(/solicitud recibida|compra confirmada/i)).not.toBeInTheDocument()
  expect(screen.getByRole('link',{name:'Abrir solicitud en WhatsApp'})).toBeInTheDocument()
  expect(localStorage.getItem(PENDING_LEAD_KEY)).toBeNull()
 })
})
