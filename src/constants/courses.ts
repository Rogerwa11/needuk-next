// Lista de cursos superiores organizada por área do conhecimento
// Baseado na Classificação Nacional de Áreas de Formação e Ensino (CNAEF) - MEC
export const coursesByArea: Record<string, string[]> = {
  // Ciências Exatas e da Terra
  "Ciências Exatas e da Terra": [
    "Matemática",
    "Estatística",
    "Física",
    "Química",
    "Geologia",
    "Oceanografia",
    "Astronomia",
    "Ciência da Computação",
    "Sistemas de Informação",
    "Engenharia de Computação",
    "Engenharia da Computação",
    "Ciência de Dados",
    "Inteligência Artificial",
    "Engenharia de Software",
    "Análise e Desenvolvimento de Sistemas",
    "Redes de Computadores",
    "Segurança da Informação",
    "Banco de Dados",
    "Engenharia Elétrica",
    "Engenharia Eletrônica",
    "Engenharia de Telecomunicações",
    "Engenharia Mecânica",
    "Engenharia Civil",
    "Engenharia Química",
    "Engenharia de Produção",
    "Engenharia de Materiais",
    "Engenharia Ambiental",
    "Engenharia Sanitária",
    "Engenharia de Minas",
    "Engenharia de Petróleo",
    "Engenharia Naval",
    "Engenharia Aeronáutica",
    "Engenharia Biomédica",
    "Arquitetura e Urbanismo",
    "Design",
    "Design Gráfico",
    "Design de Produto",
    "Engenharia de Controle e Automação"
  ],

  // Ciências Biológicas
  "Ciências Biológicas": [
    "Biologia",
    "Biologia Marinha",
    "Ecologia",
    "Zoologia",
    "Botânica",
    "Microbiologia",
    "Genética",
    "Biologia Molecular",
    "Bioquímica",
    "Biotecnologia",
    "Engenharia Biomédica",
    "Biomedicina",
    "Farmácia",
    "Farmacologia",
    "Ciências Farmacêuticas",
    "Nutrição",
    "Enfermagem",
    "Fisioterapia",
    "Terapia Ocupacional",
    "Odontologia",
    "Medicina",
    "Medicina Veterinária",
    "Zootecnia",
    "Agronomia",
    "Engenharia Florestal",
    "Ciências Agrárias",
    "Engenharia Agrícola",
    "Ciências Ambientais"
  ],

  // Engenharias
  "Engenharias": [
    "Engenharia Civil",
    "Engenharia Mecânica",
    "Engenharia Elétrica",
    "Engenharia Eletrônica",
    "Engenharia de Computação",
    "Engenharia de Telecomunicações",
    "Engenharia Química",
    "Engenharia de Produção",
    "Engenharia de Materiais",
    "Engenharia Ambiental",
    "Engenharia Sanitária",
    "Engenharia de Minas",
    "Engenharia de Petróleo",
    "Engenharia Naval",
    "Engenharia Aeronáutica",
    "Engenharia Biomédica",
    "Engenharia de Controle e Automação",
    "Engenharia de Energia",
    "Engenharia Nuclear",
    "Engenharia de Alimentos",
    "Engenharia Têxtil",
    "Arquitetura e Urbanismo",
    "Engenharia Cartográfica"
  ],

  // Ciências da Saúde
  "Ciências da Saúde": [
    "Medicina",
    "Enfermagem",
    "Fisioterapia",
    "Terapia Ocupacional",
    "Fonoaudiologia",
    "Nutrição",
    "Psicologia",
    "Farmácia",
    "Biomedicina",
    "Odontologia",
    "Medicina Veterinária",
    "Educação Física",
    "Saúde Coletiva",
    "Gerontologia",
    "Farmacologia",
    "Toxicologia",
    "Radiologia",
    "Análises Clínicas",
    "Citopatologia",
    "Higiene Dental",
    "Prótese Dentária",
    "Tecnologia em Radiologia"
  ],

  // Ciências Agrárias
  "Ciências Agrárias": [
    "Agronomia",
    "Zootecnia",
    "Engenharia Agrícola",
    "Engenharia Florestal",
    "Ciências Ambientais",
    "Gestão Ambiental",
    "Engenharia de Pesca",
    "Aquicultura",
    "Medicina Veterinária",
    "Ciências do Solo",
    "Fitotecnia",
    "Horticultura",
    "Silvicultura",
    "Manejo Florestal",
    "Recursos Florestais",
    "Ciência e Tecnologia de Alimentos",
    "Engenharia de Alimentos",
    "Tecnologia em Alimentos"
  ],

  // Ciências Sociais Aplicadas
  "Ciências Sociais Aplicadas": [
    "Administração",
    "Ciências Contábeis",
    "Ciências Econômicas",
    "Economia",
    "Relações Internacionais",
    "Comércio Exterior",
    "Turismo",
    "Hotelaria",
    "Gastronomia",
    "Direito",
    "Ciências Jurídicas",
    "Serviço Social",
    "Comunicação Social",
    "Jornalismo",
    "Publicidade e Propaganda",
    "Rádio, TV e Internet",
    "Cinema",
    "Fotografia",
    "Design",
    "Design Gráfico",
    "Design de Moda",
    "Artes Visuais",
    "Música",
    "Teatro",
    "Dança",
    "Artes Cênicas",
    "Biblioteconomia",
    "Arquivologia",
    "Museologia"
  ],

  // Ciências Humanas
  "Ciências Humanas": [
    "Filosofia",
    "Sociologia",
    "Antropologia",
    "História",
    "Geografia",
    "Psicologia",
    "Psicopedagogia",
    "Educação Especial",
    "Letras",
    "Linguística",
    "Tradução",
    "Literatura",
    "Pedagogia",
    "Educação",
    "Educação Física",
    "Ciências Sociais",
    "Política",
    "Relações Públicas",
    "Teologia",
    "Ciências da Religião",
    "Estudos Culturais",
    "Arqueologia",
    "Museologia"
  ],

  // Linguística, Letras e Artes
  "Linguística, Letras e Artes": [
    "Letras",
    "Linguística",
    "Tradução",
    "Interpretação",
    "Literatura",
    "Escrita Criativa",
    "Artes",
    "Artes Visuais",
    "Artes Plásticas",
    "Escultura",
    "Pintura",
    "Desenho",
    "Música",
    "Composição Musical",
    "Regência",
    "Canto",
    "Instrumento Musical",
    "Teatro",
    "Direção Teatral",
    "Cenografia",
    "Figurino",
    "Dança",
    "Coreografia",
    "Produção Cultural",
    "Artes Cênicas"
  ],

  // Outros Cursos Técnicos e Profissionais
  "Cursos Técnicos e Profissionais": [
    "Logística",
    "Gestão Empresarial",
    "Gestão de Recursos Humanos",
    "Gestão Financeira",
    "Marketing",
    "Comércio Eletrônico",
    "E-commerce",
    "Gestão da Qualidade",
    "Gestão Ambiental",
    "Gestão Pública",
    "Secretariado",
    "Secretariado Executivo",
    "Processos Gerenciais",
    "Gestão de Cooperativas",
    "Gestão Hospitalar",
    "Gestão em Saúde",
    "Gestão de Segurança Privada",
    "Tecnologia em Gestão Empresarial",
    "Tecnologia em Gestão da Produção Industrial",
    "Tecnologia em Gestão de Recursos Humanos",
    "Tecnologia em Marketing",
    "Tecnologia em Logística",
    "Tecnologia em Gestão Financeira",
    "Tecnologia em Comércio Exterior",
    "Tecnologia em Processos Gerenciais"
  ]
};

// Lista plana de todos os cursos para facilitar a busca
export const allCourses = Object.values(coursesByArea).flat();

// Função para filtrar cursos por área
export const getCoursesByArea = (area: string) => {
  return coursesByArea[area] || [];
};

// Função para buscar cursos por nome (case insensitive)
export const searchCourses = (query: string) => {
  if (!query || query.length < 2) return [];
  const lowerQuery = query.toLowerCase();
  return allCourses.filter(course =>
    course.toLowerCase().includes(lowerQuery)
  );
};
