import React from 'react';
import { useWizard } from '../context/WizardContext';

function Confirmation() {
  const { dispatch } = useWizard();

  const handleStartOver = () => {
    dispatch({ type: 'RESET' });
  };

  return (
    <div>
      <h2>You're all set!</h2>
      <p>Thanks — your onboarding info has been submitted.</p>
      <button onClick={handleStartOver}>Start over</button>
    </div>
  );
}

export default Confirmation;
