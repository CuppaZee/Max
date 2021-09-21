import React, { useMemo } from "react";
import { Image, PixelRatio, View } from "react-native";
import {
  DataCell,
  LevelCell,
  RequirementCell,
  RequirementDataCell,
  TitleCell,
  UserCell,
} from "./Cell";
import useComponentSize from "../../hooks/useComponentSize";
import useCuppaZeeRequest from "../../hooks/useCuppaZeeRequest";
import useMunzeeRequest from "../../hooks/useMunzeeRequest";
import useTitle from "../../hooks/useTitle";
import ClanSettingsModal from "./SettingsModal";
import SyncScrollView, { SyncScrollViewController } from "./SyncScrollView";
import Loading from "../Loading";
import useSetting, { ClanPersonalisationAtom, ClansAtom } from "../../hooks/useSetting";
import Icon from "../Common/Icon";
import { ClanShadowData, ClanStatsData, ClanStatsUser, generateClanRequirements, generateClanStats } from "@cuppazee/utils/lib";
import useDB from "../../hooks/useDB";
import { Box, Button, Heading, Modal, Text, useColorMode, useTheme } from "native-base";
export interface ClanStatsTableProps {
  game_id: number;
  clan_id: number;
  title?: boolean;
  scrollViewController?: SyncScrollViewController;
}

