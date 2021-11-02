import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Button, Input, Layout, Text } from "@ui-kitten/components";
import * as React from "react";
import useCuppaZeeRequest from "../../hooks/useCuppaZeeRequest";
import useMunzeeRequest from "../../hooks/useMunzeeRequest";
import useComponentSize from "../../hooks/useComponentSize";
import useTitle from "../../hooks/useTitle";
import { Pressable, ScrollView, View } from "react-native";
import TypeImage from "../../components/Common/TypeImage";
import Loading from "../../components/Loading";
import dayjs from "dayjs";
import { UserCapturesSpecial } from "@cuppazee/api/user/captures";
import Icon from "../../components/Common/Icon";
import ExpoClipboard from "expo-clipboard";
import { RootStackParamList } from "../../types";
import { NavProp } from "../../navigation";

export default function PlayerLotterZeeScreen() {
  const nav = useNavigation<NavProp>();
  const [size, onLayout] = useComponentSize();
  const route = useRoute<RouteProp<RootStackParamList, "Player_LotterZee">>();
  useTitle(`${route.params.username} - LotterZee`);
  const user = useMunzeeRequest(
    "user",
    { username: route.params?.username },
    route.params?.username !== undefined
  );
  const data = useCuppaZeeRequest<{
    data: { balls: NonNullable<UserCapturesSpecial["response"]["data"]>["munzees"] };
  }>(
    "user/lotterzee",
    {
      user_id: user.data?.data?.user_id,
    },
    user.data?.data?.user_id !== undefined
  );

  if (!data.data || !size) {
    return (
      <Layout style={{ flex: 1 }} onLayout={onLayout}>
        <Loading data={[user, data]} />
      </Layout>
    );
  }
  return (
    <Layout onLayout={onLayout} style={{ flex: 1, flexDirection: "row" }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 4 }}>
        {data.data.data.balls.length > 0 ? (
          <>
            <Text category="h4">
              You have captured {data.data.data.balls.length} LotterZEE Balls
            </Text>
            <Input
              value={data.data.data.balls.map(i => i.pin_icon.slice(62, -4)).join("")}
              label="Sequence"
              accessoryRight={props => (
                <Button
                  onPress={() => {
                    ExpoClipboard.setString(
                      data.data.data.balls.map(i => i.pin_icon.slice(62, -4)).join("")
                    );
                  }}
                  {...props}
                  appearance="outline"
                  style={{ margin: -8 }}
                  accessoryLeft={props => <Icon {...props} name={"content-copy"} />}
                />
              )}
            />
          </>
        ) : (
          <Text category="h4">You haven't captured any LotterZEE Balls</Text>
        )}
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {data.data.data.balls.map(i => (
            <Pressable
              style={{
                width: 80,
                maxWidth: "100%",
                flexGrow: 1,
              }}
              onPress={() =>
                nav.navigate("Tools_Munzee", {
                  a: i.munzee_id,
                })
              }>
              <Layout
                level="2"
                style={{
                  margin: 4,
                  flexDirection: "column",
                  alignItems: "center",
                  borderRadius: 8,
                  flex: 1,
                }}>
                <View style={{ padding: 4 }}>
                  <TypeImage icon={i.pin_icon} style={{ size: 48 }} />
                </View>
                <View style={{ padding: 4 }}>
                  <Text category="s1" style={{ textAlign: "center" }}>
                    {dayjs(i.captured_at).format("LTS")}
                  </Text>
                  <Text category="s2" style={{ textAlign: "center" }}>
                    {dayjs(i.captured_at).format("L")}
                  </Text>
                </View>
              </Layout>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </Layout>
  );
}
