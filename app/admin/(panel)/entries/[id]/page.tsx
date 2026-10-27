import FeedbackEntryDetail from '@/components/admin/FeedbackEntryDetail'

type Props = { params: { id: string } }

export default function AdminEntryPage({ params }: Props) {
  return <FeedbackEntryDetail id={params.id} />
}
