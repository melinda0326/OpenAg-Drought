import { Box, Typography} from "@mui/material";
import StorySection from "./ui/StorySection";

export default function Transition_Chain() {
  return (
    <StorySection>
      <Box sx={{ width: "var(--overlay-width)", mt: "var(--space-md)" }}>
        <Typography sx={{ fontSize: "var(--title-size)" }}>
            Chain of Impacts
        </Typography>
       

        <Typography sx={{ fontSize: "var(--body-size)" }}>
           Drought does not affect agriculture in a single step—it unfolds as a chain of impacts. <br />
        As water availability declines, each part of the agricultural system begins to respond. Observing these changes helps people understand how drought reshapes agriculture over time and supports more informed decisions about how to respond to water scarcity.
        </Typography>

      </Box>
    </StorySection>
  );
}