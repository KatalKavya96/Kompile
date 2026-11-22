import SheetBack from "./SheetBack";
import * as React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Strivera2zQuestionRow from "./Strivera2zQuestionRow";

function useSectionNavigation() {
  const [expanded, setExpanded] = React.useState(false);
  const summary = React.useRef(null);

  function goBack() {
    setExpanded(false);
    summary.current.focus();
  }

  return { expanded, setExpanded, summary, goBack };
}

function SubStepAccordion({ subStep, parentLabel }) {
  const { expanded, setExpanded, summary, goBack } = useSectionNavigation();
  return (
    <Accordion
      expanded={expanded}
      onChange={(_, isExpanded) => setExpanded(isExpanded)}
      disableGutters
      elevation={0}
      sx={{
        backgroundColor: "#111111",
        border: "1px solid #1f2937",
        mb: 1,
        transition: "border-top 0.2s",
        "&:hover": { borderTop: "1px solid #f97316" },
      }}
    >
      <AccordionSummary
        ref={summary}
        expandIcon={<ExpandMoreIcon sx={{ color: "#9ca3af" }} />}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ ml: 1, color: "#9ca3af" }}
        >
          {subStep.code} {" | "} {subStep.title ?? subStep.name ?? subStep._id}
          {" | "} {subStep.solvedCount} / {subStep.totalCount}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: "8px 12px", color: "text.secondary" }}>
        {subStep?.questions?.map((question) => (
          <Strivera2zQuestionRow
            key={question._id}
            data={question}
            className="mb-1"
          />
        ))}
        <SheetBack onClick={goBack}>Back to {parentLabel}</SheetBack>
      </AccordionDetails>
    </Accordion>
  );
}

function StriversA2Ztopics({ step }) {
  const { expanded, setExpanded, summary, goBack } = useSectionNavigation();
  const title = step.title ?? step.name ?? step._id;
  return (
    <Accordion
      expanded={expanded}
      onChange={(_, isExpanded) => setExpanded(isExpanded)}
      sx={{
        backgroundColor: "#111111",
        border: "1px solid #1f2937",
        mb: 1,
        transition: "border-top 0.2s",
        "&:hover": { borderTop: "1px solid #f97316" },
      }}
    >
      <AccordionSummary
        ref={summary}
        expandIcon={<ExpandMoreIcon sx={{ color: "#9ca3af" }} />}
      >
        <Typography variant="h6" fontWeight={700} sx={{ color: "#9ca3af" }}>
          {step.code}
          {": "}
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        {step.subSteps && step.subSteps.length > 0 ? (
          step.subSteps.map((subStep) => (
            <SubStepAccordion key={subStep._id} subStep={subStep} parentLabel={title} />
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No sub-topics available.
          </Typography>
        )}
        <SheetBack onClick={goBack}>Back to sheet overview</SheetBack>
      </AccordionDetails>
    </Accordion>
  );
}

export default StriversA2Ztopics;
