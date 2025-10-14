// Classes CSS comuns reutilizáveis

export const inputStyles = {
    base: 'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 text-black',
    default: 'border-gray-300 focus:ring-purple-500',
    error: 'border-red-500 focus:ring-red-500',
    success: 'border-green-500 focus:ring-green-500',
};

export const buttonStyles = {
    base: 'inline-flex items-center justify-center gap-2 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed',
    primary: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 focus:ring-purple-500',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-purple-500',
    sizes: {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-3 text-base',
        lg: 'px-6 py-3 text-lg',
    },
};

export const cardStyles = {
    base: 'bg-white rounded-lg shadow-sm border border-gray-200',
    padding: 'p-6',
    hover: 'hover:shadow-md transition-shadow duration-300',
};

export const textStyles = {
    label: 'block text-sm font-medium text-gray-700',
    error: 'text-red-500 text-sm flex items-center gap-1',
    helper: 'text-gray-500 text-sm',
    success: 'text-green-500 text-sm flex items-center gap-1',
};

export const layoutStyles = {
    container: 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8',
    pageHeader: 'bg-white shadow-sm border-b border-gray-200',
    pageContent: 'py-8',
    grid: {
        cols1: 'grid-cols-1',
        cols2: 'grid-cols-1 md:grid-cols-2',
        cols3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        cols4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
        formRow: 'grid grid-cols-1 md:grid-cols-2 gap-6',
        formRowTight: 'grid grid-cols-1 md:grid-cols-2 gap-4',
    },
};

export const modalStyles = {
    overlay: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4',
    container: 'bg-white rounded-lg shadow-xl w-full',
    sizes: {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    },
    header: 'flex items-center justify-between p-6 border-b border-gray-200',
    content: 'p-6',
};

export const statusStyles = {
    pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-600',
        badge: 'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-600',
    },
    completed: {
        bg: 'bg-green-100',
        text: 'text-green-600',
        badge: 'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600',
    },
    active: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        badge: 'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600',
    },
    inactive: {
        bg: 'bg-gray-100',
        text: 'text-gray-600',
        badge: 'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600',
    },
};

export const spacing = {
    section: 'space-y-8',
    form: 'space-y-6',
    card: 'space-y-4',
};
