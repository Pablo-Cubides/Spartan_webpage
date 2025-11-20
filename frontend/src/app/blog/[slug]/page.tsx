// app/blog/[slug]/page.tsx
export default function PostDetailPage() {
  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-[#181111] dark group/design-root overflow-x-hidden"
      style={{
        fontFamily: 'Newsreader, "Noto Sans", sans-serif',
        // Checkbox SVG para Tailwind (opcional, puede ir en globals.css si lo quieres global)
        ["--checkbox-tick-svg" as string]: "url('data:image/svg+xml,%3csvg viewBox=%270 0 16 16%27 fill=%27rgb(255,255,255)%27 xmlns=%27http://www.w3.org/2000/svg%27%3e%3cpath d=%27M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z%27/%3e%3c/svg%3e')"
      }}
    >
      <div className="flex flex-col h-full layout-container grow">
        {/* SIN HEADER */}

        <div className="flex justify-center flex-1 gap-1 px-6 py-5">
          {/* Main post content */}
          <div className="layout-content-container flex flex-col max-w-[920px] flex-1">
            {/* Breadcrumbs */}
            <div className="flex flex-wrap gap-2 p-4">
              <a className="text-[#ba9c9c] text-base font-medium leading-normal" href="#">Blog</a>
              <span className="text-[#ba9c9c] text-base font-medium leading-normal">/</span>
              <span className="text-base font-medium leading-normal text-white">Mentalidad</span>
            </div>
            {/* Title */}
            <h2 className="text-white tracking-light text-[28px] font-bold leading-tight px-4 text-left pb-3 pt-5">
              Forjar una Mentalidad de Acero: El Camino del Guerrero Moderno
            </h2>
            {/* Metadata */}
            <p className="text-[#ba9c9c] text-sm font-normal leading-normal pb-3 pt-1 px-4">
              Publicado el 15 de Julio de 2024 | Categoría: Mentalidad
            </p>
            {/* Main image */}
            <div className="@container">
              <div className="@[480px]:px-4 @[480px]:py-3">
                <div
                  className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden bg-[#181111] @[480px]:rounded-xl min-h-80"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBGn6-ZtVREo5JQK4wmQBa9SZKaGwhGTxgXHKH76KLodJczkrDBHrQ5NXIc6Xino5IPcDbN5lgzP3AdooO9fANWthLDivxXK9hlp3aNwuvH9jNKaz4N4hYhdTxoxNGk4FhBF9dlvtiu49V2_TD4039fPNVAKkn3froqq8_iGSSzUkEEG_OF0hYMQirBhpWdWHQ0Cp0GGyp5m-JF6X0Ffx6CPNQJcxN6fJA55SPKmJepfZqU0TYl2zYXAdUMu3tBACXisuQtwAbKW31O")'
                  }}
                ></div>
              </div>
            </div>
            {/* Intro */}
            <p className="px-4 pt-1 pb-3 text-base font-normal leading-normal text-white">
              En el mundo actual, lleno de distracciones y desafíos constantes, cultivar una mentalidad fuerte y resiliente es más crucial que nunca. Inspirados en la disciplina y
              el enfoque de los antiguos guerreros espartanos, podemos aprender a forjar una mentalidad de acero que nos permita superar obstáculos y alcanzar nuestras metas con
              determinación inquebrantable.
            </p>
            {/* Section */}
            <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">El Legado de la Resiliencia Espartana</h3>
            <p className="px-4 pt-1 pb-3 text-base font-normal leading-normal text-white">
              Los espartanos eran conocidos por su resistencia física y mental, forjada a través de un entrenamiento riguroso y una vida austera. Su enfoque no estaba en la
              comodidad, sino en la preparación para cualquier adversidad. Esta mentalidad de resiliencia es la base para enfrentar los desafíos de la vida moderna con la misma
              fortaleza.
            </p>
            {/* Section */}
            <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Principios para una Mentalidad de Acero</h3>

            {/* Principios */}
            {[
              "Disciplina Inquebrantable",
              "Enfoque Implacable",
              "Adaptabilidad y Aprendizaje Continuo",
              "Perseverancia ante la Adversidad",
              "Autoconocimiento y Reflexión",
            ].map((label, i) => (
              <div key={label}>
                <div className="flex items-center gap-4 bg-[#181111] px-4 min-h-14">
                  <div className="text-white flex items-center justify-center rounded-lg bg-[#392828] shrink-0 size-10">
                    {/* Check */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                    </svg>
                  </div>
                  <p className="flex-1 text-base font-normal leading-normal text-white truncate">{label}</p>
                </div>
                <p className="px-4 pt-1 pb-3 text-base font-normal leading-normal text-white">
                  {[
                    "La disciplina es el pilar fundamental. Establece rutinas diarias que te impulsen hacia tus objetivos, desde el ejercicio físico hasta el desarrollo personal. La consistencia en tus acciones diarias construye una base sólida para el éxito.",
                    "Elimina las distracciones y concéntrate en tus metas principales. Define prioridades claras y dedica tu tiempo y energía a lo que realmente importa. El enfoque implacable te permite avanzar con determinación hacia tus objetivos.",
                    "La vida está llena de cambios inesperados. Cultiva la capacidad de adaptarte a nuevas situaciones y aprender de cada experiencia, tanto de los éxitos como de los fracasos. El aprendizaje continuo te permite crecer y evolucionar constantemente.",
                    "Los obstáculos son inevitables. La perseverancia es la clave para superar los momentos difíciles. Mantén una actitud positiva, aprende de los errores y sigue adelante con determinación.",
                    "Conócete a ti mismo, tus fortalezas y debilidades. La reflexión regular te permite evaluar tu progreso, ajustar tus estrategias y mantenerte alineado con tus valores y metas."
                  ][i]}
                </p>
              </div>
            ))}

            {/* Acciones prácticas */}
            <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Acciones Prácticas para Forjar tu Mentalidad</h3>
            <div className="px-4">
              {[
                "Establece metas claras y desafiantes que te impulsen a crecer.",
                "Practica la gratitud diaria para mantener una perspectiva positiva.",
                "Visualiza tus éxitos y aprende de tus fracasos.",
              ].map((text, i) => (
                <label key={i} className="flex flex-row py-3 gap-x-3">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-[#543b3b] border-2 bg-transparent text-[#c20909] checked:bg-[#c20909] checked:border-[#c20909] focus:ring-0 focus:ring-offset-0 focus:border-[#543b3b] focus:outline-none"
                  />
                  <p className="text-base font-normal leading-normal text-white">{text}</p>
                </label>
              ))}
            </div>
            {/* Botones */}
            <div className="flex justify-stretch">
              <div className="flex flex-wrap justify-start flex-1 gap-3 px-4 py-3">
                <button
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#c20909] text-white text-sm font-bold leading-normal tracking-[0.015em]"
                >
                  <span className="truncate">Compartir</span>
                </button>
                <button
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#392828] text-white text-sm font-bold leading-normal tracking-[0.015em]"
                >
                  <span className="truncate">Comentar</span>
                </button>
              </div>
            </div>
          </div>
          {/* Artículos relacionados */}
          <div className="layout-content-container flex flex-col w-[360px]">
            <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Artículos Relacionados</h3>
            {[
              {
                title: "El Poder de la Rutina: Construyendo Hábitos de Éxito",
                category: "Desarrollo Personal",
                image:
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuCBxG7aP0jgUeVuT3H-pm5ImR97sVF__XtqG6u9JUOP3taZE44Fm2lX_gzpf31pG2JmcQ5JTXPMrvQFNmVphtswS6VVQuGXRUJnjH5d6rbFY56RsbWf_2DbXyKC2uffIDCsDFCB_gA7qlYe90XOvx8FuutmfHR0jyreMB7dq7XFeYZt0N8d_Q236OckRBoieqpPk8xVm_58Ry6zwg5cVyD1BwxuNPQSclY1WlkO8EbTvyjm0Grx5HDhH_ZZyqqdCjnJ60t0jIoTbkzj"
              },
              {
                title: "Entrenamiento de Alta Intensidad: Desata tu Potencial Físico",
                category: "Fitness",
                image:
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuDhg7U_LLgcdQ2ha5_rldlUZSV6YrFZEvFz6IES78NZt8bgCaCbMuxumrsFS-elPjPIATn-jE6ijJ6rqWRz0CAuRi2ZwMsaRQK3GcMxDKSZ08uxf3tmlM3z4BBBQvfWIvHjoDanMkxmnzzDaI9APr70Jjdql_V4otz6U3WNJ3MGMfF-W-Y_AkLZNy_tVLPGfNHJNlTLjiuhh80ewk13Ca1MDcTQ8AdUxHEmf0uExMtr4E8fT9OKHa9b7-p9jLp1VkbRCqv2w2p66gub"
              },
              {
                title: "La Dieta del Guerrero: Combustible para el Cuerpo y la Mente",
                category: "Nutrición",
                image:
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuCtTPyBPDNkSvK55CW5629uL-SQgUGbNIdWYiwlp4bz8AOMPhafQNN2SkP7p8l5kgDoMdpazNLlB3KYjEiCUSmSg5pYl4J9CKzNwuautba-pX45kbnPLl5I-SfCg3C-faPVCR0oyQxL8JcnD_wDSv_AcPPJ66mzZPq46HGS_DGKaJMF-BQKqpk-Wo2WfBofw__uCkHOtWDJyiNUq3r6ATOISbXpAwSqciNBT_KE6g0bMaF4u0_ONqatygX-UJzSKpmT2O4nAvtMpGRz"
              }
            ].map((art, i) => (
              <div key={i} className="flex items-center gap-4 bg-[#181111] px-4 py-3">
                <div
                  className="bg-center bg-no-repeat bg-cover rounded-lg aspect-video h-14 w-fit"
                  style={{ backgroundImage: `url("${art.image}")` }}
                ></div>
                <div className="flex flex-col justify-center">
                  <p className="text-base font-medium leading-normal text-white line-clamp-1">{art.title}</p>
                  <p className="text-[#ba9c9c] text-sm font-normal leading-normal line-clamp-2">{art.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
