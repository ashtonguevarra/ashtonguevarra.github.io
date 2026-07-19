export default function HeroSection() {
  return (
    <section
      id="home"
      className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-6 pt-24 pb-16"
    >
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-4">
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground">
            Hi, I'm{" "}
            <span className="text-accent">Ashton Guevarra</span>
          </h1>
          <p className="text-xl sm:text-2xl text-secondary font-light">
            Software Developer &amp; Designer
          </p>
        </div>

        <p className="text-base sm:text-lg text-secondary/80 max-w-xl mx-auto leading-relaxed">
          I build clean, performant web applications with modern technologies.
          Passionate about crafting delightful user experiences and solving
          real-world problems through code.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <a href="#projects" className="btn-primary">
            View My Work
          </a>
          <a href="#contact" className="btn-secondary">
            Get In Touch
          </a>
        </div>
      </div>
    </section>
  );
}