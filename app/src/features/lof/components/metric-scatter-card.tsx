import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { MetricId } from "@/features/lof/metrics";
import type { SimulationHistoryEntry } from "@/features/lof/hooks/use-simulation-controller";
import { ensureChartJsRegistered } from "@/lib/chart-config";
import { Scatter } from "react-chartjs-2";

interface MetricScatterCardProps {
  metricIds: MetricId[];
  history: SimulationHistoryEntry[];
  currentMetrics: Partial<Record<MetricId, number>>;
}

ensureChartJsRegistered();

const DEFAULT_AXES: [MetricId, MetricId] = ["entropy", "assembley"];

export const MetricScatterCard = ({ metricIds, history, currentMetrics }: MetricScatterCardProps) => {
  const [xAxis, setXAxis] = useState<MetricId>(DEFAULT_AXES[0]);
  const [yAxis, setYAxis] = useState<MetricId>(DEFAULT_AXES[1]);
  const [logScale, setLogScale] = useState(false);
  const [connectPoints, setConnectPoints] = useState(false);

  const dataset = useMemo(() => {
    const points = history
      .map((entry) => {
        const xValue = entry.metrics?.[xAxis] ?? currentMetrics[xAxis];
        const yValue = entry.metrics?.[yAxis] ?? currentMetrics[yAxis];
        if (typeof xValue !== "number" || typeof yValue !== "number") {
          return null;
        }
        if (!Number.isFinite(xValue) || !Number.isFinite(yValue)) {
          return null;
        }
        return {
          x: xValue,
          y: yValue,
          step: entry.step
        };
      })
      .filter((point): point is { x: number; y: number; step: number } => point !== null);
    if (points.length === 0) {
      const xValue = currentMetrics[xAxis];
      const yValue = currentMetrics[yAxis];
      if (typeof xValue === "number" && typeof yValue === "number") {
        return [
          {
            x: xValue,
            y: yValue,
            step: 0
          }
        ];
      }
    }
    return points;
  }, [history, currentMetrics, xAxis, yAxis]);

  const chartData = useMemo(
    () => ({
      datasets: [
        {
          label: `${xAxis} vs ${yAxis}`,
          data: dataset,
          backgroundColor: "rgba(59,130,246,0.35)",
          borderColor: "rgba(59,130,246,0.8)",
          pointRadius: 4,
          pointHoverRadius: 6,
          showLine: connectPoints,
          tension: 0.25
        }
      ]
    }),
    [dataset, xAxis, yAxis, connectPoints]
  );

  const scaleType = logScale ? "logarithmic" : "linear";

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Metric scatter</CardTitle>
          <CardDescription>Compare metrics over the latest simulation history.</CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={xAxis} onValueChange={(value: MetricId) => setXAxis(value)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="X axis" />
            </SelectTrigger>
            <SelectContent>
              {metricIds.map((metric) => (
                <SelectItem key={`scatter-x-${metric}`} value={metric}>
                  {metric}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={yAxis} onValueChange={(value: MetricId) => setYAxis(value)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Y axis" />
            </SelectTrigger>
            <SelectContent>
              {metricIds.map((metric) => (
                <SelectItem key={`scatter-y-${metric}`} value={metric}>
                  {metric}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => setLogScale((prev) => !prev)}>
            {logScale ? "Linear scale" : "Log scale"}
          </Button>
          <div className="flex items-center gap-2">
            <Label htmlFor="scatter-connect" className="text-xs text-muted-foreground">
              Connect
            </Label>
            <Switch
              id="scatter-connect"
              checked={connectPoints}
              onCheckedChange={(value) => setConnectPoints(value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[320px]">
        <Scatter
          key={`scatter-${history.length}-${xAxis}-${yAxis}-${logScale}-${connectPoints}`}
          data={chartData}
          options={{
            maintainAspectRatio: false,
            parsing: false,
            elements: {
              line: {
                borderWidth: 1.5
              }
            },
            scales: {
              x: {
                type: scaleType,
                title: {
                  display: true,
                  text: xAxis
                },
                grid: {
                  drawBorder: false,
                  color: "rgba(148,163,184,0.2)"
                }
              },
              y: {
                type: scaleType,
                title: {
                  display: true,
                  text: yAxis
                },
                grid: {
                  drawBorder: false,
                  color: "rgba(148,163,184,0.2)"
                }
              }
            },
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const step = (context.raw as { step?: number }).step;
                    return step !== undefined
                      ? `step ${step}: (${context.parsed.x.toFixed(2)}, ${context.parsed.y.toFixed(2)})`
                      : `(${context.parsed.x.toFixed(2)}, ${context.parsed.y.toFixed(2)})`;
                  }
                }
              }
            }
          }}
        />
      </CardContent>
    </Card>
  );
};
