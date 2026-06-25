import { useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";
import OverlayRevBarChart from "../vis/Compare_Revenue_Bar";
import PictogramRevenue from "../vis/Pictogram_Revenue";
import {
  loadComparisonRows,
  type ComparisonRow,
} from "./ui/comparisonData";
import { storyChartSx } from "./ui/storyStyles";

export default function Compare_Rev() {
  const [data, setData] = useState<ComparisonRow[]>([]);

  useEffect(() => {
    loadComparisonRows().then(setData);
  }, []);

  const colusa = useMemo(() => {
    const row = data.find((d) => d.CountyName === "Colusa");
    if (!row) return null;

    return {
      rev2019: +(row.proportion_gross_revenue_base ?? 0),
      rev2022: +(row.proportion_grev_sc ?? 0),
    };
  }, [data]);

  return (
    <Box sx={storyChartSx}>
      <Box sx={{ width: "100%" }}>
        <OverlayRevBarChart
          data={data}
          col2019="proportion_gross_revenue_base"
          col2022="proportion_grev_sc"
          title="Revenue Comparison between 2019 and 2022"
          ylabel="Revenue ($)"
        />
      </Box>

      {colusa && (
        <Box
          id="pictogram-revenue"
          sx={{
            width: "100%",
            marginTop: 3,
          }}
        >
          <PictogramRevenue
            revenue2019={colusa.rev2019}
            revenue2022={colusa.rev2022}
            squareValue={5_000_000}
            cols={3}
            squareSize={14}
            gap={4}
            colorLoss="#E65100"
            color2022="#FFCC80"
          />
        </Box>
      )}
    </Box>
  );
}
