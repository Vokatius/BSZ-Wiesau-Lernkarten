import { EditorContent, useEditor } from "@tiptap/react";
import React from "react";

import { Modal } from "@quenti/components/modal";
import {
  type EditorTerm,
  editorInput,
  getPlainText,
  hasRichText,
  richTextToHtml,
} from "@quenti/lib/editor";
import type { Term } from "@quenti/prisma/client";
import { api } from "@quenti/trpc";

import { Box, Button, ButtonGroup, Stack } from "@chakra-ui/react";

import { editorEventChannel } from "../events/editor";
import { useSetFolderUnison } from "../hooks/use-set-folder-unison";
import {
  AddImageButton,
  RemoveImageButton,
} from "../modules/editor/card/image-components";
import { RichTextBar } from "../modules/editor/card/rich-text-bar";
import { editorConfig } from "../modules/editor/editor-config";
import { PhotoView } from "./photo-view/photo-view";

export interface EditTermModalProps {
  term: Term | null;
  isOpen: boolean;
  onClose: () => void;
  onDefinition: boolean;
}

export const EditTermModal: React.FC<EditTermModalProps> = ({
  term,
  isOpen,
  onClose,
  onDefinition,
}) => {
  const utils = api.useUtils();
  const { type } = useSetFolderUnison();

  const [assetUrl, setAssetUrl] = React.useState<string | null>(null);

  const wordEditor = useEditor({
    ...editorConfig(),
    content: term ? editorInput(term as EditorTerm, "word") : "",
  });
  const definitionEditor = useEditor({
    ...editorConfig(),
    content: term ? editorInput(term as EditorTerm, "definition") : "",
  });

  React.useEffect(() => {
    if (!term || !isOpen) return;

    wordEditor?.commands.setContent(editorInput(term as EditorTerm, "word"));
    definitionEditor?.commands.setContent(
      editorInput(term as EditorTerm, "definition"),
    );
    setAssetUrl(term.assetUrl);

    if (onDefinition) {
      definitionEditor?.commands.focus();
    } else {
      wordEditor?.commands.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, isOpen]);

  React.useEffect(() => {
    const handle = (args: { id: string; url: string }) => {
      if (isOpen && args.id == term?.id) {
        setAssetUrl(args.url);
      }
    };

    editorEventChannel.on("propagateImageUrl", handle);
    return () => {
      editorEventChannel.off("propagateImageUrl", handle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const edit = api.terms.edit.useMutation({
    async onSuccess() {
      onClose();
      if (type == "set") {
        await utils.studySets.invalidate();
      } else {
        await utils.folders.invalidate();
      }
    },
  });

  const removeImage = api.terms.removeImage.useMutation();

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Body>
          <Modal.Heading>Edit term</Modal.Heading>
          <Stack w="full">
            <RichTextBar
              activeEditor={wordEditor}
              bg="gray.100"
              _dark={{
                bg: "gray.900",
              }}
            />
            <EditorContent
              editor={wordEditor}
              onKeyDown={(e) => {
                if ([" ", "ArrowRight", "ArrowLeft"].includes(e.key))
                  e.stopPropagation();
              }}
            />
          </Stack>
          <Stack w="full">
            <RichTextBar
              activeEditor={definitionEditor}
              bg="gray.100"
              _dark={{
                bg: "gray.900",
              }}
            />
            <EditorContent
              editor={definitionEditor}
              onKeyDown={(e) => {
                if ([" ", "ArrowRight", "ArrowLeft"].includes(e.key))
                  e.stopPropagation();
              }}
            />
          </Stack>
          {assetUrl ? (
            <Box w="100px" h="80px" mt={{ base: 3, md: 0 }} position="relative">
              <PhotoView src={assetUrl} id={`edit-term-modal-${term?.id}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  width={100}
                  height={80}
                  alt="Term asset"
                  src={assetUrl}
                  style={{
                    cursor: "zoom-in",
                    width: 100,
                    height: 80,
                    objectFit: "cover",
                    aspectRatio: "5 / 4",
                    borderRadius: "6px",
                  }}
                />
              </PhotoView>
              <RemoveImageButton
                onClick={() => {
                  if (!term) return;

                  setAssetUrl(null);
                }}
              />
            </Box>
          ) : (
            <AddImageButton
              w="100px"
              h="80px"
              onClick={() => {
                if (!term) return;
                editorEventChannel.emit("openSearchImages", `term:${term.id}`);
              }}
            />
          )}
        </Modal.Body>
        <Modal.Divider />
        <Modal.Footer>
          <ButtonGroup>
            <Button variant="ghost" colorScheme="gray" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!term) return;

                const wordJson = wordEditor!.getJSON();
                const definitionJson = definitionEditor!.getJSON();
                const word = getPlainText(wordJson);
                const definition = getPlainText(definitionJson);

                const wordRichText = hasRichText(wordJson, word);
                const definitionRichText = hasRichText(
                  definitionJson,
                  definition,
                );

                if (!assetUrl && term.assetUrl) {
                  removeImage.mutate({
                    id: term.id,
                    studySetId: term.studySetId,
                  });
                }

                edit.mutate({
                  ...term,
                  word,
                  definition,
                  wordRichText: wordRichText
                    ? richTextToHtml(wordJson)
                    : undefined,
                  definitionRichText: definitionRichText
                    ? richTextToHtml(definitionJson)
                    : undefined,
                });
              }}
              isLoading={edit.isLoading || removeImage.isLoading}
            >
              Save
            </Button>
          </ButtonGroup>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
};
