"use client";

import { useState } from "react";
import Step2ServiceSelect from "./quote-steps/Step2ServiceSelect";
import Step2SpecificSelect from "./quote-steps/Step2SpecificSelect";
import Step2RoleSelect from "./quote-steps/Step2RoleSelect";
import Step2CategorySelect from "./quote-steps/Step2CategorySelect";
import Step2BudgetTimeline from "./quote-steps/Step2BudgetTimeline";

export default function QuoteModalStep2({ formData, onChange, onBack, onSubmit, loading, error }) {
  const [subStep, setSubStep] = useState(1);

  return (
    <div>
      {subStep === 1 && (
        <Step2ServiceSelect
          formData={formData}
          onChange={onChange}
          onBack={onBack}
          onNext={() => setSubStep(2)}
        />
      )}

      {subStep === 2 && (
        <Step2SpecificSelect
          formData={formData}
          onChange={onChange}
          onBack={() => setSubStep(1)}
          onNext={() => setSubStep(3)}
        />
      )}

      {subStep === 3 && (
        <Step2RoleSelect
          formData={formData}
          onChange={onChange}
          onBack={() => setSubStep(2)}
          onNext={() => setSubStep(4)}
        />
      )}

      {subStep === 4 && (
        <Step2CategorySelect
          formData={formData}
          onChange={onChange}
          onBack={() => setSubStep(3)}
          onNext={() => setSubStep(5)}
        />
      )}

      {subStep === 5 && (
        <Step2BudgetTimeline
          formData={formData}
          onChange={onChange}
          onBack={() => setSubStep(4)}
          onSubmit={onSubmit}
          loading={loading}
          error={error}
        />
      )}
    </div>
  );
}
