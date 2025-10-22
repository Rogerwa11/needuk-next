import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { publicTalentSelect } from '@/lib/utils/prisma-selects';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const q = searchParams.get('q') || '';
    const userType = searchParams.get('userType') || '';
    const curso = searchParams.get('curso') || '';
    const universidade = searchParams.get('universidade') || '';
    const periodo = searchParams.get('periodo') || '';
    const nomeUniversidade = searchParams.get('nomeUniversidade') || '';
    const departamento = searchParams.get('departamento') || '';
    const cargoGestor = searchParams.get('cargoGestor') || '';
    const nomeEmpresa = searchParams.get('nomeEmpresa') || '';
    const cidade = searchParams.get('cidade') || '';
    const estado = searchParams.get('estado') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));

    const where: any = {
      userType: { in: ['aluno', 'gestor'] },
    };

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { cidade: { contains: q, mode: 'insensitive' } },
        { curso: { contains: q, mode: 'insensitive' } },
        { universidade: { contains: q, mode: 'insensitive' } },
        { nomeUniversidade: { contains: q, mode: 'insensitive' } },
        { departamento: { contains: q, mode: 'insensitive' } },
        { cargo: { contains: q, mode: 'insensitive' } },
        { setor: { contains: q, mode: 'insensitive' } },
      ];
    }

    const add = (field: string, value: string) => {
      if (value) where[field] = { contains: value, mode: 'insensitive' };
    };

    if (userType) where.userType = userType;
    add('curso', curso);
    // Unificação: quando 'universidade' for usado, buscar em aluno.universidade OU gestor.nomeUniversidade
    if (universidade || nomeUniversidade) {
      const uni = universidade || nomeUniversidade;
      where.AND = where.AND || [];
      where.AND.push({ OR: [
        { universidade: { contains: uni, mode: 'insensitive' } },
        { nomeUniversidade: { contains: uni, mode: 'insensitive' } },
      ]});
    }
    add('periodo', periodo);
    // Campo específico separado não é mais necessário; mantido apenas se passado isoladamente (já coberto acima)
    add('departamento', departamento);
    add('cargoGestor', cargoGestor);
    add('nomeEmpresa', nomeEmpresa);
    add('cidade', cidade);
    add('estado', estado);

    const [items, total] = await Promise.all([
      prisma.user.findMany({ where, select: publicTalentSelect, skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: 'desc' } }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({ items, total, page, pageSize });
  } catch (error) {
    console.error('Erro ao buscar talentos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}


