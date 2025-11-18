import { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const VACANCY_STATUS = ['OPEN', 'CLOSED'] as const;
const BOOLEAN_TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);

const baseStringArray = z
    .array(z.string().trim().min(1))
    .min(1)
    .transform((items) => normalizeStringList(items));

const optionalStringArray = z
    .array(z.string().trim().min(1))
    .optional()
    .transform((items) => (items ? normalizeStringList(items) : undefined));

export const vacancyWriteSchema = z
    .object({
        title: z.string().trim().min(3, 'Título deve ter pelo menos 3 caracteres'),
        description: z.string().trim().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
        skills: baseStringArray,
        preferredCourses: baseStringArray,
        modality: z.string().trim().min(3),
        seniority: z.string().trim().min(3),
        contractType: z.string().trim().min(2),
        workload: z.string().trim().optional(),
        salaryMin: z.number().int().nonnegative().nullable().optional(),
        salaryMax: z.number().int().nonnegative().nullable().optional(),
        salaryCurrency: z.string().trim().length(3).optional(),
        benefits: optionalStringArray,
        deadline: z.coerce.date().nullable().optional(),
        locationCity: z.string().trim().optional(),
        locationState: z.string().trim().optional(),
        locationCountry: z.string().trim().optional(),
        companyName: z.string().trim().max(120).optional(),
        contactEmail: z.string().trim().email('Contato deve ser um e-mail válido'),
        contactPhone: z.string().trim().optional(),
        contactUrl: z.string().trim().url().optional(),
        contactNotes: z.string().trim().optional(),
        keywords: optionalStringArray,
        status: z.enum(VACANCY_STATUS).optional(),
        isDraft: z.boolean().optional(),
    })
    .superRefine((data, ctx) => {
        if (typeof data.salaryMin === 'number' && typeof data.salaryMax === 'number' && data.salaryMax < data.salaryMin) {
            ctx.addIssue({
                path: ['salaryMax'],
                code: z.ZodIssueCode.custom,
                message: 'Salário máximo não pode ser menor que o mínimo',
            });
        }
    });

export const vacancyUpdateSchema = vacancyWriteSchema.partial();

export const vacancyFilterSchema = z.object({
    status: z.enum(VACANCY_STATUS).optional(),
    modality: z.string().trim().optional(),
    seniority: z.string().trim().optional(),
    contractType: z.string().trim().optional(),
    locationState: z.string().trim().optional(),
    locationCity: z.string().trim().optional(),
    course: z.string().trim().optional(),
    search: z.string().trim().optional(),
    recruiterId: z.string().trim().optional(),
    minSalary: z.coerce.number().int().nonnegative().optional(),
    maxSalary: z.coerce.number().int().nonnegative().optional(),
    mine: z.boolean().optional(),
    includeDrafts: z.boolean().optional(),
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().max(50).optional(),
});

export type VacancyWriteInput = z.infer<typeof vacancyWriteSchema>;
export type VacancyUpdateInput = z.infer<typeof vacancyUpdateSchema>;
export type VacancyFilterInput = z.infer<typeof vacancyFilterSchema>;

export interface VacancyViewer {
    id: string;
    userType: string;
    curso?: string | null;
}

export const vacancyListInclude = {
    recruiter: {
        select: {
            id: true,
            name: true,
            email: true,
            nomeEmpresa: true,
            cargo: true,
            image: true,
        },
    },
    _count: {
        select: {
            applications: true,
        },
    },
} satisfies Prisma.VacancyInclude;

export const vacancyDetailInclude = {
    recruiter: {
        select: {
            id: true,
            name: true,
            email: true,
            nomeEmpresa: true,
            cargo: true,
            telefone: true,
            image: true,
        },
    },
    applications: {
        include: {
            applicant: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    telefone: true,
                    curso: true,
                    universidade: true,
                    image: true,
                },
            },
            decidedBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: {
            appliedAt: 'desc',
        },
    },
    _count: {
        select: {
            applications: true,
        },
    },
} satisfies Prisma.VacancyInclude;

