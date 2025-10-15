import React, { useId } from 'react';

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (query: string) => void;
  suggestions: string[];
  placeholder?: string;
  label?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  fieldType?: 'course' | 'university' | 'generic';
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onChange,
  onSearch,
  suggestions,
  placeholder,
  label,
  error,
  className = '',
  disabled = false,
  required = false,
  fieldType = 'generic',
}) => {
  const inputId = useId();
  const datalistId = useId();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    onSearch?.(newValue);
  };

  const baseInputClasses = `
    w-full text-black px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300
    ${error
      ? 'border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:ring-blue-500'
    }
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
  `;

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-md">
      {label && (
        <label htmlFor={inputId} className="text-gray-700 font-semibold">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        id={inputId}
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        list={datalistId}
        className={`${baseInputClasses} ${className}`}
        autoComplete="off"
      />

      <datalist id={datalistId}>
        {suggestions.map((suggestion, index) => (
          <option key={`${datalistId}-${index}`} value={suggestion} />
        ))}
      </datalist>

      {error && (
        <p className="text-red-500 text-sm flex items-center gap-1">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          {error}
        </p>
      )}

      {suggestions.length > 0 && value && !suggestions.some(s => s.toLowerCase() === value.toLowerCase()) && (
        <p className="text-xs text-amber-600 text-center">
          ⚠️ Selecione {fieldType === 'course' ? 'um curso' : fieldType === 'university' ? 'uma universidade' : 'uma opção'} da lista para continuar
        </p>
      )}
      {suggestions.length === 0 && value && value.length >= 2 && fieldType !== 'university' && (
        <p className="text-xs text-red-500 text-center">
          ❌ {fieldType === 'course' ? 'Nenhum curso' : 'Nenhuma opção'} encontrada. Verifique a digitação
        </p>
      )}
    </div>
  );
};
