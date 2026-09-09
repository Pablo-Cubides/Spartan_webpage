"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import {
  FileText,
  CheckCircle2,
  Clock,
  PauseCircle,
  Bot,
  Search,
  Plus,
  Key,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Play,
  Pause,
  RefreshCw,
  Sparkles,
  Layers,
  AlertTriangle,
  X,
} from "lucide-react";

interface BlogArticle {
  id: number | string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  category_slug: string;
  category_name?: string;
  author: {
    name: string;
  };
  published_at: string;
  created_at: string;
  status: "published" | "scheduled" | "paused" | "draft";
  source: "agent" | "manual" | "static";
  reading_time: string;
}

interface BlogMetrics {
  total: number;
  published: number;
  scheduled: number;
  paused: number;
  byAgent: number;
}

const CATEGORIES = [
  { slug: "all", name: "Todas las dimensiones" },
  {
    slug: "entrenamiento-y-energia-fisica",
    name: "Cuerpo Triarvon",
    color: "from-red-600 to-orange-500",
  },
  {
    slug: "estilo-y-presencia",
    name: "Estilo Triarvon",
    color: "from-blue-600 to-indigo-500",
  },
  {
    slug: "mentalidad-y-disciplina",
    name: "Mentalidad Triarvon",
    color: "from-purple-600 to-pink-500",
  },
  {
    slug: "productividad-y-gestion-del-tiempo",
    name: "Productividad Triarvon",
    color: "from-green-600 to-teal-500",
  },
];

export default function AdminBlogManagement() {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [metrics, setMetrics] = useState<BlogMetrics>({
    total: 0,
    published: 0,
    scheduled: 0,
    paused: 0,
    byAgent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");

  // Modals state
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<
    number | string | null
  >(null);
  const [actionLoadingId, setActionLoadingId] = useState<
    number | string | null
  >(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<
    "python" | "node" | "curl"
  >("python");

  // New manual article form state
  const [manualForm, setManualForm] = useState({
    title: "",
    category_slug: "entrenamiento-y-energia-fisica",
    content: "",
    excerpt: "",
    cover_image: "",
    status: "published" as "published" | "scheduled" | "paused",
  });
  const [submittingManual, setSubmittingManual] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  // Fetch articles from API
  const fetchArticles = async () => {
    try {
      setLoading(true);
      const token =
        (await auth?.currentUser?.getIdToken()) || "triarvon-agent-key-2026";

      const res = await fetch("/api/admin/blog/articles", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
        if (data.metrics) {
          setMetrics(data.metrics);
        }
      }
    } catch (error) {
      console.error("Error cargando artículos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // 1-Click Toggle: Publish / Pause
  const handleToggleStatus = async (article: BlogArticle) => {
    const nextStatus = article.status === "published" ? "paused" : "published";
    setActionLoadingId(article.id);

    try {
      const token =
        (await auth?.currentUser?.getIdToken()) || "triarvon-agent-key-2026";
      const res = await fetch(`/api/admin/blog/articles/${article.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        // Optimistic UI update
        setArticles((prev) =>
          prev.map((a) =>
            a.id === article.id ? { ...a, status: nextStatus } : a,
          ),
        );
        // Recalculate metrics
        setMetrics((prev) => ({
          ...prev,
          published:
            nextStatus === "published"
              ? prev.published + 1
              : Math.max(0, prev.published - 1),
          paused:
            nextStatus === "paused"
              ? prev.paused + 1
              : Math.max(0, prev.paused - 1),
        }));
      }
    } catch (err) {
      console.error("Error alternando estado:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete article
  const handleDeleteArticle = async (id: number | string) => {
    setActionLoadingId(id);
    try {
      const token =
        (await auth?.currentUser?.getIdToken()) || "triarvon-agent-key-2026";
      const res = await fetch(`/api/admin/blog/articles/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== id));
        setMetrics((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
        }));
        setDeleteConfirmId(null);
      }
    } catch (err) {
      console.error("Error eliminando artículo:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Create manual article submit
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingManual(true);
    setManualError(null);

    try {
      const token =
        (await auth?.currentUser?.getIdToken()) || "triarvon-agent-key-2026";
      const res = await fetch("/api/admin/blog/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(manualForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.message || data.error || "Error al crear artículo.",
        );
      }

      setShowManualModal(false);
      setManualForm({
        title: "",
        category_slug: "entrenamiento-y-energia-fisica",
        content: "",
        excerpt: "",
        cover_image: "",
        status: "published",
      });
      fetchArticles();
    } catch (err: unknown) {
      setManualError(
        err instanceof Error ? err.message : "Error al crear artículo.",
      );
    } finally {
      setSubmittingManual(false);
    }
  };

  // Copy helper
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Filtered articles
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = article.title.toLowerCase().includes(q);
        const matchSlug = article.slug.toLowerCase().includes(q);
        const matchAuthor = article.author?.name?.toLowerCase().includes(q);
        if (!matchTitle && !matchSlug && !matchAuthor) return false;
      }

      // Category
      if (
        selectedCategory !== "all" &&
        article.category_slug !== selectedCategory
      ) {
        return false;
      }

      // Status
      if (selectedStatus !== "all" && article.status !== selectedStatus) {
        return false;
      }

      // Source
      if (selectedSource !== "all" && article.source !== selectedSource) {
        return false;
      }

      return true;
    });
  }, [articles, searchQuery, selectedCategory, selectedStatus, selectedSource]);

  const endpointUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/admin/blog/articles`
      : "https://triarvon.com/api/admin/blog/articles";
  const apiKey = "triarvon-agent-key-2026";

  const codeSnippets = {
    python: `# Script para publicar desde tu Agente (Python / CrewAI / LangChain)
