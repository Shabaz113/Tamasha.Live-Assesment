import React from 'react';
import { useWizard } from '../context/WizardContext';

function Step4Review() {
  const { state, dispatch } = useWizard();
  const { formData } = state;

  // Jump directly back to any step when its Edit button is clicked
  const handleEdit = (step) => {
    dispatch({ type: 'GO_TO_STEP', step });
  };

  const handleBack = () => {
    dispatch({ type: 'GO_TO_STEP', step: 3 });
  };

  const handleSubmit = () => {
    // No real backend in this task (that's "out of scope"),
    // so we just log the data and flip isSubmitted to true.
    // App.jsx watches that flag and swaps in a confirmation screen.
    console.log('Submitting onboarding data:', formData);
    dispatch({ type: 'SUBMIT' });
  };

  return (
    <div>
      <h2>Step 4: Review & Submit</h2>

      <section>
        <h3>
          Personal Info{' '}
          <button onClick={() => handleEdit(1)}>Edit</button>
        </h3>
        <p>Name: {formData.name}</p>
        <p>Email: {formData.email}</p>
        <p>Portfolio/GitHub: {formData.portfolioUrl || '(none provided)'}</p>
      </section>

      <section>
        <h3>
          Preferences{' '}
          <button onClick={() => handleEdit(2)}>Edit</button>
        </h3>
        <p>Track: {formData.track}</p>
        <p>Experience Level: {formData.experience}</p>
      </section>

      <section>
        <h3>
          Tech Stack{' '}
          <button onClick={() => handleEdit(3)}>Edit</button>
        </h3>
        <p>{formData.techStack.length > 0 ? formData.techStack.join(', ') : '(none selected)'}</p>
      </section>

      <button onClick={handleBack}>Back</button>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

export default Step4Review;
