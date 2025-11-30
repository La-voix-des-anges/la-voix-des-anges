import { Badge } from "@/components/ui/badge";
import type { ArticleStatus } from "@shared/schema";

const statusConfig: Record<ArticleStatus, { label: string; className: string }> = {
  draft: {
    label: "Brouillon",
    className: "bg-muted text-muted-foreground",
  },
  pending: {
    label: "En attente",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  published: {
    label: "Publié",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  rejected: {
    label: "Rejeté",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
};

interface StatusBadgeProps {
  status: ArticleStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  if (!config) {
    return (
      <Badge data-testid={`badge-status-${status}`}>
        {status}
      </Badge>
    );
  }
  return (
    <Badge className={config.className} data-testid={`badge-status-${status}`}>
      {config.label}
    </Badge>
  );
}
