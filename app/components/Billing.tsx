import {
  Box,
  Button,
  Card,
  Divider,
  Grid,
  Icon,
  InlineGrid,
  InlineStack,
  Text,
} from "@shopify/polaris";

import { CheckCircleIcon, MinusCircleIcon } from "@shopify/polaris-icons";

export type PlanInfo = {
  isActived?: boolean;
  title: string;
  features?: string[];
  noFeatures?: string[];
  price?: number;
  usage?: string;
};

type PlanStackProps = {
  plans: PlanCardProps[];
};

export function PlanStack(props: PlanStackProps) {
  return (
    <Grid>
      {props.plans &&
        props.plans.map((plan, idx) => (
          <Grid.Cell
            key={`plan-${idx}`}
            columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}
          >
            <PlanCard {...plan} />
          </Grid.Cell>
        ))}
    </Grid>
  );

  // return (
  //   <Box width="1280px" >
  //     <InlineGrid columns={props.plans.length}>
  //       {props.plans &&
  //         props.plans.map((plan, idx) => <PlanCard key={`${idx}`} {...plan} />)}
  //     </InlineGrid>
  //   </Box>
  // );
}

export type PlanCardProps = PlanInfo & {
  onSubscription?: (title: string) => void;
};

export function PlanCard(props: PlanCardProps) {
  return (
    <Box padding={"100"}>
      <InlineGrid alignItems="start">
        <Box paddingInlineStart={"400"}>
          <p style={{ fontWeight: "bold", fontSize: "1rem" }}>{props.title}</p>
          {/* <Text as="h2">{props.title}</Text> */}
        </Box>

        <Card padding={"400"}>
          <div
            style={{
              minHeight: "250px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ minHeight: "32px" }}>
              <p>{props.price ? `${props.price} USD/month` : "Free"}</p>
              <p>{props.usage ? `${props.usage}` : "Unlimited"}</p>
            </div>

            <Divider borderWidth="050" />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                marginTop: "12px",
                flex: "1",
              }}
            >
              <div>
                {props.features &&
                  props.features.map((v, idx) => (
                    <div
                      key={`fet-${idx}`}
                      style={{
                        marginBottom: "8px",
                        display: "flex",
                        flexWrap: "wrap",
                        minWidth: "200px",
                      }}
                    >
                      <Box width="20px">
                        <Icon source={CheckCircleIcon} tone="success" />
                      </Box>
                      <Text as="p"> {v}</Text>
                    </div>
                  ))}

                {props.noFeatures &&
                  props.noFeatures.map((v, idx) => (
                    <div key={`nofet-${idx}`} style={{ marginBottom: "8px" }}>
                      <InlineStack>
                        <Box width="20px">
                          <Icon source={MinusCircleIcon} tone="critical" />
                        </Box>
                        <Text as="span">{v}</Text>
                      </InlineStack>
                    </div>
                  ))}
              </div>
              {props.onSubscription && (
                <Button
                  fullWidth
                  variant="secondary"
                  onClick={() =>
                    props.onSubscription && props.onSubscription(props.title)
                  }
                >
                  Subscription
                </Button>
              )}
            </div>
          </div>
        </Card>
      </InlineGrid>
    </Box>
  );
}

type CurrentPlanCardProps = {
  title: string;
};

export function CurrentPlanCard(props: CurrentPlanCardProps) {
  return (
    <Card>
      <Box padding={"150"}>
        <Text as="p"> {props.title}</Text>
      </Box>
    </Card>
  );
}
