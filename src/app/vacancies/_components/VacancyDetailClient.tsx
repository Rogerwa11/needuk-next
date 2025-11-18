"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useApi } from "@/hooks/custom";
import { Button } from "@/components/ui/Button";
import {
    ArrowLeft,
    Briefcase,
    Building2,
    Calendar,
    CheckCircle2,
    ExternalLink,
    GraduationCap,
    Loader2,
    Mail,
    MapPin,
    ShieldCheck,
    UserCircle2,
    UsersRound,
    XCircle,
} from "lucide-react";

type Viewer = {
    id: string;
    name: string | null;
    email: string;
    userType: string;
    curso: string | null;
};

type Applicant = {
    id: string;
    applicantId: string;
    status: "PENDING" | "ACCEPTED" | "REJECTED";
    coverLetter: string | null;
    resumeUrl: string | null;
    portfolioUrl: string | null;
    additionalInfo: string | null;
    decisionNote: string | null;
    appliedAt: string | null;
    decidedAt: string | null;
    applicant: {
        id: string;
        name: string | null;
        email: string;
        telefone: string | null;
        curso: string | null;
        universidade: string | null;
        image: string | null;
    };
    decidedBy: {
        id: string;
        name: string | null;
        email: string;
    } | null;
};

type VacancyDetail = {
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
    status: "OPEN" | "CLOSED";
    isDraft: boolean;
    closedAt: string | null;
    recruiterId: string;
    recruiter: {
        id: string;
        name: string | null;
        email: string;
        telefone: string | null;
        nomeEmpresa: string | null;
        cargo: string | null;
        image: string | null;
    };
    skills: string[];
    preferredCourses: string[];
    keywords: string[];
    createdAt: string;
    updatedAt: string;
    applications: Applicant[];
    _count: {
        applications: number;
    };
};

type Projection = {
    vacancy: VacancyDetail;
    applications: Applicant[];
    permissions: {
        canEdit: boolean;
        canApply: boolean;
        canManageApplications: boolean;
    };
};

const statusStyles: Record<string, { label: string; className: string }> = {
    OPEN: { label: "Aberta", className: "bg-emerald-100 text-emerald-700 border border-emerald-200" },
    CLOSED: { label: "Fechada", className: "bg-rose-100 text-rose-700 border border-rose-200" },
    DRAFT: { label: "Rascunho", className: "bg-amber-100 text-amber-700 border border-amber-200" },
};

const applicationLabels: Record<string, { label: string; className: string }> = {
    PENDING: { label: "Em análise", className: "bg-blue-100 text-blue-700 border border-blue-200" },
    ACCEPTED: { label: "Aceita", className: "bg-emerald-100 text-emerald-700 border border-emerald-200" },
    REJECTED: { label: "Recusada", className: "bg-rose-100 text-rose-700 border border-rose-200" },
};
const linkButtonClass = "inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition";

interface VacancyDetailClientProps {
    initialData: Projection;
    viewer: Viewer | null;
}

