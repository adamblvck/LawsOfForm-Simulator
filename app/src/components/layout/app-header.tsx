import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Play, Pause, RotateCcw, StepForward, Beaker } from "lucide-react";
import type { OperationName } from "@/features/lof/operations/types";

interface AppHeaderProps {
  className?: string;
  isAutoPlay: boolean;
  isBatchRunning?: boolean;
  selectedOperation: OperationName;
  onToggleAutoPlay: () => void;
  onStep: () => void;
  onReset: () => void;
  onRunBatch: () => void;
  onOperationChange: (operation: OperationName) => void;
  onRunOperation: () => void;
}

export const AppHeader = ({
  className,
  isAutoPlay,
  isBatchRunning,
  selectedOperation,
  onToggleAutoPlay,
  onStep,
  onReset,
  onRunBatch,
  onOperationChange,
  onRunOperation
}: AppHeaderProps) => {
  return (
    <div className={cn("mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between", className)}>
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold tracking-tight">Assembly Driven Laws of Form</h1>
        <p className="text-sm text-muted-foreground">Interactive dashboard for stochastic LOF simulations.</p>
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <Select defaultValue="default">
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Preset" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default preset</SelectItem>
            <SelectItem value="explore">Exploratory sweep</SelectItem>
            <SelectItem value="steady">Steady growth</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button variant="secondary" size="sm" onClick={onStep}>
            <StepForward className="mr-2 h-4 w-4" />
            Step once
          </Button>
          <Select value={selectedOperation} onValueChange={(value: OperationName) => onOperationChange(value)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Operation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cancel">Cancel (LoFCancel)</SelectItem>
              <SelectItem value="confirm">Confirm (LoFConfirm)</SelectItem>
              <SelectItem value="condense">Condense (LoFCondense)</SelectItem>
              <SelectItem value="compensate">Compensate (LoFCompensate)</SelectItem>
              <SelectItem value="measure">Measure (LoFMeasure)</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={onRunOperation}>
            <Beaker className="mr-2 h-4 w-4" />
            Execute
          </Button>
          <Button size="sm" onClick={onToggleAutoPlay}>
            {isAutoPlay ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isBatchRunning}
            onClick={onRunBatch}
          >
            {isBatchRunning ? "Running..." : "Run batch"}
          </Button>
        </div>
      </div>
    </div>
  );
};
