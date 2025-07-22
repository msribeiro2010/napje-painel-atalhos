import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Copy, FileText } from 'lucide-react';
import { DescriptionSection } from '@/types/form';
import { toast } from 'sonner';

interface GeneratedDescriptionSectionProps {
  isGenerated: boolean;
  sections: DescriptionSection[];
  generatedDescription: string;
}

export const GeneratedDescriptionSection = ({ 
  isGenerated, 
  sections, 
  generatedDescription 
}: GeneratedDescriptionSectionProps) => {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado para a área de transferência!`);
  };

  const copyFullDescription = () => {
    navigator.clipboard.writeText(generatedDescription);
    toast.success('Descrição completa copiada para a área de transferência!');
  };

  const renderSectionPairs = () => {
    const pairedSections = [];
    const fullWidthSections = [];

    sections.forEach(section => {
      if (section.fullWidth) {
        fullWidthSections.push(section);
      } else {
        pairedSections.push(section);
      }
    });

    const pairs = [];
    for (let i = 0; i < pairedSections.length; i += 2) {
      pairs.push({
        left: pairedSections[i],
        right: pairedSections[i + 1] || null
      });
    }

    return { pairs, fullWidthSections };
  };

  return (
    <div className={`transition-all duration-500 ease-in-out w-full ${
      isGenerated 
        ? 'opacity-100 translate-y-0' 
        : 'opacity-0 translate-y-4 pointer-events-none'
    }`}>
      <Card className="shadow-lg w-full">
        <CardHeader className="bg-green-600 text-white">
          <CardTitle className="flex items-center text-xl">
            <Check className="h-6 w-6 mr-3" />
            Template JIRA - Sustentação
          </CardTitle>
          <CardDescription className="text-green-100 text-base">
            Template formatado e pronto para copiar no campo "Notas" do JIRA
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm max-h-[70vh] overflow-y-auto">
              {(() => {
                const { pairs, fullWidthSections } = renderSectionPairs();
                return (
                  <div className="p-4 space-y-4">
                    {/* Seções de largura completa primeiro */}
                    {fullWidthSections.map((section, index) => (
                      <div key={section.key} className={`${index !== fullWidthSections.length - 1 || pairs.length > 0 ? 'border-b border-gray-100 pb-4' : ''}`}>
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-800 text-sm">
                               {section.title.includes('Resumo') ? '*' : ''}{section.title}
                             </h4>
                          <Button
                            onClick={() => copyToClipboard(section.content, section.title)}
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 hover:bg-gray-100"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                         <div className="bg-gray-50 p-4 rounded border text-base font-mono text-gray-700 leading-relaxed">
                           {section.content || <span className="text-gray-400 italic">Campo vazio</span>}
                         </div>
                      </div>
                    ))}
                    
                    {/* Seções pareadas */}
                    {pairs.map((pair, pairIndex) => (
                      <div key={`pair-${pairIndex}`} className={`${pairIndex !== pairs.length - 1 ? 'border-b border-gray-100 pb-4' : ''}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Seção da esquerda */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                               <h4 className="font-semibold text-gray-800 text-sm">
                                 {pair.left.title.includes('Resumo') ? '*' : ''}{pair.left.title}
                               </h4>
                              <Button
                                onClick={() => copyToClipboard(pair.left.content, pair.left.title)}
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 hover:bg-gray-100"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                             <div className="bg-gray-50 p-4 rounded border text-base font-mono text-gray-700 leading-relaxed">
                               {pair.left.content || <span className="text-gray-400 italic">Campo vazio</span>}
                             </div>
                          </div>
                          
                          {/* Seção da direita */}
                          {pair.right && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                 <h4 className="font-semibold text-gray-800 text-sm">
                                   {pair.right.title.includes('Resumo') ? '*' : ''}{pair.right.title}
                                 </h4>
                                <Button
                                  onClick={() => copyToClipboard(pair.right.content, pair.right.title)}
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 hover:bg-gray-100"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                               <div className="bg-gray-50 p-4 rounded border text-base font-mono text-gray-700 leading-relaxed">
                                 {pair.right.content || <span className="text-gray-400 italic">Campo vazio</span>}
                               </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
            
            <div className="flex gap-2">
              <Button onClick={copyFullDescription} className="flex-1 bg-green-600 hover:bg-green-700">
                <Copy className="h-4 w-4 mr-2" />
                Copiar Descrição Completa
              </Button>
              <Button 
                onClick={() => {
                   const formattedText = sections
                     .map(section => `${section.title}${section.title.includes('Resumo') ? ' *' : ''}\n${section.content}`)
                     .join('\n\n');
                  copyToClipboard(formattedText, 'Template formatado');
                }}
                variant="secondary" 
                className="flex-1"
              >
                <FileText className="h-4 w-4 mr-2" />
                Copiar Template Formatado
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};