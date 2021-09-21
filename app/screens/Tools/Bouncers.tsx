import { TypeHidden, TypeTags, TypeState } from "@cuppazee/db";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { Box, Button, Heading } from "native-base";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import BouncerOverviewConverter from "../../components/Bouncers/Data";
import { BouncerIcon } from "../../components/Bouncers/Icon";
import Icon from "../../components/Common/Icon";
import Loading from "../../components/Loading";
import useCuppaZeeRequest from "../../hooks/useCuppaZeeRequest";
import useDB from "../../hooks/useDB";
import useTitle from "../../hooks/useTitle";
import { NavProp } from "../../navigation";

export default function BouncersScreen() {
  const { t } = useTranslation();
  useTitle(`${t("pages:tools_bouncers")}`);
  const nav = useNavigation<NavProp>();
  const data = useCuppaZeeRequest<{
    data: any;
    endpointsDown: { label: string; endpoint: string }[];
  }>("bouncers/overview", {});
  const db = useDB();
  const d = React.useMemo(
    () => (data.data ? BouncerOverviewConverter(db, data.data.data) : null),
    [data.dataUpdatedAt]
  );
  const headerHeight = useHeaderHeight();

  if (!data.isFetched || !d) {
    return (
      <Box bg="regularGray.100" _dark={{ bg: "regularGray.900" }} style={{ flex: 1 }}>
        <Loading data={[data]} />
      </Box>
    );
  }
  return (
    <Box bg="regularGray.100" _dark={{ bg: "regularGray.900" }} style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: headerHeight,
          flexDirection: "row",
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}>
        {data.data?.endpointsDown
          .filter(i => i.endpoint.startsWith("/munzee/specials"))
          .map(endpoint => (
            <Box style={{ margin: 4, width: "100%" }}>
              <Box
                bg="regularGray.200"
                _dark={{ bg: "regularGray.800" }}
                style={{
                  padding: 4,
                  borderRadius: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                <Heading fontSize="md" style={{ textAlign: "center", maxWidth: "100%" }}>
                  CuppaZee is currently unable to get data for {endpoint.label} from Munzee. These
                  bouncers may incorrectly show their counts as 0.
                </Heading>
              </Box>
            </Box>
          ))}
        {d && d.uncategoriesTypes.length > 0 && (
          <View style={{ flexGrow: 1, width: 400, maxWidth: "100%", padding: 4 }}>
            <Box
              bg="regularGray.200"
              _dark={{ bg: "regularGray.800" }}
              style={{ borderRadius: 8, padding: 4 }}>
              <Heading fontSize="lg" style={{ textAlign: "center" }}>
                Uncategorised
              </Heading>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {d?.uncategoriesTypes.map(t => (
                  <BouncerIcon count={d.counts[t]} icon={t} />
                ))}
              </View>
            </Box>
          </View>
        )}
        {db.categories
          .filter(i =>
            i.types.some(
              t =>
                !t.hidden(TypeHidden.Bouncers) &&
                (d?.counts[t.strippedIcon] ||
                  (i.active &&
                    (t.has_tag(TypeTags.Bouncer) ||
                      t.has_tag(TypeTags.Scatter) ||
                      t.state === TypeState.Bouncer)))
            )
          )
          .map(c => (
            <View style={{ flexGrow: 1, width: 400, maxWidth: "100%", padding: 4 }}>
              <Box
                bg="regularGray.200"
                _dark={{ bg: "regularGray.800" }}
                style={{ borderRadius: 8, padding: 4 }}>
                <View
                  style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                  <Heading fontSize="lg" style={{ textAlign: "center" }}>
                    {c.name}
                  </Heading>
                  <Button
                    size="sm"
                    variant="ghost"
                    onPress={() =>
                      nav.navigate("Tools_BouncersMap", {
                        type: c.types
                          .filter(i => !i.hidden(TypeHidden.Bouncers))
                          .map(i => i.icon)
                          .join(","),
                      })
                    }
                    startIcon={<Icon name="map" style={{ height: 24, width: 24 }} />}
                  />
                </View>
                {[
                  ...new Set(
                    c.types
                      .filter(
                        i =>
                          !i.hidden(TypeHidden.Bouncers) &&
                          (d?.counts[i.strippedIcon] ||
                            (c.active &&
                              (i.has_tag(TypeTags.Bouncer) ||
                                i.has_tag(TypeTags.Scatter) ||
                                i.state === TypeState.Bouncer)))
                      )
                      .map(i => i.group)
                  ),
                ].map(group => (
                  <View>
                    {!!group && <Heading fontSize="md" textAlign="center">{group}</Heading>}
                    <View
                      style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
                      {c.types
                        .filter(i => i.group === group)
                        .filter(
                          i =>
                            !i.hidden(TypeHidden.Bouncers) &&
                            (d?.counts[i.strippedIcon] ||
                              (c.active &&
                                (i.has_tag(TypeTags.Bouncer) ||
                                  i.has_tag(TypeTags.Scatter) ||
                                  i.state === TypeState.Bouncer)))
                        )
                        .map(t => (
                          <BouncerIcon count={d?.counts[t.strippedIcon] || 0} type={t} />
                        ))}
                    </View>
                  </View>
                ))}
              </Box>
            </View>
          ))}
      </ScrollView>
    </Box>
  );
}
