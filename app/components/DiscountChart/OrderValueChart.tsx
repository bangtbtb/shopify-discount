import { useEffect, useState } from "react";
import { SeriesDP } from "~/defs/gui";
import { BarChart, LineChart } from "~/components/Common/Chart";

type ViewCounterChartProps = {
  title?: string;
  data: SeriesDP[];
};

const ViewCounterChart = ({ title, data }: ViewCounterChartProps) => {
  const [labels, setLabels] = useState(data.map((v) => v.date));
  const [dArr, setDArr] = useState(data.map((v) => v.data));

  useEffect(() => {
    setLabels(data.map((v) => v.date));
    setDArr(data.map((v) => v.data));
  }, [data]);

  return (
    <LineChart
      data={{
        labels: labels,
        datasets: [
          {
            label: "View",
            data: dArr,
            borderColor: "rgb(255, 99, 132)",
            backgroundColor: "rgba(155, 99, 232, 0.5)",
            pointStyle: "rectRounded",
          },
        ],
      }}
      options={{
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: title,
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
      }}
    />
  );
};

export default ViewCounterChart;
