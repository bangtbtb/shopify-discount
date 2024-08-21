import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js/auto";
import { ClientOnly } from "remix-utils/client-only";
import type { ChartProps } from "node_modules/react-chartjs-2/dist/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

export function LineChart(props: Omit<ChartProps<"line">, "type">) {
  return <ClientOnly fallback={null}>{() => <Line {...props} />}</ClientOnly>;
}
