"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useApi } from "@/hooks/custom";
import { Button } from "@/components/ui/Button";
import { showError, showSuccess } from "@/components/ui";
import {
    AlertTriangle,
    ArrowLeftRight,
    ArrowUpRight,
    BadgeCheck,
    Briefcase,
    CalendarRange,
    CheckCircle2,
    ClipboardList,
    FileStack,
    Loader2,
    PenSquare,
    ShieldCheck,
    Users2,
    Wand2,
    XCircle,
} from "lucide-react";

type Viewer = {
    id: string;
    name: string | null;
    email: string;
    nomeEmpresa: string | null;
};

export type ManageVacancy = {
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
    recruiterId: string;
    skills: string[];
    preferredCourses: string[];
    keywords: string[];
    _count: {
        applications: number;
    };
    createdAt: string;
    updatedAt: string;
};

interface ManageVacanciesClientProps {
    initialViewer: Viewer;
    initialVacancies: ManageVacancy[];
    initialEditId?: string;
}

type VacancyFormState = {
    title: string;
    description: string;
    modality: string;
    seniority: string;
    contractType: string;
    workload: string;
    salaryMin: string;
    salaryMax: string;
    salaryCurrency: string;
    benefits: string;
    deadline: string;
    locationCity: string;
    locationState: string;
    locationCountry: string;
    companyName: string;
    contactEmail: string;
    contactPhone: string;
    contactUrl: string;
    contactNotes: string;
    skills: string;
    preferredCourses: string;
    keywords: string;
    status: "OPEN" | "CLOSED";
    isDraft: boolean;
};

const defaultFormState: VacancyFormState = {
    title: "",
    description: "",
    modality: "",
    seniority: "",
    contractType: "",
    workload: "",
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "BRL",
    benefits: "",
    deadline: "",
    locationCity: "",
    locationState: "",
    locationCountry: "",
    companyName: "",
    contactEmail: "",
    contactPhone: "",
    contactUrl: "",
    contactNotes: "",
    skills: "",
    preferredCourses: "",
    keywords: "",
    status: "OPEN",
    isDraft: true,
};

const modalityList = ["Remoto", "Híbrido", "Presencial"];
const seniorityList = ["Estágio", "Júnior", "Pleno", "Sênior", "Especialista", "Trainee"];
const contractTypeList = ["CLT", "PJ", "Bolsa", "Temporário", "Freelancer", "Estágio", "Cooperado"];
const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 shadow-sm transition focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200";
const textareaClass = `${inputClass} min-h-[120px] resize-y`;

