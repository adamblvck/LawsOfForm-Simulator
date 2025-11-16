import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MetricId } from "@/features/lof/metrics";
import type { OperationName } from "@/features/lof/operations/types";
import type { LoFStructure } from "@/features/lof/types";
import { SimulationCanvas } from "@/features/lof/components/simulation-canvas";

interface SimulationCanvasCardProps {
  className?: string;
  step: number;
  lastOperation: OperationName | null;
  metrics: Partial<Record<MetricId, number>>;
  structure: LoFStructure;
  structureVersion: number;
}

const formatMetric = (value: number | undefined | null, digits = 2) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "--";
  }
  return value.toFixed(digits);
};

export const SimulationCanvasCard = ({
  className,
  step,
  lastOperation,
  metrics,
  structure,
  structureVersion
}: SimulationCanvasCardProps) => {
  return (
    <Card className={cn("flex h-full flex-col", className)}>
      <CardHeader className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Simulation viewport</CardTitle>
          <CardDescription>Live rendering of the evolving LOF assembly graph.</CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select defaultValue="entropy">
            <SelectTrigger className="w-32">
              <SelectValue placeholder="X metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entropy">Entropy</SelectItem>
              <SelectItem value="assembley">Assembly</SelectItem>
              <SelectItem value="omega">Omega</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="assembley">
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Y metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="maxDepth">Max depth</SelectItem>
              <SelectItem value="assembley">Assembly</SelectItem>
              <SelectItem value="energyDiluted">Energy</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">Export PNG</Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="relative flex flex-1 rounded-lg border border-border/60 bg-muted/10 p-4">
          <SimulationCanvas structure={structure} version={structureVersion} className="h-full w-full" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border/60 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Current step</p>
            <p className="mt-2 text-2xl font-semibold">{step}</p>
          </div>
          <div className="rounded-lg border border-border/60 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Active operation</p>
            {lastOperation ? (
              <Badge variant="outline" className="mt-2 capitalize">
                {lastOperation}
              </Badge>
            ) : (
              <p className="mt-2 text-sm font-medium text-muted-foreground">awaiting input</p>
            )}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border/60 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Entropy</p>
            <p className="mt-2 text-lg font-semibold">{formatMetric(metrics.entropy)}</p>
          </div>
          <div className="rounded-lg border border-border/60 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Assembly</p>
            <p className="mt-2 text-lg font-semibold">{formatMetric(metrics.assembley)}</p>
          </div>
          <div className="rounded-lg border border-border/60 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Max depth</p>
            <p className="mt-2 text-lg font-semibold">{formatMetric(metrics.maxDepth, 0)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
