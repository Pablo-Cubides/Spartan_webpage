"use client";
import { useState } from "react";

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar búsqueda
    console.log("Buscando:", searchTerm);
  };

  const handleReadMore = (articleId: string) => {
    // Implementar navegación al artículo
    console.log("Leer artículo:", articleId);
  };

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-[#121416] dark group/design-root overflow-x-hidden"
      style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}
    >
      <div className="flex flex-col h-full layout-container grow">
        {/* SIN HEADER */}

        <div className="flex justify-center flex-1 px-40 py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Title */}
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-white text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">
                Blog de Transformación
              </p>
            </div>

            {/* Hero Image/Carousel */}
            <div className="@container">
              <div className="@[480px]:px-4 @[480px]:py-3">
                <div
                  className="bg-cover bg-center flex flex-col justify-end overflow-hidden bg-[#121416] @[480px]:rounded-xl min-h-80"
                  style={{
                    backgroundImage:
                      'linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 25%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuCTIN_nTSSE1sTcrJLsIRVi4gX8DVE-fsObRwG6aaWWVIFlwOfbPIF-JlNz8pHxfPXr0WJfqZcXs5uvn16aqGDOt-QU2E2Oo7WVUhhk1ej9AIpIGT9SGrtLnp3vqibDkB3hlyhqsVhMJfxUBASPjnWTLSn_jSuAvAJkADJA7Fnsh5NcdRznJaQ6G9hGmqbJwrxZOE-06ghtjzgjqruDDq_ETDsKg75Smd0bksTHNkBSYCvq0sMlpPsT9DBhYORYwf6gtgpCmgNOqMxh")',
                  }}
                >
                  <div className="flex justify-center gap-2 p-5">
                    <div className="size-1.5 rounded-full bg-[#121416]"></div>
                    <div className="size-1.5 rounded-full bg-[#121416] opacity-50"></div>
                    <div className="size-1.5 rounded-full bg-[#121416] opacity-50"></div>
                    <div className="size-1.5 rounded-full bg-[#121416] opacity-50"></div>
                    <div className="size-1.5 rounded-full bg-[#121416] opacity-50"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Input */}
            <div className="px-4 py-3">
              <form onSubmit={handleSearch}>
                <label className="flex flex-col w-full h-12 min-w-40">
                  <div className="flex items-stretch flex-1 w-full h-full rounded-xl">
                    <div className="text-[#a2aab3] flex border-none bg-[#2c3035] items-center justify-center pl-4 rounded-l-xl border-r-0">
                      {/* Lupa */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                        <path
                          d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"
                        ></path>
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar en el blog"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border-none bg-[#2c3035] focus:border-none h-full placeholder:text-[#a2aab3] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                    />
                  </div>
                </label>
              </form>
            </div>

            {/* Destacados */}
            <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Artículos Destacados
            </h2>

            {/* Artículos */}
            <div className="p-4">
              <div className="flex items-stretch justify-between gap-4 rounded-xl">
                <div className="flex flex-[2_2_0px] flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-base font-bold leading-tight text-white">
                      El Camino del Guerrero: Disciplina y Resiliencia
                    </p>
                    <p className="text-[#a2aab3] text-sm font-normal leading-normal">
                      Descubre cómo la disciplina y la resiliencia son fundamentales para alcanzar tus metas y superar los desafíos de la vida.
                    </p>
                  </div>
                  <button
                    onClick={() => handleReadMore("guerrero-disciplina")}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 flex-row-reverse bg-[#2c3035] text-white text-sm font-medium leading-normal w-fit hover:bg-[#3c4045] transition-colors"
                  >
                    <span className="truncate">Leer más</span>
                  </button>
                </div>
                <div
                  className="flex-1 w-full bg-center bg-no-repeat bg-cover aspect-video rounded-xl"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBHiUzgHITOlQUdFps-GVS9-ehgO87aOb8dBkid5D_0hGE4jW2W4Bi6OTAL4nwcbxvdIgdsCneyE58PoO8nvifKICNyZ6WTUAXlNp3CHGD22ODcZLzXpiFPHHevaSrX_gl1lNKS4n4jOTxR3vuvjw9DkpSNfBf5y6X7fjUVKAQLtg3aUePOr31BdwEHl1EDsT_DkP-JrMedkCT3UspMGyszNVj46_L_4PlzhzYtwjldqPOvKhydxvi5DLLxfWhYpxEAoaCOOYmWU_F-")',
                  }}
                ></div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-stretch justify-between gap-4 rounded-xl">
                <div className="flex flex-[2_2_0px] flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-base font-bold leading-tight text-white">
                      Forjando el Carácter: Superando Obstáculos
                    </p>
                    <p className="text-[#a2aab3] text-sm font-normal leading-normal">
                      Aprende a convertir los obstáculos en oportunidades de crecimiento y a forjar un carácter inquebrantable.
                    </p>
                  </div>
                  <button
                    onClick={() => handleReadMore("forjando-caracter")}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 flex-row-reverse bg-[#2c3035] text-white text-sm font-medium leading-normal w-fit hover:bg-[#3c4045] transition-colors"
                  >
                    <span className="truncate">Leer más</span>
                  </button>
                </div>
                <div
                  className="flex-1 w-full bg-center bg-no-repeat bg-cover aspect-video rounded-xl"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAhqk-TrdshTj9S3zOIiV0fyLrq2vRs6pRUr4yCR5z7ZTrlKsW5Mu7GQbc_lh7RFqEs_oEVtP0AkZUvMo7akYUsH_aKOGNjJXNT-xXi9dGhqmYn_Zzxh6m3X2xVuVqpagMO3zi-6OWZpjypdFF4xXnWtnnkGFeRsFwxsBRrxEIiOHuedqYzDAJRiKf0ZDnY9YErLFquyh1PuOYR4SRxqYkJgMWnjEf_FM-DLev29Ddu_p19Pzv1OhNJPSoADhBSLlQSkg4ZGfmGZ1Is")',
                  }}
                ></div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-stretch justify-between gap-4 rounded-xl">
                <div className="flex flex-[2_2_0px] flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-base font-bold leading-tight text-white">
                      Mente de Acero: Estrategias para el Éxito
                    </p>
                    <p className="text-[#a2aab3] text-sm font-normal leading-normal">
                      Domina tu mente y desarrolla estrategias efectivas para alcanzar el éxito en todas las áreas de tu vida.
                    </p>
                  </div>
                  <button
                    onClick={() => handleReadMore("mente-acero")}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 flex-row-reverse bg-[#2c3035] text-white text-sm font-medium leading-normal w-fit hover:bg-[#3c4045] transition-colors"
                  >
                    <span className="truncate">Leer más</span>
                  </button>
                </div>
                <div
                  className="flex-1 w-full bg-center bg-no-repeat bg-cover aspect-video rounded-xl"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDCWU79MgsUe-mzMoHnDkCuGLpbTmh_0rk6g6VhwYk8UjNTFiij3Z5RKCkDhH6_K7V8wzOLL6Rtdtv4O1lwlKPBQNe00lhi6SP34UtkQlIMES_cNLnlMslmjUtRF4iWxgxy7bnMummHhsdS1SFqDWBxWGTRUxMr0I0n-wDMpvyrDojGeqGb9Vmo3Qdd3hSjjc7gEZKzqu0T8FSPN456BrrJU0uJ8eVJxJ_cperpBI9pIbs7KwYHoNfsbFH_MHTbRktdAooI4cMcbrum")',
                  }}
                ></div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-stretch justify-between gap-4 rounded-xl">
                <div className="flex flex-[2_2_0px] flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-base font-bold leading-tight text-white">
                      El Legado del Líder: Inspirando a Otros
                    </p>
                    <p className="text-[#a2aab3] text-sm font-normal leading-normal">
                      Inspírate en los grandes líderes y aprende a motivar e influir positivamente en los demás.
                    </p>
                  </div>
                  <button
                    onClick={() => handleReadMore("legado-lider")}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 flex-row-reverse bg-[#2c3035] text-white text-sm font-medium leading-normal w-fit hover:bg-[#3c4045] transition-colors"
                  >
                    <span className="truncate">Leer más</span>
                  </button>
                </div>
                <div
                  className="flex-1 w-full bg-center bg-no-repeat bg-cover aspect-video rounded-xl"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBNeMcHKVXroWyIHBSXUU1dQDgVDCGcgdx7KImZiE4HOq0baynFEeqrXpPfEmNOLYbjHPaC0dES-eUafU0ezVgvsms51XHb7ijwNAgF4LjvFFKBawifUh8ooBdRTBudZa6raHIRiVVBuyBtF34gibWOzeeGazfAFqf1OuzxLPEMM0IF6u1V-t38M-BszdVOCuZfUIL04GSG-AzHb1bam3NiCuhUEEjSZEb_o1iERQizIZ85l3d2WRh776CKOD7D21GcNJ8NgGm1U87C")',
                  }}
                ></div>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center p-4">
              <button className="flex items-center justify-center size-10 hover:bg-[#2c3035] rounded-full transition-colors">
                {/* Caret Left */}
                <div className="text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"></path>
                  </svg>
                </div>
              </button>
              <button className="text-sm font-bold leading-normal tracking-[0.015em] flex size-10 items-center justify-center text-white rounded-full bg-[#2c3035] hover:bg-[#3c4045] transition-colors">1</button>
              <button className="flex items-center justify-center text-sm font-normal leading-normal text-white rounded-full size-10 hover:bg-[#2c3035] transition-colors">2</button>
              <button className="flex items-center justify-center text-sm font-normal leading-normal text-white rounded-full size-10 hover:bg-[#2c3035] transition-colors">3</button>
              <span className="flex items-center justify-center text-sm font-normal leading-normal text-white rounded-full size-10">...</span>
              <button className="flex items-center justify-center text-sm font-normal leading-normal text-white rounded-full size-10 hover:bg-[#2c3035] transition-colors">10</button>
              <button className="flex items-center justify-center size-10 hover:bg-[#2c3035] rounded-full transition-colors">
                {/* Caret Right */}
                <div className="text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path>
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
