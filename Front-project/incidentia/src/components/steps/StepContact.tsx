import { useState, type ChangeEvent, type FC } from 'react';
import { Phone, ChevronRight, ChevronLeft } from 'lucide-react';
import type { StepperData } from '../../types/StepperData';

interface Props {
  data: StepperData;
  setData: (data: StepperData) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const StepContact: FC<Props> = ({ data, setData, nextStep, prevStep }) => {
  const [codeSent, setCodeSent] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const sendCode = () => {
    if (data.phone) {
      setCodeSent(true);
      alert(`Código enviado a ${data.phone}`);
    }
  };

  const isFormValid = data.phone;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <Phone className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Información de Contacto</h2>
          <p className="text-sm text-gray-500">Necesitamos algunos datos adicionales</p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Paso 2 de 4</span>
          <span>50% completado</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: '50%' }}></div>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número de Teléfono <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              name="phone"
              value={data.phone}
              onChange={handleChange}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="+52 998 123 4567"
            />
            <button
              onClick={sendCode}
              disabled={!data.phone}
              className={`px-4 py-3 font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                data.phone
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Enviado
            </button>
          </div>
          {codeSent && (
            <p className="text-sm text-green-600 mt-2">
              Te enviaremos un código de verificación por SMS
            </p>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={prevStep}
          className="px-6 py-3 text-gray-500 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </button>
        <button
          onClick={nextStep}
          disabled={!isFormValid}
          className={`px-6 py-3 font-medium rounded-lg flex items-center gap-2 transition-all duration-200 ${
            isFormValid
              ? 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Siguiente
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default StepContact;