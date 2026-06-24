import { Resend } from 'resend'
import type { Alert, Job } from '@/generated/prisma/client'

type Match = { alert: Alert; jobs: Job[] }

export async function sendAlertEmail(matches: Match[]) {
  const to = process.env.ALERT_EMAIL
  if (!to || !process.env.RESEND_API_KEY) return

  const resend = new Resend(process.env.RESEND_API_KEY)

  const total = matches.reduce((sum, m) => sum + m.jobs.length, 0)

  const html = `
    <h2>Job Watcher — ${total} nouvelle${total > 1 ? 's' : ''} offre${total > 1 ? 's' : ''}</h2>
    ${matches
      .map(
        ({ alert, jobs }) => `
      <h3 style="margin-top:24px;color:#374151;">Alerte : ${alert.name}</h3>
      <ul style="padding:0;list-style:none;">
        ${jobs
          .map(
            (job) => `
          <li style="margin-bottom:12px;padding:12px;border:1px solid #e5e7eb;border-radius:8px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://job-watcher-rho.vercel.app'}/jobs/${job.id}"
               style="font-weight:600;color:#111827;text-decoration:none;">
              ${job.title}
            </a>
            ${job.company ? `<span style="color:#6b7280;"> · ${job.company}</span>` : ''}
            ${job.location ? `<span style="color:#6b7280;"> · ${job.location}</span>` : ''}
            ${job.stack.length ? `<p style="margin:4px 0 0;font-size:12px;color:#9ca3af;">${job.stack.slice(0, 5).join(', ')}</p>` : ''}
          </li>
        `
          )
          .join('')}
      </ul>
    `
      )
      .join('')}
    <p style="margin-top:24px;font-size:12px;color:#9ca3af;">
      Voir toutes les offres sur
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://job-watcher-rho.vercel.app'}">Job Watcher</a>
    </p>
  `

  await resend.emails.send({
    from: 'Job Watcher <onboarding@resend.dev>',
    to,
    subject: `Job Watcher — ${total} nouvelle${total > 1 ? 's' : ''} offre${total > 1 ? 's' : ''}`,
    html,
  })
}
