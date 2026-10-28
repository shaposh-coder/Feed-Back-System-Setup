'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ChartDatum } from '@/lib/dashboardStats'

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #e6d4cb',
  boxShadow: '0 12px 30px -18px rgba(84, 55, 47, 0.35)',
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-[24px] border border-brand-200 bg-[var(--card)] p-4 shadow-soft sm:p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-ink-900 sm:text-lg">{title}</h2>
        <p className="mt-1 text-xs text-brand-500 sm:text-sm">{subtitle}</p>
      </div>
      <div className="h-64 w-full sm:h-72">{children}</div>
    </section>
  )
}

function EmptyChart() {
  return (
    <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-brand-200 bg-brand-50/40 text-sm text-brand-500">
      No responses yet
    </div>
  )
}

export function GenderPieChart({ data }: { data: ChartDatum[] }) {
  return (
    <ChartCard title="Gender" subtitle="How respondents identify across submissions">
      {data.length === 0 ? (
        <EmptyChart />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={84}
              paddingAngle={2}
            >
              {data.map((entry) => (
                <Cell key={entry.label} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}

export function AgeGroupBarChart({ data }: { data: ChartDatum[] }) {
  return (
    <ChartCard title="Age group" subtitle="Age brackets represented in feedback">
      {data.length === 0 ? (
        <EmptyChart />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 48 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6d4cb" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#633f35' }}
              interval={0}
              angle={-28}
              textAnchor="end"
              height={70}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#633f35' }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.label} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}

export function ChallengesBarChart({ data }: { data: ChartDatum[] }) {
  return (
    <ChartCard
      title="Visit challenges"
      subtitle="What customers selected for challenges during their visit"
    >
      {data.length === 0 ? (
        <EmptyChart />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e6d4cb" />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#633f35' }} />
            <YAxis
              type="category"
              dataKey="label"
              width={110}
              tick={{ fontSize: 10, fill: '#633f35' }}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" radius={[0, 8, 8, 0]}>
              {data.map((entry) => (
                <Cell key={entry.label} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}

export function CategoriesBarChart({ data }: { data: ChartDatum[] }) {
  return (
    <ChartCard title="Purchase categories" subtitle="Categories customers usually purchase">
      {data.length === 0 ? (
        <EmptyChart />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 36 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6d4cb" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#633f35' }}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={60}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#633f35' }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.label} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}

export function SatisfactionBarChart({ data }: { data: ChartDatum[] }) {
  return (
    <ChartCard
      title="Overall satisfaction"
      subtitle="Star ratings for store visits — from 1★ to 5★"
    >
      {data.length === 0 ? (
        <EmptyChart />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 48 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6d4cb" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#633f35' }}
              interval={0}
              angle={-24}
              textAnchor="end"
              height={70}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#633f35' }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.label} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}
