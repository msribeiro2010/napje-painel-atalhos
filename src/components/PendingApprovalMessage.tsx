import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Shield, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const PendingApprovalMessage = () => {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-yellow-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <CardTitle className="text-xl">Aguardando Aprovação</CardTitle>
          <CardDescription>
            Sua conta foi criada com sucesso, mas precisa ser aprovada por um administrador
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900">Status da Conta</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Por questões de segurança, todas as novas contas precisam ser aprovadas por um administrador do TRT15.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900">Próximos Passos</h3>
                <p className="text-sm text-green-700 mt-1">
                  Você receberá um email assim que sua conta for aprovada. Normalmente este processo leva até 24 horas.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Se você tiver dúvidas, entre em contato com o suporte de TI do TRT15.</p>
          </div>

          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => signOut()}
          >
            Fazer Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingApprovalMessage;