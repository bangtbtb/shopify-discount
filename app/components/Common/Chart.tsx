import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js/auto";
import { ClientOnly } from "remix-utils/client-only";
import type { ChartProps } from "node_modules/react-chartjs-2/dist/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

export const clearLineChartOption: ChartOptions<"line"> = {
  responsive: true,
  plugins: {
    title: {
      display: false,
      text: "",
      align: "start",
    },
    legend: {
      display: false,
    },
  },
  elements: {
    line: {
      tension: 0.4,
    },
  },
  interaction: {
    intersect: false,
  },
  scales: {
    x: {
      display: false,
      title: {
        display: true,
      },
      ticks: {
        autoSkip: true,
      },
    },
    y: {
      display: false,
      title: {
        display: false,
        text: "View",
      },
      grid: {
        display: false,
      },
      ticks: {
        autoSkip: true,
      },
    },
  },
};

export function LineChart(props: Omit<ChartProps<"line">, "type">) {
  return <ClientOnly fallback={null}>{() => <Line {...props} />}</ClientOnly>;
}

export function BarChart(props: Omit<ChartProps<"bar">, "type">) {
  return <ClientOnly fallback={null}>{() => <Bar {...props} />}</ClientOnly>;
}
