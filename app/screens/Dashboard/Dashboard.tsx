import { CuppaZeeDB } from "@cuppazee/db";
import { useIsFocused, useNavigation } from "@react-navigation/core";
import { Box, Button, Heading, Tabs, Text } from "native-base";
import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  FlatList,
  Image,
  LayoutChangeEvent,
  Platform,
  Pressable,
  View,
  ViewProps,
} from "react-native";
import builds from "../../builds";
import Icon from "../../components/Common/Icon";
import useComponentSize from "../../hooks/useComponentSize";
import useSetting, {
  BuildAtom,
  LiveLocationErrorAtom,
  SkipDashboardAtom,
} from "../../hooks/useSetting";
import useTitle from "../../hooks/useTitle";
import { NavProp } from "../../navigation";
import ChangesDashCard from "./Changes";
import ClansDashCard from "./Clans";
import ToolsDashCard from "./Tools";
import UserDashCard from "./User";

function WheelWrapper({
  onWheel,
  children,
}: React.PropsWithChildren<{ onWheel: (event: React.WheelEvent<HTMLDivElement>) => void }>) {
  if (Platform.OS === "web")
    return (
      <div
        style={{ display: "flex", flexGrow: 1, flexShrink: 1, overflow: "hidden" }}
        className="snap-item-center"
        onWheel={onWheel}>
        <style>
          {".snap-item-center > div > div > div { scroll-snap-align: center !important }"}
        </style>
        {children}
      </div>
    );
  return <>{children}</>;
}

const FlexView = (props: ViewProps) => <View {...props} style={[props.style, { flex: 1 }]} />;

export interface DashCardProps<i> {
  item: i;
  index: number;
  touched: boolean;
  onInnerLayout: (event: LayoutChangeEvent) => void;
  onOuterLayout: (event: LayoutChangeEvent) => void;
}

