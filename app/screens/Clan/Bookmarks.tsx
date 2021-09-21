import { GameID } from "@cuppazee/utils/lib";
import { RouteProp, useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
import dayjs from "dayjs";
import { Box } from "native-base";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import ClanRequirementsTable from "../../components/Clan/Requirements";
import ClanStatsTable from "../../components/Clan/Stats";
import { useSyncScrollViewController } from "../../components/Clan/SyncScrollView";
import Select from "../../components/Common/Select";
import Tip from "../../components/Common/Tip";
import useComponentSize from "../../hooks/useComponentSize";
import useSetting, { ClanPersonalisationAtom } from "../../hooks/useSetting";
import useTitle from "../../hooks/useTitle";
import { useUserSetting } from "../../hooks/useUserSettings";
import { NavProp } from "../../navigation";
import { RootStackParamList } from "../../types";
import { ClanPersonalisationModal } from "../Settings/Personalisation";

export default function ClanBookmarksScreen() {
  const { t } = useTranslation();
  useTitle(`${t("pages:clan_bookmarks")}`);
  const [size, onLayout] = useComponentSize();
  const scrollViewController = useSyncScrollViewController();
  const route = useRoute<RouteProp<RootStackParamList, "Clan_Bookmarks">>();
  const nav = useNavigation<NavProp>();
  const game_id = route.params?.year ? new GameID(
    Number(route.params.year),
    route.params?.month ? Number(route.params.month) - 1 : dayjs.mhqNow().month(),
  ).game_id : new GameID().game_id;
  const [style] = useSetting(ClanPersonalisationAtom);
  const clans = useUserSetting("clans");
  const isFocused = useIsFocused();
  if(!isFocused || !size) return <Box bg="regularGray.100" _dark={{ bg: "regularGray.900" }} onLayout={onLayout} style={{ flex: 1 }} />
  return (
    <Box bg="regularGray.100" _dark={{ bg: "regularGray.900" }} onLayout={onLayout} style={{ flex: 1 }}>
      <ClanPersonalisationModal />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 4 }}>
        <Tip
          wrapperStyle={{ margin: 4, width: 400, maxWidth: "100%", alignSelf: "center" }}
          id="clan_stats_customisation"
          tip="There are a lot of options to make Clan Stats your own in the Personalisation settings"
        />
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          <View
            style={{
              width: (size?.width ?? 0) > 800 ? "50%" : "100%",
            }}>
            <ClanRequirementsTable
              key="requirements"
              clan_id={clans?.[0]?.clan_id}
              game_id={game_id}
              scrollViewController={style.reverse ? undefined : scrollViewController}
            />
          </View>
          {clans?.slice(0,1).map(i => (
            <View
              key={i.clan_id}
              style={{
                width: (size?.width ?? 0) > 800 ? "50%" : "100%",
              }}>
              <ClanStatsTable
                clan_id={i.clan_id}
                game_id={game_id}
                scrollViewController={style.reverse ? undefined : scrollViewController}
              />
            </View>
          ))}
          <View
            key="spacer"
            style={{
              width: (size?.width ?? 0) > 800 ? "50%" : "100%",
            }}
          />
        </View>
        <View style={{ width: "100%" }}>
          <Select
            style={{ margin: 4 }}
            value={game_id.toString()}
            onValueChange={value => {
              nav.setParams({
                year: new GameID(Number(value)).year,
                month: new GameID(Number(value)).month + 1,
              });
            }}
            options={new Array(new GameID().game_id - 78)
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
        </View>
      </ScrollView>
    </Box>
  );
}
