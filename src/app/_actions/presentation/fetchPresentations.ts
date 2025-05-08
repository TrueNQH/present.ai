"use server";
import "server-only";

import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { type Prisma, DocumentType } from "@prisma/client";

export type PresentationDocument = Prisma.BaseDocumentGetPayload<{
  include: {
    presentation: true;
  };
}>;

const ITEMS_PER_PAGE = 10;

export async function fetchPresentations(page = 0) {
  const session = await auth();
  const userId = session?.user.id;

  if (!userId) {
    return {
      items: [],
      hasMore: false,
    };
  }

  const skip = page * ITEMS_PER_PAGE;

  const items = await db.baseDocument.findMany({
    where: {
      userId,
      type: DocumentType.PRESENTATION,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: ITEMS_PER_PAGE,
    skip: skip,
    include: {
      presentation: true,
    },
  });

  const hasMore = items.length === ITEMS_PER_PAGE;

  return {
    items,
    hasMore,
  };
}

export async function fetchPublicPresentations(page = 0) {
  const skip = page * ITEMS_PER_PAGE;

  const [items, total] = await Promise.all([
    db.baseDocument.findMany({
      where: {
        type: DocumentType.PRESENTATION,
        isPublic: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: ITEMS_PER_PAGE,
      skip: skip,
      include: {
        presentation: true,
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    }),
    db.baseDocument.count({
      where: {
        type: DocumentType.PRESENTATION,
        isPublic: true,
      },
    }),
  ]);

  const hasMore = skip + ITEMS_PER_PAGE < total;

  return {
    items,
    hasMore,
  };
}

export async function fetchUserPresentations(userId: string, page = 0) {
  const session = await auth();
  const currentUserId = session?.user.id;

  const skip = page * ITEMS_PER_PAGE;

  const [items, total] = await Promise.all([
    db.baseDocument.findMany({
      where: {
        userId,
        type: DocumentType.PRESENTATION,
        OR: [
          { isPublic: true },
          { userId: currentUserId }, // Include private presentations if the user is viewing their own
        ],
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: ITEMS_PER_PAGE,
      skip: skip,
      include: {
        presentation: true,
      },
    }),
    db.baseDocument.count({
      where: {
        userId,
        type: DocumentType.PRESENTATION,
        OR: [{ isPublic: true }, { userId: currentUserId }],
      },
    }),
  ]);

  const hasMore = skip + ITEMS_PER_PAGE < total;

  return {
    items,
    hasMore,
  };
}
