'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApi } from '@/hooks/custom';
import { Button } from '@/components/ui/Button';
import { allCourses } from '@/constants/courses';
import { UF_OPTIONS } from '@/constants/ufs';
import {
    Briefcase,
    Building2,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    GraduationCap,
    Loader2,
    LucideIcon,
    Mail,
    MapPin,
    Search,
    Users,
} from 'lucide-react';

type ViewerInfo = {
    id: string;
    name: string;
    email: string;
    userType: string;
    curso: string | null;
    nomeEmpresa: string | null;
};

type VacancyViewerState = {
    canEdit: boolean;
    canApply: boolean;
    application: {
        id: string;
        status: string;
    } | null;
} | null;

type VacancyListItem = {
    id: string;
    title: string;
    description: string;
    modality: string;
    seniority: string;
    contractType: string;
    workload: string | null;
    salaryMin: number | null;
    salaryMax: number | null;
    salaryCurrency: string | null;
    benefits: string[];
    deadline: string | null;
    locationCity: string | null;
    locationState: string | null;
    locationCountry: string | null;
    companyName: string | null;
    contactEmail: string;
    contactPhone: string | null;
    contactUrl: string | null;
    contactNotes: string | null;
    status: 'OPEN' | 'CLOSED';
    isDraft: boolean;
    recruiterId: string;
    recruiter: {
        id: string;
        name: string | null;
        email: string;
        nomeEmpresa: string | null;
        cargo: string | null;
        image: string | null;
    };
    skills: string[];
    preferredCourses: string[];
    keywords: string[];
    createdAt: string;
    updatedAt: string;
    _count: {
        applications: number;
    };
    viewerState: VacancyViewerState;
};

