import { createContext, useContext, useMemo, useState } from 'react'
import { getJourneyGoal } from '../../data/journeyGoals.js'
const Context = createContext(null)
/** Objetivo general elegido expresamente; solo memoria de esta visita, sin persistencia ni datos de salud. */
export function JourneyExperienceProvider({ children }) {
  const [goalId, setGoalId] = useState(null)
  const value = useMemo(() => ({
    goalId,
    goal: getJourneyGoal(goalId),
    chooseGoal: id => setGoalId(current => current === id ? null : getJourneyGoal(id)?.id || null),
    clearGoal: () => setGoalId(null),
  }), [goalId])
  return <Context.Provider value={value}>{children}</Context.Provider>
}
export function useJourneyExperience() {
  const value = useContext(Context)
  if (!value) throw new Error('JourneyExperienceProvider no disponible')
  return value
}
