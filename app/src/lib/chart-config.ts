import {
  Chart as ChartJS,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  CategoryScale
} from "chart.js";

let isRegistered = false;

export const ensureChartJsRegistered = () => {
  if (isRegistered) {
    return;
  }
  ChartJS.register(
    LinearScale,
    LogarithmicScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler,
    CategoryScale
  );
  isRegistered = true;
};