export default React.memo(
  function ClanStatsTable({
    game_id,
    clan_id: actual_clan_id,
    title,
    scrollViewController,
  }: ClanStatsTableProps) {
    const [size, onLayout] = useComponentSize();
    const fontScale = PixelRatio.getFontScale();
    const [style] = useSetting(ClanPersonalisationAtom);
    const [options, setOptions] = useSetting(ClansAtom);
    if (!options[actual_clan_id])
      options[actual_clan_id] = {
        shadow: true,
        level: 5,
        share: false,
        subtract: false,
      };
    const [modalVisible, setModalVisible] = React.useState(false);
    const [sortBy, setSortBy] = React.useState(3);
    const reverse = style.reverse;
    const compact = style.style;

    const db = useDB();

    const {colorMode} = useColorMode()
    const theme = useTheme();
    const borderColor =
      (colorMode === "dark" ? theme.colors.regularGray[400] : theme.colors.regularGray[600])
        .replace("rgb(", "rgba(")
        .slice(0, -1) + ", 0.3)";

    const clan_id = actual_clan_id >= 0 ? actual_clan_id : 2041;

    const clan_data = useMunzeeRequest("clan/v2", { clan_id });
    const requirements_data = useMunzeeRequest("clan/v2/requirements", {
      clan_id,
      game_id,
    });

    const shadow_data = useCuppaZeeRequest<{ data?: ClanShadowData }>(
      "clan/shadow",
      {
        clan_id: actual_clan_id,
        game_id,
      },
      [-1, 1349, 1441, 457, 1902, 2042, 1870, 3224].includes(actual_clan_id)
    );

    const requirements = React.useMemo(
      () => generateClanRequirements(db, requirements_data.data?.data),
      [requirements_data.dataUpdatedAt, db]
    );
    const stats = React.useMemo(
      () =>
        generateClanStats(
          db, 
          clan_data.data?.data,
          requirements_data.data?.data,
          requirements || undefined,
          actual_clan_id,
          options[actual_clan_id].shadow ? shadow_data.data?.data : undefined
        ),
      [
        clan_data.dataUpdatedAt,
        shadow_data.dataUpdatedAt,
        requirements,
        options[actual_clan_id].shadow,db
      ]
    );

    if (title)
      useTitle(
        `${
          shadow_data.data?.data?.details.name ??
          clan_data.data?.data?.details.name ??
          actual_clan_id
        }`
      );

    if (
      !stats ||
      !requirements ||
      !size ||
      !clan_data.data ||
      (!shadow_data.data && [-1, 1349, 1441, 457, 1902, 2042, 1870, 3224].includes(actual_clan_id))
    ) {
      return useMemo(() => (
        <Box bg="regularGray.100" _dark={{ bg: "regularGray.900" }} flexGrow={1} onLayout={onLayout}>
          <Loading data={[clan_data, requirements_data, shadow_data]} />
        </Box>
      ), [0, 0, 0, 0, 0, 0, 0]);
    }

    const levelCount = Object.keys(requirements_data.data?.data?.data.levels ?? {}).length;
    const levels = new Array(levelCount).fill(0).map((_, n) => n + 1);

    const goalLevel = Math.min(Math.max(options[actual_clan_id].level, 0), levels.length);

    function sort(a: ClanStatsUser, b: ClanStatsUser) {
      if (sortBy < 0)
        return (a.requirements[-sortBy]?.value ?? -1) - (b.requirements[-sortBy]?.value ?? -1);
      return (b.requirements[sortBy]?.value ?? -1) - (a.requirements[sortBy]?.value ?? -1);
    }

    const headerStack = compact !== 0;
    const showSidebar = compact !== 0;
    const sidebarWidth = (compact ? 120 : 150) * fontScale;
    const columnWidth = showSidebar
      ? (compact ? (headerStack ? 68 : 90) : headerStack ? 80 : 120) * fontScale
      : 400;
    const minTableWidth = (Object.keys(stats.users).length + 1) * columnWidth + sidebarWidth;

    const main_users = [
      {
        type: options[actual_clan_id].share ? "share" : "individual",
        level: goalLevel,
      },
      ...Object.values(stats.users).sort(sort),
      stats,
      { type: "group", level: goalLevel },
    ];
    const main_rows = (reverse ? requirements.all : main_users) as (
      | number
      | ClanStatsUser
      | ClanStatsData
      | { type: "group" | "individual" | "share"; level: number }
    )[];
    const main_columns = (reverse ? main_users : requirements.all) as (
      | number
      | ClanStatsUser
      | ClanStatsData
      | { type: "group" | "individual" | "share"; level: number }
    )[];
    return useMemo(() => {
      console.log("CLAN: " + clan_id);
      return (
        <Box
          onLayout={onLayout}
          bg="regularGray.200"
          _dark={{ bg: "regularGray.800" }}
          style={{ margin: 4, borderRadius: 8 }}>
          <Box
            style={{
              flexDirection: "row",
              alignItems: "center",
              height: 48 * fontScale,
              padding: 4,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
            }}
            bg="regularGray.300"
            _dark={{ bg: "regularGray.700" }}>
            <Image
              style={{ height: 32, width: 32, borderRadius: 16, marginRight: 8 }}
              source={{
                uri: `https://munzee.global.ssl.fastly.net/images/clan_logos/${clan_id.toString(
                  36
                )}.png`,
              }}
            />
            <View style={{ flex: 1 }}>
              <Heading numberOfLines={1} fontSize="lg">
                {clan_data.data?.data?.details.name}
              </Heading>
              <Heading numberOfLines={1} fontSize="md">
                {clan_data.data?.data?.details.tagline}
              </Heading>
            </View>
            <Button.Group size="sm" isAttached>
              <Button
                bg={options[actual_clan_id]?.subtract ? "primary.700" : "primary.400"}
                borderRightRadius={0}
                onPress={() =>
                  setOptions({
                    ...options,
                    [actual_clan_id]: {
                      ...options[actual_clan_id],
                      subtract: false,
                    },
                  })
                }>
                Achieved
              </Button>
              <Button
                bg={options[actual_clan_id]?.subtract ? "primary.400" : "primary.700"}
                borderLeftRadius={0}
                onPress={() =>
                  setOptions({
                    ...options,
                    [actual_clan_id]: {
                      ...options[actual_clan_id],
                      subtract: true,
                    },
                  })
                }>
                Remaining
              </Button>
            </Button.Group>
            {!!shadow_data.data?.data?.data && <Button
              ml={2}
              bg={options[actual_clan_id]?.shadow ? "primary.400" : "primary.700"}
              startIcon={<Icon colorBlank style={{ height: 24, width: 24 }} name="coffee" />}
              size="xs"
              onPress={() =>
                setOptions({
                  ...options,
                  [actual_clan_id]: {
                    ...options[actual_clan_id],
                    shadow: !(options[actual_clan_id]?.shadow ?? true),
                  },
                })
              }
            />}
            <Button
              variant="ghost"
              startIcon={<Icon style={{ height: 24, width: 24 }} name="cog" />}
              onPress={() => setModalVisible(true)}
            />
          </Box>
          <Modal
            // backdropStyle={{ backgroundColor: "#00000077" }}
            isOpen={modalVisible}
            onClose={() => setModalVisible(false)}>
            <ClanSettingsModal
              levels={levels}
              close={() => setModalVisible(false)}
              clan_id={actual_clan_id}
            />
          </Modal>
          {requirements.isAprilFools && (
            <Text style={{ padding: 4 }}>
              Please be aware that the Munzee API is still returning April Fools requirements. I have
              tried my best to manually input the real reqirements here, however there may be a few
              typos. Once Munzee disables the April Fools requirements, CuppaZee will return back to
              using the accurate data provided by Munzee automatically.
            </Text>
          )}
          <View style={{ flexDirection: "row" }}>
            {showSidebar && (
              <View
                key="sidebar"
                style={{
                  alignSelf: "flex-start",
                  width: sidebarWidth,
                  flexGrow: size.width < minTableWidth ? undefined : 1,
                  borderRightWidth: 2,
                  borderColor,
                }}>
                <View
                  style={{
                    borderBottomWidth: 2,
                    borderColor,
                  }}>
                  <TitleCell key="header" clan={clan_data.data ?? undefined} shadow={shadow_data.data} />
                </View>
                {main_rows.map(row =>
                  typeof row === "number" ? (
                    <RequirementCell
                      key={row}
                      task_id={row}
                      requirements={requirements}
                      onPress={() => setSortBy(sortBy === row ? -row : row)}
                      sortBy={sortBy}
                    />
                  ) : "type" in row ? (
                    <View
                      key={`${row.level}_${row.type}`}
                      style={{
                        [style.reverse
                          ? row.type === "group"
                            ? "borderLeftWidth"
                            : "borderRightWidth"
                          : row.type === "group"
                            ? "borderTopWidth"
                            : "borderBottomWidth"]: 2,
                        borderColor,
                      }}>
                      <LevelCell
                        levels={levels}
                        clan_id={actual_clan_id}
                        level={row.level}
                        type={row.type}
                      />
                    </View>
                  ) : (
                    <UserCell key={"user_id" in row ? row.user_id : "Clan Total"} user={row} />
                  )
                )}
              </View>
            )}
            <SyncScrollView
              controller={scrollViewController}
              style={{
                alignSelf: "flex-start",
                flexGrow: (reverse
                  ? [...Object.values(stats.users).sort(sort), stats]
                  : requirements.all
                ).length,
              }}
              contentContainerStyle={{ flexGrow: 1, alignItems: "flex-start" }}
              horizontal={true}
              pagingEnabled={size.width < 720 || size.width < minTableWidth}
              snapToInterval={columnWidth === 400 && size.width < 400 ? undefined : columnWidth}
              snapToAlignment={showSidebar || !reverse ? "start" : "center"}>
              {main_columns.map(column => (
                <View
                  key={
                    typeof column === "number"
                      ? column
                      : "user_id" in column
                        ? column.user_id
                        : "type" in column
                          ? `${column.level}_${column.type}`
                          : "Clan Stats"
                  }
                  style={{
                    width: columnWidth,
                    flexGrow: 1,
                    maxWidth: size?.width,
                  }}>
                  <View
                    style={{
                      borderBottomWidth: 2,
                      borderColor,
                    }}>
                    {typeof column === "number" ? (
                      <RequirementCell
                        key="Header"
                        task_id={column}
                        stack={headerStack}
                        requirements={requirements}
                        onPress={() => setSortBy(sortBy === column ? -column : column)}
                        sortBy={sortBy}
                      />
                    ) : "type" in column ? (
                      <View
                        style={{
                          [style.reverse
                            ? column.type === "group"
                              ? "borderLeftWidth"
                              : "borderRightWidth"
                            : column.type === "group"
                              ? "borderTopWidth"
                              : "borderBottomWidth"]: 2,
                          borderColor,
                        }}>
                        <LevelCell
                          levels={levels}
                          clan_id={actual_clan_id}
                          key={`${column.level}_${column.type}`}
                          level={column.level}
                          type={column.type}
                          stack={headerStack}
                        />
                      </View>
                    ) : (
                      <UserCell key="Header" user={column} stack={headerStack} />
                    )}
                  </View>
                  {main_rows.map(row => {
                    const user =
                      typeof row !== "number" ? row : typeof column !== "number" ? column : null;
                    const task_id =
                      typeof row === "number" ? row : typeof column === "number" ? column : null;
                    const key =
                      typeof row === "number"
                        ? row
                        : "user_id" in row
                          ? row.user_id
                          : "type" in row
                            ? `${row.level}_${row.type}`
                            : "Clan Stats";
                    if (!user || !task_id) return null;
                    return "type" in user ? (
                      <View
                        key={key}
                        style={{
                          [style.reverse
                            ? user.type === "group"
                              ? "borderLeftWidth"
                              : "borderRightWidth"
                            : user.type === "group"
                              ? "borderTopWidth"
                              : "borderBottomWidth"]: 2,
                          borderColor,
                        }}>
                        <RequirementDataCell
                          members={Object.keys(stats.users).length}
                          task={task_id}
                          level={user.level}
                          type={user.type}
                          requirements={requirements}
                        />
                      </View>
                    ) : (
                      <DataCell
                        levelCount={levelCount}
                        clan_id={actual_clan_id}
                        requirements={requirements}
                        key={key}
                        user={user}
                        task_id={task_id}
                      />
                    );
                  })}
                </View>
              ))}
            </SyncScrollView>
          </View>
        </Box>
      )
    }, [clan_data.data, requirements, stats, options[actual_clan_id], sortBy, size.width, modalVisible]);
  },
  (prev, now) => prev.clan_id === now.clan_id && prev.game_id === now.game_id
);
