import { useEffect, useRef, useState } from "react";
import {
  Anchor,
  ArrowDownRight,
  BarChart3,
  ChevronRight,
  Fish,
  FlaskConical,
  Mail,
  Menu,
  Microscope,
  Ruler,
  ShipWheel,
  Waves,
  X,
} from "lucide-react";
import { site } from "./site";

const asset = (name: string) => `${import.meta.env.BASE_URL}assets/${name}`;

function AnimatedValue({ value }: { value: string }) {
  const elementRef = useRef<HTMLElement>(null);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const match = value.match(/^(\d+)(.*)$/);
    if (!match) {
      setDisplay(value);
      return;
    }

    const target = Number(match[1]);
    const suffix = match[2];
    const element = elementRef.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }

    let animationFrame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      const startedAt = performance.now();
      const animate = (now: number) => {
        const progress = Math.min((now - startedAt) / 1200, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(`${Math.round(target * eased)}${suffix}`);
        if (progress < 1) animationFrame = window.requestAnimationFrame(animate);
      };
      animationFrame = window.requestAnimationFrame(animate);
      observer.disconnect();
    }, { threshold: 0.55 });
    observer.observe(element);

    return () => {
      observer.disconnect();
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [value]);

  return <strong ref={elementRef}>{display}</strong>;
}

