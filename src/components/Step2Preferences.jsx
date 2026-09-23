import React from 'react';
import { useWizard } from '../context/WizardContext';

const TRACKS = ['Frontend', 'Backend', 'Fullstack', 'UI/UX Design'];
const EXPERIENCE_LEVELS = ['Junior', 'Mid', 'Senior'];

function Step2Preferences() {
  const { state, dispatch } = useWizard();
  const { formData } = state;

  // Special dispatch: changing the track must ALSO clear Step 3's techStack,
  // because those choices only make sense for the previous track.
  const handleTrackChange = (track) => {
    dispatch({ type: 'CHANGE_TRACK', value: track });
  };

  const handleExperienceChange = (level) => {
    dispatch({ type: 'UPDATE_FIELD', field: 'experience', value: level });
  };

  const handleBack = () => {
    dispatch({ type: 'GO_TO_STEP', step: 1 });
  };

  const handleNext = () => {
    // Both choices are required before moving on
    if (formData.track && formData.experience) {
      dispatch({ type: 'GO_TO_STEP', step: 3 });
    }
  };

  const canGoNext = formData.track !== '' && formData.experience !== '';

  return (
    <div>
      <h2>Step 2: Preferences</h2>

      <div>
        <label>Primary Track *</label>
        <div>
          {TRACKS.map((track) => (
            <label key={track} style={{ display: 'block' }}>
              <input
                type="radio"
                name="track"
                value={track}
                checked={formData.track === track}
                onChange={() => handleTrackChange(track)}
              />
              {track}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label>Experience Level *</label>
        <div>
          {EXPERIENCE_LEVELS.map((level) => (
            <label key={level} style={{ display: 'block' }}>
              <input
                type="radio"
                name="experience"
                value={level}
                checked={formData.experience === level}
                onChange={() => handleExperienceChange(level)}
              />
              {level}
            </label>
          ))}
        </div>
      </div>

      {!canGoNext && (
        <p style={{ color: 'red' }}>Please select both a track and an experience level.</p>
      )}

      <button onClick={handleBack}>Back</button>
      <button onClick={handleNext} disabled={!canGoNext}>Next</button>
    </div>
  );
}

export default Step2Preferences;
