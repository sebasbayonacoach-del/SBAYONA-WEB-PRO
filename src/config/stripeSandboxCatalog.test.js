import {describe,it,expect} from 'vitest'
import {getSandboxPaymentLink,STRIPE_SANDBOX} from './stripeSandboxCatalog.js'

describe('Stripe sandbox: eight verified URLs, never real payments',()=>{
 it('has four plans with two distinct links each',()=>{
  expect(Object.keys(STRIPE_SANDBOX)).toHaveLength(4)
  const links=Object.values(STRIPE_SANDBOX).flatMap(p=>Object.values(p))
  expect(links).toHaveLength(8)
  expect(new Set(links).size).toBe(8)
  links.forEach(url=>{
   expect(new URL(url).host).toBe('buy.stripe.com')
   expect(new URL(url).pathname).toMatch(/^\/test_/)
  })
 })
 it('never constructs links for unknown plans or modes',()=>{
  expect(getSandboxPaymentLink('__proto__','monthly')).toBeNull()
  expect(getSandboxPaymentLink('ELITE','live')).toBeNull()
  expect(getSandboxPaymentLink('UNKNOWN','once')).toBeNull()
 })
})
