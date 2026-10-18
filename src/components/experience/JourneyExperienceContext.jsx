import { createContext, useContext, useMemo, useState } from 'react'
import { getJourneyGoal } from '../../data/journeyGoals.js'

const Context = createContext(null)

/** Selecciones voluntarias, no sensibles y solo en memoria durante esta visita. */
export function JourneyExperienceProvider({ children }) {
  const [goalId, setGoalId] = useState(null)
  const [preferences, setPreferences] = useState({})
  const value = useMemo(() => ({
    goalId,
    goal: getJourneyGoal(goalId),
    preferences,
    chooseGoal: id => setGoalId(current => current === id ? null : getJourneyGoal(id)?.id || null),
    clearGoal: () => setGoalId(null),
    choosePreference: (key, answer) => setPreferences(current => {
      const next = { ...current }
      if (next[key] === answer) delete next[key]
      else next[key] = answer
      return next
    }),
    clearPreferences: () => setPreferences({}),
    clearAll: () => { setGoalId(null); setPreferences({}) },
  }), [goalId, preferences])
  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useJourneyExperience() {
  const value = useContext(Context)
  if (!value) throw new Error('JourneyExperienceProvider no disponible')
  return value
}