export default function DashboardScreen() {
  const { t } = useTranslation();
  const nav = useNavigation<NavProp>();
  const [clans] = useClanBookmarks();
  const pageOffset = clans.length > 2 ? 2 : 1;
  const scrollRef = React.useRef<FlatList>();
  const scrollSize = React.useRef<{ width: number; height: number }>();
  const scrollViewDimensions = React.useRef<{
    [index: number]: {
      [key in "inner" | "outer"]?: {
        width: number;
        height: number;
      };
    };
  }>({});
  const position = React.useRef<number>();
  const [build, , buildLoaded] = useSetting(BuildAtom);
  const [opacity, setOpacity] = React.useState(Platform.OS === "web" ? 0 : 1);
  const [users] = useUserBookmarks();
  const [touched, setTouched] = React.useState<number[]>([pageOffset]);
  const [index, setIndex] = React.useState<number>(pageOffset);
  const [size, onLayout] = useComponentSize();
  const width = scrollSize.current?.width ?? size?.width ?? Dimensions.get("window").width;

  const [liveLocationError, setLiveLocationError] = useSetting(LiveLocationErrorAtom);

  useTitle(`${t("pages:dashboard_dashboard")}`);

  const [skipDashboard] = useSetting(SkipDashboardAtom);
  const isFocused = useIsFocused();
  React.useEffect(() => {
    if (skipDashboard && users.length > 0 && isFocused) {
      nav.navigate("Player_Profile", {
        username: users[0]?.username,
      });
    }
  }, [skipDashboard, users, isFocused]);

  const dashCards = [
    { nonUser: "tools" },
    ...(clans.length > 2 ? [{ nonUser: "clan" }] : []),
    ...(builds(new CuppaZeeDB([], [], [])).some(i => buildLoaded && i.build > build)
      ? [{ nonUser: "changes" }]
      : []),
    ...users,
  ];

  if (skipDashboard) {
    return null;
  }
  return (
    <Box
      onLayout={onLayout}
      style={{ flex: 1, marginTop: -4 }}
      bg="regularGray.100"
      _dark={{ bg: "regularGray.900" }}>
      {liveLocationError === "permission_failed" && (
        <Box
          style={{ margin: 8, borderRadius: 8, padding: 4 }}
          bg="regularGray.200"
          _dark={{ bg: "regularGray.800" }}>
          <Heading fontSize="xl">It seems that CuppaZee no longer has Live Location access</Heading>
          <Text fontSize="md">
            Please head to CuppaZee's Notifications Settings page to disable Live Location, or save
            your Settings to re-enabled Live Location.
          </Text>
          <Button
            onPress={() =>
              nav.navigate("Settings_Notifications")
            }
            style={{ marginTop: 4 }}>
            Notification Settings
          </Button>
        </Box>
      )}
      {liveLocationError === "updated" && (
        <Box
          style={{ margin: 8, borderRadius: 8, padding: 4 }}
          bg="regularGray.200"
          _dark={{ bg: "regularGray.800" }}>
          <Text fontSize="xl">CuppaZee has updated your Live Location settings</Text>
          <Text fontSize="md">
            These changes should help to prevent battery drain, and ensure that CuppaZee continues
            running smoothly.
          </Text>
          <Button onPress={() => setLiveLocationError("")} style={{ marginTop: 4 }}>
            Dismiss
          </Button>
        </Box>
      )}
      {liveLocationError === "updated_native" && (
        <Box
          style={{ margin: 8, borderRadius: 8, padding: 4 }}
          bg="regularGray.200"
          _dark={{ bg: "regularGray.800" }}>
          <Text fontSize="xl">CuppaZee has switch you to the Native Live Location system</Text>
          <Text fontSize="md">
            These changes should help to prevent battery drain, and ensure that CuppaZee continues
            running smoothly.
          </Text>
          <Button onPress={() => setLiveLocationError("")} style={{ marginTop: 4 }}>
            Dismiss
          </Button>
        </Box>
      )}
      <WheelWrapper
        onWheel={ev => {
          if (
            (scrollViewDimensions.current[index]?.inner?.height || 1) >
            (scrollViewDimensions.current[index]?.outer?.height || 0)
          )
            return;
          scrollRef.current?.scrollToOffset({
            offset: (position.current || 0) + (ev.nativeEvent.deltaY / 100) * Math.min(600, width),
          });
        }}>
        <FlatList
          style={{ flexGrow: 1, opacity: width ? opacity : 0 }}
          decelerationRate="fast"
          ref={sv => {
            scrollRef.current = sv || undefined;
          }}
          horizontal={true}
          pagingEnabled={Platform.OS === "web"}
          contentOffset={{ x: pageOffset * Math.min(600, width), y: 0 }}
          onScroll={ev => {
            if (ev.nativeEvent.contentOffset.x !== undefined) {
              position.current = ev.nativeEvent.contentOffset.x;
              const pos = Math.ceil((ev.nativeEvent.contentOffset.x - 16) / Math.min(600, width));
              setIndex(Math.round((ev.nativeEvent.contentOffset.x - 16) / Math.min(600, width)));
              if (!touched.includes(pos)) setTouched([...touched, pos]);
            }
          }}
          onContentSizeChange={() => {
            if (Platform.OS === "web" && opacity === 0) setOpacity(1);
            scrollRef.current?.scrollToOffset({
              offset: pageOffset * Math.min(600, width),
              animated: false,
            });
          }}
          scrollEventThrottle={4}
          snapToInterval={Math.min(600, width)}
          snapToAlignment="center"
          showsHorizontalScrollIndicator={false}
          snapToStart={true}
          data={dashCards}
          CellRendererComponent={FlexView}
          keyExtractor={item => ("nonUser" in item ? item.nonUser : item.user_id)}
          renderItem={({ item, index: cardIndex }) => {
            const props: DashCardProps<any> = {
              item,
              index: cardIndex,
              touched: touched.includes(cardIndex),
              onInnerLayout: event => {
                scrollViewDimensions.current[cardIndex] = {
                  inner: {
                    width: event.nativeEvent.layout.width,
                    height: event.nativeEvent.layout.height,
                  },
                  outer: scrollViewDimensions.current[cardIndex]?.outer,
                };
              },
              onOuterLayout: event => {
                scrollViewDimensions.current[cardIndex] = {
                  inner: scrollViewDimensions.current[cardIndex]?.inner,
                  outer: {
                    width: event.nativeEvent.layout.width,
                    height: event.nativeEvent.layout.height,
                  },
                };
              },
            };
            return (
              <View
                style={{
                  width: Math.min(600, width),
                  padding: 8,
                  zIndex: -cardIndex,
                  height: "100%",
                  flex: 1,
                  alignSelf: "center",
                  opacity: index === cardIndex || width <= 600 ? 1 : 0.75,
                }}>
                {"nonUser" in item ? (
                  item.nonUser === "tools" ? (
                    <ToolsDashCard {...props} />
                  ) : item.nonUser === "clan" ? (
                    <ClansDashCard {...props} />
                  ) : item.nonUser === "changes" ? (
                    <ChangesDashCard {...props} />
                  ) : null
                ) : (
                  <UserDashCard {...props} />
                )}
                {index !== cardIndex && width > 600 && (
                  <Pressable
                    onPress={() => {
                      scrollRef.current?.scrollToOffset({
                        offset:
                          (position.current || 0) + (cardIndex - index) * Math.min(600, width),
                      });
                    }}
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: 0,
                      right: 0,
                    }}
                  />
                )}
              </View>
            );
          }}
          ListFooterComponent={<View style={{ width: (width - Math.min(600, width)) / 2 }} />}
          ListHeaderComponent={<View style={{ width: (width - Math.min(600, width)) / 2 }} />}
        />
      </WheelWrapper>

      <Tabs
        align="center"
        index={index}
        onChange={newIndex => {
          scrollRef.current?.scrollToOffset({
            offset: (position.current || 0) + (newIndex - index) * Math.min(600, width),
          });
        }}>
        <Tabs.Bar style={{ marginTop: -8 }}>
          {dashCards.map((card, cardIndex) => (
            <Tabs.Tab
              key={
                ("nonUser" in card ? card.nonUser : card.user_id) +
                (cardIndex === index ? "true" : "false")
              }>
              {"nonUser" in card ? (
                <Icon
                  name={
                    card.nonUser === "clan"
                      ? "shield-half-full"
                      : card.nonUser === "tools"
                      ? "hammer-screwdriver"
                      : "playlist-check"
                  }
                  style={{ height: 24 }}
                />
              ) : (
                <Image
                  style={{ height: 32, width: 32, margin: -4, borderRadius: 16 }}
                  source={{
                    uri: `https://munzee.global.ssl.fastly.net/images/avatars/ua${Number(
                      card.user_id
                    ).toString(36)}.png`,
                  }}
                />
              )}
            </Tabs.Tab>
          ))}
        </Tabs.Bar>
      </Tabs>
    </Box>
  );
}
