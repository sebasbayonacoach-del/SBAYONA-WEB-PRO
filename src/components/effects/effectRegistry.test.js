import {describe,expect,it} from 'vitest'
import {ALL_EFFECT_SLUGS,ALL_EFFECT_NAMES,EFFECT_NAMES,EFFECT_PLACEMENTS} from './effectRegistry.js'

describe('21 procedural ambient effects: registry',()=>{
 it('has all 21 unique public categories without inventing additional ones',()=>{
  expect(ALL_EFFECT_SLUGS).toHaveLength(21)
  expect(ALL_EFFECT_NAMES).toHaveLength(21)
  expect(new Set(ALL_EFFECT_SLUGS).size).toBe(21)
  expect(new Set(ALL_EFFECT_NAMES).size).toBe(21)
 })
 it('assigns every effect exactly once to a real editorial route',()=>{
  const placements=Object.entries(EFFECT_PLACEMENTS).flatMap(([route,effects])=>
   effects.map(({effect,selector})=>({route,effect,selector})))
  expect(placements).toHaveLength(21)
  expect(new Set(placements.map(x=>x.effect)).size).toBe(21)
  for(const item of placements){
   expect(EFFECT_NAMES[item.effect]).toBeTruthy()
   expect(item.route).not.toContain('checkout')
   expect(item.route).not.toContain('order-confirmation')
   expect(item.selector).toMatch(/^[.#][\w-]+$/)
  }
 })
})
