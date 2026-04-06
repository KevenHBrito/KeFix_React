import { Link } from "react-router-dom";

export type BreadcrumbItem = { label: string; to?: string };

export function PageBreadcrumb({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null;
  return (
    <nav className="page-breadcrumb" aria-label="Navegação estrutural">
      <ol className="page-breadcrumb-list">
        {items.map((it, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${it.label}-${i}`}>
              {isLast ? (
                <span className="page-breadcrumb-current">{it.label}</span>
              ) : it.to ? (
                <Link to={it.to}>{it.label}</Link>
              ) : (
                <span className="page-breadcrumb-muted">{it.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
