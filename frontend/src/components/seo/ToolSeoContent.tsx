// Texto explicativo + preguntas frecuentes de una herramienta, renderizado en el servidor (visible sin JavaScript para
// buscadores y asistentes de IA). Las herramientas son paginas cliente y sin este bloque casi no tienen texto indexable.

export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolSeoContentProps {
  name: string;
  path: string;
  intro: string;
  steps: string[];
  faqs: ToolFaq[];
  baseUrl: string;
}

export default function ToolSeoContent({
  name,
  path,
  intro,
  steps,
  faqs,
  baseUrl,
}: ToolSeoContentProps) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: baseUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "Herramientas",
        item: `${baseUrl}/herramientas`,
      },
      { "@type": "ListItem", position: 3, name, item: `${baseUrl}${path}` },
    ],
  };
  return (
    <section
      aria-labelledby="como-funciona"
      className="mx-auto max-w-3xl px-4 py-12 text-gray-300"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <h2 id="como-funciona" className="text-2xl font-bold text-white">
        Cómo funciona {name}
      </h2>
      <p className="mt-3 leading-relaxed">{intro}</p>
      <ol className="mt-4 list-decimal space-y-2 pl-6">
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <h2 className="mt-10 text-2xl font-bold text-white">
        Preguntas frecuentes
      </h2>
      <div className="mt-4 space-y-5">
        {faqs.map((faq) => (
          <div key={faq.question}>
            <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
            <p className="mt-1 leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
