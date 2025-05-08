"use client";

import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getUserCustomThemes,
  getPublicCustomThemes,
} from "@/app/_actions/presentation/theme-actions";
import { ThemeCreator } from "./ThemeCreator";
import { usePresentationState } from "@/states/presentation-state";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import { type ThemeProperties } from "@/lib/presentation/themes";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, X } from "lucide-react";

// Define interfaces for the theme data
interface CustomTheme {
  id: string;
  name: string;
  description?: string;
  themeData: ThemeProperties;
  isPublic: boolean;
  logoUrl?: string;
  userId: string;
  user?: {
    name: string;
  };
}

function ThemeCardSkeleton() {
  return (
    <div className="space-y-2 rounded-lg border p-4">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-4 w-48" />
      <div className="flex gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
    </div>
  );
}

export function ThemeModal({ children }: { children?: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("my-themes");
  const { setTheme } = usePresentationState();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Fetch user themes with React Query
  const { data: userThemes = [], isLoading: isLoadingUserThemes } = useQuery({
    queryKey: ["userThemes"],
    queryFn: async () => {
      const result = await getUserCustomThemes();
      return result.success ? (result.themes as CustomTheme[]) : [];
    },
    enabled: isOpen,
  });

  // Fetch public themes with React Query
  const { data: publicThemes = [], isLoading: isLoadingPublicThemes } =
    useQuery({
      queryKey: ["publicThemes"],
      queryFn: async () => {
        const result = await getPublicCustomThemes();
        return result.success ? (result.themes as CustomTheme[]) : [];
      },
      enabled: isOpen,
    });

  const handleSelectTheme = (theme: CustomTheme) => {
    // Instead of just passing the ID, pass the full theme data
    setTheme(theme.id, theme.themeData);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children ? children : <Button variant="link">More Themes</Button>}
      </DialogTrigger>
      <DialogContent
        shouldHaveClose={false}
        className="h-[60vh] max-w-5xl overflow-auto"
      >
        <div className="flex h-full flex-col ">
          <Tabs
            defaultValue="my-themes"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <div className="mb-4 flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="my-themes">My Themes</TabsTrigger>
                <TabsTrigger value="public-themes">Public Themes</TabsTrigger>
              </TabsList>

              <div className="flex gap-2">
                <ThemeCreator>
                  <Button>
                    <Plus className="mr-1 size-4"></Plus>
                    Create New Theme
                  </Button>
                </ThemeCreator>

                <DialogClose asChild>
                  <Button size={"icon"} variant={"ghost"}>
                    <X className="size-4"> </X>
                  </Button>
                </DialogClose>
              </div>
            </div>

            <TabsContent value="my-themes">
              {isLoadingUserThemes ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <ThemeCardSkeleton key={i} />
                  ))}
                </div>
              ) : userThemes.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {userThemes.map((theme) => {
                    const themeData = theme.themeData;
                    const modeColors = isDark
                      ? themeData.colors.dark
                      : themeData.colors.light;
                    const modeShadows = isDark
                      ? themeData.shadows.dark
                      : themeData.shadows.light;

                    return (
                      <button
                        key={theme.id}
                        onClick={() => handleSelectTheme(theme)}
                        className="group relative space-y-2 rounded-lg border p-4 text-left transition-all hover:border-primary/50 hover:bg-muted/50"
                        style={{
                          borderRadius: themeData.borderRadius,
                          boxShadow: modeShadows.card,
                          transition: themeData.transitions.default,
                          backgroundColor: isDark
                            ? "rgba(0,0,0,0.3)"
                            : "rgba(255,255,255,0.9)",
                        }}
                      >
                        <div
                          className="font-medium"
                          style={{
                            color: modeColors.heading,
                            fontFamily: themeData.fonts.heading,
                          }}
                        >
                          {theme.name}
                        </div>
                        <div
                          className="text-sm"
                          style={{
                            color: modeColors.text,
                            fontFamily: themeData.fonts.body,
                          }}
                        >
                          {theme.description ?? "Custom theme"}
                        </div>
                        <div className="flex gap-2">
                          {[
                            modeColors.primary,
                            modeColors.secondary,
                            modeColors.accent,
                          ].map((color, i) => (
                            <div
                              key={i}
                              className="h-4 w-4 rounded-full ring-1 ring-inset ring-white/10"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-64 flex-col items-center justify-center">
                  <p className="mb-4 text-muted-foreground">
                    You haven&apos;t created any themes yet
                  </p>
                  <ThemeCreator>
                    <Button>Create Your First Theme</Button>
                  </ThemeCreator>
                </div>
              )}
            </TabsContent>

            <TabsContent value="public-themes">
              {isLoadingPublicThemes ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <ThemeCardSkeleton key={i} />
                  ))}
                </div>
              ) : publicThemes.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {publicThemes.map((theme) => {
                    const themeData = theme.themeData;
                    const modeColors = isDark
                      ? themeData.colors.dark
                      : themeData.colors.light;
                    const modeShadows = isDark
                      ? themeData.shadows.dark
                      : themeData.shadows.light;

                    return (
                      <button
                        key={theme.id}
                        onClick={() => handleSelectTheme(theme)}
                        className="group relative space-y-2 rounded-lg border p-4 text-left transition-all hover:border-primary/50 hover:bg-muted/50"
                        style={{
                          borderRadius: themeData.borderRadius,
                          boxShadow: modeShadows.card,
                          transition: themeData.transitions.default,
                          backgroundColor: isDark
                            ? "rgba(0,0,0,0.3)"
                            : "rgba(255,255,255,0.9)",
                        }}
                      >
                        <div
                          className="font-medium"
                          style={{
                            color: modeColors.heading,
                            fontFamily: themeData.fonts.heading,
                          }}
                        >
                          {theme.name}
                        </div>
                        <div
                          className="text-sm"
                          style={{
                            color: modeColors.text,
                            fontFamily: themeData.fonts.body,
                          }}
                        >
                          {theme.description ?? "Custom theme"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          By {theme.user?.name ?? "Unknown"}
                        </div>
                        <div className="flex gap-2">
                          {[
                            modeColors.primary,
                            modeColors.secondary,
                            modeColors.accent,
                          ].map((color, i) => (
                            <div
                              key={i}
                              className="h-4 w-4 rounded-full ring-1 ring-inset ring-white/10"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center">
                  <p className="text-muted-foreground">
                    No public themes available
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
