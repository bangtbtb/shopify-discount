import { useEffect, useState } from "react";
import { SeriesDP } from "~/defs/gui";
import { BarChart } from "~/components/Common/Chart";

type OrderAppliedChartProps = {
  title?: string;
  applieds: SeriesDP[];
  unapplieds: SeriesDP[];
};

const OrderAppliedChart = ({
  title,
  applieds,
  unapplieds,
}: OrderAppliedChartProps) => {
  const [labels, setLabels] = useState(applieds.map((v) => v.date));
  const [dApplied, setdApplied] = useState(applieds.map((v) => v.data));
  const [dunapplieds, setDunapplieds] = useState(unapplieds.map((v) => v.data));

  // useEffect(() => {
  //   var newLabels = [];
  //   set;
  // }, [data]);
  return (
    <BarChart
      // id="hello-chart"
      data={{
        labels: labels,
        datasets: [
          {
            label: "Order applied",
            data: dApplied,
            borderColor: "rgb(255, 99, 10)",
            backgroundColor: "rgb(255, 99, 10)",
            stack: "combine",
          },
          {
            label: "Order unapplied",
            data: dunapplieds,
            borderColor: "rgb(155, 99, 132)",
            backgroundColor: "rgba(10, 250, 132, 0.5)",
            stack: "combine",
          },
        ],
      }}
      options={{
        responsive: true,
        plugins: {
          title: {
            display: false,
            text: title,
          },
          legend: {
            display: false,
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
      }}
    />
  );
};

export default OrderAppliedChart;