export type VacancyListItem = Prisma.VacancyGetPayload<{ include: typeof vacancyListInclude }> & {
    companyName: string | null;
};
export type VacancyWithRelations = Prisma.VacancyGetPayload<{ include: typeof vacancyDetailInclude }> & {
    companyName: string | null;
};
export type VacancyForUpdate = Prisma.VacancyGetPayload<{
    select: {
        title: true;
        description: true;
        modality: true;
        seniority: true;
        contractType: true;
        locationCity: true;
        locationState: true;
        locationCountry: true;
        companyName: true;
        skills: true;
        preferredCourses: true;
        benefits: true;
    };
}>;

export interface NormalizedVacancyFilters {
    status?: (typeof VACANCY_STATUS)[number];
    modality?: string;
    seniority?: string;
    contractType?: string;
    locationState?: string;
    locationCity?: string;
    course?: string;
    search?: string;
    recruiterId?: string;
    minSalary?: number;
    maxSalary?: number;
    mine: boolean;
    includeDrafts: boolean;
    page: number;
    pageSize: number;
}

export function normalizeVacancyFilters(params: URLSearchParams): NormalizedVacancyFilters {
    const raw: VacancyFilterInput = vacancyFilterSchema.parse({
        status: params.get('status') || undefined,
        modality: params.get('modality') || undefined,
        seniority: params.get('seniority') || undefined,
        contractType: params.get('contractType') || undefined,
        locationState: params.get('locationState') || undefined,
        locationCity: params.get('locationCity') || undefined,
        course: params.get('course') || undefined,
        search: params.get('search') || params.get('q') || undefined,
        recruiterId: params.get('recruiterId') || undefined,
        minSalary: params.get('minSalary') || undefined,
        maxSalary: params.get('maxSalary') || undefined,
        mine: parseBooleanParam(params.get('mine')),
        includeDrafts: parseBooleanParam(params.get('includeDrafts')),
        page: params.get('page') || undefined,
        pageSize: params.get('pageSize') || undefined,
    });

    return {
        ...raw,
        mine: raw.mine ?? false,
        includeDrafts: raw.includeDrafts ?? false,
        page: raw.page ?? 1,
        pageSize: raw.pageSize ?? 12,
    };
}

export type BuildVacancyWhereOptions = {
    acceptedVacancyIds?: string[];
    acceptedMode?: 'default' | 'only' | 'exclude';
};

export function buildVacancyWhere(
    filters: NormalizedVacancyFilters,
    viewer?: VacancyViewer | null,
    options: BuildVacancyWhereOptions = {}
): Prisma.VacancyWhereInput {
    const acceptedIds = options.acceptedVacancyIds ?? [];
    const acceptedMode = options.acceptedMode ?? 'default';

    const conditions: Prisma.VacancyWhereInput[] = [];
    const orConditions: Prisma.VacancyWhereInput[] = [];
    const viewerId = viewer?.id;

    if (filters.mine && viewerId) {
        conditions.push({ recruiterId: viewerId });
    } else if (filters.recruiterId) {
        conditions.push({ recruiterId: filters.recruiterId });
    }

    const includeDrafts = filters.includeDrafts && filters.mine && viewerId;
    if (!includeDrafts) {
        conditions.push({ isDraft: false });
    }

    if (filters.status) {
        conditions.push({ status: filters.status });
    } else if (!filters.mine) {
        if (acceptedMode === 'only') {
            // Não adiciona restrição de status para o modo "only"
        } else if (acceptedMode === 'default' && acceptedIds.length > 0) {
            conditions.push({
                OR: [{ status: 'OPEN' }, { id: { in: acceptedIds } }],
            });
        } else {
            conditions.push({ status: 'OPEN' });
        }
    }

    if (filters.modality) {
        conditions.push({
            modality: {
                equals: filters.modality,
                mode: 'insensitive',
            },
        });
    }

    if (filters.seniority) {
        conditions.push({
            seniority: {
                equals: filters.seniority,
                mode: 'insensitive',
            },
        });
    }

    if (filters.contractType) {
        conditions.push({
            contractType: {
                equals: filters.contractType,
                mode: 'insensitive',
            },
        });
    }

    if (filters.locationState) {
        conditions.push({
            locationState: {
                equals: filters.locationState,
                mode: 'insensitive',
            },
        });
    }

    if (filters.locationCity) {
        conditions.push({
            locationCity: {
                equals: filters.locationCity,
                mode: 'insensitive',
            },
        });
    }

    if (filters.course) {
        const normalizedCourse = filters.course.trim().toLowerCase();
        orConditions.push(
            {
                preferredCourses: {
                    has: normalizedCourse,
                },
            },
            {
                keywords: {
                    has: normalizedCourse,
                },
            }
        );
    }

    if (typeof filters.minSalary === 'number' || typeof filters.maxSalary === 'number') {
        if (typeof filters.minSalary === 'number') {
            orConditions.push({
                salaryMin: {
                    gte: filters.minSalary,
                },
            });
        }
        if (typeof filters.maxSalary === 'number') {
            orConditions.push({
                salaryMax: {
                    lte: filters.maxSalary,
                },
            });
        }
    }

    if (filters.search) {
        const searchTerm = filters.search.trim();
        orConditions.push(
            {
                title: {
                    contains: searchTerm,
                    mode: 'insensitive',
                },
            },
            {
                description: {
                    contains: searchTerm,
                    mode: 'insensitive',
                },
            },
            {
                skills: {
                    has: searchTerm,
                },
            },
            {
                keywords: {
                    has: searchTerm,
                },
            }
        );
    }

    if (acceptedMode === 'only') {
        conditions.push({ id: { in: acceptedIds } });
    } else if (acceptedMode === 'exclude' && acceptedIds.length > 0) {
        conditions.push({ id: { notIn: acceptedIds } });
    }

    const andConditions = [...conditions];
    if (orConditions.length > 0) {
        andConditions.push({ OR: orConditions });
    }

    if (andConditions.length === 0) {
        return {};
    }

    if (andConditions.length === 1) {
        return andConditions[0];
    }

    return {
        AND: andConditions,
    };
}

