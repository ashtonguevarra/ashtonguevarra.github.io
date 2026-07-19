const skills = [
  {
    category: "Languages",
    items: ["TypeScript", "JavaScript", "Python", "Go", "SQL"],
  },
  {
    category: "Frontend",
    items: ["React", "Next.js", "Vue", "Tailwind CSS", "HTML/CSS"],
  },
  {
    category: "Backend & APIs",
    items: ["Node.js", "Express", "FastAPI", "GraphQL", "REST"],
  },
  {
    category: "Databases & Tools",
    items: ["PostgreSQL", "Supabase", "Redis", "Docker", "Git"],
  },
];

export default function SkillsSection() {
  return (
    <section id="skills" className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-heading text-3xl font-bold text-foreground mb-4">
          Skills &amp; Technologies
        </h2>
        <p className="text-secondary mb-10 max-w-xl">
          Technologies I work with regularly and feel confident using.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {skills.map((group) => (
            <div key={group.category}>
              <h3 className="font-heading text-sm font-semibold text-accent uppercase tracking-wider mb-4">
                {group.category}
              </h3>
              <ul className="space-y-2" role="list">
                {group.items.map((skill) => (
                  <li
                    key={skill}
                    className="text-sm text-secondary bg-muted/50 px-3 py-2 rounded-lg border border-border"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}