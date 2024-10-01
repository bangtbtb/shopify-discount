// import { InlineGrid, Select } from "@shopify/polaris";
// import { BarChart, LineChart } from "../Common/Chart";
// import { ChartType } from "chart.js";

// type DynamicChartProps = {
//   initType?: ChartType ;
//   datasets:
// };
// export const DynamicChart = () => {

//   const [chartType, setChartType] = useState<ChartType>("line");
//     return (
//         <>
//           <InlineGrid columns={2}>
//             <Text as="legend">{title}</Text>
//             <Select
//               label=""
//               value={chartType}
//               options={[
//                 {
//                   label: "Line",
//                   value: "line",
//                 },
//                 {
//                   label: "StackBar",
//                   value: "bar",
//                 },
//               ]}
//               onChange={(v) => setChartType(v as ChartType)}
//             />
//           </InlineGrid>
//           {chartType === "bar" && (
//             <BarChart
//               // id="hello-chart"
//               data={{
//                 labels: labels,
//                 datasets: [
//                   {
//                     label: "Order applied",
//                     data: appliedValue,
//                     stack: "combine",
//                     type: "bar",

//                     // borderColor: "rgb(255, 99, 10)",
//                     // backgroundColor: "rgb(255, 99, 10)",
//                   },
//                   {
//                     label: "Order unapplied",
//                     data: unappliedValue,
//                     stack: "combine",
//                     // borderColor: "rgb(155, 99, 132)",
//                     // backgroundColor: "rgba(10, 250, 132, 0.5)",
//                   },
//                 ],
//               }}
//               options={clearBarOption}
//             />
//           )}
//           {chartType === "line" && (
//             <LineChart
//               // id="hello-chart"
//               data={{
//                 labels: labels,
//                 datasets: [
//                   {
//                     label: "Order applied",
//                     data: appliedValue,
//                     // borderColor: "rgb(255, 99, 10)",
//                     // backgroundColor: "rgb(255, 99, 10)",
//                     stack: "combine",
//                   },
//                   {
//                     label: "Order unapplied",
//                     data: unappliedValue,
//                     // borderColor: "rgb(155, 99, 132)",
//                     // backgroundColor: "rgba(10, 250, 132, 0.5)",
//                     stack: "combine",
//                   },
//                 ],
//               }}
//               options={clearLineChartOption}
//             />
//           )}
//         </>
//     )
// };
