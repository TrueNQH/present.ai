"use server";

import { type PlateSlide } from "@/components/presentation/utils/parser";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { type InputJsonValue } from "@prisma/client/runtime/library";

export async function createPresentation(
  content: {
    slides: PlateSlide[];
  },
  title: string,
  theme = "default",
  outline?: string[],
  imageModel?: string,
  presentationStyle?: string,
  language?: string
) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  const userId = session.user.id;

  try {
    const presentation = await db.baseDocument.create({
      data: {
        type: "PRESENTATION",
        documentType: "presentation",
        title: title ?? "Untitled Presentation",
        userId,
        presentation: {
          create: {
            content: content as unknown as InputJsonValue,
            theme: theme,
            imageModel,
            presentationStyle,
            language,
            outline: outline,
          },
        },
      },
      include: {
        presentation: true,
      },
    });

    return {
      success: true,
      message: "Presentation created successfully",
      presentation,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to create presentation",
    };
  }
}

export async function createEmptyPresentation(
  title: string,
  theme = "default"
) {
  const emptyContent: { slides: PlateSlide[] } = { slides: [] };

  return createPresentation(emptyContent, title, theme);
}

export async function updatePresentation({
  id,
  content,
  title,
  theme,
  outline,
  imageModel,
  presentationStyle,
  language,
}: {
  id: string;
  content?: {
    slides: PlateSlide[];
  };
  title?: string;
  theme?: string;
  outline?: string[];
  imageModel?: string;
  presentationStyle?: string;
  language?: string;
}) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    // Extract values from content if provided there
    const effectiveTheme = theme;
    const effectiveImageModel = imageModel;
    const effectivePresentationStyle = presentationStyle;
    const effectiveLanguage = language;

    // Update base document with all presentation data
    const presentation = await db.baseDocument.update({
      where: { id },
      data: {
        title: title,
        presentation: {
          update: {
            content: content as unknown as InputJsonValue,
            theme: effectiveTheme,
            imageModel: effectiveImageModel,
            presentationStyle: effectivePresentationStyle,
            language: effectiveLanguage,
            outline,
          },
        },
      },
      include: {
        presentation: true,
      },
    });

    return {
      success: true,
      message: "Presentation updated successfully",
      presentation,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to update presentation",
    };
  }
}

export async function updatePresentationTitle(id: string, title: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const presentation = await db.baseDocument.update({
      where: { id },
      data: { title },
      include: {
        presentation: true,
      },
    });

    return {
      success: true,
      message: "Presentation title updated successfully",
      presentation,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to update presentation title",
    };
  }
}

export async function deletePresentation(id: string) {
  return deletePresentations([id]);
}

export async function deletePresentations(ids: string[]) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    // Delete the base documents using deleteMany (this will cascade delete the presentations)
    const result = await db.baseDocument.deleteMany({
      where: {
        id: {
          in: ids,
        },
        userId: session.user.id, // Ensure only user's own presentations can be deleted
      },
    });

    const deletedCount = result.count;
    const failedCount = ids.length - deletedCount;

    if (failedCount > 0) {
      return {
        success: deletedCount > 0,
        message:
          deletedCount > 0
            ? `Deleted ${deletedCount} presentations, failed to delete ${failedCount} presentations`
            : "Failed to delete presentations",
        partialSuccess: deletedCount > 0,
      };
    }

    return {
      success: true,
      message:
        ids.length === 1
          ? "Presentation deleted successfully"
          : `${deletedCount} presentations deleted successfully`,
    };
  } catch (error) {
    console.error("Failed to delete presentations:", error);
    return {
      success: false,
      message: "Failed to delete presentations",
    };
  }
}

// Get the presentation with the presentation content
export async function getPresentation(id: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const presentation = await db.baseDocument.findUnique({
      where: { id },
      include: {
        presentation: true,
      },
    });

    return {
      success: true,
      presentation,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to fetch presentation",
    };
  }
}

export async function getPresentationContent(id: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const presentation = await db.baseDocument.findUnique({
      where: { id },
      include: {
        presentation: {
          select: {
            id: true,
            content: true,
            theme: true,
            outline: true,
          },
        },
      },
    });

    if (!presentation) {
      return {
        success: false,
        message: "Presentation not found",
      };
    }

    // Check if the user has access to this presentation
    if (presentation.userId !== session.user.id && !presentation.isPublic) {
      return {
        success: false,
        message: "Unauthorized access",
      };
    }

    return {
      success: true,
      presentation: presentation.presentation,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to fetch presentation",
    };
  }
}

export async function updatePresentationTheme(id: string, theme: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const presentation = await db.presentation.update({
      where: { id },
      data: { theme },
    });

    return {
      success: true,
      message: "Presentation theme updated successfully",
      presentation,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to update presentation theme",
    };
  }
}

export async function duplicatePresentation(id: string, newTitle?: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    // Get the original presentation
    const original = await db.baseDocument.findUnique({
      where: { id },
      include: {
        presentation: true,
      },
    });

    if (!original?.presentation) {
      return {
        success: false,
        message: "Original presentation not found",
      };
    }

    // Create a new presentation with the same content
    const duplicated = await db.baseDocument.create({
      data: {
        type: "PRESENTATION",
        documentType: "presentation",
        title: newTitle ?? `${original.title} (Copy)`,
        userId: session.user.id,
        isPublic: false,
        presentation: {
          create: {
            content: original.presentation.content as unknown as InputJsonValue,
            theme: original.presentation.theme,
          },
        },
      },
      include: {
        presentation: true,
      },
    });

    return {
      success: true,
      message: "Presentation duplicated successfully",
      presentation: duplicated,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to duplicate presentation",
    };
  }
}
