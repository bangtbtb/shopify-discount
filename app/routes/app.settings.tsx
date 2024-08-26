import { Page, Text } from "@shopify/polaris";
import { useI18nMultiple } from "~/components/i18n";

export default function SettingPages() {
  const [i18n] = useI18nMultiple();

  return (
    <Page title="Setting page">
      <p>Locale: {i18n.locale}</p>
      <p>language: {i18n.language}</p>
      <Text as="p">
        Translated: {i18n.translate("Polaris.ActionMenu.Actions.moreActions")}
      </Text>
      {/* {i18n.translations.map((v, idx) => {
        return (
          <div key={`dict-${idx}`}>
            <h2>Dict {idx}</h2>
            <p>{JSON.stringify(v)}</p>;
          </div>
        );
      })} */}
    </Page>
  );
}
