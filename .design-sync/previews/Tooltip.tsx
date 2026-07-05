import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "kernel-portal"

export function MoistureTooltip() {
  return (
    <TooltipProvider>
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 120 }}>
        <Tooltip open>
          <TooltipTrigger
            render={<Button variant="outline">16.2% moisture</Button>}
          />
          <TooltipContent>
            Over the 15% spec — drying discount applies at intake
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
