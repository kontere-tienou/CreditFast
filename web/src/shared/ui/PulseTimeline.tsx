type PulseStep = {
  title: string;
  meta: string;
  state: 'done' | 'active' | 'todo';
};

type PulseTimelineProps = {
  title: string;
  steps: PulseStep[];
};

export function PulseTimeline({ title, steps }: PulseTimelineProps) {
  return (
    <section className="card pulse-timeline">
      <p className="pulse-timeline-title">{title}</p>
      <ol className="pulse-timeline-track">
        {steps.map((step) => (
          <li key={step.title} className={`pulse-step is-${step.state}`}>
            <span className="pulse-step-dot">
              {step.state === 'done' ? <i className="fas fa-check"></i> : null}
            </span>
            <strong>{step.title}</strong>
            <span>{step.meta}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
