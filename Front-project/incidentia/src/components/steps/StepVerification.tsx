import { useState, type ChangeEvent, type FC } from 'react';
import { Shield, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import type { StepperData } from '../../types/StepperData';

interface Props {
  data: StepperData;
  setData: (data: StepperData) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const StepVerification: FC<Props> = ({ data, setData, nextStep, prevStep }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, code: e.target.value });
  };

  const verifyCode = async () => {
    if (!data.code) return;
    
    setIsVerifying(true);
    setTimeout(() => {
      if (data.code === "789542") {
        setIsVerified(true);
        setIsVerifying(false);
        setTimeout(() => nextStep(), 1000);
      } else {
        setIsVerifying(false);
        alert("❌ Código incorrecto. Intenta de nuevo.");
      }
    }, 1500);
  };

  const resendCode = () => {
    alert("Código reenviado a tu teléfono");
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
          <Shield className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Verificación de Teléfono</h2>
          <p className="text-sm text-gray-500">Necesitamos algunos datos adicionales</p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Paso 3 de 4</span>
          <span>75% completado</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: '75%' }}></div>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Código de Verificación <span className="text-red-500">*</span>
          </label>
          <input
            name="code"
            value={data.code}
            onChange={handleChange}
            placeholder="789542"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center text-lg tracking-widest"
            maxLength={6}
          />
          <p className="text-sm text-gray-500 mt-2">
            Hemos enviado un código a +52 998325120
          </p>
        </div>

        {/* Verification status */}
        {isVerified && (
          <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-green-700 font-medium">Teléfono verificado exitosamente</span>
          </div>
        )}

        {/* Verify/Resend buttons */}
        <div className="flex gap-3">
          <button
            onClick={verifyCode}
            disabled={!data.code || isVerifying || isVerified}
            className={`flex-1 px-4 py-3 font-medium rounded-lg transition-all duration-200 ${
              isVerified
                ? 'bg-green-600 text-white'
                : data.code && !isVerifying
                ? 'bg-gray-400 text-white hover:bg-gray-500'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isVerifying ? 'Verificando...' : isVerified ? 'Verificado ✓' : 'Verificado ✓'}
          </button>
          <button
            onClick={resendCode}
            className="px-4 py-3 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
          >
            Reenviar
          </button>
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
          disabled={!isVerified}
          className={`px-6 py-3 font-medium rounded-lg flex items-center gap-2 transition-all duration-200 ${
            isVerified
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

export default StepVerification;