import { GameID } from "@cuppazee/utils/lib";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import dayjs from "dayjs";
import { Box } from "native-base";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native";
import ClanRequirementsTable from "../../components/Clan/Requirements";
import ClanRequirementsList from "../../components/Clan/RequirementsList";
import ClanRewardsTable from "../../components/Clan/Rewards";
import Select from "../../components/Common/Select";
import Tip from "../../components/Common/Tip";
import useTitle from "../../hooks/useTitle";
import { NavProp } from "../../navigation";
import { RootStackParamList } from "../../types";
import { ClanPersonalisationModal } from "../Settings/Personalisation";

export default function ClanStatsScreen2() {
  const { t } = useTranslation();
  useTitle(`${t("pages:clan_requirements")}`);
  const route = useRoute<RouteProp<RootStackParamList, "Clan_Requirements">>();
  const nav = useNavigation<NavProp>();
  const game_id = route.params?.year
    ? new GameID(
        Number(route.params.year),
        route.params?.month ? Number(route.params.month) - 1 : dayjs.mhqNow().month()
      ).game_id
    : new GameID().game_id;
  return (
    <Box bg="regularGray.100" _dark={{ bg: "regularGray.900" }} style={{ flex: 1 }}>
      <ClanPersonalisationModal />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 4 }}>
        <Tip
          wrapperStyle={{ margin: 4, width: 400, maxWidth: "100%", alignSelf: "center" }}
          id="clan_stats_customisation"
          tip="There are a lot of options to make Clan Stats your own in the Personalisation settings"
        />
        <Select
          style={{ margin: 4 }}
          value={game_id.toString()}
          onValueChange={value => {
            nav.setParams({
              year: new GameID(Number(value)).year,
              month: new GameID(Number(value)).month + 1,
            });
          }}
          options={new Array(new GameID().game_id - 77)
            .fill(0)
            .map((_, i) => {
              const { month, year } = new GameID(i + 79);
              return {
                label: dayjs().set("month", month).set("year", year).format("MMMM YYYY"),
                value: (i + 79).toString(),
              };
            })
            .reverse()}
        />
        <ClanRequirementsTable game_id={game_id} />
        <ClanRewardsTable game_id={game_id} />
        <ClanRequirementsList game_id={game_id} />
      </ScrollView>
    </Box>
  );
}
