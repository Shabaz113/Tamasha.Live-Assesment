import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';

const STORAGE_KEY = 'onboarding-wizard-draft';

// ---------------------------------------------
// 1. THE SHAPE OF OUR DATA (the "big box")
// ---------------------------------------------
// This is what formData looks like when the app first opens.
// Everything starts empty.
const initialState = {
  currentStep: 1,
  isDraftSaved: false,
  isSubmitted: false, // becomes true after clicking Submit on Step 4
  formData: {
    // Step 1
    name: '',
    email: '',
    portfolioUrl: '',
    // Step 2
    track: '',        // 'Frontend' | 'Backend' | 'Fullstack' | 'UI/UX Design'
    experience: '',    // 'Junior' | 'Mid' | 'Senior'
    // Step 3 (depends on track)
    techStack: [],     // array of checked items, e.g. ['React', 'TypeScript']
  },
  errors: {
    name: '',
    email: '',
  },
};

// ---------------------------------------------
// 2. THE REDUCER (the "rulebook" for changes)
// ---------------------------------------------
// A reducer is just a big switch statement. You tell it WHAT happened
// (the "action"), and it decides HOW the state should change.
// It never mutates the old state directly — it always returns a
// brand new object. That's what "immutability" means.
function wizardReducer(state, action) {
  switch (action.type) {

    // Update any single field in formData (name, email, portfolioUrl, etc.)
    case 'UPDATE_FIELD': {
      return {
        ...state,
        isDraftSaved: false, // we just changed something, so it's not saved yet
        formData: {
          ...state.formData,
          [action.field]: action.value,
        },
      };
    }

    // Special case: changing the Track in Step 2 must WIPE Step 3's
    // techStack, because those choices no longer make sense.
    case 'CHANGE_TRACK': {
      return {
        ...state,
        isDraftSaved: false,
        formData: {
          ...state.formData,
          track: action.value,
          techStack: [], // <-- the "safely clear" rule from the task sheet
        },
      };
    }

    // Toggle one tech-stack checkbox on/off (Step 3)
    case 'TOGGLE_TECH': {
      const alreadyChecked = state.formData.techStack.includes(action.value);
      const updatedStack = alreadyChecked
        ? state.formData.techStack.filter((item) => item !== action.value) // remove it
        : [...state.formData.techStack, action.value]; // add it

      return {
        ...state,
        isDraftSaved: false,
        formData: {
          ...state.formData,
          techStack: updatedStack,
        },
      };
    }

    // Set an error message for one field (e.g. "Email is invalid")
    case 'SET_ERROR': {
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.field]: action.message,
        },
      };
    }

    // Move to any step directly (used by Next/Back AND the Review page's Edit buttons)
    case 'GO_TO_STEP': {
      return {
        ...state,
        currentStep: action.step,
      };
    }

    // Mark that the draft was just saved to localStorage
    case 'MARK_SAVED': {
      return {
        ...state,
        isDraftSaved: true,
      };
    }

    // Load a whole draft back in from localStorage on page refresh
    case 'LOAD_DRAFT': {
      return {
        ...state,
        ...action.draft,
      };
    }

    // User clicked Submit on the Review page. We just flip a flag —
    // App.jsx will use this to swap in the confirmation screen.
    case 'SUBMIT': {
      return {
        ...state,
        isSubmitted: true,
      };
    }

    // "Start over" button on the confirmation screen — wipes
    // everything back to a completely blank wizard.
    case 'RESET': {
      return initialState;
    }

    default:
      return state;
  }
}

// ---------------------------------------------
// 3. THE CONTEXT (how components "reach into the box")
// ---------------------------------------------
const WizardContext = createContext(null);

export function WizardProvider({ children }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState);

  // We use a "ref" to hold the timer ID. Unlike normal state, changing a
  // ref does NOT cause a re-render — which is exactly what we want for
  // something as boring as "which timer is currently running".
  const debounceTimer = useRef(null);

  // This flag tracks whether we've gotten past the very first render.
  // Without it, the auto-save effect below would fire on page load too
  // (even with an empty, untouched form), because useEffect always runs
  // once after the initial render — not just on later changes.
  const hasMounted = useRef(false);

  // ---------------------------------------------
  // LOAD DRAFT ON FIRST OPEN (runs once, when the app first mounts)
  // ---------------------------------------------
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        dispatch({ type: 'LOAD_DRAFT', draft });
      } catch (err) {
        // If the saved data is corrupted/unreadable, just ignore it
        // and start fresh instead of crashing the app.
        console.warn('Could not parse saved draft, starting fresh.', err);
      }
    }
  }, []); // empty array = run only once, on mount

  // ---------------------------------------------
  // DEBOUNCED AUTO-SAVE (runs every time formData changes)
  // ---------------------------------------------
  useEffect(() => {
    // Skip this very first run. On mount, formData "changes" from
    // undefined to its initial value, which would otherwise trigger
    // a pointless save of an empty, untouched form.
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    // Every time formData changes, cancel whatever save was about to
    // happen, and schedule a new one 500ms from now. If the user keeps
    // typing, this keeps getting cancelled and restarted, so we only
    // ever actually save 500ms AFTER they stop typing.
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          currentStep: state.currentStep,
          formData: state.formData,
        })
      );
      dispatch({ type: 'MARK_SAVED' });
    }, 500);

    // CLEANUP: this runs when the component unmounts, or right before
    // the effect runs again. Without this, a leftover timer could fire
    // after the component is gone and try to save/dispatch into nothing.
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [state.formData, state.currentStep]); // re-run when EITHER formData or the step changes

  // ---------------------------------------------
  // CLEAR THE DRAFT ONCE SUBMITTED
  // ---------------------------------------------
  useEffect(() => {
    if (state.isSubmitted) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [state.isSubmitted]);

  // We pass both state (to READ) and dispatch (to CHANGE) down to
  // every component that needs it.
  return (
    <WizardContext.Provider value={{ state, dispatch }}>
      {children}
    </WizardContext.Provider>
  );
}

// A little helper hook so components can just write:
//   const { state, dispatch } = useWizard();
// instead of importing useContext + WizardContext every time.
export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used inside a <WizardProvider>');
  }
  return context;
}