export function VacancyDetailClient({ initialData, viewer }: VacancyDetailClientProps) {
    const [data, setData] = useState<Projection>(initialData);
    const applyApi = useApi();
    const decisionApi = useApi();

    const application = useMemo(() => {
        if (!viewer) return null;
        return data.applications.find((item) => item.applicantId === viewer?.id);
    }, [data.applications, viewer]);

    const handleReload = useCallback(async () => {
        const response = await fetch(`/api/vacancies/${data.vacancy.id}`, {
            cache: "no-store",
        });
        const payload = await response.json();
        if (response.ok) {
            setData(payload.data as Projection);
        }
    }, [data.vacancy.id]);

    const handleApply = async () => {
        if (!data.permissions.canApply) return;
        const result = await applyApi.execute(async () => {
            const response = await fetch(`/api/vacancies/${data.vacancy.id}/apply`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            });
            const payload = await response.json();
            if (!response.ok) {
                throw new Error(payload?.error || "Erro ao enviar candidatura");
            }
            return payload;
        });
        if (result) {
            await handleReload();
        }
    };

    const handleDecision = async (applicationId: string, status: "ACCEPTED" | "REJECTED") => {
        if (!data.permissions.canManageApplications) return;
        const result = await decisionApi.execute(async () => {
            const response = await fetch(`/api/vacancies/${data.vacancy.id}/applications/${applicationId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status }),
            });
            const payload = await response.json();
            if (!response.ok) {
                throw new Error(payload?.error || "Não foi possível atualizar a candidatura");
            }
            return payload;
        });
        if (result) {
            await handleReload();
        }
    };

    const vacancyStatus = data.vacancy.isDraft ? statusStyles.DRAFT : statusStyles[data.vacancy.status];
    const formattedDeadline = data.vacancy.deadline ? formatDate(data.vacancy.deadline) : null;
    const companyLabel = data.vacancy.companyName || data.vacancy.recruiter.nomeEmpresa || data.vacancy.recruiter.name || "Empresa confidencial";

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pb-16">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pt-10">
                <Link href="/vacancies" className={`${linkButtonClass} w-fit border-gray-200 text-gray-600 hover:bg-gray-50`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para vagas
                </Link>

                <header className="flex flex-col gap-6 rounded-3xl bg-white p-8 shadow-xl ring-1 ring-gray-100">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex-1 space-y-3">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${vacancyStatus?.className ?? ""}`}>
                                    {vacancyStatus?.label ?? data.vacancy.status}
                                </span>
                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                                    Publicada em {new Date(data.vacancy.createdAt).toLocaleDateString("pt-BR")}
                                </span>
                                {formattedDeadline && (
                                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                                        Inscrições até {formattedDeadline}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">{data.vacancy.title}</h1>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                <InlineInfo icon={<Building2 className="h-4 w-4 text-purple-500" />} label={companyLabel} />
                                <InlineInfo icon={<Briefcase className="h-4 w-4 text-indigo-500" />} label={`${data.vacancy.contractType} · ${data.vacancy.seniority}`} />
                                <InlineInfo icon={<UsersRound className="h-4 w-4 text-emerald-500" />} label={data.vacancy.modality} />
                                {data.vacancy.locationState && (
                                    <InlineInfo icon={<MapPin className="h-4 w-4 text-rose-500" />} label={[data.vacancy.locationCity, data.vacancy.locationState].filter(Boolean).join(" · ")} />
                                )}
                            </div>
                        </div>
                        <div className="flex w-full flex-col gap-3 lg:w-64">
                            {viewer && (
                                <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                                    <p className="font-semibold text-gray-700">Olá, {viewer.name || viewer.email}</p>
                                    {viewer.curso && (
                                        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                                            <GraduationCap className="h-3.5 w-3.5" />
                                            {viewer.curso}
                                        </p>
                                    )}
                                </div>
                            )}
                            <div className="flex flex-col gap-2">
                                {data.permissions.canApply ? (
                                    <Button
                                        onClick={handleApply}
                                        loading={applyApi.loading}
                                        className="w-full justify-center bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                                    >
                                        {application ? "Atualizar candidatura" : "Candidatar-se a esta vaga"}
                                    </Button>
                                ) : (
                                    <Button disabled variant="outline" className="w-full justify-center border-dashed border-purple-200 text-purple-500">
                                        {viewer ? "Você não tem permissão para se candidatar" : "Entre na plataforma para se candidatar"}
                                    </Button>
                                )}
                                {data.permissions.canEdit && (
                                    <Link
                                        href={`/vacancies/manage?edit=${data.vacancy.id}`}
                                        className={`${linkButtonClass} w-full border border-purple-100 bg-purple-50 text-purple-600 hover:bg-purple-100`}
                                    >
                                        Editar vaga
                                    </Link>
                                )}
                            </div>
                            {applyApi.error && (
                                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-600">
                                    {applyApi.error}
                                </div>
                            )}
                            {decisionApi.error && data.permissions.canManageApplications && (
                                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-600">
                                    {decisionApi.error}
                                </div>
                            )}
                            {application && (
                                <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-700">
                                    <p className="font-semibold">Sua candidatura está {applicationLabels[application.status]?.label.toLowerCase()}.</p>
                                    <p>Enviada em {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString("pt-BR") : "--"}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                    <section className="space-y-8 rounded-3xl bg-white p-8 shadow-xl ring-1 ring-gray-100">
                        <Section title="Descrição da oportunidade">
                            <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">{data.vacancy.description}</p>
                        </Section>

                        <Section title="Habilidades e requisitos">
                            <BadgeGroup items={data.vacancy.skills} accent="bg-gray-100 text-gray-700" />
                        </Section>

                        <Section title="Cursos prioritários">
                            <BadgeGroup items={data.vacancy.preferredCourses} accent="bg-purple-50 text-purple-600" />
                        </Section>

                        {data.vacancy.benefits.length > 0 && (
                            <Section title="Benefícios">
                                <BadgeGroup items={data.vacancy.benefits} accent="bg-emerald-50 text-emerald-700" />
                            </Section>
                        )}

                        <Section title="Detalhes adicionais">
                            <dl className="grid gap-4 text-sm text-gray-600 md:grid-cols-2">
                                <DetailItem label="Carga horária" value={data.vacancy.workload || "Não informado"} />
                                <DetailItem label="Faixa salarial" value={formatSalaryRange(data.vacancy.salaryMin, data.vacancy.salaryMax, data.vacancy.salaryCurrency)} />
                                <DetailItem label="Localização" value={[data.vacancy.locationCity, data.vacancy.locationState, data.vacancy.locationCountry].filter(Boolean).join(" · ") || "Remoto / a combinar"} />
                                <DetailItem label="Palavras-chave" value={data.vacancy.keywords.length > 0 ? data.vacancy.keywords.join(", ") : "Não informado"} />
                            </dl>
                        </Section>
                    </section>

                    <aside className="flex flex-col gap-6">
                        <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">Contato do recrutador</h3>
                            <div className="mt-4 space-y-3 text-sm text-gray-600">
                                <p className="flex items-center gap-2">
                                    <UserCircle2 className="h-5 w-5 text-gray-400" />
                                    {data.vacancy.recruiter.name || data.vacancy.recruiter.email}
                                </p>
                                <Link className="flex items-center gap-2 text-purple-600 hover:text-purple-700" href={`mailto:${data.vacancy.contactEmail}`}>
                                    <Mail className="h-4 w-4" />
                                    {data.vacancy.contactEmail}
                                </Link>
                                {data.vacancy.contactPhone && (
                                    <p className="flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                        {data.vacancy.contactPhone}
                                    </p>
                                )}
                                {data.vacancy.contactUrl && (
                                    <a
                                        href={data.vacancy.contactUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        Link adicional
                                    </a>
                                )}
                                {data.vacancy.contactNotes && (
                                    <p className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">{data.vacancy.contactNotes}</p>
                                )}
                            </div>
                        </div>

                        <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">Resumo da vaga</h3>
                            <ul className="mt-4 space-y-3 text-sm text-gray-600">
                                <li className="flex items-center justify-between gap-2">
                                    <span>Modalidade</span>
                                    <strong className="text-gray-800">{data.vacancy.modality}</strong>
                                </li>
                                <li className="flex items-center justify-between gap-2">
                                    <span>Sênioridade</span>
                                    <strong className="text-gray-800">{data.vacancy.seniority}</strong>
                                </li>
                                <li className="flex items-center justify-between gap-2">
                                    <span>Tipo de contrato</span>
                                    <strong className="text-gray-800">{data.vacancy.contractType}</strong>
                                </li>
                                <li className="flex items-center justify-between gap-2">
                                    <span>Candidatos inscritos</span>
                                    <strong className="text-gray-800">{data.vacancy._count.applications}</strong>
                                </li>
                            </ul>
                        </div>
                    </aside>
                </main>

                {data.permissions.canManageApplications && (
                    <section className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-gray-100">
                        <div className="flex flex-col gap-3 border-b border-gray-100 pb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Candidaturas recebidas</h2>
                            <p className="text-sm text-gray-500">Analise cada candidato e acompanhe o status das decisões.</p>
                        </div>
                        {data.applications.length === 0 ? (
                            <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                                Nenhuma candidatura recebida até o momento. Divulgue esta vaga para atrair os primeiros talentos.
                            </div>
                        ) : (
                            <div className="mt-6 space-y-4">
                                {data.applications.map((application) => (
                                    <div key={application.id} className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {application.applicant.name || application.applicant.email}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                                    <Link href={`mailto:${application.applicant.email}`} className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-700">
                                                        <Mail className="h-3.5 w-3.5" />
                                                        {application.applicant.email}
                                                    </Link>
                                                    {application.applicant.curso && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-1 text-purple-600">
                                                            <GraduationCap className="h-3.5 w-3.5" />
                                                            {application.applicant.curso}
                                                        </span>
                                                    )}
                                                    {application.applicant.universidade && <span>{application.applicant.universidade}</span>}
                                                    <span>Enviou em {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString("pt-BR") : "--"}</span>
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${applicationLabels[application.status]?.className ?? ""}`}>
                                                {applicationLabels[application.status]?.label ?? application.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <Link
                                                href={`/talents/${application.applicant.id}`}
                                                target="_blank"
                                                className={`${linkButtonClass} border-gray-200 text-gray-600 hover:bg-gray-50`}
                                            >
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                Ver perfil completo
                                            </Link>
                                            {application.resumeUrl && (
                                                <a
                                                    href={application.resumeUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`${linkButtonClass} border-gray-200 text-gray-600 hover:bg-gray-50`}
                                                >
                                                    <FileIcon />
                                                    Currículo
                                                </a>
                                            )}
                                            {application.portfolioUrl && (
                                                <a
                                                    href={application.portfolioUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`${linkButtonClass} border-gray-200 text-gray-600 hover:bg-gray-50`}
                                                >
                                                    <ExternalLink className="mr-2 h-4 w-4" />
                                                    Portfólio
                                                </a>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <Button
                                                variant="secondary"
                                                className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                                onClick={() => handleDecision(application.id, "ACCEPTED")}
                                                loading={decisionApi.loading}
                                                disabled={application.status === "ACCEPTED"}
                                            >
                                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                                Aceitar candidatura
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                className="bg-rose-50 text-rose-600 hover:bg-rose-100"
                                                onClick={() => handleDecision(application.id, "REJECTED")}
                                                loading={decisionApi.loading}
                                                disabled={application.status === "REJECTED"}
                                            >
                                                <XCircle className="mr-2 h-4 w-4" />
                                                Recusar
                                            </Button>
                                        </div>
                                        {application.decisionNote && (
                                            <p className="rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-500">
                                                Observação: {application.decisionNote}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </div>
        </div>
    );
}

function InlineInfo({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            {icon}
            {label}
        </span>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {children}
        </div>
    );
}

function BadgeGroup({ items, accent }: { items: string[]; accent: string }) {
    if (items.length === 0) return <p className="text-sm text-gray-500">Não informado</p>;
    return (
        <div className="flex flex-wrap gap-2">
            {items.map((item) => (
                <span key={item} className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${accent}`}>
                    {item}
                </span>
            ))}
        </div>
    );
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</span>
            <span className="text-sm text-gray-700">{value}</span>
        </div>
    );
}

function formatSalaryRange(min: number | null, max: number | null, currency: string | null) {
    if (min == null && max == null) return "A combinar";
    const formatter = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: currency || "BRL",
        minimumFractionDigits: 2,
    });
    if (min != null && max != null) return `${formatter.format(min / 100)} - ${formatter.format(max / 100)}`;
    if (min != null) return `A partir de ${formatter.format(min / 100)}`;
    return `Até ${formatter.format((max ?? 0) / 100)}`;
}

function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
    });
}

function FileIcon() {
    return <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>;
}

