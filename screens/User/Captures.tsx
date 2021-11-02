import { TypeHidden } from "@cuppazee/db";
import { useHeaderHeight } from "@react-navigation/elements";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { DrawerItem, Layout, Text } from "@ui-kitten/components";
import { Box, Heading, HStack, Pressable } from "native-base";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { CapturesIcon } from "../../components/Captures/Icon";
import { Item } from "../../components/Common/Item";
import TypeImage from "../../components/Common/TypeImage";
import Loading from "../../components/Loading";
import useComponentSize from "../../hooks/useComponentSize";
import useDB from "../../hooks/useDB";
import useMunzeeRequest from "../../hooks/useMunzeeRequest";
import useTitle from "../../hooks/useTitle";
import { NavProp } from "../../navigation";
import { RootStackParamList } from "../../types";

const unavailable = new Set([
  "1starmotelroom",
  "hotelroom",
  "virtual_resort_room",
  "timeshareroom",
  "vacationcondoroom",
  "munzee",
]);

export default function PlayerCapturesScreen() {
  const { t } = useTranslation();
  const [size, onLayout] = useComponentSize();
  const route = useRoute<RouteProp<RootStackParamList, "Player_Captures">>();
  const nav = useNavigation<NavProp>();
  useTitle(`${route.params.username} - ${t("pages:user_captures")} - ${route.params.category}`);
  const user = useMunzeeRequest(
    "user",
    { username: route.params?.username },
    route.params?.username !== undefined
  );
  const data = useMunzeeRequest(
    "user/specials",
    {
      user_id: user.data?.data?.user_id as number,
    },
    user.data?.data?.user_id !== undefined
  );
  const db = useDB();

  const d = React.useMemo(
    () =>
      data.data?.data
        ? data.data.data.reduce((a, b) => {
            return {
              ...a,
              [db.getType(b.logo)?.strippedIcon ?? db.strip(b.logo)]: b.count,
            };
          }, {} as { [icon: string]: number })
        : null,
    [data.dataUpdatedAt]
  );

  const category = db.getCategory(route.params.category ?? "root");

  const headerHeight = useHeaderHeight();

  if (!data.isFetched || !d || !category || !size) {
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
  return (
    <Box
      bg="regularGray.100"
      _dark={{ bg: "regularGray.900" }}
      onLayout={onLayout}
      style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexDirection: "row",
          alignItems: "flex-start",
          flexWrap: "wrap",
          paddingTop: headerHeight,
        }}>
        <View style={{ width: "100%", alignItems: "center" }}>
          <View
            style={{
              width: size.width / Math.floor(size.width / 400),
              maxWidth: "100%",
              padding: 4,
            }}>
            <Box
              bg="regularGray.200"
              _dark={{ bg: "regularGray.800" }}
              style={{ borderRadius: 8, padding: 4 }}>
              <Heading fontSize="lg" style={{ textAlign: "center" }}>
                {category.name}
              </Heading>
              {category.children
                .filter(i => i.children.length > 0)
                .map(c => (
                  <Item
                    title={c.name}
                    typeImage={c.icon}
                    link={["Player_Captures", { username: route.params.username, category: c.id }]}
                  />
                ))}
            </Box>
          </View>
        </View>
        {category.children
          .filter(i => i.types.length > 0)
          .map(i => (
            <View style={{ flexGrow: 1, width: 400, maxWidth: "100%", padding: 4 }}>
              <Box
                bg="regularGray.200"
                _dark={{ bg: "regularGray.800" }}
                style={{ borderRadius: 8, padding: 4 }}>
                <Heading fontSize="lg" style={{ textAlign: "center" }}>
                  {i.name}
                </Heading>
                {i.groups.map(g => (
                  <>
                    {!!g.title && (
                      <Heading fontSize="md" style={{ textAlign: "center" }}>
                        {g.title}
                      </Heading>
                    )}
                    <View
                      style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
                      {g.types
                        .filter(i => !i.hidden(TypeHidden.Capture))
                        .filter(i => !unavailable.has(i.icon))
                        .map(t => (
                          <CapturesIcon count={d[t.strippedIcon] || 0} type={t} />
                        ))}
                    </View>
                  </>
                ))}
              </Box>
            </View>
          ))}
      </ScrollView>
    </Box>
  );
}
