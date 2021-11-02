import dayjs from "dayjs";
import React from "react";
import { useTranslation } from "react-i18next";
import { PixelRatio, StyleSheet, useWindowDimensions, View } from "react-native";
import { LevelCell, RequirementCell, RequirementDataCell, RequirementTitleCell } from "./Cell";
import useComponentSize from "../../hooks/useComponentSize";
import useMunzeeRequest from "../../hooks/useMunzeeRequest";
import SyncScrollView, { SyncScrollViewController } from "./SyncScrollView";
import Loading from "../Loading";
import { useQueryClient } from "react-query";
import useSetting, { ClanPersonalisationAtom } from "../../hooks/useSetting";
import Icon from "../Common/Icon";
import { GameID, generateClanRequirements } from "@cuppazee/utils/lib";
import useDB from "../../hooks/useDB";
import { Box, Text, Heading, useColorMode, useTheme } from "native-base";

const generateLevels = (n: number) =>
  new Array(n).fill(0).map(
    (_, i) =>
      [
        { level: i + 1, type: "individual" as const },
        { level: i + 1, type: "group" as const },
      ] as { level: number; type: "group" | "individual" }[]
  ).flat();

export interface ClanRequirementsTableProps {
  game_id: number;
  clan_id?: number;
  scrollViewController?: SyncScrollViewController;
}

function Countdown({ time }: { time: number }) {
  const [now, setNow] = React.useState(Date.now());
  const { width } = useWindowDimensions();
  const queryClient = useQueryClient();
  const dur = dayjs.duration(Math.max(0, time - now));
  React.useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(interval);
  }, []);
  React.useEffect(() => {
    if (time - now < 0) {
      queryClient.refetchQueries({
        predicate: query => query.queryKey[0] !== "token",
        active: true,
      });
    }
  }, [time - now < 0]);
  return (
    <View style={{ flexDirection: "row", justifyContent: "center" }}>
      {((width >= 400 ? ["days", "hours", "minutes", "seconds"] : ["days", "hours", "minutes"]) as (
        | "days"
        | "hours"
        | "minutes"
        | "seconds"
      )[]).map(i => (
        <Box
          bg="regularGray.300"
          _dark={{ bg: "regularGray.700" }}
          style={{
            height: 80,
            width: 80,
            margin: 8,
            borderRadius: 8,
            justifyContent: "center",
            alignItems: "center",
          }}>
          <Heading fontSize="lg">{Math.floor(dur[i === "days" ? "asDays" : i]())}</Heading>
          <Heading fontSize="sm">{i.toUpperCase()}</Heading>
        </Box>
      ))}
    </View>
  );
}

