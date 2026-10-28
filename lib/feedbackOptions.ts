export const GENDER_OPTIONS = [
  'Female',
  'Male',
  'Prefer not to say',
  'Other',
] as const

export const AGE_GROUP_OPTIONS = [
  '20 Years or below',
  '21 to 25 Years',
  '26 to 30 Years',
  '31 to 35 Years',
  '36 to 40 Years',
  '41 to 50 Years',
  '51 Years and above',
] as const

export const CHALLENGE_OPTIONS = [
  'No issue',
  'Customer service',
  'Product unavailability',
  'Product quality',
  'Checkout experience',
  'Fitting room experience',
  'Exchange policy',
  'Claim',
  'Other',
] as const

export const PURCHASE_CATEGORY_OPTIONS = [
  'Women Formal',
  'Women Casual',
  'Kids Casual',
  'Kids Formal',
  'Accessories',
  'Others',
] as const

/** Left → right: 1 star (lowest) to 5 stars (highest) */
export const SATISFACTION_OPTIONS = [
  'Very dissatisfied',
  'Dissatisfied',
  'Neutral',
  'Satisfied',
  'Very satisfied',
] as const

export const SATISFACTION_STARS = [
  { value: 'Very dissatisfied', label: 'Very dissatisfied', stars: 1 },
  { value: 'Dissatisfied', label: 'Dissatisfied', stars: 2 },
  { value: 'Neutral', label: 'Neutral', stars: 3 },
  { value: 'Satisfied', label: 'Satisfied', stars: 4 },
  { value: 'Very satisfied', label: 'Very satisfied', stars: 5 },
] as const

export type GenderOption = (typeof GENDER_OPTIONS)[number]
export type AgeGroupOption = (typeof AGE_GROUP_OPTIONS)[number]
export type ChallengeOption = (typeof CHALLENGE_OPTIONS)[number]
export type PurchaseCategoryOption = (typeof PURCHASE_CATEGORY_OPTIONS)[number]
export type SatisfactionOption = (typeof SATISFACTION_OPTIONS)[number]

export type FeedbackFormData = {
  fullName: string
  phone: string
  email: string
  location: string
  branch: string
  gender: GenderOption | ''
  ageGroup: AgeGroupOption | ''
  dateOfVisit: string
  challenges: ChallengeOption[]
  challengeOther: string
  purchaseCategories: PurchaseCategoryOption[]
  overallSatisfaction: SatisfactionOption | ''
  categoriesFeedback: string
}

export const EMPTY_FEEDBACK_FORM: FeedbackFormData = {
  fullName: '',
  phone: '',
  email: '',
  location: '',
  branch: '',
  gender: '',
  ageGroup: '',
  dateOfVisit: '',
  challenges: [],
  challengeOther: '',
  purchaseCategories: [],
  overallSatisfaction: '',
  categoriesFeedback: '',
}
