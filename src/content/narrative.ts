// src/content/narrative.ts

// ---- Types ----
export type Camera = {
  longitude: number;
  latitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
};

export type StepAction = {
  camera?: Camera;
  showLayers?: string[];
  hideLayers?: string[];
  payload?: Record<string, any>;
};

export type NarrativeStep = {
  id: string;
  kicker?: string;
  title: string;
  body: string;
  action?: StepAction;
};

export type NarrativeSection = {
  id: string;
  title: string;
  intro?: string;
  steps: NarrativeStep[];
};

// ---- Narrative Content ----
export const NARRATIVE: NarrativeSection[] = [
  {
    id: "section-1",
    title: "California agriculture depends on water",
    intro:
      "Scroll to understand the scale of California’s agricultural system—and why water scarcity matters.",
    steps: [
      {
        id: "s1-1-global",
        kicker: "Context",
        title: "A global-scale agricultural system",
        body:
          "California’s agricultural sector is the nation’s top producer and one of the world’s most significant agricultural systems.",
        action: {
          camera: { longitude: -120, latitude: 37, zoom: 5.5 },
          showLayers: ["state_outline"],
          hideLayers: ["central_valley_detail"],
          payload: { theme: "intro" },
        },
      },
      {
        id: "s1-2-land",
        kicker: "Footprint",
        title: "8.5 million acres of irrigated farmland",
        body:
          "About 8.5 million acres of irrigated land are used for agriculture across California.",
        action: {
          camera: { longitude: -120, latitude: 36.7, zoom: 6.2 },
          showLayers: ["irrigated_land"],
          payload: { metric: "irrigated_acres" },
        },
      },
      {
        id: "s1-3-output",
        kicker: "Production",
        title: "400+ commodities and $60B+ revenue",
        body:
          "The state’s farms and ranches produce more than 400 agricultural commodities and generate over $60 billion in revenue.",
        action: {
          showLayers: ["ag_output_summary"],
          payload: { metric: "revenue" },
        },
      },
      {
        id: "s1-4-jobs",
        kicker: "Economy",
        title: "600,000 jobs across a larger food system",
        body:
          "Agricultural commodities serve as inputs for robust food and beverage processing and distribution industries. Altogether, farms, ranches, and food and beverage industries support around 600,000 jobs.",
        action: {
          camera: { longitude: -120, latitude: 36.4, zoom: 7.0 },
          showLayers: ["food_supply_chain"],
          payload: { metric: "jobs" },
        },
      },
      {
        id: "s1-5-water",
        kicker: "Key dependency",
        title: "This entire system runs on one resource: water",
        body:
          "This agricultural system, however, depends on one essential resource: water.",
        action: {
          camera: { longitude: -120, latitude: 36.4, zoom: 7.4 },
          showLayers: ["water_infrastructure"],
          payload: { theme: "pivot_to_water" },
        },
      },
    ],
  },

      {
      id: "section-2-drought-context",
      title: "Climate change is amplifying drought",
      intro:
        "Drought is not new in California—but rising temperatures and shifting precipitation patterns are intensifying dry periods and increasing pressure on water supplies.",
      steps: [
        {
          id: "s2-1-natural",
          kicker: "Background",
          title: "Drought is part of California’s natural climate",
          body: "Drought has always been part of California’s natural climate.",
          action: {
            camera: { longitude: -120, latitude: 37, zoom: 5.5 },
            showLayers: ["state_outline"],
            hideLayers: ["drought_overlay", "temp_anomaly", "precip_variability"],
            payload: { theme: "drought_context" },
          },
        },
        {
        id: "s2-1b-drought-chart",
        kicker: "Trend",
        title: "Drought severity has intensified over time",
        body:"",
        action: {
            // keep camera the same as s2-1-natural (optional)
            camera: { longitude: -120, latitude: 37, zoom: 5.5 },
            showLayers: ["state_outline"],
            hideLayers: ["drought_overlay", "temp_anomaly", "precip_variability"],
            payload: { theme: "drought_chart" },
        },
        },
    {
      id: "s2-2-warming",
      kicker: "Warming",
      title: "Higher temperatures make water vanish faster",
      body:
        "Rising temperatures across the state accelerate evaporation from soils, rivers, and reservoirs, causing water to disappear more quickly than before.",
      action: {
        showLayers: ["temp_anomaly", "reservoirs", "rivers"],
        payload: { metric: "evaporation_pressure" },
      },
    },
    {
      id: "s2-3-precip",
      kicker: "Rainfall",
      title: "Precipitation is becoming more volatile",
      body:
        "At the same time, precipitation patterns are becoming increasingly volatile and unpredictable, with rainfall arriving less consistently and often in shorter, more intense bursts.",
      action: {
        showLayers: ["precip_variability"],
        payload: { metric: "precip_variability" },
      },
    },
    {
      id: "s2-4-amplifier",
      kicker: "Climate change",
      title: "An amplifier of dry periods",
      body:
        "However, today, climate change is acting as a powerful amplifier, intensifying the severity of these dry periods.",
      action: {
        showLayers: ["drought_overlay"],
        payload: { theme: "climate_amplifier" },
      },
    },
    {
      id: "s2-5-pressure",
      kicker: "Impact",
      title: "More frequent, persistent droughts strain water supply",
      body:
        "Together, these are pushing California into deeper and more intense and frequent persistent droughts, placing growing pressure on the state’s water supply and the systems that depend on it.",
      action: {
        camera: { longitude: -120, latitude: 36.6, zoom: 6.3 },
        showLayers: ["drought_overlay", "water_infrastructure"],
        payload: { metric: "drought_severity" },
      },
    },
  ],
},

{
  id: "section-3-water-system",
  title: "How drought reshapes California’s water system",
  intro:
    "As drought intensifies, the balance between surface water and groundwater shifts—revealing structural limits in California’s water system.",
  steps: [
    {
      id: "s3-1-system-stress",
      kicker: "System stress",
      title: "Drought strains the entire water system",
      body:
        "During drought periods, California’s water system experiences significant stress.",
      action: {
        camera: { longitude: -120, latitude: 36.6, zoom: 6.2 },
        showLayers: ["drought_overlay", "water_infrastructure"],
        payload: { theme: "system_stress" },
      },
    },
    {
      id: "s3-2-surface-to-groundwater",
      kicker: "Shifting sources",
      title: "Surface water declines—groundwater fills the gap",
      body:
        "As drought reduces rainfall and snowpack, surface water in rivers and reservoirs begins to decline. With less surface water available for irrigation, agriculture increasingly turns to groundwater pumping to meet its needs.",
      action: {
        showLayers: ["reservoirs", "rivers", "groundwater"],
        payload: { metric: "surface_vs_groundwater_shift" },
      },
    },
    {
      id: "s3-3-groundwater-limits",
      kicker: "Consequences",
      title: "Groundwater overuse triggers limits",
      body:
        "Over time, unsustainable groundwater extraction has caused impacts such as dry wells and land subsidence. In response, the state increased oversight and regulation, limiting groundwater use and reducing overall water availability as aquifer levels decline.",
      action: {
        showLayers: ["groundwater", "subsidence_zones"],
        payload: { metric: "groundwater_limits" },
      },
    },
    {
      id: "s3-4-total-decline",
      kicker: "Shortage",
      title: "Total agricultural water supply declines",
      body:
        "As both surface water and groundwater supplies become increasingly scarce, the total amount of water available for agriculture declines, placing growing pressure on farming and crop production.",
      action: {
        showLayers: ["county_choropleth_shortage"],
        payload: { metric: "total_water_shortage" },
      },
    },
    {
      id: "s3-5-visible-impacts",
      kicker: "Reshaping agriculture",
      title: "Water scarcity reshapes agricultural activity",
      body:
        "Over time, these constraints are beginning to reshape agricultural activity, and the impacts of water shortages are becoming increasingly visible.",
      action: {
        camera: { longitude: -120, latitude: 36.4, zoom: 7.4 },
        showLayers: ["crop_change", "revenue_change"],
        payload: { theme: "agricultural_impact" },
      },
    },
  ],
},

{
  id: "section-4-agricultural-impacts",
  title: "How water shortages reshape agriculture, economy, and communities",
  intro:
    "When drought reduces available water, the impacts extend beyond fields and canals—affecting agricultural production, revenue, and rural livelihoods.",
  steps: [
    {
      id: "s4-1-idled-farmland",
      kicker: "Agricultural impact",
      title: "Farmland is left idle when water is insufficient",
      body:
        "When water supplies are insufficient, irrigated farmland is often left unplanted or fallowed—a strategic decision to mitigate financial losses, but one farmers are frequently forced into during drought.",
      action: {
        camera: { longitude: -120, latitude: 36.6, zoom: 6.4 },
        showLayers: ["idled_farmland_map"],
        payload: { metric: "idled_land" },
      },
    },
    {
      id: "s4-2-2019-2022",
      kicker: "Year comparison",
      title: "Drought conditions in 2022 expanded land fallowing",
      body:
        "Compared with the wetter conditions in 2019, drought conditions in 2022 forced substantially more land out of production. Statewide, an estimated 752,000 acres were idled due to limited water availability.",
      action: {
        showLayers: ["idled_farmland_map"],
        payload: { metric: "2019_vs_2022_land" },
      },
    },
    {
      id: "s4-3-production",
      kicker: "Production impact",
      title: "Reduced acreage lowers agricultural output",
      body:
        "As land is fallowed and acreage declines, overall agricultural production decreases. Fewer planted fields translate directly into fewer crops harvested and sold.",
      action: {
        showLayers: ["crop_change"],
        payload: { metric: "production_decline" },
      },
    },
    {
      id: "s4-4-revenue",
      kicker: "Economic impact",
      title: "Lower production leads to revenue losses",
      body:
        "Comparing 2019 and 2022 shows how drought directly affects agricultural income. Statewide, growers experienced an estimated $1.7 billion loss in gross crop revenue, with the largest impacts concentrated in heavily irrigated regions such as the Central Valley.",
      action: {
        showLayers: ["revenue_change"],
        payload: { metric: "revenue_loss" },
      },
    },
    {
      id: "s4-5-employment",
      kicker: "Social impact",
      title: "Declining production reduces labor demand",
      body:
        "When less farmland is cultivated and production falls, fewer workers are needed. As drought reduced available water and more farmland was idled in 2022, labor demand across agriculture declined compared to 2019. In total, an estimated 19,418 full- and part-time jobs were lost statewide.",
      action: {
        camera: { longitude: -120, latitude: 36.4, zoom: 6.8 },
        showLayers: ["employment_change"],
        payload: { metric: "job_loss" },
      },
    },
  ],
},

{
  id: "section-5-exploration",
  title: "Explore how drought impacts vary across California",
  intro:
    "The impacts of water shortages are not uniform. Differences across counties and regions reveal how drought reshapes agriculture in uneven ways.",
  steps: [
    {
      id: "s5-1-transition",
      kicker: "Regional variation",
      title: "Impacts differ across counties",
      body:
        "Drought does not affect agriculture in a single step—it unfolds as a chain of impacts. As water availability declines, each part of the agricultural system begins to respond. Observing these changes helps people understand how drought reshapes agriculture over time and supports more informed decisions about how to respond to water scarcity.",
      action: {
        camera: { longitude: -120, latitude: 36.6, zoom: 6.2 },
        showLayers: ["county_choropleth_shortage"],
        payload: { theme: "exploration_intro" },
      },
    },
    {
      id: "s5-2-open-exploration",
      kicker: "Interactive exploration",
      title: "Explore the data",
      body:
        "",
      action: {
        camera: { longitude: -120, latitude: 36.6, zoom: 6.5 },
        showLayers: ["open_exploration_component"],
        payload: { theme: "open_exploration" },
      },
    },
  ],
},
];

export function getAllSteps() {
  return NARRATIVE.flatMap((section) => section.steps);
}

export function findStepById(stepId: string) {
  return getAllSteps().find((s) => s.id === stepId);
}