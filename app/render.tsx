import { renderToString } from "react-dom/server";
import {
  BundleThemePreview,
  defaultBundleTheme,
} from "~/components/Discounts/BundleTheme";
console.log("Hello render");

console.time("Render_time");

var endAt = new Date().getTime() + 86400;
const html = renderToString(
  <BundleThemePreview
    content={{
      button: "Add To Cart",
      total: "Total",
      showOnPage: true,
      shortDesc: "",
    }}
    theme={defaultBundleTheme}
    titleContent="Hello Bundle"
    discount={{ type: "percent", value: 10 }}
    endAt={endAt}
    products={[
      {
        id: "100",
        image: "Product 1",
        requireVol: 2,
        title: "fdfd",
        variants: [
          {
            id: "p1_v1",
            price: "100",
          },
        ],
        totalVariants: 1,
        imageAlt: "",
      },
    ]}
  />,
);
console.log("HTML: ", html);

console.timeLog("Render_time");
