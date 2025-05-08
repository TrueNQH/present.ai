"use client";

import { useState, useEffect, type ReactNode } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useForm, Controller } from "react-hook-form";
import { useUploadThing } from "@/hooks/globals/useUploadthing";
import { Loader2, Plus } from "lucide-react";
import { themes } from "@/lib/presentation/themes";
import { createCustomTheme } from "@/app/_actions/presentation/theme-actions";

import { ThemePreview } from "./ThemePreview";
import { type ColorKey, type ThemeFormValues } from "./types";
import { LogoUploader } from "./LogoUploader";
import { FontSelector } from "./FontSelector";
import { ColorPicker } from "./ColorPicker";
import { usePresentationState } from "@/states/presentation-state";

// Define steps for the stepper
const STEPS = [
  { id: "base", label: "Base Theme", icon: "🎨" },
  { id: "colors", label: "Colors", icon: "🎭" },
  { id: "typography", label: "Typography", icon: "T" },
  { id: "logo", label: "Logo", icon: "🖼️" },
  { id: "preview", label: "Finish", icon: "👁️" },
];

export function ThemeCreator({ children }: { children?: ReactNode }) {
  const { isThemeCreatorOpen, setIsThemeCreatorOpen } = usePresentationState();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [activeColorTab, setActiveColorTab] = useState<"light" | "dark">(
    "light",
  );
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { startUpload } = useUploadThing("imageUploader");

  const form = useForm<ThemeFormValues>({
    defaultValues: {
      name: "",
      description: "",
      isPublic: false,
      themeBase: "mystique",
      colors: {
        light: { ...themes.mystique.colors.light },
        dark: { ...themes.mystique.colors.dark },
      },
      fonts: { ...themes.mystique.fonts },
      borderRadius: themes.mystique.borderRadius,
      transitions: { ...themes.mystique.transitions },
      shadows: {
        light: { ...themes.mystique.shadows.light },
        dark: { ...themes.mystique.shadows.dark },
      },
    },
  });

  const { control, handleSubmit, watch, setValue } = form;
  const watchedThemeBase = watch("themeBase");

  useEffect(() => {
    if (watchedThemeBase === "blank") {
      // Default values for blank theme - proper light/dark mode
      setValue("colors", {
        light: {
          primary: "#3B82F6", // Blue
          secondary: "#6B7280", // Gray
          accent: "#60A5FA", // Light blue
          background: "#FFFFFF", // White
          text: "#1F2937", // Dark gray
          heading: "#111827", // Almost black
          muted: "#9CA3AF", // Medium gray
        },
        dark: {
          primary: "#60A5FA", // Light blue
          secondary: "#9CA3AF", // Medium gray
          accent: "#93C5FD", // Lighter blue
          background: "#111827", // Dark blue/gray
          text: "#F9FAFB", // Almost white
          heading: "#FFFFFF", // White
          muted: "#6B7280", // Gray
        },
      });
      setValue("fonts", {
        heading: "Inter, sans-serif",
        body: "Inter, sans-serif",
      });
      setValue("borderRadius", "0.5rem");
      setValue("transitions", { default: "all 0.2s ease-in-out" });
      setValue("shadows", {
        light: {
          card: "0 1px 3px rgba(0,0,0,0.05)",
          button: "0 1px 2px rgba(0,0,0,0.03)",
        },
        dark: {
          card: "0 1px 3px rgba(0,0,0,0.05)",
          button: "0 1px 2px rgba(0,0,0,0.03)",
        },
      });
    } else {
      const selectedTheme = themes[watchedThemeBase];
      setValue("colors", { ...selectedTheme.colors });
      setValue("fonts", { ...selectedTheme.fonts });
      setValue("borderRadius", selectedTheme.borderRadius);
      setValue("transitions", { ...selectedTheme.transitions });
      setValue("shadows", { ...selectedTheme.shadows });
    }
  }, [watchedThemeBase, setValue]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const onSubmit = async (data: ThemeFormValues) => {
    try {
      setIsSubmitting(true);
      let logoUrl;

      if (logoFile) {
        const uploadResult = await startUpload([logoFile]);
        if (uploadResult?.[0]?.url) {
          logoUrl = uploadResult[0].url ?? "";
        }
      }

      // Separate the basic metadata from the theme styling data
      const { name, description, isPublic, ...themeStyleData } = data;

      const themeData = {
        name,
        description,
        isPublic,
        logo: logoUrl,
        themeData: themeStyleData, // Add the theme styling data as nested themeData field
      };

      const result = await createCustomTheme(themeData);
      if (result.success) {
        toast({
          title: "Success",
          description: "Theme created successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to create theme",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setCurrentStep(0);
      setActiveColorTab("light");
      setLogoFile(null);
      setLogoPreview(null);
      form.reset();
      setIsThemeCreatorOpen(false);
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleFinalSubmit = () => {
    void handleSubmit(onSubmit)();
  };

  return (
    <Dialog open={isThemeCreatorOpen} onOpenChange={setIsThemeCreatorOpen}>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <Button>
            <Plus></Plus>
            Create a new Theme
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="h-[60vh] max-w-5xl overflow-auto p-0">
        <div className="flex h-full flex-col">
          <div className="flex h-[calc(60vh-120px)]">
            {/* Left Side - Controls */}
            <div className="w-1/2 overflow-y-auto border-r p-6">
              {currentStep === 0 && (
                <div className="h-full space-y-4">
                  <h2 className="mb-4 text-xl font-semibold">
                    Choose a Base Theme
                  </h2>
                  <Controller
                    name="themeBase"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="grid grid-cols-2 gap-4"
                      >
                        {/* Blank theme option */}
                        <div className="relative">
                          <RadioGroupItem
                            value="blank"
                            id="blank"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="blank"
                            className={`flex h-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-card p-4 hover:bg-accent/50 ${
                              field.value === "blank"
                                ? "border-indigo-600"
                                : "border-border"
                            }`}
                          >
                            <div className="flex flex-col items-center">
                              <Plus className="mb-2 h-8 w-8 text-muted-foreground" />
                              <h3 className="text-lg font-medium">
                                Start from scratch
                              </h3>
                              <p className="text-center text-sm text-muted-foreground">
                                Create a blank theme with default settings
                              </p>
                            </div>
                          </Label>
                        </div>

                        {Object.keys(themes).map((theme) => {
                          const themeData =
                            themes[theme as keyof typeof themes];
                          const colors = themeData.colors.light;

                          return (
                            <div key={theme} className="relative">
                              <RadioGroupItem
                                value={theme}
                                id={theme}
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor={theme}
                                className={`block h-full cursor-pointer rounded-lg border bg-card p-4 hover:bg-accent/50 ${
                                  field.value === theme
                                    ? "border-indigo-600"
                                    : "border-border"
                                }`}
                              >
                                <div className="flex flex-col space-y-1">
                                  <h3 className="text-lg font-medium capitalize">
                                    {theme}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {themeData.description}
                                  </p>

                                  <div className="mt-2 flex gap-2">
                                    <div
                                      className="h-5 w-5 rounded-full"
                                      style={{
                                        backgroundColor: colors.primary,
                                      }}
                                    ></div>
                                    <div
                                      className="h-5 w-5 rounded-full"
                                      style={{
                                        backgroundColor: colors.secondary,
                                      }}
                                    ></div>
                                    <div
                                      className="h-5 w-5 rounded-full"
                                      style={{ backgroundColor: colors.accent }}
                                    ></div>
                                  </div>

                                  <div className="mt-2 text-xs text-muted-foreground">
                                    <p>
                                      Heading:{" "}
                                      {themeData.fonts.heading.split(",")[0]}
                                    </p>
                                    <p>
                                      Body: {themeData.fonts.body.split(",")[0]}
                                    </p>
                                  </div>
                                </div>
                              </Label>
                            </div>
                          );
                        })}
                      </RadioGroup>
                    )}
                  />
                </div>
              )}

              {currentStep === 1 && (
                <div className="h-full space-y-4">
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setActiveColorTab(
                          activeColorTab === "light" ? "dark" : "light",
                        )
                      }
                    >
                      {activeColorTab === "light" ? "Dark Mode" : "Light Mode"}
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(
                      activeColorTab === "light"
                        ? watch("colors.light")
                        : watch("colors.dark"),
                    ).map(([key]) => (
                      <Controller
                        key={key}
                        name={`colors.${activeColorTab}.${key as ColorKey}`}
                        control={control}
                        render={({ field }) => (
                          <ColorPicker
                            color={field.value}
                            onChange={field.onChange}
                            label={`${key.charAt(0).toUpperCase() + key.slice(1)} Color`}
                          />
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="h-full space-y-4">
                  <Controller
                    name="fonts.heading"
                    control={control}
                    render={({ field }) => (
                      <FontSelector
                        value={field.value}
                        onChange={field.onChange}
                        label="Heading Font"
                      />
                    )}
                  />
                  <Controller
                    name="fonts.body"
                    control={control}
                    render={({ field }) => (
                      <FontSelector
                        value={field.value}
                        onChange={field.onChange}
                        label="Body Font"
                      />
                    )}
                  />
                </div>
              )}

              {currentStep === 3 && (
                <div className="h-full space-y-4">
                  <h2 className="mb-4 text-xl font-semibold">Upload a Logo</h2>
                  <p className="mb-4 text-muted-foreground">
                    Add a logo to customize your theme. This is optional.
                  </p>
                  <LogoUploader
                    logoPreview={logoPreview}
                    onFileChange={handleFileChange}
                    onRemove={handleRemoveLogo}
                  />
                </div>
              )}

              {currentStep === 4 && (
                <div className="h-full space-y-6">
                  <h2 className="text-xl font-semibold">Finish Your Theme</h2>

                  <div className="space-y-4">
                    <div>
                      <Label>Theme Name</Label>
                      <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                          <Input {...field} placeholder="Enter theme name" />
                        )}
                      />
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            placeholder="Enter theme description"
                          />
                        )}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Controller
                        name="isPublic"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                      <Label>Make theme public</Label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Preview */}
            <div className="grid w-1/2 place-items-center overflow-y-auto p-6">
              <ThemePreview
                colors={watch("colors")}
                fonts={watch("fonts")}
                borderRadius={watch("borderRadius")}
                logoPreview={logoPreview}
                activeColorTab={activeColorTab}
              />
            </div>
          </div>

          {/* Stepper UI */}
          <div className="mt-auto flex items-center justify-between border-t bg-background p-4 dark:bg-background">
            <div className="flex w-full items-center justify-center gap-8">
              {STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className="flex flex-col items-center gap-2"
                  onClick={() => setCurrentStep(index)}
                >
                  <div
                    className={`flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-border ${
                      index === currentStep
                        ? "bg-indigo-600 text-white"
                        : index < currentStep
                          ? "bg-indigo-600/70 text-white"
                          : "bg-transparent text-foreground"
                    }`}
                  >
                    <span className="text-lg">{step.icon}</span>
                  </div>
                  <span
                    className={`text-sm ${
                      index <= currentStep
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="absolute right-4">
              {currentStep < STEPS.length - 1 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Theme
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
