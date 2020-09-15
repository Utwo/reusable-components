import React from "react";
import { ElectionMeta, ElectionResults, electionTypeHasSeats } from "../../types/Election";
import { themable } from "../../util/theme";
import cssClasses from "./ElectionResultsSummaryTable.module.scss";
import { DivBody, Heading3, makeTypographyComponent } from "../Typography/Typography";
import { lightFormat, parseISO } from "date-fns";
import { formatGroupedNumber, formatPercentage, fractionOf } from "../../util/format";
import { ColoredSquare } from "../ColoredSquare/ColoredSquare";

type Props = {
  meta: ElectionMeta;
  results: ElectionResults;
};

const THeadRow = makeTypographyComponent("th", "label");
const TCell = makeTypographyComponent("td", "bodyMedium");

export const ElectionResultsSummaryTable = themable<Props>(
  "ElectionResultsSummaryTable",
  cssClasses,
)(({ classes, results, meta }) => {
  const hasSeats = electionTypeHasSeats(meta.type);
  const maxFraction = results.candidates.reduce(
    (acc, cand) => Math.max(acc, fractionOf(cand.votes, results.validVotes)),
    0,
  );

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        {meta.ballot && <DivBody>{meta.title}</DivBody>}
        <Heading3>
          {meta.ballot ?? meta.title} {lightFormat(parseISO(meta.date), "yyyy")}
        </Heading3>
      </div>
      <div className={classes.tableContainer}>
        <table className={classes.table}>
          <thead>
            <tr>
              <THeadRow>Partid</THeadRow>
              {hasSeats && <THeadRow>Mand.</THeadRow>}
              <THeadRow>Voturi</THeadRow>
              <THeadRow className={classes.percentage}>%</THeadRow>
              <THeadRow></THeadRow>
            </tr>
          </thead>
          <tbody>
            {results.candidates.map((candidate, index) => (
              <tr key={index}>
                <TCell>
                  <ColoredSquare color={candidate.partyColor} className={classes.square} />
                  {candidate.shortName || candidate.name}
                </TCell>
                {hasSeats && <TCell>{formatGroupedNumber(candidate.seats ?? 0)}</TCell>}
                <TCell>{formatGroupedNumber(candidate.votes)}</TCell>
                <TCell className={classes.percentage}>
                  {formatPercentage(fractionOf(candidate.votes, results.validVotes))}
                </TCell>
                <td className={classes.barContainer}>
                  <div
                    className={classes.bar}
                    style={{
                      width: `${100 * fractionOf(fractionOf(candidate.votes, results.validVotes), maxFraction)}%`,
                      backgroundColor: candidate.partyColor,
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
