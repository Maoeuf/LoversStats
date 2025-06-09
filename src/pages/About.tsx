import React from "react";
import { ArrowLeft, Github, Heart, Code, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const About: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto  p-4 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={handleBack}
            size="sm"
            className="justify-center w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <img
                src="/favicon.ico"
                alt="LoversStats Logo"
                className="w-16 h-16"
              />
              <div className="text-left">
                <h1 className="text-4xl font-bold text-foreground">
                  LoversStats
                </h1>
                <p className="text-sm md:text-xl text-muted-foreground">
                  Analysez vos conversations avec style
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />À propos de
                LoversStats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                LoversStats est une application web moderne conçue pour analyser
                et visualiser vos conversations de manière élégante et privée.
                Que ce soit WhatsApp, Instagram, Discord ou SMS, découvrez des
                insights fascinants sur vos échanges.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Toutes vos données restent locales sur votre appareil - aucune
                information n'est envoyée sur nos serveurs. Votre vie privée est
                notre priorité.
              </p>
            </CardContent>
          </Card>

          {/* Informations techniques */}
          <Card>
            <CardHeader>
              <CardTitle>Informations techniques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Technologies utilisées</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>• React 18 avec TypeScript</p>
                    <p>• Tailwind CSS pour le design</p>
                    <p>• Recharts pour les graphiques</p>
                    <p>• Radix UI pour les composants</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">
                    Sécurité & Confidentialité
                  </h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>• Traitement local uniquement</p>
                    <p>• Aucune donnée envoyée en ligne</p>
                    <p>• Code source ouvert</p>
                    <p>• Chiffrement des données stockées</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GitHub Link */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="h-5 w-5 text-primary" />
                Code source
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="items-center">
                <div>
                  <p className="text-muted-foreground mb-4">
                    LoversStats est un projet open-source. Contribuez, signalez
                    des bugs ou proposez des améliorations sur GitHub.
                  </p>
                </div>
                <Button asChild className="flex items-center gap-2">
                  <a
                    href="https://github.com/Maoeuf/LoversStats"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="h-4 w-4" />
                    Voir sur GitHub
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Fait avec <Heart className="h-4 w-4 inline text-red-500" /> par
              Maoeuf
            </p>
            <p className="mt-2">
              Version {import.meta.env.VITE_APP_VERSION || "dev-1.0.0"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
