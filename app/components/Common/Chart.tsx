import { Line, Bar, Chart } from "react-chartjs-2";
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
  ChartType,
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

export const clearBarOption: ChartOptions<"bar"> = {
  responsive: true,
  plugins: {
    title: {
      display: false,
      text: "",
    },
    legend: {
      display: true,
    },
  },
  scales: {
    x: {
      display: false,
      title: {
        display: true,
      },
    },
    y: {
      display: false,
      title: {
        display: true,
        text: "Value",
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

// type LineBarToggleProps = Omit<ChartProps<"bar">, "type"> & {
//   title?: string;
// };

// export function LineBarToggle(props: Omit<ChartProps<"line">, "type" & "options">) {
//   const { title, ...rest } = props;
//   const [chartType, setChartType] = useState<ChartType>("line");

//   return (
//     <>
//       <InlineGrid columns={2}>
//         <Text as="legend">{props.title}</Text>
//         <Select
//           label=""
//           value={chartType}
//           options={[
//             {
//               label: "Line",
//               value: "line",
//             },
//             {
//               label: "StackBar",
//               value: "bar",
//             },
//           ]}
//           onChange={(v) => setChartType(v as ChartType)}
//         />
//       </InlineGrid>
//       {chartType === "line" && (
//         <LineChart options={clearLineChartOption} {...rest} />
//       )}

//       {chartType === "bar" && <BarChart options={clearBarOption} {...rest} />}
//     </>
//   );
// }