export default React.memo(
  function ClanRequirementsTable({
    game_id,
    clan_id: actual_clan_id = 2041,
    scrollViewController,
  }: ClanRequirementsTableProps) {
    const { t } = useTranslation();
    const [size, onLayout] = useComponentSize();
    const fontScale = PixelRatio.getFontScale();
    const [style] = useSetting(ClanPersonalisationAtom);
    const reverse = style.reverse;
    const compact = style.style;

    const db = useDB();

    const { colorMode } = useColorMode();
    const theme = useTheme();
    const borderColor =
      (colorMode === "dark" ? theme.colors.regularGray[400] : theme.colors.regularGray[600])
        .replace("rgb(", "rgba(")
        .slice(0, -1) + ", 0.3)";

    const clan_id = actual_clan_id >= 0 ? actual_clan_id : 2041;

    const requirements_data = useMunzeeRequest("clan/v2/requirements", {
      clan_id,
      game_id,
    });

    const requirements = React.useMemo(
      () => generateClanRequirements(db, requirements_data.data?.data),
      [requirements_data.dataUpdatedAt, db]
    );
    
    const levelCount = Object.keys(requirements_data.data?.data?.data.levels ?? []).length;
    const sidebarLevels = generateLevels(levelCount);
    const levels = new Array(levelCount).fill(0).map((_, n) => n + 1);

    if (requirements_data.data?.data?.data.levels.length === 0) {
      const time = requirements_data.data.data.battle.reveal_at * 1000;
      return <Countdown time={time} />;
    }

    if (!requirements || !size) {
      return (
        <Box bg="regularGray.100" _dark={{ bg: "regularGray.900" }} flexGrow={1} onLayout={onLayout}>
          <Loading data={[requirements_data]} />
        </Box>
      );
    }

    const headerStack = compact !== 0;
    const showSidebar = compact !== 0;
    const sidebarWidth = (compact ? 120 : 150) * fontScale;
    const columnWidth = showSidebar
      ? (compact ? (headerStack ? 68 : 90) : headerStack ? 80 : 120) * fontScale
      : 400;
    const minTableWidth = (reverse ? sidebarLevels : requirements.all).length * columnWidth + sidebarWidth;

    const requirements_rows = (reverse ? requirements.all : sidebarLevels) as (
      | number
      | { type: "group" | "individual"; level: number }
    )[];
    const requirements_columns = (reverse ? sidebarLevels : requirements.all) as (
      | number
      | { type: "group" | "individual"; level: number }
    )[];
    return (
      <Box bg="regularGray.200" _dark={{ bg: "regularGray.800" }} onLayout={onLayout} style={{ margin: 4, borderRadius: 8 }}>
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
            <Heading fontSize="sm">{dayjs(new GameID(game_id).date).format("MMMM YYYY")}</Heading>
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
        <View style={{ flexDirection: "row" }}>
          {showSidebar && (
            <View
              key="sidebar"
              style={{
                minWidth: sidebarWidth,
                flex: size.width < minTableWidth ? undefined : 1,
                borderRightWidth: 2,
                borderColor,
              }}>
              <View
                style={{
                  borderBottomWidth: 2,
                  borderColor,
                }}>
                <RequirementTitleCell
                  key="header"
                  game_id={game_id}
                  date={dayjs(new GameID(game_id).date)}
                />
              </View>
              {requirements_rows.map(row =>
                typeof row == "number" ? (
                  <RequirementCell key={row} task_id={row} requirements={requirements} />
                ) : (
                  <LevelCell
                    levels={levels}
                    key={`${row.level}_${row.type}`}
                    level={row.level}
                    type={row.type}
                  />
                )
              )}
            </View>
          )}
          <SyncScrollView
            controller={scrollViewController}
            style={{
              flex: (reverse ? sidebarLevels : requirements.all).length,
            }}
            contentContainerStyle={{ flexGrow: 1 }}
            horizontal={true}
            pagingEnabled={size.width < 720 || size.width < minTableWidth}
            snapToInterval={columnWidth}
            snapToAlignment={showSidebar || !reverse ? "start" : "center"}>
            {requirements_columns.map(column => (
              <View
                key={typeof column === "number" ? column : `${column.level}_${column.type}`}
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
                      key="header"
                      task_id={column}
                      stack={headerStack}
                      requirements={requirements}
                    />
                  ) : (
                    <LevelCell
                      levels={levels}
                      key="header"
                      level={column.level}
                      type={column.type}
                      stack={headerStack}
                    />
                  )}
                </View>
                {requirements_rows.map(row => {
                  if (typeof row !== "number" && typeof column === "number") {
                    return (
                      <RequirementDataCell
                        key={`${row.level}_${row.type}`}
                        task={column}
                        level={row.level}
                        type={row.type}
                        requirements={requirements}
                      />
                    );
                  }
                  if (typeof row === "number" && typeof column !== "number") {
                    return (
                      <RequirementDataCell
                        key={row}
                        task={row}
                        level={column.level}
                        type={column.type}
                        requirements={requirements}
                      />
                    );
                  }
                  return null;
                })}
              </View>
            ))}
          </SyncScrollView>
        </View>
      </Box>
    );
  },
  (prev, now) => prev.clan_id === now.clan_id && prev.game_id === now.game_id
);

const styles = StyleSheet.create({
  card: {
    margin: 4,
    borderRadius: 8,
  },
});
