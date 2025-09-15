import { useState, type FC } from 'react';
import { Check, ChevronLeft } from 'lucide-react';
import type { StepperData } from '../../types/StepperData';

interface Props {
  data: StepperData;
  prevStep: () => void;
}

const StepConfirmation: FC<Props> = ({ data, prevStep }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const submit = async () => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      console.log("✅ Enviado:", data);
      setIsSubmitting(false);
      setIsCompleted(true);
      
      setTimeout(() => {
        alert("✅ Perfil completado correctamente.");
      }, 500);
    }, 1500);
  };

  if (isCompleted) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Perfil Completado!</h2>
          <p className="text-gray-600 mb-6">Tu cuenta ha sido configurada exitosamente.</p>
          <div className="w-full bg-green-100 rounded-full h-2 mb-4">
            <div className="bg-green-600 h-2 rounded-full w-full"></div>
          </div>
          <p className="text-sm text-green-600 font-medium">100% completado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
          <Check className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Revisión Final</h2>
          <p className="text-sm text-gray-500">Verifica que toda la información sea correcta</p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Paso 4 de 4</span>
          <span>100% completado</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300 w-full"></div>
        </div>
      </div>

      {/* Summary */}
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Institución:</span>
            <span className="text-sm text-gray-900 font-medium">{data.institution}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Departamento:</span>
            <span className="text-sm text-gray-900 font-medium">{data.department}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Teléfono:</span>
            <span className="text-sm text-gray-900 font-medium">{data.phone}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Experiencia:</span>
            <span className="text-sm text-gray-900 font-medium">{data.experience}</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={prevStep}
          disabled={isSubmitting}
          className="px-6 py-3 text-gray-500 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </button>
        <button
          onClick={submit}
          disabled={isSubmitting}
          className={`px-6 py-3 font-medium rounded-lg flex items-center gap-2 transition-all duration-200 ${
            isSubmitting
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Enviando...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Confirmar y Enviar
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default StepConfirmation;