"use server";

import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { z } from "zod";
import { utapi } from "@/app/api/uploadthing/core";

// Schema for creating/updating a theme
const themeSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().optional(),
  themeData: z.any(), // We'll validate this as ThemeProperties in the function
  logoUrl: z.string().optional(),
  isPublic: z.boolean().optional().default(false),
});

export type ThemeFormData = z.infer<typeof themeSchema>;

// Create a new custom theme
export async function createCustomTheme(formData: ThemeFormData) {
  try {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        message: "You must be signed in to create a theme",
      };
    }

    const validatedData = themeSchema.parse(formData);

    const newTheme = await db.customTheme.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        themeData: validatedData.themeData,
        logoUrl: validatedData.logoUrl,
        isPublic: validatedData.isPublic,
        userId: session.user.id,
      },
    });

    return {
      success: true,
      themeId: newTheme.id,
      message: "Theme created successfully",
    };
  } catch (error) {
    console.error("Failed to create custom theme:", error);

    // Log the actual error but return a generic message
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Invalid theme data. Please check your inputs and try again.",
      };
    } else if (error instanceof Error && error.message.includes("Prisma")) {
      return {
        success: false,
        message: "Database error. Please try again later.",
      };
    } else {
      return {
        success: false,
        message: "Something went wrong. Please try again later.",
      };
    }
  }
}

// Update an existing custom theme
export async function updateCustomTheme(
  themeId: string,
  formData: ThemeFormData,
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        message: "You must be signed in to update a theme",
      };
    }

    const validatedData = themeSchema.parse(formData);

    // Verify ownership
    const existingTheme = await db.customTheme.findUnique({
      where: { id: themeId },
    });

    if (!existingTheme) {
      return { success: false, message: "Theme not found" };
    }

    if (existingTheme.userId !== session.user.id) {
      return { success: false, message: "Not authorized to update this theme" };
    }

    await db.customTheme.update({
      where: { id: themeId },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        themeData: validatedData.themeData,
        logoUrl: validatedData.logoUrl,
        isPublic: validatedData.isPublic,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: "Theme updated successfully",
    };
  } catch (error) {
    console.error("Failed to update custom theme:", error);

    // Log the actual error but return a generic message
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Invalid theme data. Please check your inputs and try again.",
      };
    } else if (error instanceof Error && error.message.includes("Prisma")) {
      return {
        success: false,
        message: "Database error. Please try again later.",
      };
    } else {
      return {
        success: false,
        message: "Something went wrong. Please try again later.",
      };
    }
  }
}

// Delete a custom theme
export async function deleteCustomTheme(themeId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        message: "You must be signed in to delete a theme",
      };
    }

    // Verify ownership
    const existingTheme = await db.customTheme.findUnique({
      where: { id: themeId },
    });

    if (!existingTheme) {
      return { success: false, message: "Theme not found" };
    }

    if (existingTheme.userId !== session.user.id) {
      return { success: false, message: "Not authorized to delete this theme" };
    }

    // Delete logo from uploadthing if exists
    if (existingTheme.logoUrl) {
      try {
        const fileKey = existingTheme.logoUrl.split("/").pop();
        if (fileKey) {
          await utapi.deleteFiles(fileKey);
        }
      } catch (deleteError) {
        console.error("Failed to delete theme logo:", deleteError);
        // Continue with theme deletion even if logo deletion fails
      }
    }

    await db.customTheme.delete({
      where: { id: themeId },
    });

    return {
      success: true,
      message: "Theme deleted successfully",
    };
  } catch (error) {
    console.error("Failed to delete custom theme:", error);
    return {
      success: false,
      message:
        "Something went wrong while deleting the theme. Please try again later.",
    };
  }
}

// Get all custom themes for the current user
export async function getUserCustomThemes() {
  try {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        message: "You must be signed in to view your themes",
        themes: [],
      };
    }

    const themes = await db.customTheme.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      themes,
    };
  } catch (error) {
    console.error("Failed to fetch custom themes:", error);
    return {
      success: false,
      message: "Unable to load themes at this time. Please try again later.",
      themes: [],
    };
  }
}

// Get all public themes
export async function getPublicCustomThemes() {
  try {
    const themes = await db.customTheme.findMany({
      where: {
        isPublic: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      success: true,
      themes,
    };
  } catch (error) {
    console.error("Failed to fetch public themes:", error);
    return {
      success: false,
      message:
        "Unable to load public themes at this time. Please try again later.",
      themes: [],
    };
  }
}

// Get a single theme by ID
export async function getCustomThemeById(themeId: string) {
  try {
    const theme = await db.customTheme.findUnique({
      where: { id: themeId },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!theme) {
      return { success: false, message: "Theme not found" };
    }

    return {
      success: true,
      theme,
    };
  } catch (error) {
    console.error("Failed to fetch theme:", error);
    return {
      success: false,
      message: "Unable to load the theme at this time. Please try again later.",
    };
  }
}
