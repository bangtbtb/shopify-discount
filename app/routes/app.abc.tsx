import { useEffect, useState } from "react";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  SerializeFrom,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  InlineGrid,
  TextField,
  Tabs,
  Box,
  Button,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

import { EasyTab } from "~/components/Common/Tab";
import { StepCounter, StepProgress } from "~/components/Common/StepProgress";
import { OverlayImage } from "~/components/Common/OverlayImage";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    await authenticate.admin(request);
    console.log("Call loader");
    return json({ abc: "def" });
  } catch (error) {
    console.log("Error: ", error);
    return json({ abc: "" });
  }
};

export const action = async () => {
  console.log("Call action");
  return json({ abc: "def" });
};

export default function ABCIndex() {
  const [active, setActive] = useState(0);
  const tabs = [
    "tab 1",
    "tab 2",
    "tab 3",
    "tab 4",
    "tab 10",
    "tab 11",
    "tab 12",
    "tab 13",
  ];

  const [selected, setSelected] = useState(-1);

  return (
    <Page title="ABC index">
      <Box width="600px">
        <EasyTab
          id="test-tab"
          active={active}
          onActive={(v) => {
            setActive(v);
          }}
          tabs={tabs}
          actions={[
            <Button>Button dfdf</Button>,
            <Button>Button dfdf</Button>,
            <Button>Button dfdf</Button>,
          ]}
        >
          <div> test tab{active}</div>
          <div> test tab{active}</div>
          <div> test tab{active}</div>
        </EasyTab>
      </Box>

      {/* <StepProgress direction="row" active={active}>
        <div>tab 1</div>
        <div>tab 2</div>
        <div>tab 3</div>
        <div>tab 4</div>
        <div>tab 10</div>
        <div>tab 11</div>
        <div>tab 12</div>
        <div>tab 13</div>
      </StepProgress> */}

      <OverlayImage
        size={40}
        srcs={[
          {
            src: "https://cdn.shopify.com/s/files/1/0619/9325/4985/files/S913f93dfdecd45ab932762aaff2c5ce5m_200x200.webp",
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0619/9325/4985/files/S913f93dfdecd45ab932762aaff2c5ce5m_200x200.webp",
          },
          {
            src: "https://cdn.shopify.com/s/files/1/0619/9325/4985/files/S913f93dfdecd45ab932762aaff2c5ce5m_200x200.webp",
          },
        ]}
      ></OverlayImage>

      <StepCounter
        direction="row"
        active={active}
        highlightColor="#4ec6de"
        selected={selected}
        onSelect={setSelected}
        // children={[
        //   <Card>
        //     <p style={{ color: "green" }}>100$</p>
        //     <p style={{ color: "green" }}>10%</p>
        //   </Card>,
        //   <Card>
        //     <p style={{ color: "green" }}>200$</p>
        //   </Card>,
        //   <Card>
        //     <p style={{ color: "green" }}>300$</p>
        //   </Card>,
        // ]}
      >
        <Card>
          <p style={{ color: "green" }}>100$</p>
          <p style={{ color: "green", fontSize: "8px" }}>shipping 10%</p>
        </Card>

        <Card>
          <p style={{ color: "green" }}>200$</p>
        </Card>
        <Card>
          <p style={{ color: "green" }}>300$</p>
        </Card>
      </StepCounter>

      <svg
        className="popup-outline"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 300 130"
        height="130"
        width="300"
        rotate={"180deg"}
      >
        <g strokeWidth="2" strokeLinecap="round">
          <path
            className="popup-outline-left"
            d="M233.5 129s-1.992-7.686-32.218-14c-17.933-5.043-118.204 3.687-163.51-2.544-21.317-2.932-33.706-8.26-34.228-27.022L2.272 39.717c-.46-16.58 12.34-23.718 34.23-27.022 15.897-2.4 32.554-4.284 82.975-3.815"
            fill="none"
            stroke="#303030"
          />
          <path
            className="popup-outline-right"
            d="M119.477 8.88c79.67.74 121.785.26 145.294 5.51 18.483 4.13 34.333 11.696 33.382 32.11l-1.696 36.39c-1.01 21.68-11.678 29.377-21.934 30.838-14.884 2.12-29.72 3.52-54.512-.848C232.522 118.263 233.5 129 233.5 129"
            fill="none"
            stroke="#303030"
          />
        </g>
      </svg>
    </Page>
  );
}
