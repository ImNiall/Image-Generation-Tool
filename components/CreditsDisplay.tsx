import React from 'react';

type Props = {
  className?: string;
};

// Minimal, non-networked credits display to avoid build/runtime coupling.
// You can extend this later to call a dedicated credits endpoint.
const CreditsDisplay: React.FC<Props> = ({ className }) => {
  return (
    <div
      className={
        'inline-flex items-center rounded-full bg-brand-blue text-white px-3 py-1 text-sm font-semibold shadow ' +
        (className || '')
      }
      aria-label="Credits remaining"
    >
      Credits
    </div>
  );
};

export default CreditsDisplay;
