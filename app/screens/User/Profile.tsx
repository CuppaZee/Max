import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View, Image } from "react-native";
import UserActivityOverview from "../../components/Activity/Overview";
import Loading from "../../components/Loading";
import useMunzeeRequest from "../../hooks/useMunzeeRequest";
import useTitle from "../../hooks/useTitle";
import TypeImage from "../../components/Common/TypeImage";
import dayjs from "dayjs";
import Icon from "../../components/Common/Icon";
import useDB from "../../hooks/useDB";
import { NavProp } from "../../navigation";
import { RootStackParamList } from "../../types";
import { Box, Heading, Text } from "native-base";
import { Item } from "../../components/Common/Item";
import { useHeaderHeight } from "@react-navigation/elements";

export const UserPagesNow = [
  {
    icon: "archive",
    title: "user_inventory",
    screen: "Inventory",
  },
  {
    icon: "star",
    title: "user_bouncers",
    screen: "Bouncers",
  },
  {
    icon: "trophy",
    title: "user_challenges",
    screen: "Challenges",
  },
  {
    icon: "hammer",
    title: "user_qrew_checker",
    screen: "QRew",
  },
  {
    icon: "star-box",
    title: "user_qrates",
    screen: "QRates",
  },
  {
    icon: "cube",
    title: "user_cubimals",
    screen: "Cubimals",
  },
  {
    icon: "clock",
    nontranslatedtitle: "LotterZEE Balls",
    screen: "LotterZee",
  },
  {
    icon: "door-open",
    nontranslatedtitle: "Expiring Rooms",
    screen: "Rooms",
  },
] as const;

export default function TabOneScreen() {
  const db = useDB();
  const { t } = useTranslation();
  const route = useRoute<RouteProp<RootStackParamList, "Player_Profile">>();
  useTitle(`${route.params.username}`);

  const user = useMunzeeRequest(
    "user",
    { username: route.params?.username },
    route.params?.username !== undefined
  );
  const headerHeight = useHeaderHeight();

  if (!user.data?.data) {
    return (
      <Box flex={1}>
        <Loading data={[user]} />
      </Box>
    );
  }

  return (
    <Box bg="regularGray.100" _dark={{ bg: "regularGray.900" }} flex={1}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: headerHeight }}>
        <View
          style={{
            width: 1000,
            maxWidth: "100%",
            flexDirection: "row",
            flexWrap: "wrap",
            alignSelf: "center",
          }}>
          <View style={{ padding: 4, width: 1000, maxWidth: "100%", flexGrow: 1 }}>
            <Box bg="regularGray.200" _dark={{ bg: "regularGray.800" }} m={1} borderRadius={4}>
              <Item
                chevron
                title={t("pages:user_activity")}
                icon="calendar"
                link={["Player_Activity", { username: route.params.username }]}
              />
              <UserActivityOverview
                user_id={user.data.data.user_id}
                day={dayjs.mhqNow().format("YYYY-MM-DD")}
              />
            </Box>
          </View>

          <View style={{ padding: 4, width: 400, maxWidth: "100%", flexGrow: 1 }}>
            <Box
              bg="regularGray.200"
              _dark={{ bg: "regularGray.800" }}
              m={1}
              borderRadius={4}
              flexGrow={1}>
              <View style={{ flexDirection: "row", alignItems: "center", padding: 4 }}>
                <Image
                  style={{ margin: 4, height: 48, width: 48, borderRadius: 24 }}
                  source={{
                    uri: `https://munzee.global.ssl.fastly.net/images/avatars/ua${user.data?.data?.user_id.toString(
                      36
                    )}.png`,
                  }}
                />
                <View style={{ padding: 4, flex: 1 }}>
                  <Heading fontSize="lg">{user.data.data.username}</Heading>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Icon
                      style={{
                        height: 16,
                        width: 16,
                        marginRight: 4,
                      }}
                      name="arrow-up"
                    />
                    <Heading fontSize="md">
                      {t("user_profile:level", { level: user.data.data.level })} -{" "}
                      {t("user_profile:points", {
                        n: user.data.data.points,
                        count: user.data.data.points,
                      })}
                    </Heading>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Icon
                      style={{
                        height: 16,
                        width: 16,
                        marginRight: 4,
                      }}
                      name="trophy"
                    />
                    <Heading fontSize="md">
                      {t("user_profile:rank", { rank: user.data.data.rank })}
                    </Heading>
                  </View>
                  {user.data.data.titles && user.data.data.titles.length > 0 && (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Icon
                        style={{
                          height: 16,
                          width: 16,
                          marginRight: 4,
                        }}
                        name="star"
                      />
                      <Heading fontSize="md">{user.data.data.titles.join(", ")}</Heading>
                    </View>
                  )}
                </View>
              </View>
              {UserPagesNow.map(i => (
                <Item
                  key={i.screen}
                  title={"title" in i ? t(`pages:${i.title}` as const) : i.nontranslatedtitle}
                  icon={i.icon}
                  link={[`Player_${i.screen}` as const, { username: route.params.username }]}
                />
              ))}
              {!!user.data?.data?.clan ? (
                <Item
                  key="Clan"
                  title={user.data?.data?.clan?.name}
                  image={user.data?.data?.clan?.logo}
                  imageRounded
                  link={["Clan_Stats", { clanid: user.data?.data?.clan?.id ?? 0 }]}
                />
              ) : (
                <Item
                  key="Clan"
                  title={t(`pages:user_clan_progress`)}
                  icon="shield-half-full"
                  link={["Player_ClanProgress", { username: route.params.username }]}
                />
              )}
            </Box>
          </View>

          <View style={{ padding: 4, width: 400, maxWidth: "100%", flexGrow: 1 }}>
            <Box
              bg="regularGray.200"
              _dark={{ bg: "regularGray.800" }}
              m={1}
              borderRadius={4}
              flexGrow={1}>
              {db
                .getCategory("root")
                ?.children.filter(i => i.children.length > 0)
                .map(c => (
                  <Item
                    title={c.name}
                    typeImage={c.icon}
                    link={[
                      "Player_Captures",
                      {
                        username: route.params.username,
                        category: c.id,
                      },
                    ]}
                  />
                ))}
            </Box>
          </View>
        </View>
      </ScrollView>
    </Box>
  );
}
