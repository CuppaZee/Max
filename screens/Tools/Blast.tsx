import { Button, CheckBox, Layout, Text } from "@ui-kitten/components";
import * as React from "react";
import useCuppaZeeRequest from "../../hooks/useCuppaZeeRequest";
import useMunzeeRequest from "../../hooks/useMunzeeRequest";
import useComponentSize from "../../hooks/useComponentSize";
import useTitle from "../../hooks/useTitle";
import { ScrollView, View } from "react-native";
import Loading from "../../components/Loading";
import { BlastIcon } from "../../components/Blast/Icon";
import { useTranslation } from "react-i18next";
import { LocationPickerMap } from "../../components/Map/Map";
import useUsernameSelect from "./UserSelect";
import Select from "../../components/Common/Select";
import { Heading } from "native-base";

export interface BlastPointsData {
  min: number;
  max: number;
  avg: number;
}

interface BlastData {
  total: number;
  points: BlastPointsData;
  types: {
    [type: string]: {
      total: number;
      points: BlastPointsData;
    };
  };
}

interface BlastInfo {
  lat: number;
  lng: number;
  amount: number;
}

export default function BlastPlannerScreen() {
  const { t } = useTranslation();
  const [size, onLayout] = useComponentSize();
  const [includeTemps, setIncludeTemps] = React.useState(false);
  const [blastInfo, setBlastInfo] = React.useState<BlastInfo>();
  const pos = React.useRef<Omit<BlastInfo, "amount">>();
  const [username, props] = useUsernameSelect();
  useTitle(`Blast Planner`);
  const user = useMunzeeRequest(
    "user",
    { username: username || "" },
    username !== undefined
  );
  const data = useCuppaZeeRequest<{ data: BlastData[] }>(
    "map/blast",
    {
      user_id: user.data?.data?.user_id,
      ...blastInfo,
      includeTemps: includeTemps ? "TRUE" : "FALSE"
    },
    user.data?.data?.user_id !== undefined && blastInfo !== undefined
  );

  if (!size) {
    return (
      <Layout style={{ flex: 1 }} onLayout={onLayout}>
        <Heading fontSize="md">Blasting as</Heading>
        <Select {...props} />
        <Loading data={[user, data]} />
      </Layout>
    );
  }
  return (
    <Layout onLayout={onLayout} style={{ flex: 1, flexDirection: "row" }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 4 }}>
        <Heading fontSize="md">Blasting as</Heading>
        <Select {...props} />
        <Layout style={{ height: 400, margin: 4, borderRadius: 8 }}>
          <LocationPickerMap
            circleRadius={1609.344}
            circleColor="#00ff00"
            icon="blastcapture"
            onPositionChange={viewport => {
              pos.current = {
                lat: viewport.latitude,
                lng: viewport.longitude,
              };
            }}
          />
        </Layout>
        <View style={{ flexDirection: "row" }}>
          {(
            [
              [50, "Mini"],
              [100, "Normal"],
              [500, "MEGA"],
              //[50000, "Inter-Continental (Beta)"],
            ] as const
          ).map(([n, l]) => (
            <Button
              appearance="outline"
              onPress={() => {
                setBlastInfo({ ...(pos.current ?? { lat: 0, lng: 0 }), amount: n });
              }}
              style={{ flex: 1, margin: 4 }}>
              {`${l} (${n.toString()})`}
            </Button>
          ))}
        </View>
        <View style={{ padding: 4 }}>
          <CheckBox checked={!includeTemps} onChange={() => setIncludeTemps(i => !i)}>
            Hide Current Temporary Items (Scatters, Bouncers, etc.)
          </CheckBox>
          <Text category="p2">
            It might be useful to disable this if you are running a blast check for planning a blast
            for the future.
          </Text>
        </View>
        {data.data ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {data.data.data.map((i, n) => (
              <Layout
                level="3"
                style={{
                  margin: 4,
                  alignItems: "center",
                  borderRadius: 8,
                  width: 400,
                  maxWidth: "100%",
                  flexGrow: 1,
                  padding: 4,
                }}>
                <Text category="h6">
                  {t("user_blast_checker:blast", { n: n + 1 })} -
                  {t("user_blast_checker:munzees", { count: i.total })}
                </Text>
                <Text category="s1">{t("user_blast_checker:points", i.points)}</Text>
                <View style={{ alignSelf: "stretch", flexDirection: "row", flexWrap: "wrap" }}>
                  {Object.entries(i.types).map(i => (
                    <View style={{ margin: 4, flexGrow: 1, width: 40, alignItems: "center" }}>
                      <BlastIcon icon={i[0]} {...i[1]} />
                    </View>
                  ))}
                </View>
              </Layout>
            ))}
          </View>
        ) : blastInfo ? (
          <Layout style={{ flex: 1 }}>
            <Loading data={[user, data]} />
          </Layout>
        ) : null}
      </ScrollView>
    </Layout>
  );
}
