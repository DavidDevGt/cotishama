'use client';

/**
 * StepIndicator Component
 * Implements User Story 5: Shows 3-step progress indicator
 * 
 * 3-step flow: Search Products → Review Quote → Generate PDF
 */

type Step = 'search' | 'review' | 'pdf';

interface StepIndicatorProps {
  currentStep: Step;
}

const steps: { id: Step; label: string }[] = [
  { id: 'search', label: 'Buscar Productos' },
  { id: 'review', label: 'Revisar Cotización' },
  { id: 'pdf', label: 'Descargar PDF' },
];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <nav aria-label="Progress">
      <ol className="flex items-center">
        {steps.map((step, index) => (
          <li key={step.id} className={`flex items-center ${index !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
            <div className="relative flex items-center justify-center">
              {index !== 0 && (
                <div
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 ${
                    index <= currentIndex ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
              <div
                className={`relative flex h-8 w-8 items-center justify-center rounded-full ${
                  index < currentIndex
                    ? 'bg-blue-600 text-white'
                    : index === currentIndex
                    ? 'border-2 border-blue-600 bg-white text-blue-600'
                    : 'border-2 border-gray-300 bg-white text-gray-500'
                }`}
              >
                {index < currentIndex ? (
                  <span className="text-sm">✓</span>
                ) : (
                  <span className="text-sm">{index + 1}</span>
                )}
              </div>
            </div>
            <span
              className={`ml-3 text-sm font-medium ${
                index === currentIndex ? 'text-blue-600' : index < currentIndex ? 'text-gray-900' : 'text-gray-500'
              }`}
            >
              {step.label}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}