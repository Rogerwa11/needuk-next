// Mensagens padrão para erros e sucesso

export const authMessages = {
    login: {
        success: 'Login realizado com sucesso!',
        invalidCredentials: 'Email ou senha inválidos. Tente novamente.',
        error: 'Erro ao fazer login. Tente novamente.',
    },
    signup: {
        success: 'Conta criada com sucesso!',
        emailExists: 'Este email já está cadastrado. Tente outro.',
        error: 'Erro ao criar conta. Tente novamente.',
    },
    logout: {
        success: 'Logout realizado com sucesso.',
        error: 'Erro ao fazer logout.',
    },
};

export const profileMessages = {
    update: {
        success: 'Perfil atualizado com sucesso!',
        error: 'Erro ao atualizar perfil. Tente novamente.',
        uploadError: 'Erro ao fazer upload da imagem.',
    },
};

export const activityMessages = {
    create: {
        success: 'Atividade criada com sucesso!',
        error: 'Erro ao criar atividade.',
    },
    update: {
        success: 'Atividade atualizada com sucesso!',
        error: 'Erro ao atualizar atividade.',
    },
    delete: {
        success: 'Atividade excluída com sucesso!',
        error: 'Erro ao excluir atividade.',
        confirm: 'Tem certeza que deseja excluir esta atividade? Esta ação não pode ser desfeita.',
    },
    leave: {
        success: 'Você abandonou a atividade com sucesso.',
        error: 'Erro ao abandonar atividade.',
        confirm: 'Tem certeza que deseja abandonar esta atividade? Você perderá acesso a ela.',
    },
    transfer: {
        success: 'Liderança transferida com sucesso!',
        error: 'Erro ao transferir liderança.',
        confirm: 'Tem certeza que deseja transferir a liderança desta atividade? Você perderá os privilégios de líder.',
    },
    permission: {
        leaderRequired: 'Apenas o líder da atividade pode realizar esta ação.',
        participantRequired: 'Você precisa ser participante desta atividade.',
        notFound: 'Atividade não encontrada.',
    },
};

export const observationMessages = {
    add: {
        success: 'Observação adicionada com sucesso!',
        error: 'Erro ao adicionar observação.',
    },
    delete: {
        success: 'Observação removida com sucesso!',
        error: 'Erro ao remover observação.',
    },
};

export const linkMessages = {
    add: {
        success: 'Link adicionado com sucesso!',
        error: 'Erro ao adicionar link.',
    },
    delete: {
        success: 'Link removido com sucesso!',
        error: 'Erro ao remover link.',
        confirm: 'Tem certeza que deseja remover este link?',
    },
};

export const medalMessages = {
    award: {
        success: 'Medalha concedida com sucesso!',
        error: 'Erro ao conceder medalha.',
        selectStudent: 'Selecione um aluno e um tipo de medalha',
    },
};

export const invitationMessages = {
    send: {
        success: 'Convite enviado com sucesso!',
        error: 'Erro ao enviar convite.',
        alreadyParticipant: 'Este usuário já é participante da atividade.',
    },
    respond: {
        accept: {
            success: 'Convite aceito com sucesso!',
            error: 'Erro ao aceitar convite.',
        },
        decline: {
            success: 'Convite recusado.',
            error: 'Erro ao recusar convite.',
        },
    },
};

export const notificationMessages = {
    markAsRead: {
        success: 'Notificação marcada como lida.',
        error: 'Erro ao marcar notificação como lida.',
    },
    delete: {
        success: 'Notificação excluída.',
        error: 'Erro ao excluir notificação.',
    },
};

export const validationMessages = {
    required: 'Este campo é obrigatório',
    email: 'Email inválido',
    minLength: (field: string, min: number) => `${field} deve ter pelo menos ${min} caracteres`,
    maxLength: (field: string, max: number) => `${field} deve ter no máximo ${max} caracteres`,
    invalid: (field: string) => `${field} inválido`,
    passwordsNotMatch: 'As senhas não coincidem',
    invalidDate: 'Data inválida',
    futureDate: 'Data deve ser futura',
    invalidUrl: 'URL inválida',
    fileTooLarge: (maxSize: string) => `Arquivo deve ter no máximo ${maxSize}`,
    invalidFileType: 'Tipo de arquivo não permitido',
};

export const generalMessages = {
    error: 'Ocorreu um erro inesperado. Tente novamente.',
    loading: 'Carregando...',
    saving: 'Salvando...',
    deleting: 'Excluindo...',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    yes: 'Sim',
    no: 'Não',
    close: 'Fechar',
    back: 'Voltar',
    next: 'Próximo',
    previous: 'Anterior',
    save: 'Salvar',
    edit: 'Editar',
    delete: 'Excluir',
    add: 'Adicionar',
    remove: 'Remover',
    search: 'Buscar',
    filter: 'Filtrar',
};
