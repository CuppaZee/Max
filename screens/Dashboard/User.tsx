import { useNavigation } from "@react-navigation/native";
import { Box, Heading, HStack, Link } from "native-base";
import dayjs from "dayjs";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import UserActivityOverview from "../../components/Activity/Overview";
import ZeeOpsOverview from "../../components/ZeeOps/Overview";
import { DashCardProps } from "./Dashboard";
import TypeImage from "../../components/Common/TypeImage";
import { UserPagesNow } from "../User/Profile";
import Icon from "../../components/Common/Icon";
import useMunzeeRequest from "../../hooks/useMunzeeRequest";
import useDB from "../../hooks/useDB";
import { NavProp } from "../../navigation";

export default React.memo(
  function UserDashCard({
    item,
    touched,
    onInnerLayout,
    onOuterLayout,
  }: DashCardProps<{ username: string; user_id: string }>) {
    const db = useDB();
    const { t } = useTranslation();
    const nav = useNavigation<NavProp>();
    const user = useMunzeeRequest("user", { username: item.username }, touched);
    return (
      <Box bg="regularGray.200" _dark={{ bg: "regularGray.800" }} style={[styles.card, { flex: 1 }]}>
        <ScrollView onLayout={onOuterLayout} style={{ flex: 1 }}>
          <View onLayout={onInnerLayout}>
            <Pressable onPress={() => nav.navigate("Player_Profile", { username: item.username })}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 4,
                  justifyContent: "center",
                }}>
                <Image
                  style={{ height: 32, width: 32, borderRadius: 16, marginRight: 8 }}
                  source={{
                    uri: `https://munzee.global.ssl.fastly.net/images/avatars/ua${Number(
                      item.user_id
                    ).toString(36)}.png`,
                  }}
                />
                <Heading fontSize="xl">{item.username}</Heading>
              </View>
            </Pressable>
            {touched ? (
              <>
                <UserActivityOverview
                  user_id={Number(item?.user_id)}
                  day={dayjs.mhqNow().format("YYYY-MM-DD")}
                />
                <ZeeOpsOverview user_id={Number(item?.user_id)} />
              </>
            ) : null}
            <View style={{ padding: 4 }}>
              <Pressable
                onPress={() =>
                  nav.navigate("User", {
                    screen: "Activity",
                    params: { username: item.username },
                  })
                }>
                <HStack px={4} py={3} alignItems="center">
                  <Icon name="calendar" style={{ height: 20 }} />
                  <Heading style={{ flex: 1, marginLeft: 4 }} pl={2} fontSize="md">
                    {t("pages:user_activity")}
                  </Heading>
                </HStack>
              </Pressable>
              {UserPagesNow.map(i => (
                <Pressable
                  onPress={() =>
                    nav.navigate("User", {
                      screen: i.screen,
                      params: { username: item.username },
                    })
                  }>
                  <HStack px={4} py={3} alignItems="center">
                    <Icon name={i.icon} style={{ height: 20 }} />
                    <Heading style={{ flex: 1, marginLeft: 4 }} pl={2} fontSize="md">
                      {"title" in i ? t(`pages:${i.title}` as const) : i.nontranslatedtitle}
                    </Heading>
                  </HStack>
                </Pressable>
              ))}
              {!!user.data?.data?.clan ? (
                <Pressable
                  onPress={() =>
                    nav.navigate("Clan", {
                      screen: "Stats",
                      params: { clanid: user.data?.data?.clan?.id },
                    })
                  }>
                  <HStack px={4} py={3} alignItems="center">
                    <Image
                      source={{ uri: user.data?.data?.clan?.logo ?? "" }}
                      style={{
                        height: 32,
                        width: 32,
                        borderRadius: 16,
                        margin: -6,
                      }}
                    />
                    <Heading style={{ flex: 1, marginLeft: 4 }} pl={2} fontSize="md">
                      {user.data?.data?.clan?.name}
                    </Heading>
                  </HStack>
                </Pressable>
              ) : (
                <Pressable
                  onPress={() =>
                    nav.navigate("User", {
                      screen: "ClanProgress",
                      params: { username: item.username },
                    })
                  }>
                  <HStack px={4} py={3} alignItems="center">
                    <Icon name="shield-half-full" style={{ height: 20 }} />
                    <Heading style={{ flex: 1, marginLeft: 4 }} pl={2} fontSize="md">
                      {t(`pages:user_clan_progress`)}
                    </Heading>
                  </HStack>
                </Pressable>
              )}
              <Heading px={3} pt={3} fontSize="lg">
                {t("pages:user_captures")}
              </Heading>
              {db
                .getCategory("root")
                ?.children.filter(i => i.children.length > 0)
                .map(c => (
                  <Pressable
                    onPress={() =>
                      nav.navigate("User", {
                        screen: "Captures",
                        params: { username: item.username, category: c.id },
                      })
                    }>
                    <HStack px={4} py={3} alignItems="center">
                      <TypeImage icon={c.icon} style={{ size: 32, margin: -6 }} />
                      <Heading style={{ flex: 1, marginLeft: 4 }} pl={2} fontSize="md">
                        {c.name}
                      </Heading>
                    </HStack>
                  </Pressable>
                ))}
            </View>
          </View>
        </ScrollView>
      </Box>
    );
  },
  (a, b) => a.touched === b.touched && a.item.user_id === b.item.user_id
);

const styles = StyleSheet.create({
  card: { margin: 4, borderRadius: 4 },
});