export function ManageVacanciesClient({
    initialViewer,
    initialVacancies,
    initialEditId,
}: ManageVacanciesClientProps) {
    const [vacancies, setVacancies] = useState<ManageVacancy[]>(initialVacancies);
    const [formState, setFormState] = useState<VacancyFormState>(() => ({
        ...defaultFormState,
        contactEmail: initialViewer.email,
        companyName: initialViewer.nomeEmpresa ?? "",
    }));
    const [editingId, setEditingId] = useState<string | null>(initialEditId ?? null);
    const [formErrors, setFormErrors] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const manageApi = useApi({
        onError: (message) => {
            showError(message || "Algo deu errado ao salvar a vaga.");
        },
    });

    useEffect(() => {
        if (initialEditId) {
            const vacancy = initialVacancies.find((item) => item.id === initialEditId);
            if (vacancy) {
                populateForm(vacancy);
            }
        }
    }, [initialEditId, initialVacancies]);

    const metrics = useMemo(() => {
        const open = vacancies.filter((vacancy) => vacancy.status === "OPEN" && !vacancy.isDraft).length;
        const closed = vacancies.filter((vacancy) => vacancy.status === "CLOSED").length;
        const drafts = vacancies.filter((vacancy) => vacancy.isDraft).length;
        const totalCandidates = vacancies.reduce((total, vacancy) => total + vacancy._count.applications, 0);
        return { open, closed, drafts, totalCandidates };
    }, [vacancies]);

    const resetForm = () => {
        setFormState({
            ...defaultFormState,
            contactEmail: initialViewer.email,
            companyName: initialViewer.nomeEmpresa ?? "",
        });
        setEditingId(null);
        setFormErrors([]);
        setFeedback(null);
    };

    const populateForm = (vacancy: ManageVacancy) => {
        setFormState({
            title: vacancy.title,
            description: vacancy.description,
            modality: vacancy.modality,
            seniority: vacancy.seniority,
            contractType: vacancy.contractType,
            workload: vacancy.workload ?? "",
            salaryMin: centsToInput(vacancy.salaryMin),
            salaryMax: centsToInput(vacancy.salaryMax),
            salaryCurrency: vacancy.salaryCurrency ?? "BRL",
            benefits: listToText(vacancy.benefits),
            deadline: vacancy.deadline ? vacancy.deadline.slice(0, 10) : "",
            locationCity: vacancy.locationCity ?? "",
            locationState: vacancy.locationState ?? "",
            locationCountry: vacancy.locationCountry ?? "",
            companyName: vacancy.companyName ?? initialViewer.nomeEmpresa ?? "",
            contactEmail: vacancy.contactEmail,
            contactPhone: formatPhoneDisplay(vacancy.contactPhone ?? ""),
            contactUrl: vacancy.contactUrl ?? "",
            contactNotes: vacancy.contactNotes ?? "",
            skills: listToText(vacancy.skills),
            preferredCourses: listToText(vacancy.preferredCourses),
            keywords: listToText(vacancy.keywords),
            status: vacancy.status,
            isDraft: vacancy.isDraft,
        });
        setEditingId(vacancy.id);
        setFormErrors([]);
        setFeedback(null);
    };

    const handleInput = (field: keyof VacancyFormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const value = event.target.type === "checkbox" ? (event.target as HTMLInputElement).checked : event.target.value;
        setFormState((prev) => ({ ...prev, [field]: value }));
    };

    const handleCurrencyChange = (field: "salaryMin" | "salaryMax") => (event: React.ChangeEvent<HTMLInputElement>) => {
        const digits = event.target.value.replace(/\D/g, "");
        if (!digits) {
            setFormState((prev) => ({ ...prev, [field]: "" }));
            return;
        }
        setFormState((prev) => ({ ...prev, [field]: formatCurrencyFromDigits(digits) }));
    };

    const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormState((prev) => ({ ...prev, contactPhone: formatPhoneDisplay(event.target.value) }));
    };

    const refreshVacancies = useCallback(async () => {
        setRefreshing(true);
        try {
            const response = await fetch("/api/vacancies?mine=1&includeDrafts=1&page=1&pageSize=50", {
                cache: "no-store",
            });
            const payload = await response.json();
            if (!response.ok) {
                throw new Error(payload?.error || "Não foi possível atualizar a lista de vagas");
            }
            setVacancies(payload.data.items as ManageVacancy[]);
        } catch (error) {
            console.error(error);
            setFeedback({ type: "error", message: error instanceof Error ? error.message : "Erro ao atualizar a lista" });
        } finally {
            setRefreshing(false);
        }
    }, []);

    const handleSubmit = async (intent: "draft" | "publish") => {
        const payload = buildPayload(formState, intent, editingId);
        const validationErrors = validatePayload(payload);
        if (validationErrors.length > 0) {
            setFormErrors(validationErrors);
            const summary = validationErrors.length === 1 ? validationErrors[0] : validationErrors.map(err => `• ${err}`).join('\n');
            showError(summary, validationErrors.length > 1 ? "Revise os campos destacados" : undefined);
            return;
        }

        setFormErrors([]);
        setFeedback(null);

        const endpoint = editingId ? `/api/vacancies/${editingId}` : "/api/vacancies";
        const method = editingId ? "PATCH" : "POST";

        const result = await manageApi.execute(async () => {
            const response = await fetch(endpoint, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            const body = await response.json();
            if (!response.ok) {
                throw new Error(formatApiError(body, "Erro ao salvar a vaga"));
            }
            return body;
        });

        if (result) {
            await refreshVacancies();
            const successMessage =
                intent === "draft"
                    ? "Rascunho salvo com sucesso!"
                    : editingId
                        ? "Vaga atualizada com sucesso!"
                        : "Vaga publicada com sucesso!";
            showSuccess(successMessage);
            setFeedback({
                type: "success",
                message: successMessage,
            });
            resetForm();
        }
    };

    const handleStatusChange = async (vacancy: ManageVacancy, nextStatus: "OPEN" | "CLOSED") => {
        const result = await manageApi.execute(async () => {
            const response = await fetch(`/api/vacancies/${vacancy.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: nextStatus,
                    isDraft: false,
                }),
            });
            const body = await response.json();
            if (!response.ok) {
                throw new Error(body?.error || "Erro ao atualizar o status da vaga");
            }
            return body;
        });

        if (result) {
            const message = `Vaga ${nextStatus === "OPEN" ? "reaberta" : "fechada"} com sucesso`;
            showSuccess(message);
            setFeedback({
                type: "success",
                message,
            });
            await refreshVacancies();
        }
    };

    const handlePublishDraft = async (vacancy: ManageVacancy) => {
        const result = await manageApi.execute(async () => {
            const response = await fetch(`/api/vacancies/${vacancy.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    isDraft: false,
                    status: "OPEN",
                }),
            });
            const body = await response.json();
            if (!response.ok) {
                throw new Error(body?.error || "Erro ao publicar a vaga");
            }
            return body;
        });

        if (result) {
            showSuccess("Vaga publicada com sucesso!");
            setFeedback({
                type: "success",
                message: "Vaga publicada com sucesso!",
            });
            await refreshVacancies();
        }
    };

    const handleDuplicate = async (vacancy: ManageVacancy) => {
        const clonedState: VacancyFormState = {
            title: `${vacancy.title} (cópia)`,
            description: vacancy.description,
            modality: vacancy.modality,
            seniority: vacancy.seniority,
            contractType: vacancy.contractType,
            workload: vacancy.workload ?? "",
            salaryMin: centsToInput(vacancy.salaryMin),
            salaryMax: centsToInput(vacancy.salaryMax),
            salaryCurrency: vacancy.salaryCurrency ?? "BRL",
            benefits: listToText(vacancy.benefits),
            deadline: vacancy.deadline ? vacancy.deadline.slice(0, 10) : "",
            locationCity: vacancy.locationCity ?? "",
            locationState: vacancy.locationState ?? "",
            locationCountry: vacancy.locationCountry ?? "",
            companyName: vacancy.companyName ?? initialViewer.nomeEmpresa ?? "",
            contactEmail: vacancy.contactEmail,
            contactPhone: formatPhoneDisplay(vacancy.contactPhone ?? ""),
            contactUrl: vacancy.contactUrl ?? "",
            contactNotes: vacancy.contactNotes ?? "",
            skills: listToText(vacancy.skills),
            preferredCourses: listToText(vacancy.preferredCourses),
            keywords: listToText(vacancy.keywords),
            status: "OPEN",
            isDraft: true,
        };
        setFormState(clonedState);
        setEditingId(null);
        setFeedback({ type: "success", message: "Revise os dados e publique a nova vaga duplicada." });
        showSuccess("Vaga duplicada. Revise e publique quando estiver pronto.");
        setFormErrors([]);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pb-12">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pt-10">
                <header className="flex flex-col gap-6 rounded-3xl bg-gray-600 p-8 text-white shadow-2xl">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-white/70">Painel do recrutador</p>
                            <h1 className="text-3xl font-bold lg:text-4xl">Gerencie as vagas da sua organização</h1>
                            <p className="mt-2 max-w-2xl text-sm lg:text-base text-white/80">
                                Centralize criação, publicação e acompanhamento das candidaturas. Aproveite o ecossistema Needuk para se conectar com talentos qualificados.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-white/30 bg-white/10 px-5 py-4 text-sm leading-relaxed text-white/80">
                            <p className="font-medium text-white">Empresa</p>
                            <p>{formState.companyName || initialViewer.nomeEmpresa || "Empresa não informada"}</p>
                            <p className="mt-1 text-xs text-white/70">Responsável: {initialViewer.name || initialViewer.email}</p>
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-4">
                        <MetricCard icon={<Briefcase className="h-5 w-5" />} title="Vagas abertas" value={metrics.open} accent="bg-white/15 text-white" />
                        <MetricCard icon={<ClipboardList className="h-5 w-5" />} title="Rascunhos" value={metrics.drafts} accent="bg-white/10 text-white/90" />
                        <MetricCard icon={<Users2 className="h-5 w-5" />} title="Candidatos recebidos" value={metrics.totalCandidates} accent="bg-white/10 text-white/80" />
                        <MetricCard icon={<ShieldCheck className="h-5 w-5" />} title="Vagas encerradas" value={metrics.closed} accent="bg-white/10 text-white/80" />
                    </div>
                </header>

                <section className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                    <div className="space-y-6 rounded-3xl bg-white p-6 shadow-xl ring-1 ring-gray-100">
                        <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-4">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">{editingId ? "Editar vaga" : "Criar nova vaga"}</h2>
                                <p className="text-sm text-gray-500">
                                    {editingId ? "Atualize as informações da vaga e comunique os candidatos sobre mudanças importantes." : "Publique uma nova oportunidade ou salve como rascunho para finalizar depois."}
                                </p>
                            </div>
                            {editingId && (
                                <Button variant="outline" onClick={resetForm} className="border-gray-200 text-gray-600 hover:bg-gray-50">
                                    Cancelar edição
                                </Button>
                            )}
                        </div>

                        {feedback && (
                            <div
                                className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${feedback.type === "success"
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border-rose-200 bg-rose-50 text-rose-700"
                                    }`}
                            >
                                {feedback.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                                <span>{feedback.message}</span>
                            </div>
                        )}

                        {formErrors.length > 0 && (
                            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                <p className="font-medium">Revise os campos destacados antes de continuar:</p>
                                <ul className="mt-2 list-disc space-y-1 pl-5">
                                    {formErrors.map((error) => (
                                        <li key={error}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="grid gap-6 md:grid-cols-2">
                            <Field label="Título da vaga" required>
                                <input
                                    value={formState.title}
                                    onChange={handleInput("title")}
                                    placeholder="Ex: Analista de Dados Júnior"
                                    className={inputClass}
                                />
                            </Field>
                            <Field label="Empresa / Unidade" helper="Esse campo ajuda os candidatos a reconhecer sua empresa.">
                                <input
                                    value={formState.companyName}
                                    onChange={handleInput("companyName")}
                                    placeholder="Ex: NeedUK Educação, Unidade Campinas"
                                    className={inputClass}
                                />
                            </Field>
                            <Field label="Descrição detalhada" required fullWidth>
                                <textarea
                                    value={formState.description}
                                    onChange={handleInput("description")}
                                    placeholder="Apresente contexto, responsabilidades, desafios e oportunidades de crescimento."
                                    rows={6}
                                    className={`${textareaClass}`}
                                />
                            </Field>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            <Field label="Modalidade" required>
                                <select value={formState.modality} onChange={handleInput("modality")} className={inputClass}>
                                    <option value="">Selecione</option>
                                    {modalityList.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Sênioridade" required>
                                <select value={formState.seniority} onChange={handleInput("seniority")} className={inputClass}>
                                    <option value="">Selecione</option>
                                    {seniorityList.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Tipo de contrato" required>
                                <select value={formState.contractType} onChange={handleInput("contractType")} className={inputClass}>
                                    <option value="">Selecione</option>
                                    {contractTypeList.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Carga horária">
                                <input
                                    value={formState.workload}
                                    onChange={handleInput("workload")}
                                    placeholder="Ex: 40h semanais, segunda a sexta"
                                    className={inputClass}
                                />
                            </Field>
                            <Field label="Salário mínimo (R$)">
                                <input
                                    value={formState.salaryMin}
                                    onChange={handleCurrencyChange("salaryMin")}
                                    placeholder="Ex: R$ 2.500,00"
                                    inputMode="numeric"
                                    className={inputClass}
                                />
                            </Field>
                            <Field label="Salário máximo (R$)">
                                <input
                                    value={formState.salaryMax}
                                    onChange={handleCurrencyChange("salaryMax")}
                                    placeholder="Ex: R$ 4.500,00"
                                    inputMode="numeric"
                                    className={inputClass}
                                />
                            </Field>
                            <Field label="Moeda">
                                <input value={formState.salaryCurrency} onChange={handleInput("salaryCurrency")} maxLength={3} className={`${inputClass} uppercase`} />
                            </Field>
                            <Field label="Prazo das inscrições">
                                <input value={formState.deadline} onChange={handleInput("deadline")} type="date" className={inputClass} />
                            </Field>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <Field label="Habilidades obrigatórias" required helper="Separe as habilidades por vírgula.">
                                <textarea
                                    value={formState.skills}
                                    onChange={handleInput("skills")}
                                    placeholder="Ex: SQL, Power BI, Estatística, Python"
                                    rows={3}
                                    className={textareaClass}
                                />
                            </Field>
                            <Field label="Cursos preferenciais" required helper="Separe os cursos por vírgula.">
                                <textarea
                                    value={formState.preferredCourses}
                                    onChange={handleInput("preferredCourses")}
                                    placeholder="Ex: Administração, Engenharia de Produção, Ciência de Dados"
                                    rows={3}
                                    className={textareaClass}
                                />
                            </Field>
                            <Field label="Benefícios oferecidos" helper="Separe os benefícios por vírgula.">
                                <textarea
                                    value={formState.benefits}
                                    onChange={handleInput("benefits")}
                                    placeholder="Ex: Vale refeição, Plano de saúde, Horário flexível"
                                    rows={3}
                                    className={textareaClass}
                                />
                            </Field>
                            <Field label="Palavras-chave" helper="Melhore a busca adicionando palavras-chave relevantes.">
                                <textarea
                                    value={formState.keywords}
                                    onChange={handleInput("keywords")}
                                    placeholder="Ex: inovação, transformação digital, projetos estratégicos"
                                    rows={3}
                                    className={textareaClass}
                                />
                            </Field>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            <Field label="Cidade">
                                <input value={formState.locationCity} onChange={handleInput("locationCity")} placeholder="Ex: São Paulo" className={inputClass} />
                            </Field>
                            <Field label="Estado">
                                <input value={formState.locationState} onChange={handleInput("locationState")} placeholder="Ex: SP" maxLength={2} className={`${inputClass} uppercase`} />
                            </Field>
                            <Field label="País">
                                <input value={formState.locationCountry} onChange={handleInput("locationCountry")} placeholder="Ex: Brasil" className={inputClass} />
                            </Field>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <Field label="E-mail de contato" required>
                                <input value={formState.contactEmail} onChange={handleInput("contactEmail")} placeholder="Ex: talentos@empresa.com" type="email" className={inputClass} />
                            </Field>
                            <Field label="Telefone / WhatsApp">
                                <input value={formState.contactPhone} onChange={handlePhoneChange} placeholder="Ex: (11) 99999-9999" inputMode="numeric" className={inputClass} />
                            </Field>
                            <Field label="Link adicional (formulário, site, etc.)">
                                <input value={formState.contactUrl} onChange={handleInput("contactUrl")} placeholder="https://" className={inputClass} />
                            </Field>
                            <Field label="Observações para o candidato">
                                <textarea value={formState.contactNotes} onChange={handleInput("contactNotes")} placeholder="Ex: Informe disponibilidade para início imediato" rows={3} className={textareaClass} />
                            </Field>
                        </div>

                        {editingId && (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                                <p className="font-medium">Esta vaga está {formState.isDraft ? "em rascunho" : formState.status === "OPEN" ? "ativa" : "encerrada"}.</p>
                                <div className="mt-3 flex flex-wrap gap-3">
                                    <label className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" checked={formState.isDraft} onChange={(event) => setFormState((prev) => ({ ...prev, isDraft: event.target.checked }))} />
                                        Salvar como rascunho
                                    </label>
                                    {!formState.isDraft && (
                                        <select value={formState.status} onChange={(event) => setFormState((prev) => ({ ...prev, status: event.target.value as "OPEN" | "CLOSED" }))} className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm">
                                            <option value="OPEN">Aberta</option>
                                            <option value="CLOSED">Fechada</option>
                                        </select>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1">
                                    <Wand2 className="h-3.5 w-3.5" />
                                    Campos obrigatórios marcados com *
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <CalendarRange className="h-3.5 w-3.5" />
                                    Defina um prazo para priorizar candidatos
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="secondary"
                                    loading={manageApi.loading}
                                    onClick={() => handleSubmit("draft")}
                                    className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                                >
                                    <SaveIcon />
                                    Salvar rascunho
                                </Button>
                                <Button
                                    loading={manageApi.loading}
                                    onClick={() => handleSubmit("publish")}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                                >
                                    <RocketIcon />
                                    {editingId ? "Atualizar vaga" : "Publicar vaga"}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <aside className="flex flex-col gap-6 rounded-3xl bg-white p-6 shadow-xl ring-1 ring-gray-100">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Minhas vagas</h3>
                            <Button onClick={refreshVacancies} variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-50" disabled={refreshing}>
                                {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowLeftRight className="h-4 w-4" />}
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {vacancies.length === 0 && (
                                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
                                    Você ainda não publicou vagas. Crie a primeira oportunidade para alcançar alunos e gestores.
                                </div>
                            )}
                            {vacancies.map((vacancy) => (
                                <div key={vacancy.id} className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{vacancy.title}</p>
                                            <p className="text-xs text-gray-500">
                                                Publicada em {new Date(vacancy.createdAt).toLocaleDateString("pt-BR")}
                                            </p>
                                        </div>
                                        <StatusBadge vacancy={vacancy} />
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-1 text-purple-600">
                                            <Users2 className="h-3.5 w-3.5" />
                                            {vacancy._count.applications} candidatos
                                        </span>
                                        {vacancy.deadline && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-blue-600">
                                                <CalendarRange className="h-3.5 w-3.5" />
                                                Até {new Date(vacancy.deadline).toLocaleDateString("pt-BR")}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Link
                                            href={`/vacancies/${vacancy.id}`}
                                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                                        >
                                            <ArrowUpRight className="h-4 w-4" />
                                            Ver vaga
                                        </Link>
                                        <Button
                                            variant="secondary"
                                            className="flex-1 bg-purple-50 text-purple-600 hover:bg-purple-100"
                                            onClick={() => populateForm(vacancy)}
                                        >
                                            <PenSquare className="mr-2 h-4 w-4" />
                                            Editar
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                        <button
                                            onClick={() => handleDuplicate(vacancy)}
                                            className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 transition hover:bg-gray-200"
                                        >
                                            <FileStack className="h-3.5 w-3.5" />
                                            Duplicar
                                        </button>
                                        {vacancy.isDraft ? (
                                            <button
                                                onClick={() => handlePublishDraft(vacancy)}
                                                className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 transition hover:bg-emerald-200"
                                            >
                                                <BadgeCheck className="h-3.5 w-3.5" />
                                                Publicar rascunho
                                            </button>
                                        ) : vacancy.status === "OPEN" ? (
                                            <button
                                                onClick={() => handleStatusChange(vacancy, "CLOSED")}
                                                className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-rose-700 transition hover:bg-rose-200"
                                            >
                                                <XCircle className="h-3.5 w-3.5" />
                                                Fechar vaga
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleStatusChange(vacancy, "OPEN")}
                                                className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 transition hover:bg-emerald-200"
                                            >
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                Reabrir vaga
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-500">
                            <p className="font-semibold text-gray-600">Boas práticas</p>
                            <ul className="mt-2 space-y-2 leading-relaxed">
                                <li>
                                    <strong>Atualize</strong> a vaga ao receber candidaturas para manter os talentos engajados.
                                </li>
                                <li>
                                    <strong>Converta rascunhos</strong> em vagas publicadas quando estiver seguro das informações.
                                </li>
                                <li>
                                    <strong>Feche a vaga</strong> assim que encontrar o candidato ideal para evitar novas candidaturas.
                                </li>
                            </ul>
                        </div>
                    </aside>
                </section>
            </div>
        </div>
    );
}

function listToText(values: string[]) {
    return values.join(", ");
}

function textToList(value: string): string[] {
    return value
        .split(/[,;|\n]/)
        .map((item) => item.trim())
        .filter(Boolean);
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function inputToCents(value: string): number | null {
    if (!value) return null;
    const digits = value.replace(/\D/g, "");
    if (!digits) return null;
    const cents = Number(digits);
    return Number.isNaN(cents) ? null : cents;
}

function centsToInput(value: number | null): string {
    if (value == null) return "";
    return formatCurrencyFromDigits(value.toString());
}

function buildPayload(form: VacancyFormState, intent: "draft" | "publish", editingId: string | null) {
    const phoneDigits = sanitizePhoneNumber(form.contactPhone);

    return {
        title: form.title.trim(),
        description: form.description.trim(),
        modality: form.modality.trim(),
        seniority: form.seniority.trim(),
        contractType: form.contractType.trim(),
        workload: form.workload.trim() || undefined,
        salaryMin: inputToCents(form.salaryMin),
        salaryMax: inputToCents(form.salaryMax),
        salaryCurrency: form.salaryCurrency ? form.salaryCurrency.trim().toUpperCase() : null,
        benefits: textToList(form.benefits),
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
        locationCity: form.locationCity.trim() || undefined,
        locationState: form.locationState.trim() ? form.locationState.trim().toUpperCase() : undefined,
        locationCountry: form.locationCountry.trim() || undefined,
        companyName: form.companyName.trim() || undefined,
        contactEmail: form.contactEmail.trim(),
        contactPhone: phoneDigits || undefined,
        contactUrl: form.contactUrl.trim() || undefined,
        contactNotes: form.contactNotes.trim() || undefined,
        skills: textToList(form.skills),
        preferredCourses: textToList(form.preferredCourses),
        keywords: textToList(form.keywords),
        status: editingId ? form.status : "OPEN",
        isDraft: intent === "draft" ? true : form.isDraft && editingId != null ? false : false,
    };
}

function validatePayload(payload: ReturnType<typeof buildPayload>) {
    const errors: string[] = [];
    if (!payload.title) errors.push("Informe o título da vaga.");
    if (!payload.description) errors.push("Descreva a vaga com detalhes.");
    if (!payload.modality) errors.push("Selecione a modalidade de trabalho.");
    if (!payload.seniority) errors.push("Selecione a senioridade.");
    if (!payload.contractType) errors.push("Informe o tipo de contrato.");
    if (!payload.contactEmail) errors.push("Defina um e-mail de contato.");
    if (!payload.skills || payload.skills.length === 0) errors.push("Adicione pelo menos uma habilidade obrigatória.");
    if (!payload.preferredCourses || payload.preferredCourses.length === 0) errors.push("Informe pelo menos um curso preferencial.");
    if (payload.salaryMin != null && payload.salaryMin <= 0) errors.push("Salário mínimo deve ser maior que zero.");
    if (payload.salaryMax != null && payload.salaryMax <= 0) errors.push("Salário máximo deve ser maior que zero.");
    if (payload.salaryMin != null && payload.salaryMax != null && payload.salaryMax < payload.salaryMin) {
        errors.push("Salário máximo não pode ser menor que o mínimo.");
    }
    return errors;
}

function formatApiError(body: any, fallback: string) {
    const baseMessage = typeof body?.error === "string" && body.error.trim().length > 0 ? body.error : fallback;
    const details = Array.isArray(body?.details)
        ? body.details
            .map((detail: any) => {
                if (typeof detail === "string") return detail;
                if (detail && typeof detail === "object") {
                    const messagePart = typeof detail.message === "string" ? detail.message : null;
                    const fieldPart = typeof detail.field === "string" ? detail.field : null;
                    if (messagePart && fieldPart) return `${fieldPart}: ${messagePart}`;
                    return messagePart || fieldPart || null;
                }
                return null;
            })
            .filter(Boolean)
        : [];

    if (details.length === 0) {
        return baseMessage;
    }

    if (details.length === 1) {
        return `${baseMessage}\n${details[0]}`;
    }

    return `${baseMessage}\n${details.map((detail: string) => `• ${detail}`).join("\n")}`;
}

function formatCurrencyFromDigits(digits: string) {
    const number = Number(digits) / 100;
    return currencyFormatter.format(number);
}

function formatPhoneDisplay(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length === 0) return "";
    if (digits.length < 3) return `(${digits}`;
    if (digits.length < 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length < 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

function sanitizePhoneNumber(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    return digits.length > 0 ? digits : "";
}

function StatusBadge({ vacancy }: { vacancy: ManageVacancy }) {
    if (vacancy.isDraft) {
        return <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Rascunho</span>;
    }
    if (vacancy.status === "OPEN") {
        return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Aberta</span>;
    }
    return <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">Fechada</span>;
}

function MetricCard({ icon, title, value, accent }: { icon: React.ReactNode; title: string; value: number; accent: string }) {
    return (
        <div className={`flex flex-col gap-2 rounded-2xl px-5 py-4 shadow-sm ${accent}`}>
            <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">{title}</span>
                {icon}
            </div>
            <p className="text-3xl font-bold">{value}</p>
        </div>
    );
}

function Field({ label, children, helper, required, fullWidth }: { label: string; children: React.ReactNode; helper?: string; required?: boolean; fullWidth?: boolean }) {
    return (
        <label className={`flex flex-col gap-1 text-sm text-gray-600 ${fullWidth ? "md:col-span-2" : ""}`}>
            <span className="font-medium text-gray-800">
                {label}
                {required && <span className="text-rose-500"> *</span>}
            </span>
            {children}
            {helper && <span className="text-xs text-gray-400">{helper}</span>}
        </label>
    );
}

function SaveIcon() {
    return <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>;
}

function RocketIcon() {
    return <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 15c-2-2-2-5-1-7a4 4 0 0 1 3-2c2-1 5-1 7 1 2 2 2 5 1 7a4 4 0 0 1-2 3c-2 1-5 1-7-1z" /><path d="M9 9c-2-2-5-2-7-1a4 4 0 0 0-2 3c-1 2-1 5 1 7 2 2 5 2 7 1a4 4 0 0 0 3-2c1-2 1-5-1-7z" /><line x1="12" x2="12" y1="6" y2="18" /></svg>;
}

