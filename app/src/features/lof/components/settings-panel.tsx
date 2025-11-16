import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { OperationName } from "@/features/lof/operations/types";
import { cn } from "@/lib/utils";

const OPERATION_METADATA: Record<OperationName, { label: string; description: string }> = {
  cancel: { label: "Cancel", description: "Remove nested [[ ]] pairs to simplify loops." },
  confirm: { label: "Confirm", description: "Duplicate random subforms to reinforce structure." },
  condense: { label: "Condense", description: "Collapse sibling forms that are identical." },
  compensate: { label: "Compensate", description: "Introduce [[ ]] units to rebalance topology." },
  measure: { label: "Measure", description: "Encapsulate or decapsulate paths stochastically." }
};

interface SettingsPanelProps {
  weights?: Partial<Record<OperationName, number>>;
  onWeightsChange?: (operation: OperationName, value: number) => void;
  autoPlay?: boolean;
  onAutoPlayChange?: (value: boolean) => void;
  stepsPerSecond?: number;
  onStepsPerSecondChange?: (value: number) => void;
}

export const SettingsPanel = ({
  weights = { cancel: 1, confirm: 1, condense: 1, compensate: 1, measure: 1 },
  onWeightsChange,
  autoPlay = false,
  onAutoPlayChange,
  stepsPerSecond = 5,
  onStepsPerSecondChange
}: SettingsPanelProps) => {
  const [localWeights, setLocalWeights] = useState<Record<OperationName, number>>({
    cancel: weights.cancel ?? 0,
    confirm: weights.confirm ?? 0,
    condense: weights.condense ?? 0,
    compensate: weights.compensate ?? 0,
    measure: weights.measure ?? 0
  });

  useEffect(() => {
    setLocalWeights((prev) => ({
      ...prev,
      cancel: weights.cancel ?? prev.cancel ?? 0,
      confirm: weights.confirm ?? prev.confirm ?? 0,
      condense: weights.condense ?? prev.condense ?? 0,
      compensate: weights.compensate ?? prev.compensate ?? 0,
      measure: weights.measure ?? prev.measure ?? 0
    }));
  }, [weights]);

  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card/60 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Control center</p>
          <p className="text-xs text-muted-foreground">Fine tune stochastic operations, metrics, and exports.</p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="autoplay" className="text-xs text-muted-foreground">
            Autoplay
          </Label>
          <Switch
            id="autoplay"
            checked={autoPlay}
            onCheckedChange={(value) => onAutoPlayChange?.(value)}
          />
        </div>
      </div>
      <Tabs defaultValue="operations" className="flex flex-1 flex-col">
        <TabsList className="w-full">
          <TabsTrigger value="operations" className="flex-1">Operations</TabsTrigger>
          <TabsTrigger value="metrics" className="flex-1">Metrics</TabsTrigger>
          <TabsTrigger value="exports" className="flex-1">Exports</TabsTrigger>
        </TabsList>
        <div className="flex-1">
          <TabsContent value="operations" className="mt-4 h-full">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-4">
                <div className="rounded-lg border border-border/60 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">Simulation pace</p>
                      <p className="text-xs text-muted-foreground">
                        Control autoplay throughput (steps per second).
                      </p>
                    </div>
                    <span className="text-sm font-semibold">{stepsPerSecond}×</span>
                  </div>
                  <Slider
                    className="mt-3"
                    value={[stepsPerSecond]}
                    min={1}
                    max={1000}
                    step={1}
                    onValueChange={([next]) => onStepsPerSecondChange?.(Math.max(1, Math.min(1000, Math.round(next))))}
                  />
                  <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wide text-muted-foreground">
                    <span>1</span>
                    <span>1000</span>
                  </div>
                </div>
                {(Object.keys(OPERATION_METADATA) as OperationName[]).map((operation) => {
                  const metadata = OPERATION_METADATA[operation];
                  const value = localWeights[operation] ?? 0;
                  return (
                    <div
                      key={operation}
                      className={cn(
                        "rounded-lg border border-border/60 p-4 transition-colors",
                        value > 0 ? "bg-background" : "bg-muted/30"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">{metadata.label}</p>
                          <p className="text-xs text-muted-foreground">{metadata.description}</p>
                        </div>
                        <span className="text-sm font-semibold">{value}</span>
                      </div>
                      <Slider
                        value={[value]}
                        min={0}
                        max={10}
                        step={1}
                        className="mt-3"
                        onValueChange={([next]) =>
                          setLocalWeights((prev) => ({
                            ...prev,
                            [operation]: Math.max(0, Math.min(10, Math.round(next)))
                          }))
                        }
                        onValueCommit={([next]) =>
                          onWeightsChange?.(operation, Math.max(0, Math.min(10, Math.round(next))))
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="metrics" className="mt-4 h-full">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-4">
                <div className="rounded-lg border border-border/60 p-4">
                  <Label htmlFor="sample-window" className="text-xs uppercase tracking-wide text-muted-foreground">
                    Sampling window
                  </Label>
                  <Input id="sample-window" placeholder="e.g. 100 steps" className="mt-2" />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Configure the horizon for rolling averages, deltas, and alerts.
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 p-4">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Alerts</Label>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Receive toast alerts when entropy spikes or assembly index collapses.
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm">Entropy spike detection</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm">Assembly low-water mark</span>
                    <Switch />
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="exports" className="mt-4 h-full">
            <div className="flex h-full flex-col gap-4">
              <div className="rounded-lg border border-border/60 p-4">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Data export</Label>
                <p className="mt-2 text-sm text-muted-foreground">
                  Export CSV snapshots or JSON payloads to integrate with downstream notebooks.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline">
                    Download CSV
                  </Button>
                  <Button size="sm" variant="outline">
                    Copy JSON
                  </Button>
                  <Button size="sm" variant="ghost">
                    Stream via MCP
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border border-border/60 p-4">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Presets</Label>
                <p className="mt-2 text-xs text-muted-foreground">
                  Save the current distribution and metric preferences for later recall.
                </p>
                <div className="mt-3 flex gap-2">
                  <Input placeholder="Preset name" />
                  <Button size="sm">Save</Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
