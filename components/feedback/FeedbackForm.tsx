'use client'

import { FormEvent, useMemo, useState } from 'react'
import { Star } from 'lucide-react'
import {
  AGE_GROUP_OPTIONS,
  CHALLENGE_OPTIONS,
  EMPTY_FEEDBACK_FORM,
  GENDER_OPTIONS,
  PURCHASE_CATEGORY_OPTIONS,
  SATISFACTION_STARS,
  type ChallengeOption,
  type FeedbackFormData,
  type PurchaseCategoryOption,
  type SatisfactionOption,
} from '@/lib/feedbackOptions'
import {
  getStep1InvalidFields,
  validateStep1,
  type FeedbackFieldKey,
} from '@/lib/feedbackValidation'

type Step = 1 | 2

export default function FeedbackForm() {
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<FeedbackFormData>(EMPTY_FEEDBACK_FORM)
  const [error, setError] = useState<string | null>(null)
  const [invalidFields, setInvalidFields] = useState<FeedbackFieldKey[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [hoverStars, setHoverStars] = useState(0)

  const selectedStars = useMemo(() => {
    const match = SATISFACTION_STARS.find((item) => item.value === form.overallSatisfaction)
    return match?.stars ?? 0
  }, [form.overallSatisfaction])

  const activeStars = hoverStars || selectedStars
  const activeSatisfactionLabel =
    SATISFACTION_STARS.find((item) => item.stars === activeStars)?.label ?? null

  const progressLabel = useMemo(
    () => (step === 1 ? 'Step 1 of 2 — About you' : 'Step 2 of 2 — Your visit'),
    [step]
  )

  function isInvalid(field: FeedbackFieldKey) {
    return invalidFields.includes(field)
  }

  function clearFieldError(field: FeedbackFieldKey) {
    setInvalidFields((prev) => prev.filter((item) => item !== field))
    setError(null)
  }

  function updateField<K extends keyof FeedbackFormData>(key: K, value: FeedbackFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    clearFieldError(key)
  }

  function toggleChallenge(option: ChallengeOption) {
    setForm((prev) => {
      let next = [...prev.challenges]
      if (option === 'No issue') {
        next = next.includes('No issue') ? [] : ['No issue']
        return { ...prev, challenges: next, challengeOther: '' }
      }
      next = next.filter((item) => item !== 'No issue')
      if (next.includes(option)) {
        next = next.filter((item) => item !== option)
      } else {
        next.push(option)
      }
      return {
        ...prev,
        challenges: next,
        challengeOther: option === 'Other' && !next.includes('Other') ? '' : prev.challengeOther,
      }
    })
    clearFieldError('challenges')
  }

  function toggleCategory(option: PurchaseCategoryOption) {
    setForm((prev) => {
      const exists = prev.purchaseCategories.includes(option)
      return {
        ...prev,
        purchaseCategories: exists
          ? prev.purchaseCategories.filter((item) => item !== option)
          : [...prev.purchaseCategories, option],
      }
    })
    clearFieldError('purchaseCategories')
  }

  function handleContinue(e: FormEvent) {
    e.preventDefault()
    const fields = getStep1InvalidFields(form)
    if (fields.length > 0) {
      const checked = validateStep1(form)
      setInvalidFields(fields)
      setError(checked.ok ? 'Please complete all required fields.' : checked.error)
      const firstId = fields[0] === 'ageGroup' ? 'ageGroup' : fields[0]
      document.getElementById(firstId)?.focus()
      document.getElementById(firstId)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setInvalidFields([])
    setError(null)
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const payload = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(payload.error || 'Unable to submit your feedback. Please try again.')
        return
      }
      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-[28px] border border-brand-200 bg-[var(--card)] p-8 shadow-soft backdrop-blur sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">
          Thank you
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-ink-900 sm:text-4xl">
          Your feedback has been received
        </h2>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-700">
          We appreciate you taking a moment to share your store visit experience. Your response
          helps us improve every visit.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-[28px] border border-brand-200 bg-[var(--card)] p-5 shadow-soft backdrop-blur sm:p-8">
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">
            {progressLabel}
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink-900 sm:text-3xl">
            {step === 1 ? 'Tell us a little about yourself' : 'Share your store visit experience'}
          </h2>
        </div>
        <div className="flex gap-2" aria-hidden>
          <span
            className={`h-1.5 w-10 rounded-full ${step === 1 ? 'bg-brand-700' : 'bg-brand-300'}`}
          />
          <span
            className={`h-1.5 w-10 rounded-full ${step === 2 ? 'bg-brand-700' : 'bg-brand-200'}`}
          />
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      ) : null}

      {step === 1 ? (
        <form
          onSubmit={handleContinue}
          className="space-y-5"
          autoComplete="on"
          method="post"
          noValidate
        >
          <div>
            <label htmlFor="fullName" className="field-label">
              Name <span className="field-required">*</span>
            </label>
            <input
              id="fullName"
              name="name"
              className={`field-input${isInvalid('fullName') ? ' field-invalid' : ''}`}
              type="text"
              autoComplete="name"
              autoCapitalize="words"
              value={form.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
              onInput={(e) => updateField('fullName', e.currentTarget.value)}
              placeholder="Your full name"
              aria-invalid={isInvalid('fullName')}
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="field-label">
              Phone <span className="field-required">*</span>
            </label>
            <input
              id="phone"
              name="tel"
              className={`field-input${isInvalid('phone') ? ' field-invalid' : ''}`}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              onInput={(e) => updateField('phone', e.currentTarget.value)}
              placeholder="03XXXXXXXXX"
              aria-invalid={isInvalid('phone')}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="field-label">
              Email <span className="text-brand-500 font-normal">(optional)</span>
            </label>
            <input
              id="email"
              name="email"
              className={`field-input${isInvalid('email') ? ' field-invalid' : ''}`}
              type="email"
              inputMode="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              onInput={(e) => updateField('email', e.currentTarget.value)}
              placeholder="name@example.com"
              aria-invalid={isInvalid('email')}
            />
          </div>

          <div>
            <label htmlFor="location" className="field-label">
              Location <span className="field-required">*</span>
            </label>
            <input
              id="location"
              name="address-level2"
              className={`field-input${isInvalid('location') ? ' field-invalid' : ''}`}
              type="text"
              autoComplete="address-level2"
              value={form.location}
              onChange={(e) => updateField('location', e.target.value)}
              onInput={(e) => updateField('location', e.currentTarget.value)}
              placeholder="City or store area"
              aria-invalid={isInvalid('location')}
              required
            />
          </div>

          <div>
            <label htmlFor="gender" className="field-label">
              Gender <span className="field-required">*</span>
            </label>
            <select
              id="gender"
              name="sex"
              className={`field-select${isInvalid('gender') ? ' field-invalid' : ''}`}
              autoComplete="sex"
              value={form.gender}
              onChange={(e) => updateField('gender', e.target.value as FeedbackFormData['gender'])}
              aria-invalid={isInvalid('gender')}
              required
            >
              <option value="">Select gender</option>
              {GENDER_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <fieldset id="ageGroup">
            <legend className="field-label">
              Age Group <span className="field-required">*</span>
            </legend>
            <div
              className={`choice-group space-y-1.5${isInvalid('ageGroup') ? ' field-invalid' : ''}`}
              aria-invalid={isInvalid('ageGroup')}
            >
              {AGE_GROUP_OPTIONS.map((option) => (
                <label
                  key={option}
                  className="choice-row"
                  data-checked={form.ageGroup === option}
                >
                  <input
                    type="radio"
                    name="ageGroup"
                    className="mt-1 h-4 w-4 accent-brand-700"
                    checked={form.ageGroup === option}
                    onChange={() => updateField('ageGroup', option)}
                  />
                  <span className="text-[15px] text-ink-800">{option}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="border-t border-brand-100 pt-6">
            <p className="mb-4 text-sm leading-relaxed text-ink-700">
              Next, we will ask a few short questions about your recent store visit so we can
              improve your experience.
            </p>
            <button type="submit" className="btn-primary w-full sm:w-auto">
              Continue to visit feedback
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="on" noValidate>
          <div>
            <label htmlFor="dateOfVisit" className="field-label">
              Date of visit <span className="field-required">*</span>
            </label>
            <input
              id="dateOfVisit"
              name="dateOfVisit"
              className="field-input"
              type="date"
              autoComplete="off"
              value={form.dateOfVisit}
              onChange={(e) => updateField('dateOfVisit', e.target.value)}
              required
            />
          </div>

          <fieldset>
            <legend className="field-label">
              Did you experience any challenges during your visit?{' '}
              <span className="field-required">*</span>
            </legend>
            <div className="space-y-1.5">
              {CHALLENGE_OPTIONS.map((option) => {
                const checked = form.challenges.includes(option)
                return (
                  <label key={option} className="choice-row" data-checked={checked}>
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded accent-brand-700"
                      checked={checked}
                      onChange={() => toggleChallenge(option)}
                    />
                    <span className="flex flex-1 flex-col gap-2 text-[15px] text-ink-800 sm:flex-row sm:items-center">
                      <span>{option}</span>
                      {option === 'Other' && checked ? (
                        <input
                          className="field-input sm:max-w-sm"
                          value={form.challengeOther}
                          onChange={(e) => updateField('challengeOther', e.target.value)}
                          placeholder="Please specify"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : null}
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="field-label">
              What category do you usually purchase{' '}
              <span className="field-required">*</span>
            </legend>
            <div className="space-y-1.5">
              {PURCHASE_CATEGORY_OPTIONS.map((option) => {
                const checked = form.purchaseCategories.includes(option)
                return (
                  <label key={option} className="choice-row" data-checked={checked}>
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded accent-brand-700"
                      checked={checked}
                      onChange={() => toggleCategory(option)}
                    />
                    <span className="text-[15px] text-ink-800">{option}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="field-label">
              Overall, how satisfied are you with your visit to our store today{' '}
              <span className="field-required">*</span>
            </legend>
            <div
              className={`choice-group px-2 py-3${
                isInvalid('overallSatisfaction') ? ' field-invalid' : ''
              }`}
            >
              <div
                className="flex items-center justify-center gap-2 sm:gap-3"
                role="radiogroup"
                aria-label="Overall satisfaction rating"
                onMouseLeave={() => setHoverStars(0)}
              >
                {SATISFACTION_STARS.map((option) => {
                  const filled = option.stars <= activeStars
                  const selected = form.overallSatisfaction === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      aria-label={`${option.stars} star${option.stars > 1 ? 's' : ''} — ${option.label}`}
                      className="rounded-xl p-1 transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      onMouseEnter={() => setHoverStars(option.stars)}
                      onFocus={() => setHoverStars(option.stars)}
                      onBlur={() => setHoverStars(0)}
                      onClick={() =>
                        updateField('overallSatisfaction', option.value as SatisfactionOption)
                      }
                    >
                      <Star
                        className={`h-9 w-9 sm:h-10 sm:w-10 transition ${
                          filled
                            ? 'fill-brand-600 text-brand-600'
                            : 'fill-transparent text-brand-300'
                        }`}
                      />
                    </button>
                  )
                })}
              </div>
              <p
                className={`mt-3 text-center text-sm ${
                  activeSatisfactionLabel ? 'font-medium text-brand-800' : 'text-brand-400'
                }`}
                aria-live="polite"
              >
                {activeSatisfactionLabel ?? 'Tap a star to rate your visit'}
              </p>
            </div>
          </fieldset>

          <div>
            <label htmlFor="categoriesFeedback" className="field-label">
              What categories would you like to see more, do you have any feedback
            </label>
            <textarea
              id="categoriesFeedback"
              className="field-input min-h-[120px] resize-y"
              value={form.categoriesFeedback}
              onChange={(e) => updateField('categoriesFeedback', e.target.value)}
              placeholder="Share any suggestions or notes for us…"
              rows={4}
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-brand-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setError(null)
                setInvalidFields([])
                setStep(1)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              disabled={submitting}
            >
              Back
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit feedback'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
