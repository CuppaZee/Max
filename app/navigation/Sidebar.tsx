import {Box, Column, Heading, HStack, Pressable, ScrollView} from "native-base";
import React, {useCallback} from "react";
import { useWindowDimensions } from "react-native";
import Icon from "../components/Common/Icon";
import { useTranslation } from "react-i18next";
import { Item } from "../components/Common/Item";
import useSetting, {DrawerAtom} from "../hooks/useSetting";
import { useUserSetting } from "../hooks/useUserSettings";

export default function Drawer() {
  const { width } = useWindowDimensions();
  const { t } = useTranslation();
  const users = useUserSetting("users");
  const clans = useUserSetting("clans");
  const [drawerSettings, setDrawerSettings] = useSetting(DrawerAtom);
  const toggleCollapse = useCallback(() => {
    setDrawerSettings({...drawerSettings, collapsed: !drawerSettings.collapsed});
  }, [drawerSettings]);
  if (width < 1000) return null;
  return (
    <Column
      borderRightWidth={1}
      borderRightColor="regularGray.500"
      style={{
        minWidth: drawerSettings.collapsed ? 56 : 200,
        maxWidth: drawerSettings.collapsed ? 56 : 300,
        flex: drawerSettings.collapsed ? 0 : 1,
        maxHeight: "100vh",
      }}
      bg="regularGray.100"
      _dark={{ bg: "regularGray.900" }}>
      <Box
        bg="regularGray.200"
        height="48px"
        justifyContent="center"
        alignItems="center"
        _dark={{ bg: "regularGray.800" }}>
        {!drawerSettings.collapsed && <Heading fontSize="lg">CuppaZee Max</Heading>}
      </Box>
      <ScrollView flex={1} contentContainerStyle={{ flexGrow: 1 }}>
        <Column flexGrow={1} py={2} px={2} space={2}>
          <Box borderRadius={4} bg="regularGray.200" _dark={{ bg: "regularGray.800" }}>
            <Item
              checkMatch
              collapsed={drawerSettings.collapsed}
              navMethod="reset"
              icon="magnify"
              title={t("pages:tools_search")}
              link={["Tools_Search"]}
            />
          </Box>
          <Box borderRadius={4} bg="regularGray.200" _dark={{ bg: "regularGray.800" }}>
            <Item
              checkMatch
              collapsed={drawerSettings.collapsed}
              navMethod="reset"
              icon="magnify"
              title={t("pages:user")}
              link={["Player_Inventory"]}
            />
            {users?.map(i => (
              <Item
                checkMatch
                collapsed={drawerSettings.collapsed}
                navMethod="reset"
                image={`https://munzee.global.ssl.fastly.net/images/avatars/ua${Number(
                  i.user_id
                ).toString(36)}.png`}
                imageRounded
                title={i.username}
                link={["Player_Profile", { username: i.username }]}
              />
            ))}
          </Box>
          <Box borderRadius={4} bg="regularGray.200" _dark={{ bg: "regularGray.800" }}>
            <Item
              checkMatch
              collapsed={drawerSettings.collapsed}
              navMethod="reset"
              icon="shield-half-full"
              title={t("pages:clan_bookmarks")}
              link={["Clan_Bookmarks"]}
            />
            {clans?.map(i => (
              <Item
                checkMatch
                collapsed={drawerSettings.collapsed}
                navMethod="reset"
                image={`https://munzee.global.ssl.fastly.net/images/clan_logos/${Number(
                  i.clan_id
                ).toString(36)}.png`}
                imageRounded
                title={i.name}
                link={["Clan_Stats", { clanid: i.clan_id }]}
              />
            ))}
          </Box>
          <Box borderRadius={4} bg="regularGray.200" _dark={{ bg: "regularGray.800" }}>
            <Item
              checkMatch
              collapsed={drawerSettings.collapsed}
              navMethod="reset"
              icon="map-marker-radius"
              title={t("pages:tools_nearby")}
              link={["Tools_Nearby"]}
            />
            <Item
              checkMatch
              collapsed={drawerSettings.collapsed}
              navMethod="reset"
              icon="map-marker"
              title={t("pages:tools_bouncers_overview")}
              link={["Tools_Bouncers"]}
            />
            <Item
              checkMatch
              collapsed={drawerSettings.collapsed}
              navMethod="reset"
              icon="clock"
              title={t("pages:tools_bouncing_soon")}
              link={["Tools_BouncersExpiring"]}
            />
          </Box>
          <Box borderRadius={4} bg="regularGray.200" _dark={{ bg: "regularGray.800" }}>
            <Item
              checkMatch
              collapsed={drawerSettings.collapsed}
              navMethod="reset"
              icon="bomb"
              title={t("pages:tools_blastplanner")}
              link={["Tools_Blast"]}
            />
            <Item
              checkMatch
              collapsed={drawerSettings.collapsed}
              navMethod="reset"
              icon="map-marker-circle"
              title={t("pages:tools_poiplanner")}
              link={["Tools_POIPlanner"]}
            />
            <Item
              checkMatch
              collapsed={drawerSettings.collapsed}
              navMethod="reset"
              icon="home-circle-outline"
              title={t("pages:tools_destinationplanner")}
              link={["Tools_DestinationPlanner"]}
            />
            <Item
              checkMatch
              collapsed={drawerSettings.collapsed}
              navMethod="reset"
              icon="dna"
              title={t("pages:tools_evo_planner")}
              link={["Tools_EvoPlanner"]}
            />
          </Box>
          <Box borderRadius={4} bg="regularGray.200" _dark={{ bg: "regularGray.800" }}>
            <Item
              checkMatch
              collapsed={drawerSettings.collapsed}
              navMethod="reset"
              icon="calendar"
              title={t("pages:tools_calendar")}
              link={["Tools_Calendar"]}
            />
            <Item
              checkMatch
              collapsed={drawerSettings.collapsed}
              navMethod="reset"
              icon="earth"
              title={t("pages:tools_universal")}
              link={["Tools_Universal"]}
            />
            <Item
              checkMatch
              collapsed={drawerSettings.collapsed}
              navMethod="reset"
              icon="database"
              title={t("pages:tools_munzee_types")}
              link={["Tools_TypeCategory", { category: "root" }]}
            />
          </Box>
        </Column>
      </ScrollView>
      <Pressable bg="regularGray.200" _dark={{ bg: "regularGray.800" }} onPress={toggleCollapse}>
        <HStack w="100%" alignItems="center" space={3} p={2}>
          <Icon
            name={drawerSettings.collapsed ? "chevron-right" : "chevron-left"}
            style={{ height: 24, width: 24 }}
          />
          {!drawerSettings.collapsed && (
            <Heading flex={1} fontSize="md">
              Collapse Sidebar
            </Heading>
          )}
        </HStack>
      </Pressable>
    </Column>
  );
}
