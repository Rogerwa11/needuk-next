import { prisma } from '@/lib/prisma'
import { publicTalentSelect, activityDetailSelect } from '@/lib/utils/prisma-selects'
import Link from 'next/link'
import { ActivityCard } from './_components/ActivityCard'

export default async function TalentDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolved = await params;
  const formatDate = (value: unknown): string => {
    if (!value) return ''
    const date = value instanceof Date ? value : new Date(String(value))
    return isNaN(date.getTime()) ? '' : date.toLocaleString()
  }
  const user = await prisma.user.findUnique({ where: { id: resolved.id }, select: publicTalentSelect })
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center overflow-hidden">
              {user.image ? <img src={user.image} alt={user.name || user.email} className="w-full h-full object-cover" /> : <span className="text-white text-lg">{(user.name || user.email)[0]?.toUpperCase()}</span>}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{user.name || user.email}</h1>
              <p className="text-sm text-gray-600 capitalize">{user.userType}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
            <div><span className="text-gray-500">Email:</span> <span className="text-gray-800">{user.email}</span></div>
            {user.telefone && (<div><span className="text-gray-500">Telefone:</span> <span className="text-gray-800">{user.telefone}</span></div>)}
            {(user.cidade || user.estado) && (
              <div><span className="text-gray-500">Localidade:</span> <span className="text-gray-800">{[user.cidade, user.estado].filter(Boolean).join(' / ')}</span></div>
            )}
            {user.cnpj && (<div><span className="text-gray-500">CNPJ:</span> <span className="text-gray-800">{user.cnpj}</span></div>)}
            {user.userType === 'aluno' && (
              <>
                {(user.curso || user.universidade) && <div><span className="text-gray-500">Formação:</span> <span className="text-gray-800">{[user.curso, user.universidade].filter(Boolean).join(' - ')}</span></div>}
                {user.periodo && <div><span className="text-gray-500">Período:</span> <span className="text-gray-800">{user.periodo}</span></div>}
              </>
            )}
            {user.userType === 'gestor' && (
              <>
                {(user.nomeUniversidade || user.departamento) && <div><span className="text-gray-500">Instituição/Dep.:</span> <span className="text-gray-800">{[user.nomeUniversidade, user.departamento].filter(Boolean).join(' - ')}</span></div>}
                {user.cargoGestor && <div><span className="text-gray-500">Cargo:</span> <span className="text-gray-800">{user.cargoGestor}</span></div>}
              </>
            )}
            {(user.nomeEmpresa || user.cargo || user.setor) && (
              <div><span className="text-gray-500">Empresa/Cargo/Setor:</span> <span className="text-gray-800">{[user.nomeEmpresa, user.cargo, user.setor].filter(Boolean).join(' • ')}</span></div>
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
        </div>

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


