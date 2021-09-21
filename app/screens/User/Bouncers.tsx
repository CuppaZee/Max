import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import * as React from "react";
import useCuppaZeeRequest from "../../hooks/useCuppaZeeRequest";
import useMunzeeRequest from "../../hooks/useMunzeeRequest";
import useComponentSize from "../../hooks/useComponentSize";
import useTitle from "../../hooks/useTitle";
import { Pressable, ScrollView, View } from "react-native";
import { UserDeploys } from "@cuppazee/api/user/deploys";
import { MunzeeSpecialBouncer } from "@cuppazee/api/munzee/specials";
import TypeImage from "../../components/Common/TypeImage";
import Loading from "../../components/Loading";
import { useTranslation } from "react-i18next";
import { AutoMap, Icons, Layer, Source } from "../../components/Map/Map";
import useDB from "../../hooks/useDB";
import { Box, Heading, Text } from "native-base";
import { NavProp } from "../../navigation";
import { RootStackParamList } from "../../types";
import dayjs from "dayjs";

type Bouncer = NonNullable<UserDeploys["response"]["data"]>["munzees"][0] & {
  bouncer?: MunzeeSpecialBouncer & { hash: string };
  location?: {
    record?: {
      name: string;
      latitude: number;
      longitude: number;
      countryCode: string;
    };
    distance: number;
  };
  timezone: string[];
};

export default function PlayerBouncersScreen() {
  const db = useDB();
  const { t } = useTranslation();
  const nav = useNavigation<NavProp>();
  const [size, onLayout] = useComponentSize();
  const route = useRoute<RouteProp<RootStackParamList, "Player_Bouncers">>();
  useTitle(`${route.params.username} - ${t("pages:user_bouncers")}`);
  const user = useMunzeeRequest(
    "user",
    { username: route.params?.username },
    route.params?.username !== undefined
  );
  const data = useCuppaZeeRequest<{
    data: Bouncer[];
    endpointsDown: { label: string; endpoint: string }[];
  }>(
    "user/bouncers",
    {
      user_id: user.data?.data?.user_id,
    },
    user.data?.data?.user_id !== undefined
  );

  if (!data.data || !size) {
    return (
      <Box bg="regularGray.100" _dark={{ bg: "regularGray.900" }} style={{ flex: 1 }} onLayout={onLayout}>
        <Loading data={[user, data]} />
      </Box>
    );
  }
  return (
    <Box
      bg="regularGray.100"
      _dark={{ bg: "regularGray.900" }}
      onLayout={onLayout}
      style={{ flex: 1, flexDirection: "row" }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 4 }}>
        {data.data?.endpointsDown
          .filter(i => i.endpoint.startsWith("/munzee/specials"))
          .map(endpoint => (
            <Box style={{ padding: 4 }}>
              <Box
                bg="danger.200"
                _dark={{ bg: "danger.800" }}
                style={{
                  padding: 4,
                  borderRadius: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                <Heading fontSize="lg" style={{ textAlign: "center", maxWidth: "100%" }}>
                  CuppaZee is currently unable to get data for {endpoint.label} from Munzee. These
                  bouncers may incorrectly show as being off the map.
                </Heading>
              </Box>
            </Box>
          ))}
        <Box
          bg="regularGray.200"
          _dark={{ bg: "regularGray.800" }}
          style={{ height: 400, margin: 4, borderRadius: 8 }}>
          <AutoMap
            onPress={point => {
              const munzee = point.features?.find(i => i.source === "bouncers");
              if (munzee) {
                nav.navigate("Tools_Munzee", { a: munzee.id });
              }
            }}>
            <Icons
              icons={Object.keys(
                data.data.data.reduce((a, b) => ({ ...a, [db.strip(b.pin_icon)]: 1 }), {} as any)
              )}
            />
            <Source
              id="bouncers"
              type="geojson"
              data={{
                type: "FeatureCollection",
                features: data.data.data
                  .filter(i => i.bouncer)
                  .map(i => ({
                    type: "Feature",
                    geometry: {
                      type: "Point",
                      coordinates: [Number(i.bouncer?.longitude), Number(i.bouncer?.latitude)],
                    },
                    properties: {
                      icon: db.strip(i.pin_icon),
                      id: i.munzee_id,
                    },
                  })),
              }}>
              <Layer
                id="bouncers_symbols"
                type="symbol"
                paint={{}}
                layout={{
                  "icon-allow-overlap": true,
                  "icon-anchor": "bottom",
                  "icon-size": 0.8,
                  "icon-image": ["get", "icon"],
                }}
              />
            </Source>
          </AutoMap>
        </Box>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {data.data.data.map(i => (
            <Pressable
              style={{
                width: 400,
                maxWidth: "100%",
                flexGrow: 1,
              }}
              onPress={
                i.bouncer
                  ? () =>
                      nav.navigate("Tools_Munzee", {
                        a: i.bouncer?.munzee_id ?? "",
                      })
                  : undefined
              }>
              <Box
                bg="regularGray.200"
                _dark={{ bg: "regularGray.800" }}
                style={{
                  margin: 4,
                  flexDirection: "row",
                  alignItems: "center",
                  borderRadius: 8,
                  flex: 1,
                }}>
                <View style={{ padding: 4 }}>
                  <TypeImage icon={i.pin_icon} style={{ size: 48 }} />
                </View>
                <View style={{ padding: 4 }}>
                  <Heading fontSize="lg">{i.friendly_name}</Heading>
                  {i.bouncer ? (
                    <>
                      <Heading fontSize="md">
                        {t("user_bouncers:host", {
                          name: i.bouncer.friendly_name,
                          creator: i.bouncer.full_url.split("/")[4],
                        })}
                      </Heading>
                      {i.location?.record && (
                        <Text fontSize="md">
                          {t("user_bouncers:location", {
                            town: i.location?.record?.name,
                            country: i.location?.record?.countryCode,
                            times: i.timezone.map(t => dayjs().tz(t).format("HH:mm")).join(", "),
                          })}
                        </Text>
                      )}
                      <Text fontSize="md">
                        {t("user_bouncers:captures", {
                          number: i.number_of_captures,
                          date: i.last_captured_at ? dayjs(i.last_captured_at).format("L LT") : "-",
                        })}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Heading fontSize="md">
                        {t(
                          `user_bouncers:rest_${
                            (["a", "b", "c"] as const)[Math.floor(Math.random() * 3)]
                          }` as const
                        )}
                      </Heading>
                    </>
                  )}
                </View>
              </Box>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </Box>
  );
}
