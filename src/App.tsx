import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CaliforniaScrolly from './components/SimpleScrollama'
import CaliforniaMap from './components/California_Map'
import CaliforniaMapRevenue from './components/revenue_chro'
import OpenExploration from './components/OpenExploration'
import Scale from './components/02Scale'
import Opener from './components/01Opener'
import DroughtCumulativeAreaChart from './components/06_Drought_monitor';
import Test_DM from './components/test_dm';
import TemperatureTrend from './components/07_Rising_Temp';
import ZoomToColusaMap from './components/test_colusa';
import Scale_CV from './components/03Scale_CV';
import PrecipitationAnomalyChart from './components/08_Precipitation';
import SurfaceGroundwaterChart from './components/SW_GW';
import CaliforniaCountyMap from './vis/DroughtMap';


import StoryContainer from './StoryContainer';


import './index.css'
function App() {
return <StoryContainer/>

}


// import './App.css'
// function App() {
//   return (
//       <CaliforniaCountyMap />
//   );
// }


export default App;
