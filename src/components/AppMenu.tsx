import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Palette,
  BarChart3,
  Info,
  BookOpen,
  Moon,
  Sun,
  Heart,
  HeartPlus,
  Music,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";

const AppMenu: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: "love", name: "Love", icon: Heart, color: "text-rose-500" },
    { id: "loveplus", name: "Love +", icon: HeartPlus, color: "text-blue-500" },
    { id: "dark", name: "Dark", icon: Moon, color: "text-gray-600" },
    { id: "light", name: "Light", icon: Sun, color: "text-yellow-500" },
    { id: "spotify", name: "Spotify", icon: Music, color: "text-green-500" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-black/20 border-white/20 text-white hover:bg-black/30"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Palette className="mr-2 h-4 w-4" />
            Thème
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {themes.map((themeOption) => {
              const IconComponent = themeOption.icon;
              return (
                <DropdownMenuItem
                  key={themeOption.id}
                  onClick={() => setTheme(themeOption.id as any)}
                  className={`cursor-pointer ${
                    theme === themeOption.id ? "bg-accent" : ""
                  }`}
                >
                  <IconComponent
                    className={`mr-2 h-4 w-4 ${themeOption.color}`}
                  />
                  {themeOption.name}
                  {theme === themeOption.id && (
                    <span className="ml-auto text-xs">✓</span>
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => navigate("/statistics")}
          className="cursor-pointer"
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          Statistiques
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => navigate("/stories")}
          className="cursor-pointer"
        >
          <BookOpen className="mr-2 h-4 w-4" />
          Stories Analytics
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => navigate("/about")}
          className="cursor-pointer"
        >
          <Info className="mr-2 h-4 w-4" />À propos
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          Version: {import.meta.env.VITE_APP_VERSION || "dev"}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AppMenu;
