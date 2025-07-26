import { useState, useRef } from 'react';
import { Upload, X, Image, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface MediaUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // em MB
}

export const MediaUpload = ({ 
  files, 
  onFilesChange, 
  maxFiles = 3, 
  maxFileSize = 10 
}: MediaUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    handleFiles(selectedFiles);
  };

  const handleFiles = (newFiles: File[]) => {
    const validFiles: File[] = [];
    
    for (const file of newFiles) {
      // Verificar se já atingiu o limite
      if (files.length + validFiles.length >= maxFiles) {
        toast.error(`Máximo de ${maxFiles} arquivos permitidos`);
        break;
      }
      
      // Verificar tipo de arquivo - apenas imagens
      const isImage = file.type.startsWith('image/');
      
      if (!isImage) {
        toast.error(`Arquivo ${file.name} não é uma imagem válida`);
        continue;
      }
      
      // Verificar tamanho
      if (file.size > maxFileSize * 1024 * 1024) {
        toast.error(`Arquivo ${file.name} excede o tamanho máximo de ${maxFileSize}MB`);
        continue;
      }
      
      // Verificar se já existe
      if (files.some(f => f.name === file.name && f.size === file.size)) {
        toast.error(`Arquivo ${file.name} já foi adicionado`);
        continue;
      }
      
      validFiles.push(file);
    }
    
    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles]);
      toast.success(`${validFiles.length} arquivo(s) adicionado(s)`);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    return <Image className="h-4 w-4" />;
  };

  const getPreviewUrl = (file: File) => {
    return URL.createObjectURL(file);
  };

  return (
    <div className="space-y-4">
      <Label>Imagens (máximo {maxFiles})</Label>
      
      {/* Área de upload */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-2">
          <Upload className="mx-auto h-8 w-8 text-gray-400" />
          <div className="text-sm text-gray-600">
            <span className="font-medium">Clique para selecionar</span> ou arraste arquivos aqui
          </div>
          <div className="text-xs text-gray-500">
            Formatos aceitos: PNG, JPG, JPEG, GIF, WebP
            <br />
            Máximo {maxFileSize}MB por arquivo
          </div>
        </div>
      </div>

      {/* Lista de arquivos */}
      {files.length > 0 && (
        <div className="space-y-2">
          <Label>Arquivos selecionados ({files.length}/{maxFiles})</Label>
          <div className="grid gap-2">
            {files.map((file, index) => (
              <Card key={index} className="p-3">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        {getFileIcon(file)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Badge variant="outline" className="text-xs">
                            Imagem
                          </Badge>
                          <span>{formatFileSize(file.size)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Botão de preview */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPreviewFile(file)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>{file.name}</DialogTitle>
                          </DialogHeader>
                          <div className="flex justify-center">
                            <img
                              src={getPreviewUrl(file)}
                              alt={file.name}
                              className="max-w-full max-h-[70vh] object-contain"
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      {/* Botão de remover */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground">
        💡 <strong>Dicas:</strong>
        <br />• Use imagens para mostrar prints de tela, capturas de erro, interfaces
        <br />• Organize as imagens na ordem que faz mais sentido para o entendimento
        <br />• Prefira imagens claras e com boa resolução
      </p>
    </div>
  );
};