import { useEffect, useRef, useState } from "react";
import { ElectionBallot, ElectionScope } from "../types/Election";
import { APIRequestState } from "../util/api";
import { ElectionAPI } from "../util/electionApi";
import { useApiResponse } from "./useApiResponse";

export const useBallotData = (
  api: ElectionAPI,
  ballotId: number | null,
  scope: ElectionScope | null,
  autoRefreshInterval: number = 60 * 1000,
): APIRequestState<ElectionBallot> => {
  const [timerToken, setTimerToken] = useState<boolean>(false);

  const lastBallotId = useRef<number | null>(null);
  const state = useApiResponse(() => {
    if (ballotId == null || !scope) return null;
    const lastId = lastBallotId.current;
    lastBallotId.current = ballotId;
    return {
      invocation: api.getBallot(ballotId, scope),
      discardPreviousData: lastId !== ballotId,
    };
  }, [scope, ballotId, timerToken, api]);

  // Changing the timerToken will re-trigger useApiResponse
  useEffect(() => {
    if (state.loading || !state.data?.meta.live) {
      return undefined;
    }

    const timerId = setTimeout(() => {
      setTimerToken((x) => !x);
    }, autoRefreshInterval);

    return () => {
      clearTimeout(timerId);
    };
  }, [state.data, state.loading, timerToken, autoRefreshInterval]);
  return state;
};
