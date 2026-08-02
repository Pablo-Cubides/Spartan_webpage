"use client";

import Link from "next/link";
import { generateBreadcrumbSchema } from "@/lib/blog/schema-generator";

interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const schema = generateBreadcrumbSchema(
    items.map((item, index) => ({
      label: item.label,
      url: item.href,
      active: index === items.length - 1,
    })),
    { baseUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://www.triarvon.com" },
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav className="text-sm mb-8" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 flex-wrap">
          {items.map((item, index) => (
            <li key={item.href} className="flex items-center gap-2">
              {!item.current ? (
                <>
                  <Link
                    href={item.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                  {index < items.length - 1 && (
                    <span className="text-gray-500" aria-hidden="true">/</span>
                  )}
                </>
              ) : (
                <span className="text-gray-200 font-medium" aria-current="page">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
