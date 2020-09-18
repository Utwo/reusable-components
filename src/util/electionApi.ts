import { electionApiProductionUrl } from "../constants/servers";
import { Election, ElectionMeta, ElectionScope } from "../types/Election";
import { APIInvocation, JSONFetch, makeJsonFetch } from "./api";

export type OptionWithID<K = number, N = string> = { id: K; name: N };

export interface ElectionScopeAPI {
  getCounties: () => APIInvocation<OptionWithID[]>;
  getLocalities: (countyId: number) => APIInvocation<OptionWithID[]>;
  getCountries: () => APIInvocation<OptionWithID[]>;
}

export interface ElectionAPI extends ElectionScopeAPI {
  getElection: (id: number, scope: ElectionScope) => APIInvocation<Election>;
  getElections: () => APIInvocation<ElectionMeta[]>;
}

const scopeToQuery = (scope: ElectionScope) => {
  switch (scope.type) {
    case "national":
      return { Division: "national" };
    case "diaspora":
      return { Division: "diaspora" };
    case "county":
      return { Division: "county", CountyId: scope.countyId };
    case "locality":
      return { Division: "locality", CountyId: scope.countyId, LocalityId: scope.localityId };
    case "diaspora_country":
      return { Division: "diaspora_country", LocalityId: scope.countryId };
  }
};

export const makeElectionApi = (options?: {
  apiUrl?: string;
  fetch?: JSONFetch; // for optional mocking
}): ElectionAPI => {
  const fetch = options?.fetch ?? makeJsonFetch(options?.apiUrl ?? electionApiProductionUrl);
  return {
    getElection: (id, scope) =>
      fetch("GET", "/ballot", {
        query: {
          BallotId: id,
          ...scopeToQuery(scope),
        },
      }),
    getElections: () => fetch("GET", "/ballots"),
    getCounties: () => fetch("GET", "/counties"),
    getLocalities: (countyId) => fetch("GET", "/localities", { query: { CountyId: countyId } }),
    getCountries: () => fetch("GET", "/countries"),
  };
};
