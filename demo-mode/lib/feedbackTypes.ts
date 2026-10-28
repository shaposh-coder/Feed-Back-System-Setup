export type FeedbackStatus = 'new' | 'reviewed' | 'archived'

export type FeedbackEntry = {
  id: string
  created_at: string
  full_name: string
  phone: string
  email: string
  location: string
  gender: string
  age_group: string
  date_of_visit: string
  challenges: string[]
  challenge_other: string | null
  purchase_categories: string[]
  overall_satisfaction: string
  categories_feedback: string | null
  status: FeedbackStatus
}

export const FEEDBACK_SELECT =
  'id, created_at, full_name, phone, email, location, gender, age_group, date_of_visit, challenges, challenge_other, purchase_categories, overall_satisfaction, categories_feedback, status'
