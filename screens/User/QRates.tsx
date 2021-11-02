import { useHeaderHeight } from "@react-navigation/elements";
import { RouteProp, useRoute } from "@react-navigation/native";
import dayjs from "dayjs";
import { Box, Heading, Progress, Text, useToken, ScrollView } from "native-base";
import * as React from "react";
import { View } from "react-native";
import TypeImage from "../../components/Common/TypeImage";
import Loading from "../../components/Loading";
import useComponentSize from "../../hooks/useComponentSize";
import useMunzeeRequest from "../../hooks/useMunzeeRequest";
import useTitle from "../../hooks/useTitle";
import { RootStackParamList } from "../../types";

export default function PlayerCubimalsScreen() {
  const [size, onLayout] = useComponentSize();
  const route = useRoute<RouteProp<RootStackParamList, "Player_QRates">>();
  useTitle(`${route.params.username} - QRates`);
  const user = useMunzeeRequest(
    "user",
    { username: route.params?.username },
    route.params?.username !== undefined
  );
  const data = useMunzeeRequest<any>(
    "qrates",
    {
      method: "get"
    },
    user.data?.data?.user_id !== undefined,
    user.data?.data?.user_id
  );
  const [success] = useToken("colors", ["success.500"]);
  const headerHeight = useHeaderHeight();

  if (!data.isFetched || !size) {
    return (
      <Box
        bg="regularGray.100"
        _dark={{ bg: "regularGray.900" }}
        onLayout={onLayout}
        style={{ flex: 1, paddingTop: headerHeight }}>
        <Loading data={[data]} />
      </Box>
    );
  }
  return (
    <Box
      bg="regularGray.100"
      _dark={{ bg: "regularGray.900" }}
      onLayout={onLayout}
    flex={1}>
      <ScrollView
        flex={1}
        contentContainerStyle={{
          flexDirection: "row",
          alignItems: "flex-start",
          flexWrap: "wrap",
          paddingTop: headerHeight,
        }}>
        {data.data?.data?.qrates.map((q: any) => (
          <View style={{ flexGrow: 1, width: 300, maxWidth: "100%", padding: 4 }}>
            <Box
              bg="regularGray.200"
              _dark={{ bg: "regularGray.800" }}
              style={{ borderRadius: 8, padding: 4, alignItems: "center" }}>
              <TypeImage icon={q.logo.slice(51, -4)} style={{ size: 128 }} iconSize={128} />
              <Heading fontSize="md" style={{ textAlign: "center" }}>
                {q.name}
              </Heading>
              <Heading fontSize="sm" style={{ textAlign: "center" }}>
                {q.description}
              </Heading>
              <Text fontSize="sm" style={{ textAlign: "center" }}>
                Found: {dayjs.mhqParse(q.time_found).local().format("L LTS")} (Local)
              </Text>
              <Text fontSize="sm" style={{ textAlign: "center" }}>
                QRowbars Used: {q.qrowbars_used}/3
              </Text>

              <Box pt="1" w="100%">
                <Progress size="2xl" rounded="md" value={(q.progress / q.goal) * 100} />
                <Box
                  position="absolute"
                  top={1}
                  left="0"
                  right="0"
                  bottom="0"
                  style={{ justifyContent: "center", alignItems: "center" }}>
                  <Heading
                    position="absolute"
                    w="100%"
                    fontSize="sm"
                    style={{ textAlign: "center" }}>
                    {q.progress}/{q.goal}
                  </Heading>
                </Box>
              </Box>
            </Box>
          </View>
        ))}
      </ScrollView>
    </Box>
  );
}
