import { useHeaderHeight } from "@react-navigation/elements";
import { Box, ScrollView, VStack } from "native-base";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Item } from "../../components/Common/Item";
import useTitle from "../../hooks/useTitle";

export default function DonateScreen() {
  const { t } = useTranslation();
  const headerHeight = useHeaderHeight();
  useTitle(`${t("pages:more")}`);
  return (
    <ScrollView
      flex={1}
      bg="regularGray.100"
      _dark={{ bg: "regularGray.900" }}
      contentContainerStyle={{ paddingTop: headerHeight }}>
      <VStack py={2} px={2} space={2}>
        <Box borderRadius={4} bg="regularGray.200" _dark={{ bg: "regularGray.800" }}>
          <Item
            navMethod="push"
            icon="shield-half-full"
            title={t("pages:clan_bookmarks")}
            link={["Clan_Bookmarks"]}
          />
          <Item
            navMethod="push"
            icon="map-marker-radius"
            title={t("pages:tools_nearby")}
            link={["Tools_Nearby"]}
          />
          <Item
            navMethod="push"
            icon="map-marker"
            title={t("pages:tools_bouncers_overview")}
            link={["Tools_Bouncers"]}
          />
          <Item
            navMethod="push"
            icon="clock"
            title={t("pages:tools_bouncing_soon")}
            link={["Tools_BouncersExpiring"]}
          />
        </Box>
        <Box borderRadius={4} bg="regularGray.200" _dark={{ bg: "regularGray.800" }}>
          <Item
            navMethod="push"
            icon="bomb"
            title={t("pages:tools_blastplanner")}
            link={["Tools_Blast"]}
          />
          <Item
            navMethod="push"
            icon="map-marker-circle"
            title={t("pages:tools_poiplanner")}
            link={["Tools_POIPlanner"]}
          />
          <Item
            navMethod="push"
            icon="home-circle-outline"
            title={t("pages:tools_destinationplanner")}
            link={["Tools_DestinationPlanner"]}
          />
          <Item
            navMethod="push"
            icon="dna"
            title={t("pages:tools_evo_planner")}
            link={["Tools_EvoPlanner"]}
          />
        </Box>
        <Box borderRadius={4} bg="regularGray.200" _dark={{ bg: "regularGray.800" }}>
          <Item
            navMethod="push"
            icon="calendar"
            title={t("pages:tools_calendar")}
            link={["Tools_Calendar"]}
          />
          <Item
            navMethod="push"
            icon="earth"
            title={t("pages:tools_universal")}
            link={["Tools_Universal"]}
          />
          <Item
            navMethod="push"
            icon="database"
            title={t("pages:tools_munzee_types")}
            link={["Tools_TypeCategory", { category: "root" }]}
          />
        </Box>
        <Box borderRadius={4} bg="regularGray.200" _dark={{ bg: "regularGray.800" }}>
          <Item
            navMethod="push"
            icon="palette"
            title={t("pages:settings_personalisation")}
            link={["Settings_Personalisation"]}
          />
          <Item
            navMethod="push"
            icon="account-multiple"
            title={t("pages:settings_accounts")}
            link={["Settings_Accounts"]}
          />
          <Item
            navMethod="push"
            icon="bookmark-multiple"
            title={t("pages:settings_bookmarks")}
            link={["Settings_Bookmarks"]}
          />
        </Box>
      </VStack>
    </ScrollView>
  );
}
