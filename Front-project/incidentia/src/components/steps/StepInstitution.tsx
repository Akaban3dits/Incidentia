import type { ChangeEvent, FC } from 'react';
import { Building2, ChevronRight } from 'lucide-react';
import type { StepperData } from '../../types/StepperData';

interface Props {
  data: StepperData;
  setData: (data: StepperData) => void;
  nextStep: () => void;
}

const StepInstitution: FC<Props> = ({ data, setData, nextStep }) => {
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const isFormValid = data.institution && data.department;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <Building2 className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Información Institucional</h2>
          <p className="text-sm text-gray-500">Necesitamos algunos datos adicionales</p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Paso 1 de 4</span>
          <span>25% completado</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: '25%' }}></div>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Institución <span className="text-red-500">*</span>
          </label>
          <select
            name="institution"
            value={data.institution}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
          >
            <option value="">Selecciona una institución</option>
            <option value="Universidad de los Andes">Universidad de los Andes</option>
            <option value="Universidad Nacional">Universidad Nacional</option>
            <option value="Universidad Javeriana">Universidad Javeriana</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Departamento <span className="text-red-500">*</span>
          </label>
          <select
            name="department"
            value={data.department}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
          >
            <option value="">Selecciona un departamento</option>
            <option value="Antioquia">Antioquia</option>
            <option value="Cundinamarca">Cundinamarca</option>
            <option value="Valle del Cauca">Valle del Cauca</option>
          </select>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8">
        <button className="px-6 py-3 text-gray-500 font-medium rounded-lg hover:bg-gray-50 transition-colors">
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

export default StepInstitution;