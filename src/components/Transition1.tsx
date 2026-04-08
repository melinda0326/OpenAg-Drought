import { Box, Typography} from "@mui/material";
import StorySection from "./ui/StorySection";

export default function Transition1() {
  return (
    <StorySection>
      <Box sx={{ width: "var(--overlay-width)", mt: "var(--space-md)", textAlign: "center" }}>
        <Typography sx={{ fontSize: "var(--body-size)" }}>
          This agricultural system, however, depends on one essential resource: <br />
        </Typography>

        <Typography sx={{ fontSize: "var(--title-size)", fontWeight:"600", mt: "var(--space-sm)", textAlign: "center", color:"#4287f5", fontStyle: "italic",}}>
          Water
        </Typography>

      </Box>
    </StorySection>
  );
}