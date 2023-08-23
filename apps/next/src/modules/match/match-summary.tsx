import React from "react";

import { Link } from "@quenti/components";
import { api } from "@quenti/trpc";
import { MATCH_MIN_TIME } from "@quenti/trpc/server/common/constants";

import {
  Button,
  ButtonGroup,
  Container,
  Heading,
  Stack,
  Text,
} from "@chakra-ui/react";

import { IconArrowBack, IconPlayerPlay } from "@tabler/icons-react";

import { Loading } from "../../components/loading";
import { useEntityRootUrl } from "../../hooks/use-entity-root-url";
import { useSetFolderUnison } from "../../hooks/use-set-folder-unison";
import { useMatchContext } from "../../stores/use-match-store";
import { Leaderboard } from "../leaderboard/leaderboard";
import { MatchSummaryFeedback } from "./match-summary-feedback";

export const MatchSummary = () => {
  const { id, type } = useSetFolderUnison();
  const rootUrl = useEntityRootUrl();
  const startTime = useMatchContext((s) => s.roundStartTime);
  const summary = useMatchContext((s) => s.roundSummary)!;
  const isEligibleForLeaderboard = useMatchContext(
    (s) => s.isEligibleForLeaderboard,
  );
  const elapsed = Math.floor((summary.endTime - startTime) / 100);
  const nextRound = useMatchContext((s) => s.nextRound);

  const add = api.leaderboard.add.useMutation();
  const leaderboard = api.leaderboard.byEntityId.useQuery(
    {
      mode: "Match",
      entityId: id,
    },
    {
      enabled: add.isSuccess,
    },
  );

  const isStorable = elapsed > MATCH_MIN_TIME;

  React.useEffect(() => {
    if (isStorable)
      void add.mutateAsync({
        entityId: id,
        mode: "Match",
        time: elapsed,
        eligible: isEligibleForLeaderboard,
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStorable]);

  const { data: highscore, isFetchedAfterMount } =
    api.leaderboard.highscore.useQuery(
      {
        mode: "Match",
        entityId: id,
        eligible: isEligibleForLeaderboard,
      },
      {
        refetchOnMount: "always",
        enabled: add.isSuccess || !isStorable,
      },
    );

  if (!summary || !leaderboard.data || !highscore || !isFetchedAfterMount)
    return <Loading />;

  return (
    <Container maxW="container.md" py="10" display="flex" alignItems="center">
      <Stack spacing="6" w="full">
        {isStorable ? (
          <>
            <MatchSummaryFeedback
              elapsed={elapsed}
              highscore={highscore}
              highscores={leaderboard.data.highscores}
            />
            {isEligibleForLeaderboard && (
              <Leaderboard data={leaderboard.data} />
            )}
          </>
        ) : (
          <>
            <Heading size={"2xl"}>Woah! You{"'"}re too fast!</Heading>
            <Text>
              Your time was too fast to record on our leaderboard.
              {summary.termsThisRound > 3
                ? ""
                : " Consider playing with more terms."}
            </Text>
          </>
        )}
        <ButtonGroup w="full" justifyContent="end">
          <Button
            variant="outline"
            leftIcon={<IconArrowBack size={18} />}
            as={Link}
            href={rootUrl}
          >
            Back to {type === "folder" ? "folder" : "set"}
          </Button>
          <Button onClick={nextRound} leftIcon={<IconPlayerPlay size={18} />}>
            Play again
          </Button>
        </ButtonGroup>
      </Stack>
    </Container>
  );
};
