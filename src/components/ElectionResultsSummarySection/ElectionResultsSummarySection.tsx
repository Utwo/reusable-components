import React, { ReactNode } from "react";
import {
  ElectionBallotMeta,
  ElectionResults,
  ElectionScopeIncomplete,
  ElectionScopeIncompleteResolved,
  electionScopeIsComplete,
  electionTypeInvolvesDiaspora,
} from "../../types/Election";
import { themable } from "../../hooks/theme";
import { useDimensions } from "../../hooks/useDimensions";
import { ElectionResultsStackedBar } from "../ElectionResultsStackedBar/ElectionResultsStackedBar";
import { ElectionMap } from "../ElectionMap/ElectionMap";
import { electionCandidateColor, getScopeName } from "../../util/format";
import { DivBodyHuge, Heading2, Label } from "../Typography/Typography";
import { ElectionScopeIncompleteWarning } from "../Warning/ElectionScopeIncompleteWarning";
import { ElectionResultsSummaryTable } from "../ElectionResultsSummaryTable/ElectionResultsSummaryTable";
import cssClasses from "./ElectionResultsSummarySection.module.scss";

type Props = {
  meta?: ElectionBallotMeta | null;
  scope: ElectionScopeIncompleteResolved;
  results?: ElectionResults | null;
  separator?: ReactNode;
  onScopeChange?: (scope: ElectionScopeIncomplete) => unknown;
};

const defaultConstants = {
  breakpoint1: 840,
  breakpoint2: 330,
};

export const ElectionResultsSummarySection = themable<Props>(
  "ElectionResultsSummarySection",
  cssClasses,
  defaultConstants,
)(({ classes, results, meta, scope, onScopeChange, constants, separator }) => {
  const involvesDiaspora = !!meta && electionTypeInvolvesDiaspora(meta.type);

  const [measureRef, { width }] = useDimensions();

  const completeness = electionScopeIsComplete(scope);

  const map = width != null && (
    <ElectionMap
      scope={scope}
      onScopeChange={onScopeChange}
      involvesDiaspora={involvesDiaspora}
      className={classes.map}
      selectedColor={(results?.candidates && electionCandidateColor(results.candidates[0])) || undefined}
    />
  );

  const { breakpoint1, breakpoint2 } = constants;
  const mobileMap = width != null && width <= breakpoint2;
  const fullWidthMap = !mobileMap && width != null && width <= breakpoint1;

  const showHeading = results != null && completeness.complete;

  return (
    <>
      {mobileMap && map}
      {mobileMap && showHeading && separator}
      {showHeading && (
        <>
          <Heading2>Rezultate vot</Heading2>
          <div>
            <Label>{getScopeName(scope)}</Label>
          </div>
        </>
      )}
      {!completeness.complete && (
        <ElectionScopeIncompleteWarning className={classes.warning} completeness={completeness} page="results" />
      )}
      {results == null && completeness.complete && (
        <DivBodyHuge className={classes.warning}>
          Nu există date despre prezența la vot pentru acest nivel de detaliu.
        </DivBodyHuge>
      )}
      {results && <ElectionResultsStackedBar className={classes.stackedBar} results={results} />}
      <div style={{ width: "100%" }} ref={measureRef} />
      {results && !mobileMap && separator}
      {!mobileMap && (
        <div className={classes.mapSummaryContainer}>
          {!fullWidthMap && meta && results && (
            <ElectionResultsSummaryTable className={classes.mapSummaryTable} meta={meta} results={results} />
          )}
          {map}
        </div>
      )}
    </>
  );
});
