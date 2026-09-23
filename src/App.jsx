import React from 'react';
import { useWizard } from './context/WizardContext';
import Step1PersonalInfo from './components/Step1PersonalInfo';
import Step2Preferences from './components/Step2Preferences';
import Step3TechStack from './components/Step3TechStack';
import Step4Review from './components/Step4Review';
import Confirmation from './components/Confirmation';

const STEP_NAMES = ['Personal info', 'Preferences', 'Tech stack', 'Review'];

function App() {
  const { state } = useWizard();

  if (state.isSubmitted) {
    return (
      <div>
        <Confirmation />
      </div>
    );
  }

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return <Step1PersonalInfo />;
      case 2:
        return <Step2Preferences />;
      case 3:
        return <Step3TechStack />;
      case 4:
        return <Step4Review />;
      default:
        return <Step1PersonalInfo />;
    }
  };

  // Builds the little dot-and-line progress rail: filled dots for steps
  // already passed, a highlighted dot for the current one, empty for
  // steps still ahead.
  const renderRail = () => {
    const dots = [];
    for (let step = 1; step <= 4; step++) {
      const status =
        step < state.currentStep ? 'done' : step === state.currentStep ? 'active' : '';
      dots.push(<div key={`dot-${step}`} className={`dot ${status}`} />);
      if (step < 4) {
        const lineDone = step < state.currentStep ? 'done' : '';
        dots.push(<div key={`line-${step}`} className={`line ${lineDone}`} />);
      }
    }
    return dots;
  };

  return (
    <div>
      <h1>Onboarding wizard</h1>
      <div className="step-rail">{renderRail()}</div>
      <p className="step-label">
        Step {state.currentStep} of 4 — {STEP_NAMES[state.currentStep - 1]}
      </p>
      {state.isDraftSaved && <p style={{ color: 'green' }}>Draft saved</p>}
      {renderStep()}
    </div>
  );
}

export default App;