export function mapVacancyCreateData(input: VacancyWriteInput, recruiterId: string): Prisma.VacancyCreateInput {
    const normalizedSkills = normalizeStringList(input.skills);
    const normalizedCourses = normalizeStringList(input.preferredCourses);
    const normalizedBenefits = input.benefits ? input.benefits : [];
    const normalizedKeywords =
        input.keywords && input.keywords.length > 0 ? normalizeStringList(input.keywords).map((keyword) => keyword.toLowerCase()) : [];

    return {
        title: input.title.trim(),
        description: input.description.trim(),
        skills: normalizedSkills,
        preferredCourses: normalizedCourses,
        keywords: normalizedKeywords.length > 0 ? normalizedKeywords : computeVacancyKeywords({
            title: input.title,
            description: input.description,
            modality: input.modality,
            seniority: input.seniority,
            contractType: input.contractType,
            locationCity: input.locationCity,
            locationState: input.locationState,
            locationCountry: input.locationCountry,
            companyName: input.companyName,
            skills: normalizedSkills,
            preferredCourses: normalizedCourses,
            benefits: normalizedBenefits,
        }),
        modality: input.modality.trim(),
        seniority: input.seniority.trim(),
        contractType: input.contractType.trim(),
        workload: input.workload?.trim() ?? null,
        salaryMin: typeof input.salaryMin === 'number' ? input.salaryMin : null,
        salaryMax: typeof input.salaryMax === 'number' ? input.salaryMax : null,
        salaryCurrency: input.salaryCurrency?.toUpperCase() ?? null,
        benefits: normalizedBenefits,
        deadline: input.deadline ?? null,
        locationCity: input.locationCity?.trim() ?? null,
        locationState: input.locationState?.trim() ?? null,
        locationCountry: input.locationCountry?.trim() ?? null,
        companyName: input.companyName?.trim() ?? null,
        contactEmail: input.contactEmail.trim().toLowerCase(),
        contactPhone: input.contactPhone?.trim() ?? null,
        contactUrl: input.contactUrl?.trim() ?? null,
        contactNotes: input.contactNotes?.trim() ?? null,
        status: input.status ?? 'OPEN',
        isDraft: input.isDraft ?? false,
        recruiter: {
            connect: { id: recruiterId },
        },
    };
}

