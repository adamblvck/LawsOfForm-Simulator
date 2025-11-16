import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { METRICS_CONFIG } from "@/features/lof/metrics";

export interface MetricStat {
  id: string;
  label: string;
  value: number | null;
  delta?: number | null;
  unit?: string;
}

interface MetricsOverviewCardProps {
  metrics?: MetricStat[];
}

const defaultMetrics: MetricStat[] = METRICS_CONFIG.map((metric) => ({
  id: metric.id,
  label: metric.label,
  value: null,
  delta: null
}));

export const MetricsOverviewCard = ({ metrics = defaultMetrics }: MetricsOverviewCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Metric pulse</CardTitle>
            <CardDescription>Live snapshot across entropy, assembly, energy, and more.</CardDescription>
          </div>
          <Badge variant="secondary">Realtime</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {metrics.map((metric) => (
          <div key={metric.id} className="rounded-lg border border-border/60 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{metric.label}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-xl font-semibold">
                {typeof metric.value === "number" && Number.isFinite(metric.value) ? metric.value.toFixed(2) : "--"}
              </p>
              {typeof metric.delta === "number" && metric.delta !== 0 ? (
                <span className={metric.delta > 0 ? "text-emerald-500" : "text-rose-500"}>
                  {metric.delta > 0 ? "+" : ""}
                  {metric.delta.toFixed(2)}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">Δ 0.00</span>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
