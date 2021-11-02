import {
  ClanShadowData,
  GameID,
  generateClanRequirements,
  generateClanStats,
} from "@cuppazee/utils/lib";
import dayjs from "dayjs";
import { useAtomValue } from "jotai/utils";
import { Box, Button, Heading, HStack, Image, Row, Text, VStack } from "native-base";
import React from "react";
import { PixelRatio } from "react-native";
import useCuppaZeeRequest from "../../hooks/useCuppaZeeRequest";
import useDB from "../../hooks/useDB";
import useMunzeeRequest from "../../hooks/useMunzeeRequest";
import useAtom, { ClanPersonalisationAtom, ClansAtom } from "../../hooks/useSetting";
import {
  DataCell,
  LevelCell,
  RequirementCell,
  RequirementDataCell,
  TitleCell,
  useClanOptions,
  UserCell,
} from "./Cell";
import SyncScrollView, { SyncScrollViewController } from "./SyncScrollView";

export interface ClanStatsCardProps {
  clan_id: number;
  game_id: number;
  scrollViewController?: SyncScrollViewController;
}

export interface ClanStatsTableProps extends ClanStatsCardProps {}

const shadowClans = new Set([-1, 1349, 1441, 457, 1902, 2042, 1870, 3224]);

function ClanStatsTable(props: ClanStatsTableProps) {
  const clanOptions = useClanOptions(props.clan_id);
  const clan_id = props.clan_id >= 0 ? props.clan_id : 2041;

  const clanRequest = useMunzeeRequest("clan/v2", { clan_id });
  const requirementsRequest = useMunzeeRequest("clan/v2/requirements", {
    clan_id,
    game_id: props.game_id,
  });

  const shadowRequest = useCuppaZeeRequest<{ data?: ClanShadowData }>(
    "clan/shadow",
    {
      clan_id: props.clan_id,
      game_id: props.game_id,
    },
    shadowClans.has(props.clan_id)
  );

  const db = useDB();

  const requirements = React.useMemo(
    () => generateClanRequirements(db, requirementsRequest.data?.data),
    [requirementsRequest.dataUpdatedAt, db]
  );
  const stats = React.useMemo(
    () => {
      const start = Date.now()
      console.log("GCS-S");
      const s = generateClanStats(
        db,
        clanRequest.data?.data,
        requirementsRequest.data?.data,
        requirements ?? undefined,
        props.clan_id,
        clanOptions.shadow ? shadowRequest.data?.data : undefined
      )
      console.log("GCS-F", Date.now() - start);
      return s;
    },
    [clanRequest.dataUpdatedAt, shadowRequest.dataUpdatedAt, requirements, clanOptions.shadow, db]
  );

  const { style: clanStyle } = useAtomValue(ClanPersonalisationAtom);

  const levelCount = Object.keys(requirementsRequest.data?.data?.data.levels ?? {}).length;
  const levels = React.useMemo(() => (new Array(levelCount).fill(0).map((_, n) => n + 1)), [levelCount]);

  const goalLevel = Math.min(Math.max(clanOptions.level, 0), levelCount);

  const fontScale = PixelRatio.getFontScale();
  const headerStack = clanStyle !== 0;
  const showSidebar = clanStyle !== 0;
  const sidebarWidth = (clanStyle ? 120 : 150) * fontScale;
  const columnWidth = showSidebar
    ? (clanStyle ? (headerStack ? 68 : 90) : headerStack ? 80 : 120) * fontScale
    : 400;

  if (!stats || !requirements) {
    return null;
  }

  return (
    <HStack>
      <VStack width={sidebarWidth}>
        <TitleCell clan={clanRequest.data ?? undefined} shadow={shadowRequest.data} />
        <LevelCell
          key="indivLevel"
          clan_id={props.clan_id}
          levels={levels}
          type={clanOptions.share ? "share" : "individual"}
          level={goalLevel}
        />
        {Object.values(stats?.users ?? {}).map(user => (
          <UserCell key={user.user_id} user={user} />
        ))}
        <UserCell key="total" user={stats} />
        <LevelCell
          key="groupLevel"
          clan_id={props.clan_id}
          levels={levels}
          type="group"
          level={goalLevel}
        />
      </VStack>
      <SyncScrollView
        style={{ flex: 1 }}
        horizontal
        contentContainerStyle={{ flexGrow: 1 }}
        controller={props.scrollViewController}>
        {requirements.all.map(requirement => {
          return (
            <VStack width={columnWidth} flexGrow={1} key={requirement}>
              <RequirementCell
                stack={true}
                key="header"
                task_id={requirement}
                requirements={requirements}
              />
              <RequirementDataCell
                key="indivRequirement"
                requirements={requirements}
                task={requirement}
                type={clanOptions.share ? "share" : "individual"}
                level={goalLevel}
              />
              {Object.values(stats?.users ?? {}).map(user => (
                <DataCell
                  key={user.user_id}
                  user={user}
                  task_id={requirement}
                  clan_id={clan_id}
                  requirements={requirements}
                  goalLevel={goalLevel}
                />
              ))}
              <DataCell
                key="total"
                user={stats}
                task_id={requirement}
                clan_id={clan_id}
                requirements={requirements}
                goalLevel={goalLevel}
              />

              <RequirementDataCell
                requirements={requirements}
                key="groupRequirement"
                task={requirement}
                type="group"
                level={goalLevel}
              />
            </VStack>
          );
        })}
      </SyncScrollView>
    </HStack>
  );
}

export default function ClanStatsCard(props: ClanStatsCardProps) {
  const clan_id = props.clan_id >= 0 ? props.clan_id : 2041;

  const clan_request = useMunzeeRequest("clan/v2", { clan_id });
  const [options, setOptions] = useAtom(ClansAtom);
  return (
    <Box bg="regularGray.200" _dark={{ bg: "regularGray.800" }} borderRadius={8} m="1">
      <HStack
        alignItems="center"
        p="1"
        space="sm"
        bg="regularGray.300"
        _dark={{ bg: "regularGray.700" }}>
        <Image
          h="36px"
          w="36px"
          borderRadius={18}
          alt="Clan Logo"
          source={{
            uri: `https://munzee.global.ssl.fastly.net/images/clan_logos/${props.clan_id.toString(
              36
            )}.png`,
          }}
        />
        <Box flex={1}>
          <Heading numberOfLines={1} fontSize="md">
            {clan_request.data?.data?.details?.name ?? clan_id}
          </Heading>
          <Text numberOfLines={1} fontSize="sm">
            {dayjs(new GameID(props.game_id).date).format("MMMM YYYY")}
          </Text>
        </Box>

        <Button.Group size="sm" isAttached>
          <Button
            bg={options[props.clan_id]?.subtract ? "primary.700" : "primary.400"}
            borderRightRadius={0}
            onPress={() =>
              setOptions({
                ...options,
                [props.clan_id]: {
                  ...options[props.clan_id],
                  subtract: false,
                },
              })
            }>
            Achieved
          </Button>
          <Button
            bg={options[props.clan_id]?.subtract ? "primary.400" : "primary.700"}
            borderLeftRadius={0}
            onPress={() =>
              setOptions({
                ...options,
                [props.clan_id]: {
                  ...options[props.clan_id],
                  subtract: true,
                },
              })
            }>
            Remaining
          </Button>
        </Button.Group>
      </HStack>
      <ClanStatsTable {...props} />
    </Box>
  );
}