export function mapVacancyUpdateData(input: VacancyUpdateInput, current: VacancyForUpdate): Prisma.VacancyUpdateInput {
    const data: Prisma.VacancyUpdateInput = {};

    if (input.title !== undefined) data.title = input.title.trim();
    if (input.description !== undefined) data.description = input.description.trim();
    if (input.modality !== undefined) data.modality = input.modality.trim();
    if (input.seniority !== undefined) data.seniority = input.seniority.trim();
    if (input.contractType !== undefined) data.contractType = input.contractType.trim();
    if (input.workload !== undefined) data.workload = input.workload?.trim() ?? null;
    if (input.salaryMin !== undefined) data.salaryMin = typeof input.salaryMin === 'number' ? input.salaryMin : null;
    if (input.salaryMax !== undefined) data.salaryMax = typeof input.salaryMax === 'number' ? input.salaryMax : null;
    if (input.salaryCurrency !== undefined) data.salaryCurrency = input.salaryCurrency?.toUpperCase() ?? null;
    if (input.benefits !== undefined) data.benefits = { set: input.benefits ?? [] };
    if (input.deadline !== undefined) data.deadline = input.deadline ?? null;
    if (input.locationCity !== undefined) data.locationCity = input.locationCity?.trim() ?? null;
    if (input.locationState !== undefined) data.locationState = input.locationState?.trim() ?? null;
    if (input.locationCountry !== undefined) data.locationCountry = input.locationCountry?.trim() ?? null;
    if (input.companyName !== undefined) data.companyName = input.companyName?.trim() ?? null;
    if (input.contactEmail !== undefined) data.contactEmail = input.contactEmail.trim().toLowerCase();
    if (input.contactPhone !== undefined) data.contactPhone = input.contactPhone?.trim() ?? null;
    if (input.contactUrl !== undefined) data.contactUrl = input.contactUrl?.trim() ?? null;
    if (input.contactNotes !== undefined) data.contactNotes = input.contactNotes?.trim() ?? null;
    if (input.status !== undefined) data.status = input.status;
    if (input.isDraft !== undefined) data.isDraft = input.isDraft;

    const nextSkills = input.skills !== undefined ? normalizeStringList(input.skills) : current.skills;
    const nextCourses = input.preferredCourses !== undefined ? normalizeStringList(input.preferredCourses) : current.preferredCourses;
    const nextBenefits = input.benefits !== undefined ? input.benefits ?? [] : current.benefits ?? [];
    const nextKeywords =
        input.keywords !== undefined && input.keywords.length > 0
            ? normalizeStringList(input.keywords).map((keyword) => keyword.toLowerCase())
            : computeVacancyKeywords({
                title: input.title ?? current.title,
                description: input.description ?? current.description,
                modality: input.modality ?? current.modality,
                seniority: input.seniority ?? current.seniority,
                contractType: input.contractType ?? current.contractType,
                locationCity: input.locationCity ?? current.locationCity ?? undefined,
                locationState: input.locationState ?? current.locationState ?? undefined,
                locationCountry: input.locationCountry ?? current.locationCountry ?? undefined,
                companyName: input.companyName ?? current.companyName ?? undefined,
                skills: nextSkills,
                preferredCourses: nextCourses,
                benefits: nextBenefits,
            });

    if (input.skills !== undefined) {
        data.skills = { set: nextSkills };
    }

    if (input.preferredCourses !== undefined) {
        data.preferredCourses = { set: nextCourses };
    }

    if (input.keywords !== undefined || input.skills !== undefined || input.preferredCourses !== undefined || input.title !== undefined || input.description !== undefined) {
        data.keywords = { set: nextKeywords };
    }

    return data;
}

export function sortVacanciesByPreference<T extends Pick<Prisma.VacancyGetPayload<any>, 'id' | 'preferredCourses'>>(
    vacancies: T[],
    course?: string | null,
    priorityIds: string[] = []
): T[] {
    const normalizedCourse = course ? normalizeCourse(course) : null;
    const prioritySet = new Set(priorityIds);

    return [...vacancies].sort((a, b) => {
        const aPriority = prioritySet.has(a.id) ? 1 : 0;
        const bPriority = prioritySet.has(b.id) ? 1 : 0;
        if (aPriority !== bPriority) {
            return bPriority - aPriority;
        }

        if (!normalizedCourse) return 0;

        const scoreA = scoreVacancyForCourse(a.preferredCourses, normalizedCourse);
        const scoreB = scoreVacancyForCourse(b.preferredCourses, normalizedCourse);
        if (scoreA !== scoreB) {
            return scoreB - scoreA;
        }
        return 0;
    });
}

