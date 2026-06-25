import { useEffect } from "react";
import { Box } from "@mui/material";
import { useInView } from "react-intersection-observer";

type StepId = "opener" | "open-exploration";

type Props = {
  id: StepId;
  setActiveSection: (id: StepId) => void;
  children: React.ReactNode;
};

export default function StoryStep({ id, setActiveSection, children }: Props) {
  const { ref, inView } = useInView({
    threshold: 0.5,
  });

  useEffect(() => {
    if (inView) {
      setActiveSection(id);
    }
  }, [inView, id, setActiveSection]);

  return (
    <Box
      component="section"
      ref={ref}
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        paddingLeft: "6vw",
        paddingRight: "6vw",
        pointerEvents: "none",
      }}
    >
      <Box
        sx={{
          maxWidth: 560,
          pointerEvents: "auto",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
