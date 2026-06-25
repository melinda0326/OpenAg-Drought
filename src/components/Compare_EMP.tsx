import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import OverlayEMPBarChart from "../vis/Compare_EMP_Bar";
import {
  loadComparisonRows,
  type ComparisonRow,
} from "./ui/comparisonData";
import { storyChartSx, storyContentSx } from "./ui/storyStyles";

export default function Compare_Water() {
  const [data, setData] = useState<ComparisonRow[]>([]);

  useEffect(() => {
    loadComparisonRows().then(setData);
  }, []);

  return (
    <Box sx={{ margin: "var(--overlay-margin)" }}>
      <Box sx={storyContentSx}>
        <Typography component="p" variant="body1" gutterBottom>
          When less farmland is cultivated and production falls, fewer workers
          are needed. Farmworkers and others employed in farm-related industries
          face reduced job opportunities, shorter work seasons, and potential
          unemployment.
        </Typography>

        <Typography
          component="p"
          variant="body1"
          sx={{ mb: "var(--space-text-chart)" }}
        >
          As drought reduced available water and more farmland was idled in
          2022, labor demand across agriculture declined compared to 2019.
        </Typography>
      </Box>

      <Box sx={storyChartSx}>
        <OverlayEMPBarChart
          data={data}
          col2019="proportion_xwater"
          col2022="proportion_xwatersc"
          title="Employment Comparison between 2019 and 2022"
          ylabel="Employment Rate (%)"
        />
      </Box>
    </Box>
  );
}
