import { StudySetVisibility } from "@prisma/client";
import { z } from "zod";
import { LANGUAGE_VALUES } from "../../common/constants";

export const ZSaveSchema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  wordLanguage: z.enum(LANGUAGE_VALUES),
  definitionLanguage: z.enum(LANGUAGE_VALUES),
  visibility: z.nativeEnum(StudySetVisibility),
  terms: z.array(
    z.object({
      word: z.string(),
      definition: z.string(),
    })
  ),
});

export type TSaveSchema = z.infer<typeof ZSaveSchema>;