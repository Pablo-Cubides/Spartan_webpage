import React from "react";
import Link from "next/link";
import { SocialLink } from "@/types/blog";

interface AuthorBioProps {
  name: string;
  bio?: string;
  avatar?: string;
  expertiseAreas?: string[];
  socialLinks?: SocialLink[];
}

/**
 * Sección de autor con E-E-A-T (Expertise, Authoritativeness, Trustworthiness)
 * Muestra bio, foto, áreas de expertise y redes sociales
 * Refuerza credibilidad ante Google
 */
export const AuthorBio: React.FC<AuthorBioProps> = ({
  name,
  bio,
  avatar,
  expertiseAreas,
  socialLinks,
}) => {
  return (
    <aside className="author-bio">
      <div className="author-container">
        {avatar && (
          <div className="author-avatar">
            <img src={avatar} alt={name} />
          </div>
        )}

        <div className="author-info">
          <h3>{name}</h3>

          {bio && <p className="author-bio-text">{bio}</p>}

          {expertiseAreas && expertiseAreas.length > 0 && (
            <div className="expertise-areas">
              <strong>Especialista en:</strong>
              <div className="expertise-tags">
                {expertiseAreas.map((area, index) => (
                  <span key={index} className="expertise-tag">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {socialLinks && socialLinks.length > 0 && (
            <div className="social-links">
              <strong>Sígueme:</strong>
              <div className="social-icons">
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Visita ${link.platform}`}
                    className={`social-link ${link.platform.toLowerCase()}`}
                  >
                    <span className="sr-only">{link.platform}</span>
                    {getPlatformIcon(link.platform)}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .author-bio {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 1.5rem;
          margin: 2rem 0;
        }

        .author-container {
          display: flex;
          gap: 1.5rem;
          align-items: flex-start;
        }

        .author-avatar {
          flex-shrink: 0;
        }

        .author-avatar img {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #e5e7eb;
        }

        .author-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        h3 {
          margin: 0;
          font-size: 1.125rem;
          color: #111827;
        }

        .author-bio-text {
          margin: 0;
          color: #4b5563;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .expertise-areas {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .expertise-areas strong {
          font-size: 0.875rem;
          color: #374151;
        }

        .expertise-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .expertise-tag {
          background: #dbeafe;
          color: #0c4a6e;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .social-links {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .social-links strong {
          font-size: 0.875rem;
          color: #374151;
        }

        .social-icons {
          display: flex;
          gap: 0.75rem;
        }

        .social-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: white;
          border: 1px solid #d1d5db;
          color: #2563eb;
          transition: all 0.2s;
          text-decoration: none;
        }

        .social-link:hover {
          background: #2563eb;
          color: white;
          border-color: #2563eb;
        }

        .social-link svg {
          width: 16px;
          height: 16px;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }

        @media (max-width: 640px) {
          .author-container {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .author-avatar {
            flex-shrink: 0;
          }

          .author-info {
            align-items: center;
          }

          .expertise-tags,
          .social-icons {
            justify-content: center;
          }
        }
      `}</style>
    </aside>
  );
};

// Helper para obtener iconos de redes sociales
function getPlatformIcon(platform: string): React.ReactNode {
  const iconMap: Record<string, React.ReactNode> = {
    linkedin: (
      <svg fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.39v-1.2h-2.5v8.5h2.5v-4.34c0-.77.62-1.4 1.4-1.4a1.4 1.4 0 0 1 1.4 1.4v4.34h2.5M6.5 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
      </svg>
    ),
    twitter: (
      <svg fill="currentColor" viewBox="0 0 24 24">
        <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7a10.5 10.5 0 01-10-10z" />
      </svg>
    ),
    github: (
      <svg fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.544 2.914 1.186.092-.923.35-1.544.636-1.9-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.137 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
      </svg>
    ),
    default: (
      <svg fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
      </svg>
    ),
  };

  return iconMap[platform.toLowerCase()] || iconMap.default;
}
