"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/firebase";
import { getTokenCookie } from "@/lib/api";

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  description?: string;
}

type PaymentMethod = "mercadopago" | "stripe";

// Step indicators
type CheckoutStep = "package" | "payment" | "confirm";

export default function BuyCredits() {
  const { user: firebaseUser } = useAuth();
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(
    null,
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("package");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [userCredits, setUserCredits] = useState<number>(0);

  // Fixed USD prices
  const usdPriceMap: Record<string, number> = {
    "Paquete Iniciación": 3,
    "Paquete Guerrero": 8,
    "Paquete Leónidas": 30,
  };

  const getUSDPrice = (pkgName: string) => {
    return usdPriceMap[pkgName] || Math.round(10000 / 4000); // fallback
  };

  const formatCOP = (amount: number) => {
    return new Intl.NumberFormat("es-CO").format(amount);
  };

  // Fetch packages and user info
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch packages
        const res = await fetch("/api/credits/packages");
        if (res.ok) {
          const data = await res.json();
          setPackages(data.packages || []);
        } else {
          setError("Error al cargar los paquetes");
        }

        // Fetch user credits if logged in
        if (firebaseUser) {
          const token = await firebaseUser.getIdToken();
          const profileRes = await fetch("/api/users/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            setUserCredits(profileData.user?.credits || 0);
          }
        }
      } catch {
        setError("Error de conexión al cargar los paquetes");
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [firebaseUser]);

  const handleSelectPackage = (pkg: CreditPackage) => {
    setSelectedPackage(pkg);
    setCurrentStep("payment");
    setError("");
  };

  const handleSelectPayment = (method: PaymentMethod) => {
    setPaymentMethod(method);
    setCurrentStep("confirm");
    setError("");
  };

  const handleBuyCredits = async () => {
    if (!selectedPackage || !paymentMethod) return;

    setLoading(true);
    setError("");

    const baseUrl = window.location.origin;
    const backUrls = {
      success: `${baseUrl}/credits?status=success`,
      failure: `${baseUrl}/credits?status=failure`,
      cancel: `${baseUrl}/credits?status=cancelled`,
    };

    try {
      const endpoint =
        paymentMethod === "stripe"
          ? "/api/credits/buy-stripe"
          : "/api/credits/buy";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getTokenCookie()}`,
        },
        body: JSON.stringify({
          package_id: selectedPackage.id,
          back_urls: {
            success: backUrls.success,
            failure: backUrls.failure,
            cancel: backUrls.cancel,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const paymentUrl =
          paymentMethod === "stripe"
            ? data.checkout_url
            : data.preference?.init_point ||
              data.preference?.sandbox_init_point;

        if (paymentUrl) {
          window.location.href = paymentUrl;
        } else {
          setError("No se pudo obtener la URL de pago");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Error al procesar la compra");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (currentStep === "confirm") {
      setCurrentStep("payment");
    } else if (currentStep === "payment") {
      setCurrentStep("package");
      setSelectedPackage(null);
    }
  };

  // Get most popular package (middle one or largest)
  const popularPackageId =
    packages.length > 0 ? packages[Math.floor(packages.length / 2)]?.id : null;

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#c20909] mb-4"></div>
        <p className="text-[#b2a4a4]">Cargando paquetes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header with Logo */}
      <div className="text-center mb-10">
        <div className="flex justify-center mb-6">
          <Image
            src="/Logo triarvon club - sin fondo.webp"
            alt="Triarvon Club"
            width={240}
            height={240}
            className="object-contain"
          />
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">Comprar Créditos</h1>
        <p className="text-[#b2a4a4] text-lg">
          Potencia tu experiencia Triarvon con créditos premium
        </p>

        {/* Current Credits Display */}
        {firebaseUser && (
          <div className="mt-4 inline-flex items-center gap-2 bg-[#342d2d] px-6 py-3 rounded-full">
            <span className="text-[#b2a4a4]">Tu saldo actual:</span>
            <span className="text-2xl font-bold text-[#d4af37]">
              {userCredits}
            </span>
            <span className="text-[#b2a4a4]">créditos</span>
          </div>
        )}
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center mb-10">
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 ${currentStep === "package" ? "text-white" : "text-[#b2a4a4]"}`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                currentStep === "package"
                  ? "bg-[#c20909] text-white"
                  : selectedPackage
                    ? "bg-green-600 text-white"
                    : "bg-[#342d2d] text-[#b2a4a4]"
              }`}
            >
              {selectedPackage ? "✓" : "1"}
            </div>
            <span className="hidden sm:inline font-medium">Paquete</span>
          </div>

          <div className="w-12 h-0.5 bg-[#342d2d]"></div>

          <div
            className={`flex items-center gap-2 ${currentStep === "payment" ? "text-white" : "text-[#b2a4a4]"}`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                currentStep === "payment"
                  ? "bg-[#c20909] text-white"
                  : paymentMethod
                    ? "bg-green-600 text-white"
                    : "bg-[#342d2d] text-[#b2a4a4]"
              }`}
            >
              {paymentMethod ? "✓" : "2"}
            </div>
            <span className="hidden sm:inline font-medium">Método</span>
          </div>

          <div className="w-12 h-0.5 bg-[#342d2d]"></div>

          <div
            className={`flex items-center gap-2 ${currentStep === "confirm" ? "text-white" : "text-[#b2a4a4]"}`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                currentStep === "confirm"
                  ? "bg-[#c20909] text-white"
                  : "bg-[#342d2d] text-[#b2a4a4]"
              }`}
            >
              3
            </div>
            <span className="hidden sm:inline font-medium">Confirmar</span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl">
          <p className="text-red-400 text-center">{error}</p>
        </div>
      )}

      {/* Step 1: Package Selection */}
      {currentStep === "package" && (
        <div>
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            Elige tu paquete de créditos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => handleSelectPackage(pkg)}
                className={`relative bg-[#1e1a1a] rounded-2xl p-6 border-2 transition-all cursor-pointer hover:scale-[1.02] hover:shadow-xl ${
                  selectedPackage?.id === pkg.id
                    ? "border-[#c20909] shadow-lg shadow-red-900/20"
                    : "border-[#342d2d] hover:border-[#c20909]/50"
                }`}
              >
                {/* Popular Badge */}
                {pkg.id === popularPackageId && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#c20909] text-white text-xs font-bold px-4 py-1 rounded-full">
                      MÁS POPULAR
                    </span>
                  </div>
                )}

                <div className="text-center pt-2">
                  <div className="text-lg font-medium text-[#b2a4a4] mb-2">
                    {pkg.name}
                  </div>

                  <div className="text-5xl font-bold text-[#d4af37] mb-1">
                    {pkg.credits.toLocaleString()}
                  </div>
                  <div className="text-sm text-[#b2a4a4] mb-6">créditos</div>

                  <div className="text-3xl font-bold text-white mb-1">
                    ${formatCOP(pkg.price)} COP
                  </div>
                  <div className="text-sm text-[#b2a4a4] mb-6">
                    ~${getUSDPrice(pkg.name)} USD
                  </div>

                  <button className="w-full bg-[#c20909] hover:bg-red-700 text-white py-3 px-4 rounded-xl font-bold transition-colors">
                    Seleccionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Payment Method */}
      {currentStep === "payment" && selectedPackage && (
        <div>
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-[#b2a4a4] hover:text-white mb-6 transition-colors"
          >
            ← Volver a paquetes
          </button>

          <div className="bg-[#1e1a1a] rounded-2xl p-6 border border-[#342d2d] mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#b2a4a4]">Paquete seleccionado:</p>
                <p className="text-white font-bold text-xl">
                  {selectedPackage.name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-[#d4af37]">
                  {selectedPackage.credits.toLocaleString()}
                </p>
                <p className="text-[#b2a4a4]">créditos</p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white text-center mb-6">
            Elige tu método de pago
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* MercadoPago */}
            <div
              onClick={() => handleSelectPayment("mercadopago")}
              className={`bg-[#1e1a1a] rounded-2xl p-6 border-2 cursor-pointer transition-all hover:scale-[1.02] ${
                paymentMethod === "mercadopago"
                  ? "border-[#009ee3] shadow-lg shadow-blue-900/20"
                  : "border-[#342d2d] hover:border-[#009ee3]/50"
              }`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-[#009ee3] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">MP</span>
                </div>
                <div>
                  <p className="text-white font-bold text-lg">MercadoPago</p>
                  <p className="text-[#b2a4a4] text-sm">Pago en Colombia 🇨🇴</p>
                </div>
              </div>
              <p className="text-[#b2a4a4] text-sm mb-4">
                Ideal para usuarios en Colombia. Paga con PSE, tarjeta de
                crédito, Nequi, Daviplata y más.
              </p>
              <div className="text-xl font-bold text-white">
                ${formatCOP(selectedPackage.price)} COP
              </div>
            </div>

            {/* Stripe */}
            <div
              onClick={() => handleSelectPayment("stripe")}
              className={`bg-[#1e1a1a] rounded-2xl p-6 border-2 cursor-pointer transition-all hover:scale-[1.02] ${
                paymentMethod === "stripe"
                  ? "border-[#635bff] shadow-lg shadow-purple-900/20"
                  : "border-[#342d2d] hover:border-[#635bff]/50"
              }`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-[#635bff] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <div>
                  <p className="text-white font-bold text-lg">Stripe</p>
                  <p className="text-[#b2a4a4] text-sm">
                    Pago Internacional 🌎
                  </p>
                </div>
              </div>
              <p className="text-[#b2a4a4] text-sm mb-4">
                Para usuarios internacionales. Acepta tarjetas de crédito y
                débito de cualquier país.
              </p>
              <div className="text-xl font-bold text-white">
                ${getUSDPrice(selectedPackage.name)} USD
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {currentStep === "confirm" && selectedPackage && paymentMethod && (
        <div>
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-[#b2a4a4] hover:text-white mb-6 transition-colors"
          >
            ← Volver a método de pago
          </button>

          <div className="max-w-lg mx-auto">
            <div className="bg-[#1e1a1a] rounded-2xl p-8 border border-[#342d2d]">
              <h2 className="text-2xl font-bold text-white text-center mb-6">
                Confirmar Compra
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-3 border-b border-[#342d2d]">
                  <span className="text-[#b2a4a4]">Paquete</span>
                  <span className="text-white font-medium">
                    {selectedPackage.name}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[#342d2d]">
                  <span className="text-[#b2a4a4]">Créditos</span>
                  <span className="text-[#d4af37] font-bold text-xl">
                    {selectedPackage.credits.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[#342d2d]">
                  <span className="text-[#b2a4a4]">Método de pago</span>
                  <span className="text-white font-medium">
                    {paymentMethod === "mercadopago" ? "MercadoPago" : "Stripe"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-[#b2a4a4]">Total a pagar</span>
                  <span className="text-white font-bold text-2xl">
                    {paymentMethod === "stripe"
                      ? `$${getUSDPrice(selectedPackage.name)} USD`
                      : `$${formatCOP(selectedPackage.price)} COP`}
                  </span>
                </div>
              </div>

              <button
                onClick={handleBuyCredits}
                disabled={loading}
                className="w-full bg-[#c20909] hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    Proceder al Pago
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </>
                )}
              </button>

              <p className="text-[#b2a4a4] text-sm text-center mt-4">
                Serás redirigido a{" "}
                {paymentMethod === "mercadopago" ? "MercadoPago" : "Stripe"}{" "}
                para completar el pago de forma segura.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-12 bg-[#1e1a1a] rounded-2xl p-6 border border-[#342d2d]">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-[#d4af37]"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          Información Importante
        </h3>
        <ul className="space-y-2 text-sm text-[#b2a4a4]">
          <li className="flex items-start gap-2">
            <span className="text-[#c20909]">•</span>
            Los créditos se acreditan automáticamente después del pago
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#c20909]">•</span>
            Puedes usar créditos en todas las herramientas de Triarvon Club
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#c20909]">•</span>
            <strong className="text-white">MercadoPago:</strong> Ideal para
            pagos en Colombia (COP)
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#c20909]">•</span>
            <strong className="text-white">Stripe:</strong> Ideal para pagos
            internacionales (USD)
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#c20909]">•</span>
            Si tienes problemas, contacta con soporte
          </li>
        </ul>
      </div>
    </div>
  );
}