export function canUserApply(user?: VacancyViewer | null): boolean {
    if (!user) return false;
    return user.userType === 'aluno' || user.userType === 'gestor';
}

export function projectsVacancyForViewer(vacancy: VacancyWithRelations, viewer?: VacancyViewer | null) {
    const isOwner = !!viewer && viewer.id === vacancy.recruiterId;

    const applications = isOwner
        ? vacancy.applications
        : viewer
            ? vacancy.applications.filter((application) => application.applicantId === viewer.id)
            : [];

    const sanitizedVacancy: VacancyWithRelations = {
        ...vacancy,
        applications,
    };

    return {
        vacancy: sanitizedVacancy,
        applications,
        permissions: {
            canEdit: isOwner,
            canApply: !vacancy.isDraft && vacancy.status === 'OPEN' && canUserApply(viewer),
            canManageApplications: isOwner,
        },
    };
}

export async function ensureRecruiterUser(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            userType: true,
            curso: true,
            nomeEmpresa: true,
            name: true,
        },
    });

    if (!user) {
        throw new Error('USER_NOT_FOUND');
    }

    if (user.userType !== 'recrutador') {
        throw new Error('USER_NOT_RECRUITER');
    }

    return user;
}

export function parseBooleanParam(value: string | null): boolean | undefined {
    if (value === null) return undefined;
    const normalized = value.trim().toLowerCase();
    if (BOOLEAN_TRUE_VALUES.has(normalized)) return true;
    if (normalized === '0' || normalized === 'false' || normalized === 'no' || normalized === 'off') return false;
    return undefined;
}

function computeVacancyKeywords(source: {
    title: string;
    description: string;
    modality?: string;
    seniority?: string;
    contractType?: string;
    locationCity?: string;
    locationState?: string;
    locationCountry?: string;
    companyName?: string;
    skills: string[];
    preferredCourses: string[];
    benefits?: string[];
}): string[] {
    const tokens = new Set<string>();

    const pushTokens = (value?: string | null, split = true) => {
        if (!value) return;
        const normalized = value.trim();
        if (!normalized) return;
        if (!split) {
            tokens.add(normalized.toLowerCase());
            return;
        }
        normalized
            .split(/[\s,;|/\\-]+/)
            .map((token) => token.trim())
            .filter((token) => token.length > 2)
            .forEach((token) => tokens.add(token.toLowerCase()));
    };

    pushTokens(source.title, false);
    pushTokens(source.description);
    pushTokens(source.modality);
    pushTokens(source.seniority);
    pushTokens(source.contractType);
    pushTokens(source.locationCity);
    pushTokens(source.locationState);
    pushTokens(source.locationCountry);
    pushTokens(source.companyName, false);

    source.skills.forEach((skill) => pushTokens(skill, false));
    source.preferredCourses.forEach((course) => pushTokens(course, false));
    source.benefits?.forEach((benefit) => pushTokens(benefit, false));

    return Array.from(tokens);
}

function normalizeCourse(course: string): string {
    return course.trim().toLowerCase();
}

function scoreVacancyForCourse(preferredCourses: string[], normalizedCourse: string): number {
    if (!preferredCourses || preferredCourses.length === 0) return 0;
    const normalizedPreferred = preferredCourses.map((course) => normalizeCourse(course));
    if (normalizedPreferred.includes(normalizedCourse)) return 3;
    if (normalizedPreferred.some((course) => normalizedCourse.includes(course) || course.includes(normalizedCourse))) return 2;
    const mainCourseRoot = normalizedCourse.split(' ')[0];
    if (normalizedPreferred.some((course) => course.startsWith(mainCourseRoot))) return 1;
    return 0;
}

function normalizeStringList(values: string[]): string[] {
    const normalized = values
        .flatMap((value) =>
            value
                .split(/[,;|/\\\n]+/)
                .map((token) => token.trim())
                .filter(Boolean)
        )
        .map((token) => token);
    return Array.from(new Set(normalized));
}

