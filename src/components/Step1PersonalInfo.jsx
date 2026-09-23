import React from 'react';
import { useWizard } from '../context/WizardContext';

// Simple check: does this look like a real email? (has text@text.text)
function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function Step1PersonalInfo() {
  const { state, dispatch } = useWizard();
  const { formData, errors } = state;

  // Runs every time the user types in ANY of the 3 boxes
  const handleChange = (field) => (e) => {
    dispatch({ type: 'UPDATE_FIELD', field, value: e.target.value });
  };

  // Runs when the user clicks away from a box (onBlur = "on leaving the field")
  const handleBlur = (field) => () => {
    if (field === 'name') {
      const message = formData.name.trim() === '' ? 'Name is required.' : '';
      dispatch({ type: 'SET_ERROR', field: 'name', message });
    }
    if (field === 'email') {
      const message = !isValidEmail(formData.email)
        ? 'Please enter a valid email address.'
        : '';
      dispatch({ type: 'SET_ERROR', field: 'email', message });
    }
    // portfolioUrl has no required rule, so nothing to check here
  };

  // Runs when the user clicks "Next" — checks everything at once
  const handleNext = () => {
    const nameError = formData.name.trim() === '' ? 'Name is required.' : '';
    const emailError = !isValidEmail(formData.email)
      ? 'Please enter a valid email address.'
      : '';

    dispatch({ type: 'SET_ERROR', field: 'name', message: nameError });
    dispatch({ type: 'SET_ERROR', field: 'email', message: emailError });

    // Only move forward if BOTH fields are clean
    if (!nameError && !emailError) {
      dispatch({ type: 'GO_TO_STEP', step: 2 });
    }
  };

  return (
    <div>
      <h2>Step 1: Personal Info</h2>

      <div>
        <label>Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={handleChange('name')}
          onBlur={handleBlur('name')}
        />
        {errors.name && <p style={{ color: 'red' }}>{errors.name}</p>}
      </div>

      <div>
        <label>Email *</label>
        <input
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
          onBlur={handleBlur('email')}
        />
        {errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}
      </div>

      <div>
        <label>Portfolio / GitHub URL</label>
        <input
          type="text"
          value={formData.portfolioUrl}
          onChange={handleChange('portfolioUrl')}
        />
      </div>

      <button onClick={handleNext}>Next</button>
    </div>
  );
}

export default Step1PersonalInfo;
