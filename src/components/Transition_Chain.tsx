import { Box, Typography} from "@mui/material";
import StorySection from "./ui/StorySection";

export default function Transition_Chain() {
  return (
    <StorySection>
      <Box sx={{ width: "var(--overlay-width)"}}>
        <Typography component="h3" variant="h3" gutterBottom>
          Chain of Impacts
        </Typography>

        <Typography component="p" variant="body1" gutterBottom>
          Drought does not affect agriculture in a single step—it unfolds as a
          chain of impacts.
        </Typography>
        <Typography component="p" variant="body1">
          As water availability declines, each part of the agricultural system
          begins to respond. Observing these changes helps people understand how
          drought reshapes agriculture over time and supports more informed
          decisions about how to respond to water scarcity.
        </Typography>
      </Box>
    </StorySection>
  );
}