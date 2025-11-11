import { prisma } from '@/lib/prisma'
import { publicTalentSelect, activityDetailSelect } from '@/lib/utils/prisma-selects'
import { BadgeCheck } from 'lucide-react'
import Link from 'next/link'
import { ActivityCard } from './_components/ActivityCard'
import { ExperienceCard } from './_components/ExperienceCard'

export default async function TalentDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolved = await params;
  const formatDate = (value: unknown): string => {
    if (!value) return ''
    const date = value instanceof Date ? value : new Date(String(value))
    return isNaN(date.getTime()) ? '' : date.toLocaleString()
  }
  const user = await prisma.user.findUnique({ where: { id: resolved.id }, select: (publicTalentSelect as any) }) as any
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white border rounded-lg p-6 max-w-md text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Usuário não encontrado</h1>
          <Link href="/talents" className="text-purple-600 hover:text-purple-700">Voltar ao Banco de Talentos</Link>
        </div>
      </div>
    )
  }

  // atividades que participa
  const participations = await prisma.activityParticipant.findMany({
    where: { userId: resolved.id },
    include: {
      activity: { select: activityDetailSelect as any }
    },
    orderBy: { activity: { startDate: 'desc' } }
  })

  const activities = participations.map(p => p.activity)
  const badges: any[] = Array.isArray((user as any).badgesReceived) ? (user as any).badgesReceived : []
  const aggregatedBadges = (() => {
    const grouped = new Map<
      string,
      {
        badgeId: string
        badgeName: string
        badgeIcon?: string | null
        badgeColor?: string | null
        description?: string | null
        count: number
        latestCreatedAt: string
        awardedByNames: Set<string>
        activityTitles: Set<string>
        notes: string[]
      }
    >()

    badges.forEach((badge: any) => {
      const existing = grouped.get(badge.badgeId)
      if (existing) {
        existing.count += 1
        if (badge.awardedBy?.name) {
          existing.awardedByNames.add(badge.awardedBy.name)
        }
        if (badge.activity?.title) {
          existing.activityTitles.add(badge.activity.title)
        }
        if (badge.note) {
          existing.notes.push(badge.note)
        }
        if (new Date(badge.createdAt).getTime() > new Date(existing.latestCreatedAt).getTime()) {
          existing.latestCreatedAt = badge.createdAt
        }
      } else {
        grouped.set(badge.badgeId, {
          badgeId: badge.badgeId,
          badgeName: badge.badgeName,
          badgeIcon: badge.badgeIcon ?? null,
          badgeColor: badge.badgeColor ?? null,
          description: badge.badgeDescription ?? null,
          count: 1,
          latestCreatedAt: badge.createdAt,
          awardedByNames: new Set(badge.awardedBy?.name ? [badge.awardedBy.name] : []),
          activityTitles: new Set(badge.activity?.title ? [badge.activity.title] : []),
          notes: badge.note ? [badge.note] : [],
        })
      }
    })

    return Array.from(grouped.values())
      .sort(
        (a, b) =>
          new Date(b.latestCreatedAt).getTime() - new Date(a.latestCreatedAt).getTime()
      )
      .map(({ awardedByNames, activityTitles, ...rest }) => ({
        badgeId: rest.badgeId,
        badgeName: rest.badgeName,
        badgeIcon: rest.badgeIcon,
        badgeColor: rest.badgeColor,
        description: rest.description,
        count: rest.count,
        awardedByNames: Array.from(awardedByNames),
        activityTitles: Array.from(activityTitles),
        notes: rest.notes,
      }))
  })()

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center overflow-hidden">
              {user.image ? <img src={user.image as string} alt={(user.name || user.email) as string} className="w-full h-full object-cover" /> : <span className="text-white text-lg">{String(user.name || user.email)[0]?.toUpperCase()}</span>}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{String(user.name || user.email)}</h1>
              <p className="text-sm text-gray-600 capitalize">{user.userType}</p>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
            <div><span className="text-gray-500">Email:</span> <span className="text-gray-800">{user.email}</span></div>
            {user.telefone && (<div><span className="text-gray-500">Telefone:</span> <span className="text-gray-800">{String(user.telefone)}</span></div>)}
            {(user.cidade || user.estado) && (
              <div><span className="text-gray-500">Localidade:</span> <span className="text-gray-800">{[user.cidade, user.estado].filter(Boolean).map(String).join(' / ')}</span></div>
            )}
            {user.cnpj && (<div><span className="text-gray-500">CNPJ:</span> <span className="text-gray-800">{String(user.cnpj)}</span></div>)}
            {user.userType === 'aluno' && (
              <>
                {(user.curso || user.universidade) && <div><span className="text-gray-500">Formação:</span> <span className="text-gray-800">{[user.curso, user.universidade].filter(Boolean).map(String).join(' - ')}</span></div>}
                {user.periodo && <div><span className="text-gray-500">Período:</span> <span className="text-gray-800">{user.periodo}</span></div>}
              </>
            )}

            {user.userType === 'gestor' && (
              <>
                {(user.nomeUniversidade || user.departamento) && <div><span className="text-gray-500">Instituição/Dep.:</span> <span className="text-gray-800">{[user.nomeUniversidade, user.departamento].filter(Boolean).map(String).join(' - ')}</span></div>}
                {user.cargoGestor && <div><span className="text-gray-500">Cargo:</span> <span className="text-gray-800">{user.cargoGestor}</span></div>}
              </>
            )}
            {(user.nomeEmpresa || user.cargo || user.setor) && (
              <div><span className="text-gray-500">Empresa/Cargo/Setor:</span> <span className="text-gray-800">{[user.nomeEmpresa, user.cargo, user.setor].filter(Boolean).map(String).join(' • ')}</span></div>
            )}
          </div>

          {user.userType === 'aluno' && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Medalhas</h3>
              <div className="grid grid-cols-3 gap-2 max-w-xs text-center">
                <div className="px-2 py-2 border rounded-lg bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                  <div className="text-xl mb-1">🥇</div>
                  <div className="text-sm font-bold text-yellow-800">{(user as any).goldMedals || 0}</div>
                  <div className="text-xs text-yellow-600">Ouro</div>
                </div>
                <div className="px-2 py-2 border rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
                  <div className="text-xl mb-1">🥈</div>
                  <div className="text-sm font-bold text-gray-800">{(user as any).silverMedals || 0}</div>
                  <div className="text-xs text-gray-600">Prata</div>
                </div>
                <div className="px-2 py-2 border rounded-lg bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                  <div className="text-xl mb-1">🥉</div>
                  <div className="text-sm font-bold text-orange-800">{(user as any).bronzeMedals || 0}</div>
                  <div className="text-xs text-orange-600">Bronze</div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <BadgeCheck className="w-4 h-4" />
              Emblemas recebidos
            </h3>
            {aggregatedBadges.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {aggregatedBadges.map((badge) => {
                  const tooltip = [
                    badge.description,
                    `Recebido ${badge.count} ${badge.count > 1 ? 'vezes' : 'vez'}`,
                    badge.awardedByNames.length ? `Concedido por: ${badge.awardedByNames.join(', ')}` : null,
                    badge.activityTitles.length ? `Atividades: ${badge.activityTitles.join(', ')}` : null,
                    badge.notes.length ? `Mensagens: ${badge.notes.join(' | ')}` : null,
                  ]
                    .filter(Boolean)
                    .join(' • ')

                  return (
                    <span
                      key={badge.badgeId}
                      title={tooltip || 'Emblema conquistado'}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-medium bg-white"
                      style={{
                        borderColor: badge.badgeColor || '#c4b5fd',
                        color: badge.badgeColor || '#6b21a8',
                      }}
                    >
                      <span>{badge.badgeIcon || '🏅'}</span>
                      <span>
                        {badge.badgeName}
                        {badge.count > 1 ? ` ×${badge.count}` : ''}
                      </span>
                    </span>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-600">Nenhum emblema recebido até o momento.</p>
            )}
          </div>

          {user.aboutMe && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Sobre mim</h3>
              <p className="text-sm text-gray-800 whitespace-pre-line">{user.aboutMe}</p>
            </div>
          )}
        </div>

        {(user as any).experiences && Array.isArray((user as any).experiences) && (
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Experiências</h2>
            {(user as any).experiences.length === 0 ? (
              <p className="text-sm text-gray-600">Nenhuma experiência encontrada.</p>
            ) : (
              <div className="space-y-4">
                {(user as any).experiences.map((e: any, idx: number) => (
                  <ExperienceCard key={`exp-${idx}`} experience={e} />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Atividades</h2>
          {activities.length === 0 ? (
            <p className="text-sm text-gray-600">Nenhuma atividade encontrada.</p>
          ) : (
            <div className="space-y-4">
              {activities.map((a) => (
                <ActivityCard key={`${a.id}`} activity={a} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


