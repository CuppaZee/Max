import { GameID } from "@cuppazee/utils/lib";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import dayjs from "dayjs";
import { Box } from "native-base";
import React from "react";
import { ScrollView } from "react-native";
import ClanRequirementsTable from "../../components/Clan/Requirements";
import ClanStatsTable from "../../components/Clan/Stats";
import { useSyncScrollViewController } from "../../components/Clan/SyncScrollView";
import Select from "../../components/Common/Select";
import Tip from "../../components/Common/Tip";
import useMunzeeRequest from "../../hooks/useMunzeeRequest";
import useSetting, { ClanPersonalisationAtom } from "../../hooks/useSetting";
import useTitle from "../../hooks/useTitle";
import { NavProp } from "../../navigation";
import { RootStackParamList } from "../../types";
import { ClanPersonalisationModal } from "../Settings/Personalisation";
import { useHeaderHeight } from "@react-navigation/elements";

export default function ClanStatsScreen2() {
  const [style] = useSetting(ClanPersonalisationAtom);
  const scrollViewController = useSyncScrollViewController();
  const route = useRoute<RouteProp<RootStackParamList, "Clan_Stats">>();
  const nav = useNavigation<NavProp>();
  const game_id = route.params?.year
    ? new GameID(
        Number(route.params.year),
        route.params?.month ? Number(route.params.month) - 1 : dayjs.mhqNow().month()
      ).game_id
    : new GameID().game_id;
  const clan_id = Number(route.params.clanid);
  const clan_data = useMunzeeRequest("clan/v2", { clan_id });
  const headerHeight = useHeaderHeight();
  useTitle(`${clan_data.data?.data?.details?.name ?? clan_id}`);
  return (
    <Box bg="regularGray.100" _dark={{ bg: "regularGray.900" }} style={{ flex: 1 }}>
      <ClanPersonalisationModal />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 4, paddingTop: 4 + headerHeight }}>
        <Tip
          wrapperStyle={{ margin: 4, width: 400, maxWidth: "100%", alignSelf: "center" }}
          id="clan_stats_customisation"
          tip="There are a lot of options to make Clan Stats your own in the Personalisation settings"
        />
        <ClanStatsTable
          clan_id={clan_id}
          game_id={game_id}
          scrollViewController={style.reverse ? undefined : scrollViewController}
        />
        <ClanRequirementsTable
          clan_id={clan_id}
          game_id={game_id}
          scrollViewController={style.reverse ? undefined : scrollViewController}
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
      </ScrollView>
    </Box>
  );
}
