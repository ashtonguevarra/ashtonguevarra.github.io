const experiences = [
  {
    role: "Senior Software Engineer",
    company: "Tech Company",
    location: "Remote",
    period: "Jan 2023 — Present",
    achievements: [
      "Led the development of a customer-facing dashboard serving 10k+ users",
      "Architected a microservices migration that reduced deployment time by 60%",
      "Mentored 3 junior developers through structured code reviews and pair programming",
    ],
  },
  {
    role: "Software Engineer",
    company: "Startup Inc.",
    location: "San Francisco, CA",
    period: "Mar 2021 — Dec 2022",
    achievements: [
      "Built the core API infrastructure using Node.js and PostgreSQL",
      "Implemented CI/CD pipelines that increased test coverage to 90%+",
      "Collaborated with design team to ship 15+ major features on schedule",
    ],
  },
  {
    role: "Junior Developer",
    company: "Agency Co.",
    location: "New York, NY",
    period: "Jun 2019 — Feb 2021",
    achievements: [
      "Developed responsive web applications for 20+ client projects",
      "Introduced automated testing practices that reduced bugs by 40%",
      "Contributed to open-source internal tools used across the engineering team",
    ],
  },
];

export default function ExperienceSection() {
  return (
    <section id="experience" className="py-20 px-6 section-alt">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-heading text-3xl font-bold text-foreground mb-4">
          Experience
        </h2>
        <p className="text-secondary mb-10">
          My professional journey so far.
        </p>

        <div className="relative space-y-8">
          {/* Timeline line */}
          <div
            className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-border"
            aria-hidden="true"
          />

          {experiences.map((exp, index) => (
            <div key={index} className="relative pl-12">
              {/* Timeline dot */}
              <div
                className="absolute left-3 top-2 w-3.5 h-3.5 rounded-full bg-accent border-2 border-background"
                aria-hidden="true"
              />

              <div className="card">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-2">
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground">
                      {exp.role}
                    </h3>
                    <p className="text-sm text-accent font-medium">
                      {exp.company} &middot; {exp.location}
                    </p>
                  </div>
                  <span className="text-xs text-secondary whitespace-nowrap">
                    {exp.period}
                  </span>
                </div>
                <ul className="space-y-1.5 mt-3" role="list">
                  {exp.achievements.map((item, i) => (
                    <li
                      key={i}
                      className="text-sm text-secondary pl-4 relative before:content-['–'] before:absolute before:left-0"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}