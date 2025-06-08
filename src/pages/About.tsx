
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Github, Mail, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const About: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold">À propos</h1>
        </div>

        <div className="space-y-6">
          {/* App Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-rose-500" />
                LoversStats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                LoversStats est une application qui vous permet d'analyser vos conversations 
                WhatsApp, Instagram et Discord pour découvrir des statistiques fascinantes 
                sur vos échanges.
              </p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Version:</span>
                  <span className="ml-2 text-muted-foreground">
                    {import.meta.env.VITE_APP_VERSION || 'dev-1.0.0'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Dernière mise à jour:</span>
                  <span className="ml-2 text-muted-foreground">
                    {new Date().toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Fonctionnalités</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Import de conversations WhatsApp, Instagram et Discord</li>
                <li>• Statistiques détaillées (messages, mots, participants)</li>
                <li>• Visualisations graphiques interactives</li>
                <li>• Mode Stories pour des analyses animées</li>
                <li>• Thèmes personnalisables (Love, Dark, Light, Spotify)</li>
                <li>• Export des données en PDF</li>
                <li>• Interface responsive optimisée mobile</li>
              </ul>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>Confidentialité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Vos données restent entièrement privées :
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Tout est traité localement sur votre appareil</li>
                <li>• Aucune donnée n'est envoyée sur des serveurs externes</li>
                <li>• Stockage local dans votre navigateur uniquement</li>
                <li>• Vous gardez le contrôle total de vos conversations</li>
              </ul>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle>Support & Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  GitHub
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Contact
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Coffee className="h-4 w-4" />
                  Buy me a coffee
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Credits */}
          <Card>
            <CardHeader>
              <CardTitle>Remerciements</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Développé avec ❤️ pour Jas et Mao.
                <br />
                Merci aux communautés open-source : React, Tailwind CSS, Radix UI, Lucide Icons.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;
