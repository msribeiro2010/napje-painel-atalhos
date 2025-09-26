import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, FileText, Calendar, Briefcase, User, Building, Clock, DollarSign, CheckCircle, AlertCircle, History } from "lucide-react";
import { formatDate } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Processo } from '@/hooks/usePJeSearch';

interface ProcessoDetalhesModalProps {
  open: boolean;
  onClose: () => void;
  detalhes: Processo | any;
  loading?: boolean;
}

export function ProcessoDetalhesModal({
  open,
  onClose,
  detalhes,
  loading = false
}: ProcessoDetalhesModalProps) {
  if (!detalhes) return null;

  // Suporte para ambas estruturas de dados
  const processo = detalhes.processo || detalhes;
  const partes = detalhes.partes || [];
  const tarefa = detalhes.tarefa || detalhes.tarefa_atual;
  const documentos = detalhes.documentos || [];

  // Agrupa partes por polo e situação
  const partesAtivas = partes.filter(p => 
    p.polo?.includes('Ativo') || p.polo?.includes('Reclamante') || p.ds_polo_parte?.includes('ATIVO')
  );
  const partesPassivas = partes.filter(p => 
    p.polo?.includes('Passivo') || p.polo?.includes('Reclamada') || p.ds_polo_parte?.includes('PASSIVO')
  );
  const partesTerceiros = partes.filter(p => 
    !p.polo?.includes('Ativo') && !p.polo?.includes('Passivo') &&
    !p.polo?.includes('Reclamante') && !p.polo?.includes('Reclamada') &&
    !p.ds_polo_parte?.includes('ATIVO') && !p.ds_polo_parte?.includes('PASSIVO')
  );
  
  const historicoTarefas = detalhes.historico_tarefas || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Processo {processo.numero_unico || `${processo.numero}/${processo.ano}`}
          </DialogTitle>
          <DialogDescription>
            {processo.nome_orgao_julgador}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="partes" className="mt-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="partes">
              <Users className="h-4 w-4 mr-2" />
              Partes ({partes.length})
            </TabsTrigger>
            <TabsTrigger value="historico">
              <History className="h-4 w-4 mr-2" />
              Histórico ({historicoTarefas.length})
            </TabsTrigger>
            <TabsTrigger value="tarefa">
              <Briefcase className="h-4 w-4 mr-2" />
              Atual
            </TabsTrigger>
            <TabsTrigger value="dados">
              <FileText className="h-4 w-4 mr-2" />
              Dados
            </TabsTrigger>
            <TabsTrigger value="documentos">
              <FileText className="h-4 w-4 mr-2" />
              Docs ({documentos.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="partes" className="mt-4">
            <ScrollArea className="h-[400px] w-full">
              <div className="space-y-4">
                {/* Polo Ativo */}
                {partesAtivas.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Badge variant="default">Polo Ativo</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {partesAtivas.map((parte, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-2 rounded hover:bg-muted/50">
                          <User className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{parte.nome_parte}</p>
                            <p className="text-xs text-muted-foreground">
                              {parte.tipo_parte} 
                              {(parte.documento || parte.cpf || parte.cnpj) && ` • CPF/CNPJ: ${parte.documento || parte.cpf || parte.cnpj}`}
                            </p>
                            <div className="flex gap-2 mt-1">
                              {parte.parte_principal === 'S' && (
                                <Badge variant="outline" className="text-xs">Parte Principal</Badge>
                              )}
                              {parte.situacao_parte && (
                                <Badge 
                                  variant={parte.situacao_parte === 'Ativa' ? 'default' : 'secondary'} 
                                  className="text-xs"
                                >
                                  {parte.situacao_parte}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Polo Passivo */}
                {partesPassivas.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Badge variant="secondary">Polo Passivo</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {partesPassivas.map((parte, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-2 rounded hover:bg-muted/50">
                          <User className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{parte.nome_parte}</p>
                            <p className="text-xs text-muted-foreground">
                              {parte.tipo_parte}
                              {parte.documento && ` • CPF/CNPJ: ${parte.documento}`}
                            </p>
                            {parte.parte_principal === 'S' && (
                              <Badge variant="outline" className="text-xs mt-1">Parte Principal</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Terceiros */}
                {partesTerceiros.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Badge variant="outline">Terceiros</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {partesTerceiros.map((parte, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-2 rounded hover:bg-muted/50">
                          <User className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{parte.nome_parte}</p>
                            <p className="text-xs text-muted-foreground">
                              {parte.tipo_parte}
                              {parte.documento && ` • CPF/CNPJ: ${parte.documento}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="tarefa" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Situação Atual do Processo
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tarefa ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tarefa Atual</p>
                      <p className="text-lg font-semibold">{tarefa.tarefa_atual || tarefa.nome_tarefa}</p>
                    </div>
                    
                    {tarefa.descricao_tarefa && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Descrição</p>
                        <p className="text-sm">{tarefa.descricao_tarefa}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Início da Tarefa</p>
                        <p className="text-sm">
                          {(tarefa.data_inicio_tarefa || tarefa.data_inicio)
                            ? formatDate(new Date(tarefa.data_inicio_tarefa || tarefa.data_inicio), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                            : 'Não informado'}
                        </p>
                      </div>
                      
                      {tarefa.responsavel && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Responsável</p>
                          <p className="text-sm">{tarefa.responsavel}</p>
                        </div>
                      )}
                    </div>
                    
                    {tarefa.dias_na_tarefa && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-sm flex items-center gap-2">
                          <Clock className="h-4 w-4 text-amber-600" />
                          <span className="font-medium text-amber-900">
                            Há {tarefa.dias_na_tarefa} dias nesta tarefa
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Não foi possível identificar a tarefa atual do processo</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dados" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Dados Gerais do Processo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Número CNJ</p>
                    <p className="font-mono">{processo.numero_unico || 'Não informado'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Número/Ano</p>
                    <p className="font-mono">{processo.numero}/{processo.ano}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Data de Autuação</p>
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {(processo.dta_autuacao || processo.data_autuacao)
                        ? formatDate(new Date(processo.dta_autuacao || processo.data_autuacao), 'dd/MM/yyyy', { locale: ptBR })
                        : 'Não informada'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Órgão Julgador</p>
                    <p className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      {processo.nome_orgao_julgador || processo.orgao_julgador || 'Não informado'}
                    </p>
                  </div>
                  
                  {processo.classe_judicial && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Classe Judicial</p>
                      <p className="text-sm">{processo.classe_judicial}</p>
                    </div>
                  )}
                  
                  {processo.valor_causa && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Valor da Causa</p>
                      <p className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        R$ {processo.valor_causa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="historico" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Histórico de Tarefas
                </CardTitle>
                <CardDescription>
                  Todas as tarefas pelas quais o processo passou
                </CardDescription>
              </CardHeader>
              <CardContent>
                {historicoTarefas && historicoTarefas.length > 0 ? (
                  <ScrollArea className="h-[350px]">
                    <div className="space-y-2">
                      {historicoTarefas.map((evento, idx) => (
                        <Card key={idx} className="p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <p className="font-medium text-sm">
                                  {evento.nome_evento || evento.nome_tarefa || 'Evento'}
                                </p>
                              </div>
                              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                {evento.data_evento && (
                                  <p>Data: {formatDate(new Date(evento.data_evento), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                                )}
                                {evento.usuario && (
                                  <p>Usuário: {evento.usuario}</p>
                                )}
                                {evento.tarefa_relacionada && (
                                  <p>Tarefa: {evento.tarefa_relacionada}</p>
                                )}
                              </div>
                            </div>
                            <Badge 
                              variant={evento.periodo === 'Hoje' ? 'default' : evento.periodo === 'Ontem' ? 'secondary' : 'outline'}
                              className="text-xs"
                            >
                              {evento.periodo || 'Evento'}
                            </Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum histórico de tarefas encontrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="documentos" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documentos do Processo
                </CardTitle>
                <CardDescription>
                  Últimos documentos juntados ao processo
                </CardDescription>
              </CardHeader>
              <CardContent>
                {documentos && documentos.length > 0 ? (
                  <ScrollArea className="h-[350px]">
                    <div className="space-y-2">
                      {documentos.map((doc, idx) => (
                        <Card key={idx} className="p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {doc.nome_documento || doc.tipo_documento || 'Documento'}
                              </p>
                              {doc.dt_juntada && (
                                <p className="text-xs text-muted-foreground">
                                  Juntado em: {formatDate(new Date(doc.dt_juntada), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                </p>
                              )}
                              {doc.juntado_por && (
                                <p className="text-xs text-muted-foreground">
                                  Por: {doc.juntado_por}
                                </p>
                              )}
                            </div>
                            {doc.sigiloso === 'S' ? (
                              <Badge variant="destructive" className="text-xs">
                                Sigiloso
                              </Badge>
                            ) : doc.id_processo_documento ? (
                              <Badge variant="outline" className="text-xs">
                                ID: {doc.id_processo_documento}
                              </Badge>
                            ) : null}
                          </div>
                          {doc.ds_identificador_unico && (
                            <p className="text-xs font-mono text-muted-foreground mt-2">
                              ID: {doc.ds_identificador_unico}
                            </p>
                          )}
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum documento encontrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}