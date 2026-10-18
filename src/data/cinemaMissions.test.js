import {describe,it,expect} from 'vitest'
import {BAYONA_MISSIONS,PLAN_MISSION,formatMissionStep,missionFor} from './cinemaMissions.js'

describe('BAYONA PRIME / motor de misiones públicas',()=>{
 it('cada ruta editorial tiene una misión real, con instrucciones breves',()=>{
  expect(Object.keys(BAYONA_MISSIONS)).toHaveLength(10)
  Object.entries(BAYONA_MISSIONS).forEach(([path,mission])=>{
   expect(missionFor(path)).toBe(mission)
   expect(mission.name.length).toBeLessThan(38)
   expect(mission.objective.length).toBeLessThan(75)
  })
 })
 it('las fichas tienen una misión comercial y no aparecen en el checkout ni en la app privada',()=>{
  expect(missionFor('/plan/fuerza')).toBe(PLAN_MISSION)
  expect(missionFor('/plan/elite')).toBe(PLAN_MISSION)
  expect(missionFor('/checkout')).toBeNull()
  expect(missionFor('/mi-app')).toBeNull()
 })
 it('progreso visible ajustado al total real',()=>{
  expect(formatMissionStep(0,8)).toBe('01')
  expect(formatMissionStep(7,8)).toBe('08')
  expect(formatMissionStep(9,8)).toBe('08')
  expect(formatMissionStep(-12,8)).toBe('01')
 })
})
