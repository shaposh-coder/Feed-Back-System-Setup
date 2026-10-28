import {
  AGE_GROUP_OPTIONS,
  CHALLENGE_OPTIONS,
  GENDER_OPTIONS,
  PURCHASE_CATEGORY_OPTIONS,
  SATISFACTION_OPTIONS,
  type FeedbackFormData,
} from './feedbackOptions'

type OptionList = readonly string[]

function isOneOf(value: string, options: OptionList): boolean {
  return options.includes(value)
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isDateOnly(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

export type FeedbackFieldKey = keyof FeedbackFormData

export type FeedbackValidationResult =
  | { ok: true; data: FeedbackFormData }
  | { ok: false; error: string; step?: 1 | 2; fields?: FeedbackFieldKey[] }

const STEP1_MESSAGES: Partial<Record<FeedbackFieldKey, string>> = {
  fullName: 'Please enter your name.',
  phone: 'Please enter your phone number.',
  email: 'Please enter a valid email address.',
  location: 'Please enter your location.',
  gender: 'Please select your gender.',
  ageGroup: 'Please select your age group.',
}

export function getStep1InvalidFields(input: Partial<FeedbackFormData>): FeedbackFieldKey[] {
  const fullName = (input.fullName ?? '').trim()
  const phone = (input.phone ?? '').trim()
  const email = (input.email ?? '').trim()
  const location = (input.location ?? '').trim()
  const gender = (input.gender ?? '').trim()
  const ageGroup = (input.ageGroup ?? '').trim()

  const fields: FeedbackFieldKey[] = []
  if (!fullName) fields.push('fullName')
  if (!phone) fields.push('phone')
  if (email && !isEmail(email)) fields.push('email')
  if (!location) fields.push('location')
  if (!isOneOf(gender, GENDER_OPTIONS)) fields.push('gender')
  if (!isOneOf(ageGroup, AGE_GROUP_OPTIONS)) fields.push('ageGroup')
  return fields
}

export function validateStep1(input: Partial<FeedbackFormData>): FeedbackValidationResult {
  const fields = getStep1InvalidFields(input)
  if (fields.length > 0) {
    const first = fields[0]
    return {
      ok: false,
      error: STEP1_MESSAGES[first] || 'Please complete all required fields.',
      step: 1,
      fields,
    }
  }

  const fullName = (input.fullName ?? '').trim()
  const phone = (input.phone ?? '').trim()
  const email = (input.email ?? '').trim()
  const location = (input.location ?? '').trim()
  const gender = (input.gender ?? '').trim()
  const ageGroup = (input.ageGroup ?? '').trim()

  return {
    ok: true,
    data: {
      fullName,
      phone,
      email,
      location,
      gender: gender as FeedbackFormData['gender'],
      ageGroup: ageGroup as FeedbackFormData['ageGroup'],
      dateOfVisit: '',
      challenges: [],
      challengeOther: '',
      purchaseCategories: [],
      overallSatisfaction: '',
      categoriesFeedback: '',
    },
  }
}

export function validateFullFeedback(input: Partial<FeedbackFormData>): FeedbackValidationResult {
  const step1 = validateStep1(input)
  if (!step1.ok) return step1

  const dateOfVisit = (input.dateOfVisit ?? '').trim()
  const challenges = Array.isArray(input.challenges) ? input.challenges : []
  const challengeOther = (input.challengeOther ?? '').trim()
  const purchaseCategories = Array.isArray(input.purchaseCategories)
    ? input.purchaseCategories
    : []
  const overallSatisfaction = (input.overallSatisfaction ?? '').trim()
  const categoriesFeedback = (input.categoriesFeedback ?? '').trim()

  if (!dateOfVisit || !isDateOnly(dateOfVisit)) {
    return { ok: false, error: 'Please select the date of your visit.', step: 2 }
  }
  if (challenges.length === 0) {
    return {
      ok: false,
      error: 'Please tell us if you experienced any challenges during your visit.',
      step: 2,
    }
  }
  for (const item of challenges) {
    if (!isOneOf(item, CHALLENGE_OPTIONS)) {
      return { ok: false, error: 'One of the selected challenges is invalid.', step: 2 }
    }
  }
  if (challenges.includes('Other') && !challengeOther) {
    return { ok: false, error: 'Please describe the other challenge you experienced.', step: 2 }
  }
  if (purchaseCategories.length === 0) {
    return {
      ok: false,
      error: 'Please select at least one category you usually purchase.',
      step: 2,
    }
  }
  for (const item of purchaseCategories) {
    if (!isOneOf(item, PURCHASE_CATEGORY_OPTIONS)) {
      return { ok: false, error: 'One of the selected purchase categories is invalid.', step: 2 }
    }
  }
  if (!isOneOf(overallSatisfaction, SATISFACTION_OPTIONS)) {
    return {
      ok: false,
      error: 'Please rate your overall satisfaction with your visit.',
      step: 2,
    }
  }

  return {
    ok: true,
    data: {
      ...step1.data,
      dateOfVisit,
      challenges: challenges as FeedbackFormData['challenges'],
      challengeOther: challenges.includes('Other') ? challengeOther : '',
      purchaseCategories: purchaseCategories as FeedbackFormData['purchaseCategories'],
      overallSatisfaction: overallSatisfaction as FeedbackFormData['overallSatisfaction'],
      categoriesFeedback,
    },
  }
}
