import { NextResponse } from 'next/server'
import type { FeedbackFormData } from '@/lib/feedbackOptions'
import { validateFullFeedback } from '@/lib/feedbackValidation'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const checked = validateFullFeedback((body ?? {}) as Partial<FeedbackFormData>)
  if (!checked.ok) {
    return NextResponse.json({ error: checked.error, step: checked.step }, { status: 400 })
  }

  const { data } = checked

  try {
    const admin = getSupabaseAdmin()
    const { error } = await admin.from('feedback_entries').insert({
      full_name: data.fullName,
      phone: data.phone,
      email: data.email,
      location: data.location,
      gender: data.gender,
      age_group: data.ageGroup,
      date_of_visit: data.dateOfVisit,
      challenges: data.challenges,
      challenge_other: data.challengeOther || null,
      purchase_categories: data.purchaseCategories,
      overall_satisfaction: data.overallSatisfaction,
      categories_feedback: data.categoriesFeedback || null,
      status: 'new',
    })

    if (error) {
      console.error('feedback insert failed:', error.message)
      return NextResponse.json(
        { error: 'Unable to save your feedback right now. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('feedback route error:', err)
    return NextResponse.json(
      { error: 'Unable to save your feedback right now. Please try again later.' },
      { status: 500 }
    )
  }
}
