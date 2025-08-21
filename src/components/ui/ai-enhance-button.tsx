import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIEnhanceButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
  className?: string;
}

export const AIEnhanceButton = ({ 
  onClick, 
  isLoading = false, 
  disabled = false,
  size = "sm",
  variant = "outline",
  className
}: AIEnhanceButtonProps) => {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        "gap-1.5 text-xs font-medium transition-all",
        "hover:scale-105 active:scale-95",
        "border-purple-200 hover:border-purple-300 hover:bg-purple-50",
        "text-purple-700 hover:text-purple-800",
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Sparkles className="h-3 w-3" />
      )}
      {isLoading ? 'Melhorando...' : 'IA'}
    </Button>
  );
};