import React from 'react';
import { useCheckout } from '../../hooks/useCheckout';

interface CheckoutButtonProps {
  planId: string;
  planName: string;
  price: string;
  className?: string;
}

export const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  planId,
  planName,
  price,
  className = '',
}) => {
  const { createCheckout, isLoading, error } = useCheckout();

  const handleCheckout = async () => {
    try {
      await createCheckout({ planId });
    } catch (err) {
      console.error('Erro no checkout:', err);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleCheckout}
        disabled={isLoading}
        className={`
          relative px-8 py-4 rounded-xl font-bold text-white
          transition-all duration-300 transform
          ${isLoading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 hover:shadow-lg'
          }
          disabled:opacity-70
          ${className}
        `}
      >
        {/* Conteúdo do botão */}
        <span className={`flex items-center gap-2 ${isLoading ? 'invisible' : 'visible'}`}>
          <span>Assinar {planName}</span>
          <span className="text-sm opacity-80">- {price}</span>
        </span>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg 
              className="animate-spin h-6 w-6 text-white" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="ml-2">Processando...</span>
          </div>
        )}
      </button>

      {/* Mensagem de erro */}
      {error && (
        <p className="mt-2 text-red-500 text-sm animate-pulse">
          {error}
        </p>
      )}
    </div>
  );
};

export default CheckoutButton;