import { RouteProp, useRoute } from "@react-navigation/native";
import { useTheme } from "@ui-kitten/components";
import dayjs from "dayjs";
import * as React from "react";
import useMunzeeRequest from "../../hooks/useMunzeeRequest";
import useComponentSize from "../../hooks/useComponentSize";
import useTitle from "../../hooks/useTitle";
import ChallengesConverter from "../../components/Challenges/Data";
import useActivity from "../../hooks/useActivity";
import Loading from "../../components/Loading";
import { PixelRatio, ScrollView, View } from "react-native";
import TypeImage from "../../components/Common/TypeImage";
import { useTranslation } from "react-i18next";
import Icon from "../../components/Common/Icon";
import useDB from "../../hooks/useDB";
import { generateUserActivityData } from "@cuppazee/utils/lib";
import { RootStackParamList } from "../../types";
import { Text, Box, Heading } from "native-base";
import { useHeaderHeight } from "@react-navigation/elements";

export default function PlayerChallengesScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [size, onLayout] = useComponentSize();
  const route = useRoute<RouteProp<RootStackParamList, "Player_Challenge">>();
  useTitle(
    `${route.params.username} - ${t("pages:user_challenges")} - ${dayjs(
      route.params?.date ?? dayjs.mhqNow()
    ).format("L")}`
  );
  const user = useMunzeeRequest(
    "user",
    { username: route.params?.username },
    route.params?.username !== undefined
  );
  const data = useActivity(user.data?.data?.user_id, route.params?.date);
  const db = useDB();
  const d = React.useMemo(
    () =>
      data.data?.data
        ? ChallengesConverter(db, generateUserActivityData(db, data.data?.data, {activity: new Set(), state: new Set(), category: new Set()}, "sohcah"))
        : null,
    [data.dataUpdatedAt, db]
  );

  const headerHeight = useHeaderHeight();

  if (!data.data || !d || !size) {
    return (
      <Box
        bg="regularGray.100"
        _dark={{ bg: "regularGray.900" }}
        onLayout={onLayout}
        style={{ flex: 1 }}>
        <Loading data={[data]} />
      </Box>
    );
  }

  const challenge = d.find(i => i.id === route.params.challenge);
  if (!challenge) return null;

  if (challenge.size === "small")
    return (
      <Box
        bg="regularGray.100"
        _dark={{ bg: "regularGray.900" }}
        onLayout={onLayout}
        style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingTop: headerHeight,
            flexDirection: "row",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}>
          {challenge.categories
            .slice()
            .sort((a, b) => b.completion.length - a.completion.length)
            .map(c => (
              <View style={{ width: 80, maxWidth: "100%", flexGrow: 1, padding: 4 }}>
                <Box
                  bg={c.completion.length > 0 ? "regularGray.300" : "regularGray.200"}
                  _dark={{ bg: c.completion.length > 0 ? "regularGray.700" : "regularGray.800" }}
                  style={{ alignItems: "center", borderRadius: 8 }}>
                  <TypeImage style={{ size: 32, margin: 8 }} icon={c.icon} />
                  <Text numberOfLines={1} style={{ textAlign: "center" }} fontSize="sm">
                    {c.name.includes(":") ? t(c.name as any) : c.name}
                  </Text>
                  <Box
                    bg={c.completion.length > 0 ? "regularGray.400" : "regularGray.200"}
                    _dark={{ bg: c.completion.length > 0 ? "regularGray.600" : "regularGray.800" }}
                    style={{
                      padding: 2,
                      borderBottomRightRadius: 8,
                      borderBottomLeftRadius: 8,
                      alignSelf: "stretch",
                      justifyContent: "center",
                      height: 32 * PixelRatio.getFontScale() + 2,
                      alignItems: "center",
                    }}>
                    {c.completion.length ? (
                      <Heading fontSize="xl">{c.completion.length}</Heading>
                    ) : (
                      <Icon style={{ height: 24, width: 24 }} name="close" />
                    )}
                  </Box>
                </Box>
              </View>
            ))}
        </ScrollView>
      </Box>
    );

  return (
    <Box
      bg="regularGray.100"
      _dark={{ bg: "regularGray.900" }}
      onLayout={onLayout}
      style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: headerHeight,
          flexDirection: "row",
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}>
        {challenge.categories
          .slice()
          .sort((a, b) => b.completion.length - a.completion.length)
          .map(c => (
            <View style={{ width: 300, maxWidth: "100%", flexGrow: 1, padding: 4 }}>
              <Box
                bg={c.completion.length > 0 ? "regularGray.300" : "regularGray.200"}
                _dark={{ bg: c.completion.length > 0 ? "regularGray.700" : "regularGray.800" }}
                style={{ flexDirection: "row", alignItems: "center", borderRadius: 8 }}>
                <TypeImage style={{ size: 48, margin: 8 }} icon={c.icon} />
                <View style={{ paddingVertical: 8, flex: 1 }}>
                  <Heading fontSize="md">
                    {c.name.includes(":") ? t(c.name as any) : c.name}
                  </Heading>
                  <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                    {c.completion.map(i => (
                      <TypeImage icon={i.icon} style={{ size: 24 }} />
                    ))}
                  </View>
                </View>
                <Box
                  bg={c.completion.length > 0 ? "regularGray.400" : "regularGray.200"}
                  _dark={{ bg: c.completion.length > 0 ? "regularGray.600" : "regularGray.800" }}
                  style={{
                    padding: 8,
                    borderBottomRightRadius: 8,
                    borderTopRightRadius: 8,
                    alignSelf: "stretch",
                    justifyContent: "center",
                    width: 60,
                    alignItems: "center",
                  }}>
                  <Heading fontSize="xl">
                    {c.completion.length || <Icon style={{ height: 24, width: 24 }} name="close" />}
                  </Heading>
                </Box>
              </Box>
            </View>
          ))}
      </ScrollView>
    </Box>
  );
}
