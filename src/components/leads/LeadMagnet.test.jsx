import {render,screen,within} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import {beforeEach,describe,expect,it} from 'vitest'
import LeadMagnet,{LEADS_KEY,FREE_RESOURCES} from './LeadMagnet.jsx'

function renderMagnet(){return render(<MemoryRouter><LeadMagnet/></MemoryRouter>)}

describe('LeadMagnet — captación real y privacidad',()=>{
 beforeEach(()=>window.localStorage.clear())
 it('no pide contacto ni finge el registro cuando no hay backend',()=>{
  renderMagnet()
  expect(screen.getByRole('heading',{level:2,name:/tu siguiente paso/i})).toBeInTheDocument()
  expect(screen.queryByLabelText(/tu correo o whatsapp/i)).not.toBeInTheDocument()
  expect(screen.queryByRole('button',{name:/quiero que me contacten/i})).not.toBeInTheDocument()
  expect(screen.getByRole('link',{name:/hablar por whatsapp/i})).toHaveAttribute('href',expect.stringContaining('https://wa.me/'))
  expect(window.localStorage.getItem(LEADS_KEY)).toBeNull()
 })
 it('entrega tres recursos públicos sin formularios ni datos personales',()=>{
  renderMagnet()
  const section=screen.getByRole('group',{name:/tres recursos gratuitos/i})
  const downloads=within(section).getAllByRole('link')
  expect(downloads).toHaveLength(3)
  downloads.forEach((link,index)=>{
   expect(link).toHaveAttribute('download')
   expect(link).toHaveAttribute('href',FREE_RESOURCES[index].url)
  })
  expect(screen.getByRole('link',{name:/ver servicios y precios/i})).toHaveAttribute('href','/programs')
  expect(window.localStorage.getItem(LEADS_KEY)).toBeNull()
 })
 it('nunca presenta una solicitud como enviada sin confirmación real',()=>{
  renderMagnet()
  expect(screen.queryByText(/solicitud recibida/i)).not.toBeInTheDocument()
  expect(screen.queryByText(/te responderemos por el contacto/i)).not.toBeInTheDocument()
 })
})