import requests

ENDPOINT = "${endpointUrl}"
API_KEY = "${apiKey}"

payload = {
    "title": "Protocolo de 4 Semanas para Recomposición Corporal",
    "category_slug": "entrenamiento-y-energia-fisica",
    "content": """## Fundamentos de la Recomposición
Entrenar con intensidad y ajustar el timing de nutrientes permite ganar músculo y perder grasa a la vez.

## 1. El Déficit Calórico Controlado
Mantén un déficit del 10-15% para no perder rendimiento.

## 2. Ingesta de Proteína Óptima
Asegura 2.0g por kg de peso corporal.""",
    "excerpt": "Estrategia integral para ganar músculo y quemar grasa simultáneamente con bases científicas.",
    "status": "published",
    "author_name": "Agente Spartan Alpha"
}

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

response = requests.post(ENDPOINT, json=payload, headers=headers)
print("Estado:", response.status_code)
print("Respuesta:", response.json())`,

    node: `// Ejemplo en Node.js / TypeScript (Fetch API)
const ENDPOINT = "${endpointUrl}";
const API_KEY = "${apiKey}";

async function publishArticle() {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${API_KEY}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: "Mentalidad Estoica: Dominando la Presión en Momentos Críticos",
      category_slug: "mentalidad-y-disciplina",
      content: "## Introducción\\nEl autocontrol no es reprimir emociones, sino dominarlas deliberadamente...",
      excerpt: "Aprende a mantener la calma y el enfoque absoluto bajo situaciones de máxima presión.",
      status: "published",
      author_name: "Agente IA Triarvon",
    }),
  });

  const data = await res.json();
  console.log("Artículo publicado:", data);
}

publishArticle();`,

    curl: `# Envío rápido desde terminal o script Bash
