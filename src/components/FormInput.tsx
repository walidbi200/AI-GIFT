import React from "react";

interface FormInputProps {
  label: string;
  type: "text" | "number" | "select" | "range";
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  icon?: React.ReactNode;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const FormInput: React.FC<FormInputProps & { id?: string; index?: number }> = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  options = [],
  min,
  max,
  icon,
  className = "",
  onKeyDown,
  id,
  index,
}) => {
  // Generate a unique ID: use provided id, or label + random string
  const inputId =
    id ||
    `input-${label.toLowerCase().replace(/\s+/g, "-")}-${Math.random().toString(36).substr(2, 6)}`;
  const hasError = !!error;

  const handleChange = (newValue: string | number) => {
    if (type === "range") {
      onChange(Number(newValue));
    } else {
      onChange(newValue);
    }
  };

  const renderInput = () => {
    switch (type) {
      case "select":
        return (
          <div className="relative">
            {icon && (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
                {icon}
              </div>
            )}
            <select
              id={inputId}
              value={value as string}
              onChange={(e) => handleChange(e.target.value)}
              aria-label={label}
              className={`
                w-full px-4 py-3 border rounded-lg transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                ${icon ? "pl-10" : ""}
                ${
                  hasError
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                }
                ${className}
              `}
            >
              <option value="">{placeholder || "Select an option"}</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {/* Custom dropdown arrow */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        );

      case "range":
        return (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Age: {value}
              </span>
              {icon && <div className="text-gray-400">{icon}</div>}
            </div>
            <input
              type="range"
              id={inputId}
              min={min}
              max={max}
              value={value as number}
              onChange={(e) => handleChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        );

      default:
        return (
          <div className="relative">
            {icon && (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
                {icon}
              </div>
            )}
            <input
              type={type}
              id={inputId}
              value={value as string}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={placeholder}
              aria-label={label}
              className={`
                w-full px-4 py-3 border rounded-lg transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                ${icon ? "pl-10" : ""}
                ${
                  hasError
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                }
                ${className}
              `}
            />
          </div>
        );
    }
  };

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {renderInput()}

      {hasError && (
        <p className="text-red-500 text-sm flex items-center gap-1 animate-fade-in">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default FormInput;
