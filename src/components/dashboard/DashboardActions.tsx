import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { DashboardAction } from '@/types/dashboard';

interface DashboardActionsProps {
  actions: DashboardAction[];
}

export const DashboardActions = ({ actions }: DashboardActionsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {actions.map((action) => (
        <Card key={action.title} className="hover:shadow-glow transition-all cursor-pointer group">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto p-3 bg-gradient-primary rounded-xl shadow-glow mb-3 group-hover:scale-110 transition-transform">
              <action.icon className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-lg">{action.title}</CardTitle>
            <CardDescription className="text-sm">{action.description}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button 
              variant={action.variant}
              onClick={action.onClick}
              className="w-full"
            >
              Acessar
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};