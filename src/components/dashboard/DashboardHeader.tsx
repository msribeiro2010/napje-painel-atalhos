import { Button } from '@/components/ui/button';
import { FileText, ExternalLink, Bot } from 'lucide-react';
import UserMenu from '@/components/UserMenu';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Clock } from '@/components/ui/clock';
import { DateDisplay } from '@/components/ui/date-display';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { AITool } from '@/types/dashboard';

const aiTools: AITool[] = [
  { name: 'ChatGPT', url: 'https://chatgpt.com/' },
  { name: 'Claude.ai', url: 'https://claude.ai/login?returnTo=%2F%3F' },
  { name: 'Perplexity', url: 'https://www.perplexity.ai/?login-source=oneTapHome&login-new=false' },
  { name: 'Lovable', url: 'https://lovable.dev/' },
  { name: 'Base44', url: 'https://app.base44.com/' },
  { name: 'Abacus', url: 'https://abacus.ai/' },
];

interface DashboardHeaderProps {
  isAdmin?: boolean;
}

export const DashboardHeader = ({ isAdmin }: DashboardHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-3">
        <a href="https://trt15.jus.br/" target="_blank" rel="noopener noreferrer">
          <img src="/lovable-uploads/622691d5-a295-40f0-ad0d-cb958024c4ba.png" alt="Brasão TRT15" className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity" />
        </a>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Painel JIRA - V.2.15.2
          </h1>
          <p className="text-muted-foreground">Núcleo de Apoio ao PJe - TRT15</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Clock />
        <DateDisplay />
        {isAdmin && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 hover:scale-105 transition-transform"
              >
                <Bot className="h-4 w-4" />
                <span className="hidden sm:inline">Ferramentas IA</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-background border shadow-lg">
              {aiTools.map((tool) => (
                <DropdownMenuItem
                  key={tool.name}
                  onClick={() => window.open(tool.url, '_blank')}
                  className="cursor-pointer hover:bg-accent"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {tool.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <Button
          variant="outline"
          onClick={() => window.open('https://msribeiro2010.github.io/PROJETO-CENTRAL-NUCLEO/', '_blank')}
          className="flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <ExternalLink className="h-4 w-4" />
          <span className="hidden sm:inline">Central do Núcleo</span>
        </Button>
        <ThemeToggle />
        <UserMenu />
      </div>
    </div>
  );
};