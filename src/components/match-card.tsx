import { Card, Text, useColorModeValue } from "@chakra-ui/react";
import { animate, motion, useMotionValue } from "framer-motion";
import React from "react";
import { MATCH_SHUFFLE_TIME } from "../constants/match";
import { useMatchContext, type MatchItem } from "../stores/use-match-store";
import { ScriptFormatter } from "./script-formatter";

export interface MatchCardProps {
  term: MatchItem;
  index: number;
  onDragEnd: (term: MatchItem, index: number, x: number, y: number) => boolean;
}

export const RawMatchCard: React.FC<MatchCardProps> = ({
  term,
  index,
  onDragEnd,
}) => {
  const setCard = useMatchContext((state) => state.setCard);

  const [dragging, setDragging] = React.useState(false);
  const [isInMotion, setIsInMotion] = React.useState(false);

  const linkBg = useColorModeValue("white", "gray.800");
  const gray = useColorModeValue("gray.200", "gray.700");

  const stateBorder = term.state
    ? term.state == "correct"
      ? "green.400"
      : "red.400"
    : undefined;
  const linkBorder = term.state ? stateBorder : gray;

  const card = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setCard(index, {
      ...term,
      width: card.current ? card.current.offsetWidth : 200,
      height: card.current ? card.current.offsetHeight : 60,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card]);

  const x = useMotionValue(term.x);
  const y = useMotionValue(term.y);

  React.useEffect(() => {
    setIsInMotion(true);
    void (async () => {
      await animate(x, term.targetX, { duration: MATCH_SHUFFLE_TIME });
    })();
    void (async () => {
      await animate(y, term.targetY, { duration: MATCH_SHUFFLE_TIME });
    })();

    setTimeout(() => {
      setIsInMotion(false);
    }, MATCH_SHUFFLE_TIME * 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term.targetX, term.targetY]);

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{
        opacity: 0,
      }}
      animate={{
        position: "absolute",
        opacity: 1,
        pointerEvents:
          term.state == "correct" || isInMotion ? "none" : "initial",
      }}
      exit={{
        opacity: 0,
        transition: { duration: 0.5 },
      }}
      onDragStart={() => setDragging(true)}
      onDragEnd={(_, info) => {
        setDragging(onDragEnd(term, index, info.offset.x, info.offset.y));
      }}
      style={{ x, y, zIndex: dragging || isInMotion ? 200 : 100 }}
    >
      <Card
        rounded="md"
        py="4"
        px="5"
        ref={card}
        bg={linkBg}
        borderColor={linkBorder}
        borderWidth="2px"
        shadow="lg"
        transition="all ease-in-out 150ms"
        maxW="200px"
        w="max-content"
        position="absolute"
        _hover={{
          transform: "translateY(-2px)",
          borderBottomColor: stateBorder ?? "blue.300",
        }}
      >
        <Text fontSize="sm">
          <ScriptFormatter>{term.word}</ScriptFormatter>
        </Text>
      </Card>
    </motion.div>
  );
};

export const MatchCard = React.memo(RawMatchCard);