type VacancyListResponse = {
    items: VacancyListItem[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
    filters: Record<string, unknown>;
};

interface VacanciesClientProps {
    initialViewer: ViewerInfo | null;
    initialData: VacancyListResponse | null;
    initialParams: Record<string, string | string[] | undefined>;
}

type FiltersState = {
    search: string;
    modality: string;
    seniority: string;
    contractType: string;
    course: string;
    locationState: string;
    locationCity: string;
    status: string;
};

const modalityOptions = ['Remoto', 'Híbrido', 'Presencial'];
const seniorityOptions = ['Estágio', 'Júnior', 'Pleno', 'Sênior', 'Especialista', 'Trainee'];
const contractTypeOptions = ['CLT', 'PJ', 'Bolsa', 'Temporário', 'Freelancer', 'Estágio', 'Cooperado'];

const statusLabels: Record<string, { label: string; className: string }> = {
    OPEN: { label: 'Aberta', className: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
    CLOSED: { label: 'Fechada', className: 'bg-rose-100 text-rose-700 border border-rose-200' },
    DRAFT: { label: 'Rascunho', className: 'bg-amber-100 text-amber-700 border border-amber-200' },
};

const applicationStatusLabels: Record<string, { label: string; className: string }> = {
    PENDING: { label: 'Em análise', className: 'bg-blue-100 text-blue-700 border border-blue-200' },
    ACCEPTED: { label: 'Aceita', className: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
    REJECTED: { label: 'Recusada', className: 'bg-rose-100 text-rose-700 border border-rose-200' },
};
const buttonBaseClass = 'inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition';

export function VacanciesClient({ initialViewer, initialData, initialParams }: VacanciesClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const {
        data: listData,
        loading: listLoading,
        execute: executeVacancies,
        setData: setVacanciesData,
    } = useApi<VacancyListResponse>();
    const [page, setPage] = useState(() => parsePositiveNumber(getParam(initialParams, 'page')) || initialData?.page || 1);
    const [searchInput, setSearchInput] = useState(() => getParam(initialParams, 'search') || getParam(initialParams, 'q') || '');
    const [filters, setFilters] = useState<FiltersState>(() => ({
        search: getParam(initialParams, 'search') || getParam(initialParams, 'q') || '',
        modality: getParam(initialParams, 'modality') || '',
        seniority: getParam(initialParams, 'seniority') || '',
        contractType: getParam(initialParams, 'contractType') || '',
        course: getParam(initialParams, 'course') || '',
        locationState: getParam(initialParams, 'locationState') || '',
        locationCity: getParam(initialParams, 'locationCity') || '',
        status: getParam(initialParams, 'status') || '',
    }));
    const [highlightedVacancyId, setHighlightedVacancyId] = useState<string | null>(null);
    const hasBootstrapped = useRef(false);
    const pageSize = useMemo(() => initialData?.pageSize ?? 12, [initialData]);

    const fetchVacancies = useCallback(async () => {
        const params = new URLSearchParams();
        if (filters.search) params.set('search', filters.search);
        if (filters.modality) params.set('modality', filters.modality);
        if (filters.seniority) params.set('seniority', filters.seniority);
        if (filters.contractType) params.set('contractType', filters.contractType);
        if (filters.course) params.set('course', filters.course);
        if (filters.locationState) params.set('locationState', filters.locationState);
        if (filters.locationCity) params.set('locationCity', filters.locationCity);
        if (filters.status) params.set('status', filters.status);
        params.set('page', String(page));
        params.set('pageSize', String(pageSize));

        await executeVacancies(async () => {
            const response = await fetch(`/api/vacancies?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store',
            });

            const payload = await response.json();
            if (!response.ok) {
                throw new Error(payload?.error || 'Não foi possível carregar as vagas');
            }
            return payload.data as VacancyListResponse;
        });
    }, [filters, page, pageSize, executeVacancies]);

    useEffect(() => {
        if (initialData) {
            setVacanciesData(initialData);
        }
    }, [initialData, setVacanciesData]);

    useEffect(() => {
        if (!initialData && !hasBootstrapped.current) {
            hasBootstrapped.current = true;
            void fetchVacancies();
        }
    }, [initialData, fetchVacancies]);

    useEffect(() => {
        if (!hasBootstrapped.current) {
            hasBootstrapped.current = true;
            return;
        }
        void fetchVacancies();
    }, [filters, page, fetchVacancies]);

    useEffect(() => {
        const params = new URLSearchParams();
        if (filters.search) params.set('search', filters.search);
        if (filters.modality) params.set('modality', filters.modality);
        if (filters.seniority) params.set('seniority', filters.seniority);
        if (filters.contractType) params.set('contractType', filters.contractType);
        if (filters.course) params.set('course', filters.course);
        if (filters.locationState) params.set('locationState', filters.locationState);
        if (filters.locationCity) params.set('locationCity', filters.locationCity);
        if (filters.status) params.set('status', filters.status);
        params.set('page', String(page));
        params.set('pageSize', String(pageSize));
        const queryString = params.toString();
        router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    }, [filters, page, pageSize, pathname, router]);

    const data = listData ?? initialData;
    const items = data?.items ?? [];
    const total = data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const loading = listLoading && !initialData;

    const applyApi = useApi<{ application: any }>();
    const [applyingId, setApplyingId] = useState<string | null>(null);

    const handleSearchChange = (value: string) => {
        setSearchInput(value);
        updateFilters({ search: value });
    };

    const updateFilters = (patch: Partial<FiltersState>) => {
        setFilters((prev) => {
            const next = { ...prev, ...patch };
            return next;
        });
        setPage(1);
    };

    const resetFilters = () => {
        setSearchInput('');
        setFilters({
            search: '',
            modality: '',
            seniority: '',
            contractType: '',
            course: '',
            locationState: '',
            locationCity: '',
            status: '',
        });
        setPage(1);
    };

    const handleApply = async (vacancy: VacancyListItem) => {
        if (!vacancy.viewerState?.canApply) return;
        setApplyingId(vacancy.id);
        const response = await applyApi.execute(async () => {
            const res = await fetch(`/api/vacancies/${vacancy.id}/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            });
            const payload = await res.json();
            if (!res.ok) {
                throw new Error(payload?.error || 'Não foi possível enviar a candidatura');
            }
            return payload?.data;
        });
        setApplyingId(null);
        if (response) {
            setHighlightedVacancyId(vacancy.id);
            void fetchVacancies();
        }
    };

    const orderingCourse = filters.course || initialViewer?.curso || '';
    const displayCourse = filters.course;

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white py-8 px-4">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
                <header className="flex flex-col gap-4 rounded-2xl bg-gray-600 p-6 text-white shadow-lg">
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-white/70">Needuk Talents</p>
                            <h1 className="text-2xl font-bold lg:text-3xl">Encontre a oportunidade ideal</h1>
                            <p className="mt-2 max-w-2xl text-sm lg:text-base text-white/80">
                                Explore vagas abertas para alunos e gestores. Resultados são priorizados de acordo com o curso informado em seu perfil para acelerar o match com empresas.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            {initialViewer?.userType === 'recrutador' && (
                                <Link
                                    href="/vacancies/manage"
                                    className={`${buttonBaseClass} bg-white/90 text-gray-700 hover:bg-white`}
                                >
                                    Gerenciar vagas
                                </Link>
                            )}
                            <Link
                                href="/talents"
                                className={`${buttonBaseClass} border border-white/40 bg-white/10 text-white hover:bg-white/20`}
                            >
                                Explorar talentos
                            </Link>
                        </div>
                    </div>
                    {displayCourse && (
                        <div className="flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-sm">
                            <GraduationCap className="h-4 w-4" />
                            <span>
                                Vagas filtradas para o curso <strong>{displayCourse}</strong>.
                            </span>
                        </div>
                    )}
                </header>

                <section className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-gray-100">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="md:col-span-2">
                            <div className="flex flex-col gap-1 text-sm text-gray-700">
                                <span className="font-medium">Busca</span>
                                <label className="relative block">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <input
                                        value={searchInput}
                                        onChange={(event) => handleSearchChange(event.target.value)}
                                        placeholder="Busque por cargo, tecnologia, palavra-chave ou empresa"
                                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 pl-10 text-sm text-gray-900 shadow-sm transition focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
                                    />
                                </label>
                            </div>
                        </div>
                        <SelectFilter
                            label="Modalidade"
                            value={filters.modality}
                            onChange={(value) => updateFilters({ modality: value })}
                            options={['', ...modalityOptions]}
                        />
                        <SelectFilter
                            label="Sênioridade"
                            value={filters.seniority}
                            onChange={(value) => updateFilters({ seniority: value })}
                            options={['', ...seniorityOptions]}
                        />
                        <SelectFilter
                            label="Tipo de contrato"
                            value={filters.contractType}
                            onChange={(value) => updateFilters({ contractType: value })}
                            options={['', ...contractTypeOptions]}
                        />
                        <InputFilter
                            label="Curso preferido"
                            placeholder="Ex: Administração, Engenharia..."
                            value={filters.course}
                            onChange={(value) => updateFilters({ course: value })}
                            suggestionList={allCourses}
                        />
                        <SelectFilter
                            label="UF"
                            value={filters.locationState}
                            onChange={(value) => updateFilters({ locationState: value, locationCity: '' })}
                            options={['', ...UF_OPTIONS]}
                        />
                        <InputFilter
                            label="Cidade"
                            placeholder="Cidade"
                            value={filters.locationCity}
                            onChange={(value) => updateFilters({ locationCity: value })}
                            disabled={!filters.locationState}
                        />
                        {initialViewer?.userType === 'recrutador' && (
                            <SelectFilter
                                label="Status da vaga"
                                value={filters.status}
                                onChange={(value) => updateFilters({ status: value })}
                                options={['', 'OPEN', 'CLOSED']}
                            />
                        )}
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-gray-600">
                        <p>
                            {total} {total === 1 ? 'vaga encontrada' : 'vagas encontradas'}
                        </p>
                        <div className="flex items-center gap-3">
                            {(filters.search ||
                                filters.modality ||
                                filters.seniority ||
                                filters.contractType ||
                                filters.course ||
                                filters.locationState ||
                                filters.locationCity ||
                                filters.status) && (
                                    <button
                                        onClick={resetFilters}
                                        className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-200"
                                    >
                                        Limpar filtros
                                    </button>
                                )}
                            {loading && (
                                <div className="flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-600">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Atualizando...
                                </div>
                            )}
                            {applyApi.loading && (
                                <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Enviando candidatura...
                                </div>
                            )}
                            {applyApi.error && (
                                <div className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600">
                                    {applyApi.error}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {items.length === 0 && !loading ? (
                        <div className="col-span-full rounded-2xl border border-dashed border-gray-200 bg-white/70 p-8 text-center text-sm text-gray-600 shadow-inner">
                            Nenhuma vaga encontrada com os filtros atuais. Ajuste sua busca ou explore outras áreas.
                        </div>
                    ) : (
                        items.map((vacancy) => (
                            <VacancyCard
                                key={vacancy.id}
                                vacancy={vacancy}
                                viewer={initialViewer}
                                onApply={() => handleApply(vacancy)}
                                applying={applyingId === vacancy.id}
                                highlight={highlightedVacancyId === vacancy.id}
                            />
                        ))
                    )}
                </section>

                {items.length > 0 && totalPages > 1 && (
                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        onPrevious={() => setPage((prev) => Math.max(1, prev - 1))}
                        onNext={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    />
                )}
            </div>
        </div>
    );
}

interface SelectFilterProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
}

function SelectFilter({ label, value, onChange, options }: SelectFilterProps) {
    return (
        <label className="flex flex-col gap-1 text-sm text-gray-700">
            <span className="font-medium">{label}</span>
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 shadow-sm transition focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
            >
                <option value="">{label === 'Status da vaga' ? 'Todas' : 'Todas'}</option>
                {options
                    .filter((option) => option !== '')
                    .map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
            </select>
        </label>
    );
}

interface InputFilterProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    suggestionList?: string[];
    disabled?: boolean;
}

function InputFilter({ label, value, onChange, placeholder, suggestionList, disabled }: InputFilterProps) {
    const dataListId = suggestionList ? `list-${label.replace(/\s+/g, '-')}` : undefined;
    const uniqueSuggestions = suggestionList ? Array.from(new Set(suggestionList)) : [];

    return (
        <label className="flex flex-col gap-1 text-sm text-gray-700">
            <span className="font-medium">{label}</span>
            <input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                list={dataListId}
                disabled={disabled}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 shadow-sm transition focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 disabled:cursor-not-allowed disabled:bg-gray-100"
            />
            {dataListId && suggestionList && (
                <datalist id={dataListId}>
                    {uniqueSuggestions.slice(0, 50).map((suggestion) => (
                        <option key={suggestion} value={suggestion} />
                    ))}
                </datalist>
            )}
        </label>
    );
}

interface VacancyCardProps {
    vacancy: VacancyListItem;
    viewer: ViewerInfo | null;
    onApply: () => void;
    applying: boolean;
    highlight: boolean;
}

function VacancyCard({ vacancy, viewer, onApply, applying, highlight }: VacancyCardProps) {
    const statusKey = vacancy.isDraft ? 'DRAFT' : vacancy.status;
    const statusInfo = statusLabels[statusKey];
    const viewerState = vacancy.viewerState;
    const applicationState = viewerState?.application;
    const benefits = vacancy.benefits?.slice(0, 6) ?? [];
    const preferredCourses = vacancy.preferredCourses?.slice(0, 4) ?? [];
    const skills = vacancy.skills?.slice(0, 8) ?? [];
    const companyLabel = vacancy.companyName || vacancy.recruiter.nomeEmpresa || vacancy.recruiter.name || 'Empresa confidencial';

    return (
        <article
            className={`group relative flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${highlight ? 'ring-2 ring-purple-300' : ''
                }`}
        >
            <div className="flex flex-col gap-2 border-b border-gray-100 pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                        <span className={`rounded-full px-2.5 py-0.5 ${statusInfo?.className ?? 'bg-gray-100 text-gray-600'}`}>
                            {statusInfo?.label ?? vacancy.status}
                        </span>
                        {vacancy.viewerState?.canEdit && (
                            <span className="rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-purple-600">
                                Minha vaga
                            </span>
                        )}
                        {applicationState && (
                            <span
                                className={`rounded-full px-2.5 py-0.5 ${applicationStatusLabels[applicationState.status]?.className ?? 'bg-blue-50 text-blue-600 border border-blue-200'
                                    }`}
                            >
                                {applicationStatusLabels[applicationState.status]?.label ?? applicationState.status}
                            </span>
                        )}
                    </div>
                    <p className="text-[11px] font-medium text-gray-500">
                        {new Date(vacancy.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">{vacancy.title}</h2>
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                    <InlineBadge icon={Building2} label={companyLabel} />
                    {vacancy.modality && <InlineBadge icon={Briefcase} label={vacancy.modality} />}
                    {vacancy.locationState && (
                        <InlineBadge icon={MapPin} label={[vacancy.locationCity, vacancy.locationState].filter(Boolean).join(' • ')} />
                    )}
                    {vacancy.seniority && <InlineBadge icon={Users} label={vacancy.seniority} />}
                    {vacancy.deadline && (
                        <InlineBadge icon={Calendar} label={`Inscrições até ${formatDate(vacancy.deadline)}`} />
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-3 py-3 text-sm text-gray-700">
                <InfoRow label="Faixa salarial" value={formatSalaryRange(vacancy.salaryMin, vacancy.salaryMax, vacancy.salaryCurrency)} />
                {vacancy.workload && <InfoRow label="Carga horária" value={vacancy.workload} />}
                {preferredCourses.length > 0 && (
                    <InfoRow
                        label="Cursos preferenciais"
                        value={
                            <div className="flex flex-wrap gap-2">
                                {preferredCourses.map((course) => (
                                    <span key={course} className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-600">
                                        {course}
                                    </span>
                                ))}
                                {vacancy.preferredCourses.length > preferredCourses.length && (
                                    <span className="rounded-full bg-purple-100 px-2 py-1 text-[11px] text-purple-700">
                                        +{vacancy.preferredCourses.length - preferredCourses.length}
                                    </span>
                                )}
                            </div>
                        }
                    />
                )}
                {skills.length > 0 && (
                    <InfoRow
                        label="Habilidades"
                        value={
                            <div className="flex flex-wrap gap-2">
                                {skills.map((skill) => (
                                    <span key={skill} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                                        {skill}
                                    </span>
                                ))}
                                {vacancy.skills.length > skills.length && (
                                    <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] text-gray-600">
                                        +{vacancy.skills.length - skills.length}
                                    </span>
                                )}
                            </div>
                        }
                    />
                )}
                {benefits.length > 0 && (
                    <InfoRow
                        label="Benefícios"
                        value={
                            <div className="flex flex-wrap gap-2">
                                {benefits.map((benefit) => (
                                    <span key={benefit} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                                        {benefit}
                                    </span>
                                ))}
                                {vacancy.benefits.length > benefits.length && (
                                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] text-emerald-700">
                                        +{vacancy.benefits.length - benefits.length}
                                    </span>
                                )}
                            </div>
                        }
                    />
                )}
            </div>

            <footer className="mt-auto flex flex-col gap-3 border-t border-gray-100 pt-3">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-gray-500">
                    <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5">
                        <Users className="h-4 w-4 text-gray-400" />
                        {vacancy._count.applications} {vacancy._count.applications === 1 ? 'candidato' : 'candidatos'}
                    </span>
                    {vacancy.contactEmail && (
                        <Link
                            href={`mailto:${vacancy.contactEmail}`}
                            className="flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-purple-600 transition hover:bg-purple-100"
                        >
                            <Mail className="h-4 w-4" />
                            {vacancy.contactEmail}
                        </Link>
                    )}
                    {vacancy.contactUrl && (
                        <a
                            href={vacancy.contactUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-blue-600 transition hover:bg-blue-100"
                        >
                            <ExternalLink className="h-4 w-4" />
                            Link externo
                        </a>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {viewerState?.canApply ? (
                        <Button
                            onClick={onApply}
                            loading={applying}
                            loadingText="Enviando..."
                            size="sm"
                            className="flex-1 justify-center bg-gradient-to-r from-purple-600 to-pink-600 text-xs text-white hover:from-purple-700 hover:to-pink-700"
                        >
                            {applicationState ? 'Atualizar candidatura' : 'Candidatar-se'}
                        </Button>
                    ) : (
                        <Button
                            disabled
                            variant="outline"
                            size="sm"
                            className="flex-1 justify-center border-dashed border-purple-200 text-xs text-purple-500"
                        >
                            {viewer?.userType === 'recrutador' ? 'Candidatar-se' : 'Não é possível candidatar-se'}
                        </Button>
                    )}
                    <Link
                        href={`/vacancies/${vacancy.id}`}
                        className={`${buttonBaseClass} flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50`}
                    >
                        Ver detalhes
                    </Link>
                    {viewerState?.canEdit && (
                        <Link
                            href={`/vacancies/manage?edit=${vacancy.id}`}
                            className={`${buttonBaseClass} flex-1 bg-purple-50 text-purple-600 hover:bg-purple-100`}
                        >
                            Editar vaga
                        </Link>
                    )}
                </div>
            </footer>
        </article>
    );
}

function InlineBadge({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
    return (
        <span className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
            <Icon className="h-4 w-4 text-gray-400" />
            {label}
        </span>
    );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1 text-sm text-gray-700">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</span>
            <span className="text-sm text-gray-700">{value}</span>
        </div>
    );
}

function Pagination({ page, totalPages, onPrevious, onNext }: { page: number; totalPages: number; onPrevious: () => void; onNext: () => void }) {
    return (
        <div className="flex items-center justify-between rounded-3xl border border-gray-100 bg-white p-4 shadow-md">
            <div className="flex items-center gap-2 text-sm text-gray-600">
                Página <strong>{page}</strong> de <strong>{totalPages}</strong>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={onPrevious}
                    disabled={page <= 1}
                    className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                </button>
                <button
                    onClick={onNext}
                    disabled={page >= totalPages}
                    className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Próxima
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

function getParam(params: Record<string, string | string[] | undefined>, key: string): string | undefined {
    const value = params[key];
    if (Array.isArray(value)) {
        return value[0];
    }
    return value;
}

function parsePositiveNumber(value?: string) {
    if (!value) return undefined;
    const number = Number(value);
    if (Number.isNaN(number) || number <= 0) return undefined;
    return number;
}

function formatSalaryRange(min: number | null, max: number | null, currency: string | null) {
    if (min == null && max == null) {
        return 'A combinar';
    }
    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currency || 'BRL',
        minimumFractionDigits: 2,
    });
    if (min != null && max != null) {
        return `${formatter.format(min / 100)} - ${formatter.format(max / 100)}`;
    }
    if (min != null) {
        return `A partir de ${formatter.format(min / 100)}`;
    }
    return `Até ${formatter.format((max ?? 0) / 100)}`;
}

function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
    });
}

