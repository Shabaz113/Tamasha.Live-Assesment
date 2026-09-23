import React from 'react';
import { useWizard } from '../context/WizardContext';

// Dynamic options based on what track was picked in Step 2
const TECH_OPTIONS = {
  Frontend: ['React', 'Vue', 'TypeScript', 'CSS Modules'],
  Backend: ['Node.js', 'Python/Django', 'PostgreSQL', 'Redis'],
  'UI/UX Design': ['Figma', 'Storybook', 'Design Systems'],
  // Fullstack combines Frontend + Backend options
  Fullstack: [
    'React', 'Vue', 'TypeScript', 'CSS Modules',
    'Node.js', 'Python/Django', 'PostgreSQL', 'Redis',
  ],
};

function Step3TechStack() {
  const { state, dispatch } = useWizard();
  const { formData } = state;

  // Look up which checkboxes to show based on the track chosen in Step 2
  const availableOptions = TECH_OPTIONS[formData.track] || [];

  const handleToggle = (option) => {
    dispatch({ type: 'TOGGLE_TECH', value: option });
  };

  const handleBack = () => {
    dispatch({ type: 'GO_TO_STEP', step: 2 });
  };

  const handleNext = () => {
    if (formData.techStack.length > 0) {
      dispatch({ type: 'GO_TO_STEP', step: 4 });
    }
  };

  const canGoNext = formData.techStack.length > 0;

  return (
    <div>
      <h2>Step 3: Tech Stack</h2>
      <p>Showing options for: <strong>{formData.track || 'No track selected'}</strong></p>

      {availableOptions.length === 0 && (
        <p style={{ color: 'red' }}>
          No track was selected in Step 2. Go back and pick one first.
        </p>
      )}

      <div>
        {availableOptions.map((option) => (
          <label key={option} style={{ display: 'block' }}>
            <input
              type="checkbox"
              checked={formData.techStack.includes(option)}
              onChange={() => handleToggle(option)}
            />
            {option}
          </label>
        ))}
      </div>

      {!canGoNext && availableOptions.length > 0 && (
        <p style={{ color: 'red' }}>Pick at least one option to continue.</p>
      )}

      <button onClick={handleBack}>Back</button>
      <button onClick={handleNext} disabled={!canGoNext}>Next</button>
    </div>
  );
}

export default Step3TechStack;
