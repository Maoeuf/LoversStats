
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
            description: `Le fichier ${file.name} n'est pas un fichier texte supporté (.txt ou .lov)`,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Format non supporté",
          description: `Le fichier ${file.name} n'est pas un fichier texte`,
          variant: "destructive"
        });
      }
    }

    if (validFiles.length > 0) {
      onFilesUploaded(validFiles);
      toast({
        title: "Fichiers chargés",
        description: `${validFiles.length} fichier(s) de conversation chargé(s) avec succès`
      });
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
      spotify-card p-7 rounded-xl transition-all duration-300 cursor-pointer group
      ${dragActive 
        ? 'border-green-500 bg-green-500/5' 
        : 'hover:border-green-500/50'
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
        
        <div className="flex items-center justify-center space-x-7">
          <div className={`w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center transition-all duration-300 ${
            dragActive ? 'bg-green-500/20 scale-110' : 'group-hover:bg-green-500/15'
          }`}>
            <Upload className={`h-5 w-5 transition-colors duration-300 ${
              dragActive ? 'text-green-400' : 'text-green-500 group-hover:text-green-400'
            }`} />
          </div>
          <div className="text-left">
            <h3 className="font-semibold spotify-text">
              Ajouter des conversations
            </h3>
            <p className="spotify-muted text-sm">
              Glissez-déposez vos fichiers .lov
            </p>
          </div>
          <Button size="sm" className="spotify-button">
            <Plus className="h-4 w-4 mr-0" />
            Parcourir
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default FileUpload;
