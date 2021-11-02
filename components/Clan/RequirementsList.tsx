import dayjs from "dayjs";
import React from "react";
import { useTranslation } from "react-i18next";
import { Image, PixelRatio, View, Pressable } from "react-native";
import useComponentSize from "../../hooks/useComponentSize";
import useCuppaZeeRequest from "../../hooks/useCuppaZeeRequest";
import useMunzeeRequest from "../../hooks/useMunzeeRequest";
import TypeImage from "../Common/TypeImage";
import Loading from "../Loading";
import Icon from "../Common/Icon";
import { ClanRewardsData, GameID, generateClanRequirements } from "@cuppazee/utils/lib";
import useDB from "../../hooks/useDB";
import { Box, Heading, Text } from "native-base";

export interface ClanRequirementsListProps {
  game_id: number;
  clan_id?: number;
}

export default React.memo(
  function ClanRequirementsList({
    game_id,
    clan_id: actual_clan_id = 2041,
  }: ClanRequirementsListProps) {
    const { t } = useTranslation();
    const [size, onLayout] = useComponentSize();
    const fontScale = PixelRatio.getFontScale();

    const db = useDB();

    const clan_id = actual_clan_id >= 0 ? actual_clan_id : 2041;

    const requirements_data = useMunzeeRequest("clan/v2/requirements", {
      clan_id,
      game_id,
    });

    const rewards_data = useCuppaZeeRequest<{ data: ClanRewardsData }>("clan/rewards", {
      game_id,
    });

    const requirements = React.useMemo(
      () => generateClanRequirements(db, requirements_data.data?.data),
      [requirements_data.dataUpdatedAt, db]
    );

    const levelCount = Object.keys(requirements_data.data?.data?.data.levels ?? {}).length;
    const levels = new Array(levelCount).fill(0).map((_, n) => n + 1);

    const rewards = rewards_data.data?.data;

    if (requirements_data.data?.data?.data.levels.length === 0) {
      return null;
    }

    if (!requirements || !size || !rewards) {
      return (
        <Box bg="regularGray.100" _dark={{ bg: "regularGray.900"}} style={{ flexGrow: 1 }} onLayout={onLayout}>
          <Loading data={[requirements_data, rewards_data]} />
        </Box>
      );
    }
    return (
      <Box
        bg="regularGray.200"
        _dark={{ bg: "regularGray.800" }}
        onLayout={onLayout}
        style={{ margin: 4, borderRadius: 8 }}>
        <Box
          bg="regularGray.300"
          _dark={{ bg: "regularGray.700" }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            height: 48 * fontScale,
            padding: 4,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}>
          <Icon
            style={{
              height: 32 * fontScale,
              width: 32 * fontScale,
              marginRight: 8,
            }}
            name="playlist-check"
          />
          <View>
            <Heading fontSize="lg">{t("clan:clan_requirements")}</Heading>
            <Pressable
              onPress={() => {
                console.log(JSON.stringify(requirements.all));
              }}>
              <Heading fontSize="sm">{dayjs(new GameID(game_id).date).format("MMMM YYYY")}</Heading>
            </Pressable>
          </View>
        </Box>
        {requirements.isAprilFools && (
          <Text style={{ padding: 4 }}>
            Please be aware that the Munzee API is still returning April Fools requirements. I have
            tried my best to manually input the real reqirements here, however there may be a few
            typos. Once Munzee disables the April Fools requirements, CuppaZee will return back to
            using the accurate data provided by Munzee automatically.
          </Text>
        )}
        {levels.map(level => (
          <View style={{ paddingBottom: 16 }}>
            <Heading style={{ margin: 4 }} fontSize="lg">
              {t("clan:level", { level })}
            </Heading>
            <Heading style={{ margin: 4 }} fontSize="md">
              {t("clan:individual")}
            </Heading>
            {requirements.individual
              .filter(i => requirements.tasks.individual[i][level])
              .map(i => (
                <View style={{ padding: 4, flexDirection: "row" }}>
                  <Image
                    source={{ uri: `https://server.cuppazee.app/requirements/${i}.png` }}
                    style={{ height: 24, width: 24, marginRight: 8 }}
                  />
                  <Heading fontSize="xs">
                    <Heading fontSize="sm">
                      {requirements.tasks.individual[i][level]?.toLocaleString()}
                    </Heading>{" "}
                    {db.getClanRequirement(i).top} {db.getClanRequirement(i).bottom}
                  </Heading>
                </View>
              ))}

            <Heading style={{ margin: 4 }} fontSize="md">
              {t("clan:group")}
            </Heading>
            {requirements.group
              .filter(i => requirements.tasks.group[i][level])
              .map(i => (
                <View style={{ padding: 4, flexDirection: "row" }}>
                  <Image
                    source={{ uri: `https://server.cuppazee.app/requirements/${i}.png` }}
                    style={{ height: 24, width: 24, marginRight: 8 }}
                  />
                  <Heading fontSize="xs">
                    <Heading fontSize="sm">
                      {requirements.tasks.group[i][level]?.toLocaleString()}
                    </Heading>{" "}
                    {db.getClanRequirement(i).top} {db.getClanRequirement(i).bottom}
                  </Heading>
                </View>
              ))}

            <Heading style={{ margin: 4 }} fontSize="md">
              {t("clan:rewards")}
            </Heading>
            {rewards.order
              .filter(i => rewards.levels[level - 1]?.[i])
              .map(i => (
                <View style={{ padding: 4, flexDirection: "row" }}>
                  <TypeImage icon={rewards.rewards[i]?.logo} style={{ size: 24, marginRight: 8 }} />
                  <Heading fontSize="xs">
                    <Heading fontSize="sm">
                      {rewards.levels[level - 1][i]?.toLocaleString()}x
                    </Heading>{" "}
                    {rewards.rewards[i]?.name}
                  </Heading>
                </View>
              ))}
          </View>
        ))}
      </Box>
    );
  },
  (prev, now) => prev.clan_id === now.clan_id && prev.game_id === now.game_id
);