function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, []);

  return (
    <header className="site-header">
      <a className="brand" href="#inicio" aria-label="Proyecto Monodon, ir al inicio">
        <span>Proyecto</span>
        <span>Monodon</span>
      </a>

      <nav className="desktop-nav" aria-label="Navegación principal">
        {site.nav.map((item) => (
          <a key={item.href} href={item.href}>{item.label}</a>
        ))}
      </nav>

      <a className="header-cta" href="#contacto">Conocer más <ArrowDownRight size={16} /></a>

      <button
        className="menu-button"
        type="button"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X /> : <Menu />}
      </button>

      {open && (
        <nav className="mobile-nav" aria-label="Navegación móvil">
          {site.nav.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}<ChevronRight size={18} />
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}

function App() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    const hero = document.querySelector<HTMLElement>(".hero");
    let frame = 0;
    const updateHero = () => {
      frame = 0;
      if (!hero) return;
      const travel = Math.min(window.scrollY, hero.offsetHeight);
      hero.style.setProperty("--hero-image-y", `${travel * 0.12}px`);
      hero.style.setProperty("--hero-content-y", `${travel * 0.045}px`);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateHero);
    };

    const selectors = [
      ".quick-card", ".project-grid > *", ".study-area-heading > *", ".study-area-figure",
      ".identification-copy", ".identification-figure", ".comparison-heading > *", ".species-card",
      ".method-heading", ".method-steps article", ".results-heading > *", ".stat-card",
      ".evidence-grid > *", ".content-strip-heading > *", ".content-cards article",
      ".team-intro", ".team-list article", ".contact-layout > *",
    ];
    const elements = document.querySelectorAll<HTMLElement>(selectors.join(","));
    document.documentElement.classList.add("motion-ready");
    elements.forEach((element) => element.classList.add("scroll-reveal"));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -7%" });
    elements.forEach((element) => observer.observe(element));

    updateHero();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      document.documentElement.classList.remove("motion-ready");
    };
  }, []);

  return (
    <div className="site-shell">
      <Header />

      <main>
        <section className="hero" id="inicio">
          <img
            className="hero-image"
            src={asset("hero-monodon.png")}
            alt=""
            aria-hidden="true"
          />
          <div className="hero-backdrop" aria-hidden="true" />
          <div className="hero-content">
            <p className="eyebrow hero-reveal delay-1">Proyecto de investigación · Bahía de Samaná</p>
            <h1 className="hero-reveal delay-2">Proyecto<br />Monodon</h1>
            <p className="hero-tagline hero-reveal delay-3">Ciencia para conocerlo,<br />datos para comprenderlo.</p>
            <p className="hero-copy hero-reveal delay-4">
              Estudiamos la distribución y el potencial reproductivo del camarón tigre gigante
              (<i>Penaeus monodon</i>) para aportar evidencia científica a su manejo.
            </p>
            <div className="hero-actions hero-reveal delay-4">
              <a className="button button-coral" href="#proyecto">Conoce el proyecto</a>
              <a className="button button-ghost" href="#resultados">Ver resultados</a>
            </div>
          </div>
          <p className="species-label"><i>Penaeus monodon</i> Fabricius, 1798</p>
          <div className="tide-edge" aria-hidden="true" />
        </section>

        <section className="project-section" id="proyecto">
          <div className="quick-cards wrap">
            <article className="quick-card">
              <div className="quick-icon"><Fish /></div>
              <div><h3>Conocer la especie</h3><p>Origen, biología y adaptación en ambientes costeros.</p></div>
            </article>
            <article className="quick-card">
              <div className="quick-icon"><Microscope /></div>
              <div><h3>Ciencia en acción</h3><p>Muestreo, medición y análisis con rigor científico.</p></div>
            </article>
            <article className="quick-card accent-card">
              <div className="quick-icon"><ShipWheel /></div>
              <div><h3>Manejo responsable</h3><p>Evidencia para orientar decisiones y acciones de control.</p></div>
            </article>
          </div>

          <div className="project-grid wrap">
            <div className="section-copy">
              <p className="eyebrow dark">El proyecto</p>
              <h2>Conocer para manejar</h2>
              <p className="lead">
                El camarón tigre gigante es una especie exótica invasora registrada en diferentes
                zonas costeras de la República Dominicana.
              </p>
              <p>
                Su presencia frecuente en las capturas artesanales de Samaná plantea nuevas preguntas
                sobre su distribución, reproducción y establecimiento en la bahía.
              </p>
              <ul className="impact-list">
                <li><Waves /><span><strong>Biodiversidad marina</strong>Puede competir por espacio y recursos con especies nativas.</span></li>
                <li><Anchor /><span><strong>Pesca artesanal</strong>Su presencia tiene implicaciones ambientales y socioeconómicas.</span></li>
                <li><BarChart3 /><span><strong>Ciencia para decidir</strong>Los datos permiten orientar vigilancia, manejo y control.</span></li>
              </ul>
            </div>

            <figure className="field-figure">
              <img src={asset("field-research.jpg")} alt="Pescador artesanal en una embarcación de la bahía de Samaná" />
              <figcaption>La investigación conecta evidencia científica y conocimiento del territorio.</figcaption>
            </figure>
          </div>

          <div className="study-area wrap" id="area-estudio">
            <div className="study-area-heading">
              <div>
                <p className="eyebrow dark">Área de estudio</p>
                <h2>Una bahía observada desde sus desembarques</h2>
              </div>
              <p>
                El monitoreo conecta los principales puntos de desembarque de Samaná con el trabajo
                directo de pescadores artesanales y el registro sistemático de las capturas.
              </p>
            </div>
            <figure className="study-area-figure">
              <a href={asset("area-estudio-samana.jpg")} target="_blank" rel="noreferrer" aria-label="Ampliar el mapa del área de estudio">
                <img
                  src={asset("area-estudio-samana.jpg")}
                  alt="Mapa del área de estudio y sitios de desembarque monitoreados en Samaná, acompañado por un pescador artesanal"
                />
              </a>
              <figcaption>Área de estudio y sitios de desembarque contemplados por el proyecto. Toca la imagen para ampliarla.</figcaption>
            </figure>
          </div>

          <div className="identification-band">
            <div className="wrap identification-layout">
              <div className="identification-copy">
                <p className="eyebrow light">Reconocer para comprender</p>
                <h2>Conoce al Monodon</h2>
                <p>
                  Su gran tamaño y el patrón de bandas transversales permiten diferenciarlo visualmente
                  de otros camarones. La confirmación debe realizarse utilizando criterios taxonómicos.
                </p>
              </div>
              <figure className="identification-figure">
                <img src={asset("identification-monodon.png")} alt="Representación visual del camarón tigre gigante" />
                <span className="callout callout-a">Bandas transversales</span>
                <span className="callout callout-b">Antenas alargadas</span>
                <span className="callout callout-c">Gran tamaño corporal</span>
              </figure>
            </div>

            <div className="wrap comparison-block">
              <div className="comparison-heading">
                <div>
                  <p className="eyebrow light">Comparación con especies nativas</p>
                  <h2>No todos los camarones son Monodon</h2>
                </div>
                <p>
                  La coloración ayuda a orientar la observación, pero la identificación definitiva
                  requiere revisar el rostro, las carenas y otros caracteres taxonómicos.
                </p>
              </div>

              <div className="comparison-grid">
                <article className="species-card invasive-species">
                  <div className="species-image">
                    <img src={asset("identification-monodon.png")} alt="Representación de Penaeus monodon con bandas transversales oscuras y amarillas" />
                    <span>Exótica invasora</span>
                  </div>
                  <div className="species-content">
                    <p>Camarón tigre gigante</p>
                    <h3><i>Penaeus monodon</i></h3>
                    <ul>
                      <li>Bandas transversales oscuras y amarillo pálido muy visibles.</li>
                      <li>Puede alcanzar cerca de 33–34 cm y supera ampliamente a las especies locales.</li>
                      <li>Rostro con 6–8 dientes dorsales y 3 ventrales.</li>
                    </ul>
                    <strong>248,000–811,000 huevos por desove</strong>
                  </div>
                </article>

                <article className="species-card">
                  <div className="species-image">
                    <img src={asset("native-litopenaeus-schmitti.jpg")} alt="Representación visual del camarón blanco sureño Litopenaeus schmitti" />
                    <span>Especie nativa</span>
                  </div>
                  <div className="species-content">
                    <p>Camarón blanco sureño</p>
                    <h3><i>Litopenaeus schmitti</i></h3>
                    <ul>
                      <li>Cuerpo blanco translúcido, a veces azulado, grisáceo o verdoso.</li>
                      <li>Aspecto vidrioso y sin las bandas oscuras marcadas del Monodon.</li>
                      <li>Rostro largo y delgado, con una punta estrecha y prolongada.</li>
                    </ul>
                    <strong>68,000–310,000 huevos por desove</strong>
                  </div>
                </article>

                <article className="species-card farfante-card">
                  <div className="species-image">
                    <img src={asset("native-farfantepenaeus.jpg")} alt="Representación visual de un camarón del género Farfantepenaeus" />
                    <span>Especies nativas</span>
                  </div>
                  <div className="species-content">
                    <p>Camarones rosados</p>
                    <h3><i>Farfantepenaeus</i></h3>
                    <ul>
                      <li><i>F. notialis</i>: camarón rosado sureño; 440,000–668,000 huevos por desove.</li>
                      <li><i>F. duorarum</i>: camarón rosado norteño; 85,900–230,700 huevos por desove.</li>
                      <li>Tonos rosados, pardos o rojizos y ausencia de bandas “tigre”.</li>
                    </ul>
                    <strong>Se diferencian examinando carenas y surcos abdominales</strong>
                  </div>
                </article>
              </div>

              <p className="comparison-note">
                Las imágenes de las especies locales son representaciones visuales. La primera corresponde
                a <i>Litopenaeus schmitti</i>; la segunda representa el grupo <i>Farfantepenaeus</i> y no debe
                utilizarse por sí sola para separar <i>F. notialis</i> de <i>F. duorarum</i>.
              </p>
            </div>
          </div>

          <div className="method-band">
            <div className="wrap method-inner">
              <div className="method-heading">
                <p className="eyebrow light">Investigación en acción</p>
                <h2>Del desembarque<br />a la evidencia</h2>
              </div>
              <div className="method-steps">
                <article><span>01</span><FlaskConical /><h3>Monitorear</h3><p>Documentamos capturas en sitios de desembarque.</p></article>
                <article><span>02</span><Ruler /><h3>Medir</h3><p>Registramos talla, peso, sexo y madurez reproductiva.</p></article>
                <article><span>03</span><BarChart3 /><h3>Interpretar</h3><p>Analizamos distribución y estructura poblacional.</p></article>
              </div>
            </div>
          </div>
        </section>

        <section className="results-section" id="resultados">
          <div className="wrap">
            <div className="results-heading">
              <div>
                <p className="eyebrow dark">Agosto 2024 — abril 2026</p>
                <h2>Samaná en datos</h2>
              </div>
              <p>Los registros muestran una presencia recurrente de <i>Penaeus monodon</i> y señales de reclutamiento local activo.</p>
            </div>

            <div className="stats-grid">
              {site.stats.map((stat, index) => (
                <article className={`stat-card stat-${index + 1}`} key={stat.label}>
                  <span className="stat-index">0{index + 1}</span>
                  <AnimatedValue value={stat.value} />
                  <p>{stat.label}</p>
                </article>
              ))}
            </div>

            <div className="evidence-grid">
              <figure className="specimen-card">
                <img src={asset("specimens.jpg")} alt="Ejemplares de camarón organizados para su análisis" />
                <figcaption>Ejemplares registrados durante el trabajo de campo.</figcaption>
              </figure>

              <article className="finding-card">
                <span className="finding-kicker">Hallazgo principal</span>
                <h3>Diferentes etapas de vida dentro de la bahía</h3>
                <p>
                  La presencia de individuos adolescentes, preadultos y adultos evidencia una estructura
                  poblacional diversa. También se observaron hembras en etapas avanzadas de madurez,
                  especialmente durante enero–febrero y octubre–noviembre.
                </p>
              </article>

              <article className="control-card">
                <div className="control-icon"><ShipWheel /></div>
                <span className="finding-kicker">Próxima pregunta</span>
                <h3>Una posible herramienta de control</h3>
                <p>
                  El proyecto evalúa una pesquería artesanal dirigida a la especie, acompañada de monitoreo
                  biológico, coordinación institucional y manejo responsable de las artes de pesca.
                </p>
              </article>
            </div>

            <div className="content-strip">
              <div className="content-strip-heading">
                <div>
                  <p className="eyebrow dark">Divulgación científica</p>
                  <h2>Contenido del proyecto</h2>
                </div>
                <p>Recursos visuales para acercar la especie, el trabajo de campo y los resultados a distintos públicos.</p>
              </div>
              <div className="content-cards">
                <article>
                  <img src={asset("content-species.png")} alt="Paisaje costero de la bahía de Samaná" />
                  <div><span>Territorio</span><h3>La bahía de Samaná</h3><p>El escenario costero donde se desarrolla el monitoreo científico.</p></div>
                </article>
                <article>
                  <img src={asset("content-field.png")} alt="Camarones organizados para su medición" />
                  <div><span>Investigar</span><h3>Medir para comprender</h3><p>Talla, peso, sexo y madurez registrados en cada muestreo.</p></div>
                </article>
                <article>
                  <img src={asset("conocimiento-territorio.jpg")} alt="Pescador artesanal preparando sus redes en la bahía de Samaná" />
                  <div><span>Colaborar</span><h3>Conocimiento del territorio</h3><p>La pesca artesanal aporta contexto a la evidencia científica.</p></div>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section className="team-section" id="equipo">
          <div className="wrap team-layout">
            <div className="team-intro">
              <p className="eyebrow light">Equipo e instituciones</p>
              <h2>Una investigación colaborativa</h2>
              <p>Capacidades científicas, técnicas e institucionales unidas para estudiar la especie desde una perspectiva biológica, pesquera y comunitaria.</p>
              <div className="official-project-title">
                <span>Título oficial del proyecto</span>
                <p>
                  Distribución y potencial reproductivo de <i>Penaeus monodon</i> en Samaná:
                  Hacia una pesquería de control de esta especie invasora.
                </p>
              </div>
              <div className="institution-logos" aria-label="Instituciones participantes y financiadoras">
                <figure className="institution-logo institution-logo-unphu">
                  <img src={asset("logo-unphu-60-white.png")} alt="UNPHU, 60 aniversario" />
                  <figcaption>Institución ejecutora</figcaption>
                </figure>
                <figure className="institution-logo institution-logo-uasd">
                  <img src={asset("logo-uasd-white-complete.png")} alt="Universidad Autónoma de Santo Domingo" />
                  <figcaption>Institución colaboradora</figcaption>
                </figure>
                <figure className="institution-logo institution-logo-codopesca">
                  <img src={asset("logo-codopesca-white.png")} alt="Consejo Dominicano de Pesca y Acuicultura" />
                  <figcaption>Institución colaboradora</figcaption>
                </figure>
                <figure className="institution-logo institution-logo-mescyt">
                  <img src={asset("logo-mescyt-white.png")} alt="Ministerio de Educación Superior, Ciencia y Tecnología" />
                  <figcaption>Financiamiento FONDOCYT</figcaption>
                </figure>
              </div>
              <p className="funding">Proyecto FONDOCYT–UNPHU No. 2023-1-1C2-0661</p>
            </div>
            <div className="team-list">
              {site.team.map((member, index) => (
                <article key={member.name}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div><h3>{member.name}</h3><p>{member.role}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="contact-section" id="contacto">
          <div className="wrap contact-layout">
            <div>
              <p className="eyebrow dark">Contacto</p>
              <h2>Conversemos sobre el proyecto</h2>
              <p>Conoce más sobre la investigación, sus resultados y sus materiales de divulgación.</p>
              <a className="email-link" href="mailto:investigaciones@unphu.edu.do"><Mail size={18} /> investigaciones@unphu.edu.do</a>
            </div>

            <aside className="contact-card" aria-label="Información de contacto">
              <span>Proyecto FONDOCYT–UNPHU</span>
              <h3>Investigación, resultados y materiales de divulgación</h3>
              <p>Escríbenos para solicitar información institucional sobre el proyecto.</p>
              <a className="button button-coral" href="mailto:investigaciones@unphu.edu.do?subject=Consulta%20sobre%20el%20Proyecto%20Monodon">
                Escribir por correo <ArrowDownRight size={18} />
              </a>
            </aside>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap footer-inner">
          <div className="brand footer-brand"><span>Proyecto</span><span>Monodon</span></div>
          <p>Investigación para la conservación y el manejo sostenible de la bahía de Samaná.</p>
          <p>Universidad Nacional Pedro Henríquez Ureña</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
