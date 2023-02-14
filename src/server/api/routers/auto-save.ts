import { Language } from "@prisma/client";
import { nanoid } from "nanoid";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const autoSaveRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.setAutoSave.upsert({
      where: {
        userId: ctx.session.user.id,
      },
      update: {},
      create: {
        title: "",
        description: "",
        userId: ctx.session.user.id,
        autoSaveTerms: {
          createMany: {
            data: Array.from({ length: 5 }).map((_, i) => ({
              id: nanoid(),
              word: "",
              definition: "",
              rank: i,
            })),
          },
        },
      },
      include: {
        autoSaveTerms: true,
      },
    });
  }),

  save: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        tags: z.array(z.string()),
        wordLanguage: z.nativeEnum(Language),
        definitionLanguage: z.nativeEnum(Language),
        visibility: z.enum(["Public", "Unlisted", "Private"]),
        terms: z.array(
          z.object({
            word: z.string(),
            definition: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const terms = input.terms.map((t) => ({ ...t, id: nanoid() }));

      return await ctx.prisma.setAutoSave.upsert({
        where: {
          userId: ctx.session.user.id,
        },
        update: {
          title: input.title,
          description: input.description,
          tags: input.tags,
          wordLanguage: input.wordLanguage,
          definitionLanguage: input.definitionLanguage,
          visibility: input.visibility,
          userId: ctx.session.user.id,
          autoSaveTerms: {
            deleteMany: { setAutoSaveId: ctx.session.user.id },
            createMany: {
              data: terms.map((term, i) => ({
                id: term.id,
                definition: term.definition,
                word: term.word,
                rank: i,
              })),
            },
          },
        },
        create: {
          title: input.title,
          description: input.description,
          tags: input.tags,
          wordLanguage: input.wordLanguage,
          definitionLanguage: input.definitionLanguage,
          visibility: input.visibility,
          userId: ctx.session.user.id,
          autoSaveTerms: {
            createMany: {
              data: terms.map((term, i) => ({
                id: term.id,
                definition: term.definition,
                word: term.word,
                rank: i,
              })),
            },
          },
        },
      });
    }),
});
