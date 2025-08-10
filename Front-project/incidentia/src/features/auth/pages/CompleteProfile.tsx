import React, { useState } from 'react';
import type { StepperData } from '../../../types/StepperData';
import StepInstitution from '../../../components/steps/StepInstitution';
import StepContact from '../../../components/steps/StepContact';
import StepVerification from '../../../components/steps/StepVerification';
import StepConfirmation from '../../../components/steps/StepConfirmation';

const CompleteProfile: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<StepperData>({
    institution: '',
    department: '',
    phone: '',
    experience: '',
    code: ''
  });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const steps = [
    <StepInstitution 
      key="institution" 
      data={data} 
      setData={setData} 
      nextStep={nextStep} 
    />,
    <StepContact 
      key="contact" 
      data={data} 
      setData={setData} 
      nextStep={nextStep} 
      prevStep={prevStep} 
    />,
    <StepVerification 
      key="verification" 
      data={data} 
      setData={setData} 
      nextStep={nextStep} 
      prevStep={prevStep} 
    />,
    <StepConfirmation 
      key="confirmation" 
      data={data} 
      prevStep={prevStep} 
    />
  ];

  const stepNames = ['Institución', 'Contacto', 'Verificación', 'Confirmación'];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">
          Completa tu Perfil
        </h1>
        
        {/* Step navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            {stepNames.map((step, index) => (
              <button
                key={step}
                onClick={() => setCurrentStep(index)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  index === currentStep
                    ? 'bg-blue-600 text-white'
                    : index < currentStep
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step}
              </button>
            ))}
          </div>
        </div>

        {/* Current step component */}
        {steps[currentStep]}
      </div>
    </div>
  );
};

export default CompleteProfile;