curl -X POST "${endpointUrl}" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Optimización del Tiempo: Bloques de Trabajo Profundo",
    "category_slug": "productividad-y-gestion-del-tiempo",
    "content": "## La Regla de los 90 Minutos\\nEl cerebro humano opera en ciclos ultradianos...",
    "excerpt": "Estrategias para alcanzar hiperenfoque y eliminar distracciones laborales.",
    "status": "published"
  }'`,
  };

  return (
    <div className="min-h-screen pb-16 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Gestor de Artículos del Blog
            </h1>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
              Triarvon Club
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Controla publicaciones, supervisa envíos de tus agentes de IA y
            administra el contenido público en 1 clic.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAgentModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold hover:from-purple-500 hover:to-indigo-500 transition shadow-lg shadow-purple-900/20"
          >
            <Bot className="w-4 h-4" />
            Acceso para Agentes IA
          </button>

          <button
            onClick={() => setShowManualModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition shadow-lg shadow-red-900/20"
          >
            <Plus className="w-4 h-4" />
            Nuevo Artículo Manual
          </button>

          <button
            onClick={fetchArticles}
            disabled={loading}
            className="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 transition border border-gray-700 disabled:opacity-50"
            title="Refrescar lista"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total */}
        <div className="bg-gray-850 bg-gray-900/80 border border-gray-800 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-gray-400 font-bold">
              Total Artículos
            </span>
            <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-300">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-3">{metrics.total}</p>
          <p className="text-xs text-gray-400 mt-1">Estáticos + Dinámicos</p>
        </div>

        {/* Publicados */}
        <div className="bg-gray-850 bg-gray-900/80 border border-gray-800 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-green-400 font-bold">
              Publicados
            </span>
            <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-green-400 mt-3">
            {metrics.published}
          </p>
          <p className="text-xs text-gray-400 mt-1">Visibles en la web</p>
        </div>

        {/* Programados */}
        <div className="bg-gray-850 bg-gray-900/80 border border-gray-800 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-purple-400 font-bold">
              Programados
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-purple-400 mt-3">
            {metrics.scheduled}
          </p>
          <p className="text-xs text-gray-400 mt-1">Publicación futura</p>
        </div>

        {/* Pausados */}
        <div className="bg-gray-850 bg-gray-900/80 border border-gray-800 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-yellow-400 font-bold">
              Pausados
            </span>
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
              <PauseCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-yellow-400 mt-3">
            {metrics.paused}
          </p>
          <p className="text-xs text-gray-400 mt-1">Ocultos al público</p>
        </div>

        {/* Agentes IA */}
        <div className="bg-gray-850 bg-gray-900/80 border border-indigo-900/50 bg-gradient-to-br from-gray-900 via-indigo-950/20 to-gray-900 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-indigo-400 font-bold">
              Agentes IA
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-indigo-300 mt-3">
            {metrics.byAgent}
          </p>
          <p className="text-xs text-gray-400 mt-1">Automatizados vía API</p>
        </div>
      </div>

      {/* Filters & Real-time Search */}
      <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por título o slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800/80 border border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-red-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-red-500"
          >
            <option value="all">Todos los Estados</option>
            <option value="published">🟢 Publicados</option>
            <option value="scheduled">🟣 Programados</option>
            <option value="paused">🟡 Pausados</option>
          </select>

          {/* Source */}
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-red-500"
          >
            <option value="all">Todos los Orígenes</option>
            <option value="agent">🤖 Agente IA</option>
            <option value="manual">✍️ Manual</option>
            <option value="static">🏛️ Base Estática</option>
          </select>

          {(searchQuery ||
            selectedCategory !== "all" ||
            selectedStatus !== "all" ||
            selectedSource !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedStatus("all");
                setSelectedSource("all");
              }}
              className="text-xs text-red-400 hover:text-red-300 transition underline px-1"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-850 bg-black/40 border-b border-gray-800 text-xs uppercase tracking-wider text-gray-400 font-semibold">
                <th className="py-4 px-6">Artículo / Título</th>
                <th className="py-4 px-6">Dimensión</th>
                <th className="py-4 px-6">Origen</th>
                <th className="py-4 px-6">Fecha</th>
                <th className="py-4 px-6 text-center">Estado</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <RefreshCw className="w-6 h-6 animate-spin text-red-500" />
                      <p>Cargando artículos unificados...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="w-8 h-8 text-gray-600" />
                      <p className="font-medium text-gray-300">
                        No se encontraron artículos
                      </p>
                      <p className="text-xs text-gray-500">
                        Prueba ajustando los filtros o crea un artículo nuevo.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredArticles.map((article) => {
                  const isPaused =
                    article.status === "paused" || article.status === "draft";
                  const isScheduled = article.status === "scheduled";
                  const isPublished = article.status === "published";
                  const isUpdating = actionLoadingId === article.id;

                  return (
                    <tr
                      key={article.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Title & Slug */}
                      <td className="py-4 px-6 max-w-md">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 overflow-hidden flex-shrink-0 relative mt-0.5">
                            {article.cover_image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={article.cover_image}
                                alt={article.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                                📖
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1">
                              {article.title}
                            </p>
                            <p className="text-xs text-gray-400 font-mono mt-0.5">
                              /{article.slug}
                            </p>
                            {article.excerpt && (
                              <p className="text-xs text-gray-400 line-clamp-1 mt-1">
                                {article.excerpt}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-md bg-white/5 border border-white/10 text-gray-300">
                          {article.category_name || article.category_slug}
                        </span>
                      </td>

                      {/* Origin / Source */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        {article.source === "agent" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            <Bot className="w-3.5 h-3.5" />
                            Agente IA
                          </span>
                        ) : article.source === "static" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700">
                            <Layers className="w-3.5 h-3.5" />
                            Estático Base
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <Sparkles className="w-3.5 h-3.5" />
                            Manual
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 whitespace-nowrap text-xs text-gray-400">
                        {article.published_at
                          ? new Date(article.published_at).toLocaleDateString(
                              "es-ES",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "-"}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 whitespace-nowrap text-center">
                        {isPublished && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            Publicado
                          </span>
                        )}
                        {isScheduled && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                            <Clock className="w-3.5 h-3.5" />
                            Programado
                          </span>
                        )}
                        {isPaused && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                            <Pause className="w-3.5 h-3.5" />
                            Pausado
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* 1-Click Toggle: Pause / Resume */}
                          <button
                            onClick={() => handleToggleStatus(article)}
                            disabled={isUpdating}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                              isPublished
                                ? "bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                                : "bg-green-500/10 hover:bg-green-500/20 text-green-300 border border-green-500/30"
                            } disabled:opacity-50`}
                            title={
                              isPublished
                                ? "Pausar publicación en 1 clic"
                                : "Reanudar / Publicar en 1 clic"
                            }
                          >
                            {isUpdating ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : isPublished ? (
                              <>
                                <Pause className="w-3.5 h-3.5" />
                                Pausar
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5" />
                                Publicar
                              </>
                            )}
                          </button>

                          {/* View in public web */}
                          <Link
                            href={`/blog/${article.category_slug}/${article.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
                            title="Ver en blog público"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteConfirmId(article.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
                            title="Eliminar artículo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ACCESO PARA AGENTES DE IA */}
      {showAgentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setShowAgentModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Acceso API para tus Agentes de IA
                </h3>
                <p className="text-xs text-gray-400">
                  Configura tus agentes (CrewAI, LangChain, Python, etc.) para
                  publicar artículos.
                </p>
              </div>
            </div>

            {/* Credentials Card */}
            <div className="mt-6 space-y-4 bg-gray-950 p-4 rounded-2xl border border-gray-800">
              {/* Endpoint */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Endpoint URL (POST)
                </label>
                <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl p-2.5">
                  <span className="text-xs font-mono text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10">
                    POST
                  </span>
                  <code className="text-xs font-mono text-gray-200 flex-1 overflow-x-auto select-all">
                    {endpointUrl}
                  </code>
                  <button
                    onClick={() => handleCopyText(endpointUrl, "endpoint")}
                    className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition"
                    title="Copiar URL"
                  >
                    {copiedCode === "endpoint" ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* API Key */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Clave de Autorización (Bearer Token)
                </label>
                <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl p-2.5">
                  <Key className="w-4 h-4 text-purple-400 ml-1" />
                  <code className="text-xs font-mono text-gray-200 flex-1 overflow-x-auto select-all">
                    {apiKey}
                  </code>
                  <button
                    onClick={() => handleCopyText(apiKey, "key")}
                    className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition"
                    title="Copiar Token"
                  >
                    {copiedCode === "key" ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Configurable en tu archivo de entorno mediante{" "}
                  <code className="text-gray-400">BLOG_AGENT_API_KEY</code>.
                </p>
              </div>
            </div>

            {/* Code Snippets Section */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Fragmentos de Código Listos para Usar
                </span>
                <div className="flex items-center gap-1 bg-gray-950 p-1 rounded-xl border border-gray-800">
                  <button
                    onClick={() => setActiveCodeTab("python")}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                      activeCodeTab === "python"
                        ? "bg-purple-600 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Python
                  </button>
                  <button
                    onClick={() => setActiveCodeTab("node")}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                      activeCodeTab === "node"
                        ? "bg-purple-600 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    TypeScript / Node
                  </button>
                  <button
                    onClick={() => setActiveCodeTab("curl")}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                      activeCodeTab === "curl"
                        ? "bg-purple-600 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    cURL
                  </button>
                </div>
              </div>

              <div className="relative bg-gray-950 border border-gray-800 rounded-2xl p-4">
                <button
                  onClick={() =>
                    handleCopyText(codeSnippets[activeCodeTab], "snippet")
                  }
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-300 transition flex items-center gap-1.5 text-xs"
                >
                  {copiedCode === "snippet" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-400" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar código</span>
                    </>
                  )}
                </button>
                <pre className="text-xs font-mono text-gray-300 overflow-x-auto pr-24 max-h-56 leading-relaxed">
                  {codeSnippets[activeCodeTab]}
                </pre>
              </div>
            </div>

            {/* Explanatory note */}
            <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-3">
              <span className="text-base mt-0.5">💡</span>
              <p>
                <strong>Soporte Markdown Inteligente:</strong> Tus agentes
                pueden enviar encabezados{" "}
                <code className="text-blue-200">##</code> y{" "}
                <code className="text-blue-200">###</code>. El blog parseará
                automáticamente la estructura para generar el índice anclado
                (TOC) interactivo y calcular el tiempo de lectura sin trabajo
                manual adicional.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NUEVO ARTÍCULO MANUAL */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowManualModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Redactar Nuevo Artículo Manual
                </h3>
                <p className="text-xs text-gray-400">
                  Publica o programa un artículo directamente desde el panel.
                </p>
              </div>
            </div>

            {manualError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                {manualError}
              </div>
            )}

            <form onSubmit={handleManualSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Título del Artículo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Guía Definitiva de Entrenamiento de Fuerza para Hombres"
                  value={manualForm.title}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, title: e.target.value })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                    Dimensión / Categoría
                  </label>
                  <select
                    value={manualForm.category_slug}
                    onChange={(e) =>
                      setManualForm({
                        ...manualForm,
                        category_slug: e.target.value,
                      })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="entrenamiento-y-energia-fisica">
                      Cuerpo Triarvon (Entrenamiento)
                    </option>
                    <option value="estilo-y-presencia">
                      Estilo Triarvon (Moda y Presencia)
                    </option>
                    <option value="mentalidad-y-disciplina">
                      Mentalidad Triarvon (Disciplina y Hábitos)
                    </option>
                    <option value="productividad-y-gestion-del-tiempo">
                      Productividad Triarvon (Tiempo y Rendimiento)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                    Estado Inicial
                  </label>
                  <select
                    value={manualForm.status}
                    onChange={(e) =>
                      setManualForm({
                        ...manualForm,
                        status: e.target.value as
                          "published" | "scheduled" | "paused",
                      })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="published">
                      🟢 Publicar Inmediatamente
                    </option>
                    <option value="paused">
                      🟡 Guardar Pausado (Borrador)
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Resumen / Extracto (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Una síntesis de 1 o 2 líneas para la tarjeta y Google..."
                  value={manualForm.excerpt}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, excerpt: e.target.value })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  URL Imagen de Portada (Opcional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={manualForm.cover_image}
                  onChange={(e) =>
                    setManualForm({
                      ...manualForm,
                      cover_image: e.target.value,
                    })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Contenido (Markdown Estándar) *
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder="## Primera Sección&#10;&#10;Escribe tu contenido usando Markdown con subtítulos ## para generar automáticamente el índice del blog..."
                  value={manualForm.content}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, content: e.target.value })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-sm text-white font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-gray-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingManual}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition flex items-center gap-2 disabled:opacity-50"
                >
                  {submittingManual ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Publicar Artículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">
                ¿Eliminar artículo?
              </h3>
            </div>
            <p className="text-sm text-gray-300 mb-6 leading-relaxed">
              Esta publicación será retirada permanentemente del blog. Si solo
              deseas que no sea visible al público en este momento, te
              recomendamos usar el botón <strong>Pausar</strong>.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-gray-800 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteArticle(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition"
              >
                Confirmar Eliminación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
