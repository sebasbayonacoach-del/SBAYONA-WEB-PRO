import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { getJourneyGoal } from '../../data/journeyGoals.js'

const Context = createContext(null)

/** Preferencias temporales. No existen cookies, almacenamiento persistente ni subida automática. */
export function JourneyExperienceProvider({ children }) {
  const [goalId, setGoalId] = useState(null)
  const [preferences, setPreferences] = useState({})
  const [coachOpen, setCoachOpen] = useState(false)
  const [coachStep, setCoachStep] = useState(0)
  const [coachAnswers, setCoachAnswers] = useState({})
  const [coachName, setCoachName] = useState('')
  const autoStarted = useRef(false)
  const autoStartCoach = useCallback(() => {
    if (autoStarted.current) return
    autoStarted.current = true
    setCoachStep(0)
    setCoachOpen(true)
  }, [])
  const closeCoach = useCallback(() => setCoachOpen(false), [])

  const value = useMemo(() => ({
    goalId,
    goal: getJourneyGoal(goalId),
    preferences,
    coachOpen,
    coachStep,
    coachAnswers,
    coachName,
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
    startCoach: () => { autoStarted.current = true; setCoachStep(0); setCoachOpen(true) },
    autoStartCoach,
    closeCoach,
    moveCoach: step => setCoachStep(step),
    answerCoach: (key, answer) => {
      setCoachAnswers(current => ({ ...current, [key]: answer }))
      if (key === 'objetivo') setGoalId(answer)
    },
    nameCoach: value => setCoachName(value.slice(0, 70)),
    clearCoach: () => { setCoachAnswers({}); setCoachStep(0); setCoachName(''); setGoalId(null) },
  }), [goalId, preferences, coachOpen, coachStep, coachAnswers, coachName, closeCoach, autoStartCoach])

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useJourneyExperience() {
  const value = useContext(Context)
  if (!value) throw new Error('JourneyExperienceProvider no disponible')
  return value
}
