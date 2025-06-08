
import React, { useCallback } from 'react';
import { Upload, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFilesUploaded: (files: Array<{ name: string; content: string }>) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesUploaded }) => {
  const { toast } = useToast();
  const [dragActive, setDragActive] = React.useState(false);

  const handleFiles = useCallback(async (files: FileList) => {
    const validFiles: Array<{ name: string; content: string }> = [];

    for (const file of Array.from(files)) {
      if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.lov')) {
        try {
          const content = await file.text();
          validFiles.push({ name: file.name, content });
        } catch (error) {
          toast({
            title: "Erreur de lecture",
            description: `Impossible de lire le fichier ${file.name}`,
            variant: "destructive",
            duration: 5000,
          });
        }
      } else {
        toast({
          title: "Format non supporté",
          description: `Le fichier ${file.name} n'est pas un fichier texte supporté (.txt ou .lov)`,
          variant: "destructive",
          duration: 5000,
        });
      }
    }

    if (validFiles.length > 0) {
      onFilesUploaded(validFiles);
    }
  }, [onFilesUploaded, toast]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  return (
    <Card className={`
      romantic-card p-4 sm:p-6 lg:p-8 rounded-xl transition-all duration-300 cursor-pointer group
      ${dragActive 
        ? 'border-rose-500 bg-rose-500/5' 
        : 'hover:border-rose-500/50'
      }
    `}>
      <div
        className="text-center"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept=".txt,.lov"
          onChange={handleFileInput}
          className="hidden"
        />
        
        <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-rose-500/10 flex items-center justify-center transition-all duration-300 ${
            dragActive ? 'bg-rose-500/20 scale-110' : 'group-hover:bg-rose-500/15'
          }`}>
            <Upload className={`h-5 w-5 sm:h-6 sm:w-6 transition-colors duration-300 ${
              dragActive ? 'text-rose-400' : 'text-rose-500 group-hover:text-rose-400'
            }`} />
          </div>
          
          <div className="text-center">
            <h3 className="font-semibold romantic-text text-base sm:text-lg mb-1">
              Ajouter des conversations
            </h3>
            <p className="romantic-muted text-xs sm:text-sm">
              Glissez-déposez vos fichiers .txt ou .lov
            </p>
          </div>
          
          <Button size="sm" className="romantic-button text-xs sm:text-sm px-4 sm:px-6">
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Parcourir
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default FileUpload;
