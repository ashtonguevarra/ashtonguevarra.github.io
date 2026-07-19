export default function AboutSection() {
  return (
    <section id="about" className="py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-heading text-3xl font-bold text-foreground mb-8">
          About Me
        </h2>
        <div className="space-y-4 text-secondary leading-relaxed">
          <p>
            I'm a software developer passionate about building web applications
            that are both functional and beautiful. With experience across the
            full stack, I enjoy turning complex problems into simple, elegant
            solutions.
          </p>
          <p>
            My approach combines clean code practices with a strong focus on user
            experience. I believe great software should be intuitive,
            performant, and accessible to everyone.
          </p>
          <p>
            When I'm not coding, you'll find me exploring new technologies,
            contributing to open-source projects, or writing about my experiences
            here on my blog.
          </p>
        </div>
      </div>
    </section>
  );
}