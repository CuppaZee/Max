import React from "react";
import { Pressable, View } from "react-native";
import TypeImage from "../Common/TypeImage";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { UserActivityItem } from "@cuppazee/utils";
import { Box, Heading, Text } from "native-base";
import { NavProp } from "../../navigation";
import dayjs from "dayjs";

export default React.memo(
  function UserActivityListItem(item: UserActivityItem) {
    const nav = useNavigation<NavProp>();
    const { t } = useTranslation();
    return (
      <Pressable
        onPress={() =>
          nav.navigate("Tools_Munzee", {
            a: item.creator ?? "",
            b: item.code,
          })
        }>
        <Box
          bg="regularGray.200"
          _dark={{ bg: "regularGray.800" }}
          style={{
            margin: 4,
            borderRadius: 4,
            flexDirection: "row",
            alignSelf: "center",
            alignItems: "center",
            width: 500,
            maxWidth: "100%",
          }}>
          <View
            style={{
              width: 4,
              alignSelf: "stretch",
              backgroundColor: {
                capture: "#00ff00",
                capture_owned: "#ffff00",
                deploy: "#00ffff",
                passive_deploy: "#7777ff",
                capon: "#ff7700",
              }[item.type],
              borderTopLeftRadius: 4,
              borderBottomLeftRadius: 4,
            }}
          />
          <View style={{ flex: 1 }}>
            {[item, ...(item.sub_captures ?? [])].map(i => (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ alignItems: "center", width: 50, paddingLeft: 4 }}>
                  <Text fontSize={i.sub ? "xs" : "sm"}>
                    {i.points > 0 ? "+" : ""}
                    {i.points || t("user_activity:none")}
                  </Text>
                  <TypeImage icon={i.icon} style={{ size: i.sub ? 24 : 32 }} />
                </View>
                <View style={{ padding: 4, flex: 1 }}>
                  {!i.sub && (
                    <Text fontSize="sm">
                      {
                        {
                          capture: t("user_activity:activity_capture"),
                          capture_owned: t("user_activity:activity_capture"),
                          deploy: t("user_activity:activity_deploy"),
                          passive_deploy: t("user_activity:activity_deploy"),
                          capon: t("user_activity:activity_capon", { user: i.capper }),
                        }[i.type]
                      }
                    </Text>
                  )}
                  <Heading fontSize="md">{i.name}</Heading>
                  {i.type === "capture" && (
                    <Text fontSize="sm">
                      {t("user_activity:owned_by_user", { user: i.creator || "" })}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
          <View style={{ paddingHorizontal: 4, paddingRight: 8 }}>
            <Text style={{ textAlign: "right" }} fontSize="sm">
              {dayjs(item.time).format("HH:mm")}
            </Text>
            <Text style={{ textAlign: "right" }} fontSize="md">
              {dayjs(item.time).mhq().format("HH:mm [MHQ]")}
            </Text>
          </View>
        </Box>
      </Pressable>
    );
  },
  (prev, now) => prev.key === now.key
);
