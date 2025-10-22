'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useApi } from '@/hooks/custom'
import { Input } from '@/components/ui'
import { User, GraduationCap, Building2, Briefcase, MapPin, Search, ChevronLeft, ChevronRight } from 'lucide-react'

interface TalentItem {
  id: string
  name: string | null
  email: string
  image?: string | null
  userType: 'aluno' | 'gestor'
  cidade?: string | null
  estado?: string | null
  cnpj?: string | null
  curso?: string | null
  universidade?: string | null
  periodo?: string | null
  nomeUniversidade?: string | null
  departamento?: string | null
  cargoGestor?: string | null
  nomeEmpresa?: string | null
  cargo?: string | null
  setor?: string | null
}

export default function Talents() {
  const [q, setQ] = useState('')
  const [userType, setUserType] = useState<'aluno' | 'gestor' | ''>('')
  const [curso, setCurso] = useState('')
  const [universidade, setUniversidade] = useState('')
  const [departamento, setDepartamento] = useState('')
  const [cargoGestor, setCargoGestor] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 20

  const listApi = useApi({})

  const fetchTalents = () => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (userType) params.set('userType', userType)
    if (curso) params.set('curso', curso)
    if (universidade) params.set('universidade', universidade)
    if (departamento) params.set('departamento', departamento)
    if (cargoGestor) params.set('cargoGestor', cargoGestor)
    if (cidade) params.set('cidade', cidade)
    if (estado) params.set('estado', estado)
    params.set('page', String(page))
    params.set('pageSize', String(pageSize))

    return listApi.execute(() =>
      fetch(`/api/talents?${params.toString()}`).then(res => res.json())
    )
  }

  useEffect(() => {
    fetchTalents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, userType, curso, universidade, departamento, cargoGestor, cidade, estado, page])

  const items: TalentItem[] = listApi.data?.items || []
  const total: number = listApi.data?.total || 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const resetFilters = () => {
    setQ(''); setUserType(''); setCurso(''); setUniversidade(''); setDepartamento(''); setCargoGestor(''); setCidade(''); setEstado(''); setPage(1)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Banco de Talentos</h1>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="col-span-1 md:col-span-2">
              <div className="relative">
                <input
                  value={q}
                  onChange={(e) => { setPage(1); setQ(e.target.value) }}
                  placeholder="Buscar por nome, email, curso, universidade, cargo..."
                  className="w-full text-black px-4 py-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 border-gray-300 focus:ring-purple-500"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            <select value={userType} onChange={(e) => { setPage(1); setUserType(e.target.value as any) }} className="text-black w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 border-gray-300 focus:ring-purple-500">
              <option value="">Tipo de usuário</option>
              <option value="aluno">Aluno</option>
              <option value="gestor">Gestor</option>
            </select>
            <input value={curso} onChange={(e) => { setPage(1); setCurso(e.target.value) }} placeholder="Curso" className="text-black w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 border-gray-300 focus:ring-purple-500" />
            <input value={universidade} onChange={(e) => { setPage(1); setUniversidade(e.target.value) }} placeholder="Universidade" className="text-black w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 border-gray-300 focus:ring-purple-500" />
            <input value={departamento} onChange={(e) => { setPage(1); setDepartamento(e.target.value) }} placeholder="Departamento (Gestor)" className="text-black w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 border-gray-300 focus:ring-purple-500" />
            <input value={cargoGestor} onChange={(e) => { setPage(1); setCargoGestor(e.target.value) }} placeholder="Cargo (Gestor)" className="text-black w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 border-gray-300 focus:ring-purple-500" />
            <input value={cidade} onChange={(e) => { setPage(1); setCidade(e.target.value) }} placeholder="Cidade" className="text-black w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 border-gray-300 focus:ring-purple-500" />
            <input value={estado} onChange={(e) => { setPage(1); setEstado(e.target.value.toUpperCase().slice(0,2)) }} placeholder="UF" maxLength={2} className="text-black w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 border-gray-300 focus:ring-purple-500" />
            <button onClick={resetFilters} className="text-black px-3 py-3 rounded-lg border text-sm hover:bg-gray-50">Limpar filtros</button>
          </div>
        </div>

        {/* Lista */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((u) => (
            <Link key={u.id} href={`/talents/${u.id}`} className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center overflow-hidden">
                  {u.image ? <img src={u.image} alt={u.name || u.email} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{u.name || u.email}</p>
                  <p className="text-xs text-gray-600 capitalize">{u.userType}</p>
                </div>
              </div>
              <div className="text-xs text-gray-700 space-y-1">
                {(u.cidade || u.estado) && (
                  <p className="flex items-center gap-1"><MapPin className="w-3 h-3" />{[u.cidade, u.estado].filter(Boolean).join(' / ')}</p>
                )}
                {u.userType === 'aluno' && (u.curso || u.universidade) && (
                  <p className="flex items-center gap-1"><GraduationCap className="w-3 h-3" />{[u.curso, u.universidade].filter(Boolean).join(' - ')}</p>
                )}
                {u.userType === 'gestor' && (u.nomeUniversidade || u.departamento || u.cargoGestor) && (
                  <p className="flex items-center gap-1"><Building2 className="w-3 h-3" />{[u.nomeUniversidade, u.departamento, u.cargoGestor].filter(Boolean).join(' • ')}</p>
                )}
                {(u.nomeEmpresa || u.cargo || u.setor) && (
                  <p className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{[u.nomeEmpresa, u.cargo, u.setor].filter(Boolean).join(' • ')}</p>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Paginação */}
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-2 rounded border disabled:opacity-50 flex items-center gap-1"><ChevronLeft className="w-4 h-4"/>Anterior</button>
          <span>Página {page} de {totalPages}</span>
          <button disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} className="px-3 py-2 rounded border disabled:opacity-50 flex items-center gap-1">Próxima<ChevronRight className="w-4 h-4"/></button>
        </div>
      </div>
    </div>
  )
}

