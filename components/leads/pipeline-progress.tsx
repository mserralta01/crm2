"use client";

import { cn } from "@/lib/utils";
import { Lead } from "@/data/leads";
import { updateLead } from "@/lib/services/leads-service";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check, ChevronRight } from "lucide-react";

// Define the pipeline stages and their corresponding visual styles
const PIPELINE_STAGES = [
  { id: "New", label: "New Lead", color: "bg-blue-600 hover:bg-blue-700" },
  { id: "Contacted", label: "Contact Made", color: "bg-yellow-600 hover:bg-yellow-700" },
  { id: "Qualified", label: "Qualified", color: "bg-green-600 hover:bg-green-700" },
  { id: "Negotiating", label: "Negotiating", color: "bg-purple-600 hover:bg-purple-700" },
  { id: "Closed", label: "Closed Won", color: "bg-emerald-600 hover:bg-emerald-700" },
  { id: "Lost", label: "Closed Lost", color: "bg-red-600 hover:bg-red-700" }
];

interface PipelineProgressProps {
  lead: Lead;
  onStatusUpdate?: (newStatus: string) => void;
}

export function PipelineProgress({ lead, onStatusUpdate }: PipelineProgressProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  
  // Find the current stage index
  const currentStageIndex = PIPELINE_STAGES.findIndex(stage => stage.id === lead.status);
  
  // Calculate days in current stage (mocking for now, would come from lead data)
  const daysInStage = lead.daysInStage || {}; // This would be added to the Lead interface
  
  const handleStageClick = async (stageId: string) => {
    if (stageId === lead.status || isUpdating) return;
    
    setIsUpdating(stageId);
    try {
      // Update the lead's status in the database
      await updateLead(lead.id, {
        status: stageId,
        // Update the timestamp for when this stage was entered
        statusUpdatedAt: new Date().toISOString()
      });
      
      // Notify parent component
      if (onStatusUpdate) {
        onStatusUpdate(stageId);
      }
      
      toast({
        title: "Status Updated",
        description: `Lead moved to ${stageId} stage`,
        duration: 2000,
      });
    } catch (error) {
      console.error("Error updating stage:", error);
      toast({
        title: "Error",
        description: "Failed to update stage. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };
  
  return (
    <TooltipProvider>
      <div className="w-full bg-muted rounded-md overflow-hidden mb-8 relative">
        <div className="flex w-full">
          {PIPELINE_STAGES.map((stage, index) => {
            const isCurrentStage = stage.id === lead.status;
            const isCompleted = index <= currentStageIndex;
            const isUpdatingThisStage = isUpdating === stage.id;
            const days = daysInStage[stage.id] || 0;
            
            // Generate tooltip content
            const tooltipContent = isCurrentStage 
              ? `Current stage: ${days} days`
              : isCompleted 
                ? `Completed stage: ${days} days` 
                : `Click to move lead to ${stage.label}`;
            
            return (
              <Tooltip key={stage.id}>
                <TooltipTrigger asChild>
                  <div 
                    className={cn(
                      "h-14 flex-1 transition-all duration-200 flex flex-col justify-center items-center text-center relative cursor-pointer",
                      isCompleted ? stage.color : "bg-gray-200",
                      isUpdatingThisStage && "opacity-70",
                      stage.id === isUpdating && "animate-pulse"
                    )}
                    onClick={() => handleStageClick(stage.id)}
                  >
                    <span className={cn(
                      "font-medium text-xs",
                      isCompleted ? "text-white" : "text-gray-600"
                    )}>
                      {stage.label}
                    </span>
                    <span className={cn(
                      "text-[10px]", 
                      isCompleted ? "text-white/80" : "text-gray-500"
                    )}>
                      {days} days
                    </span>
                    
                    {/* Stage completion indicator */}
                    {isCompleted && index < currentStageIndex && (
                      <div className="absolute right-1 top-1">
                        <Check className="h-3 w-3 text-white/90" />
                      </div>
                    )}
                    
                    {/* Current stage indicator */}
                    {isCurrentStage && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white rounded-full border-2 border-current"></div>
                    )}
                    
                    {/* Stage connector chevron */}
                    {index < PIPELINE_STAGES.length - 1 && (
                      <div className="absolute right-[-8px] top-1/2 transform -translate-y-1/2 z-10">
                        <ChevronRight className={cn(
                          "h-4 w-4",
                          isCompleted ? "text-white" : "text-gray-400"
                        )} />
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tooltipContent}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
        
        {/* Progress line */}
        <div 
          className="absolute h-1 bg-blue-500 bottom-0 left-0 transition-all duration-500"
          style={{ 
            width: `${Math.min(100, (currentStageIndex / (PIPELINE_STAGES.length - 1)) * 100)}%`,
            background: 'linear-gradient(to right, #3b82f6, #10b981)'
          }}
        />
      </div>
    </TooltipProvider>
  );
} 