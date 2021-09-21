import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  getPathFromState,
} from "@react-navigation/native";
import * as React from "react";
import * as Notifications from "expo-notifications";
import { ColorSchemeName, Platform } from "react-native";

import SomewhereWithoutCoffeeScreen from "../screens/SomewhereWithoutCoffee";
import { RootStackParamList, WrapperStackParamList } from "../types";
import LinkingConfiguration from "./LinkingConfiguration";
import * as Analytics from "expo-firebase-analytics";
import lazy from "../components/lazy";
import Sidebar from "./Sidebar";
import { Box, HStack, useColorModeValue, useToken, VStack } from "native-base";
import { createNativeStackNavigator, NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HeaderTitle, LoadIcon } from "./Header";
import Tabs from "./Tabs";

// Clan
const ClanStatsScreen = lazy(() => import("../screens/Clan/Stats"));
const ClanBookmarksScreen = lazy(() => import("../screens/Clan/Bookmarks"));
const ClanRequirementsScreen = lazy(() => import("../screens/Clan/Requirements"));
const CuppaManagerScreen = lazy(() => import("../screens/Clan/CuppaManager"));

// User
const PlayerProfileScreen = lazy(() => import("../screens/User/Profile"));
const PlayerActivityScreen = lazy(() => import("../screens/User/Activity"));
const PlayerInventoryScreen = lazy(() => import("../screens/User/Inventory"));
const PlayerZeeOpsScreen = lazy(() => import("../screens/User/ZeeOps"));
const PlayerChallengesScreen = lazy(() => import("../screens/User/Challenges"));
const PlayerChallengeScreen = lazy(() => import("../screens/User/Challenge"));
const PlayerCapturesScreen = lazy(() => import("../screens/User/Captures"));
const PlayerBouncersScreen = lazy(() => import("../screens/User/Bouncers"));
const PlayerClanScreen = lazy(() => import("../screens/User/Clan"));
const PlayerQRewScreen = lazy(() => import("../screens/User/QRew"));
const PlayerCubimalsScreen = lazy(() => import("../screens/User/Cubimals"));
const PlayerQRatesScreen = lazy(() => import("../screens/User/QRates"));
const PlayerRoomsScreen = lazy(() => import("../screens/User/Rooms"));
const PlayerLotterZeeScreen = lazy(() => import("../screens/User/LotterZee"));

// Settings
const PersonalisationScreen = lazy(() => import("../screens/Settings/Personalisation"));
const AccountsScreen = lazy(() => import("../screens/Settings/Accounts"));
const NotificationScreen = lazy(() => import("../screens/Settings/Notifications"));
const BookmarksScreen = lazy(() => import("../screens/Settings/Bookmarks"));

// Tools
const SearchScreen = lazy(() => import("../screens/Tools/Search"));
const CalendarScreen = lazy(() => import("../screens/Tools/Calendar"));
const CreditsScreen = lazy(() => import("../screens/Tools/Credits"));
const TestScanScreen = lazy(() => import("../screens/Tools/TestScan"));
const OpenSourceScreen = lazy(() => import("../screens/Tools/OpenSource"));
const BouncersScreen = lazy(() => import("../screens/Tools/Bouncers"));
const BouncersExpiringScreen = lazy(() => import("../screens/Tools/BouncersExpiring"));
const BouncersMapScreen = lazy(() => import("../screens/Tools/BouncersMap"));
const NearbyScreen = lazy(() => import("../screens/Tools/Nearby"));
const DonateScreen = lazy(() => import("../screens/Tools/Donate"));
const POIPlannerScreen = lazy(() => import("../screens/Tools/POIPlanner"));
const DestinationPlannerScreen = lazy(() => import("../screens/Tools/DestinationPlanner"));
const EvoPlannerScreen = lazy(() => import("../screens/Tools/EvoPlanner"));
const MunzeeScreen = lazy(() => import("../screens/Tools/Munzee"));
const TypeCategoryScreen = lazy(() => import("../screens/Tools/Types/Category"));
const TypeMunzeeScreen = lazy(() => import("../screens/Tools/Types/Type"));
const ActivityWidgetScreen = lazy(() => import("../screens/Tools/WidgetConfigure/ActivityWidget"));
const UniversalScreen = lazy(() => import("../screens/Tools/Universal"));
const BlastScreen = lazy(() => import("../screens/Tools/Blast"));

const WelcomeScreen = lazy(() => import("../screens/Welcome"));

export type NavProp<T extends keyof RootStackParamList = keyof RootStackParamList> =
  NativeStackNavigationProp<RootStackParamList, T>;

// If you are not familiar with React Navigation, we recommend going through the
// "Fundamentals" guide: https://reactnavigation.org/docs/getting-started
export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  const lastNotificationResponse = Notifications.useLastNotificationResponse();
  const LinkingConfig = React.useMemo(
    () => LinkingConfiguration(lastNotificationResponse || undefined),
    [lastNotificationResponse]
  );
  console.log("nav");
  return (
    <NavigationContainer
      linking={LinkingConfig}
      onStateChange={state => {
        if (!state) return;
        const currentScreen = getPathFromState(state);
        Analytics.setCurrentScreen(currentScreen);
      }}
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <VStack flex={1}>
        <HStack flex={1}>
          <Sidebar />
          <Box flex={2}>
            <WrapperNavigator />
          </Box>
        </HStack>
        <Tabs />
      </VStack>
    </NavigationContainer>
  );
}

// A root stack navigator is often used for displaying modals on top of all other content
// Read more here: https://reactnavigation.org/docs/modal
const Wrapper = createNativeStackNavigator<WrapperStackParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function WrapperNavigator() {
  return (
    <Wrapper.Navigator screenOptions={{ animation: "none", headerShown: false }}>
      <Wrapper.Screen name="__root" getId={p => (p.params as any)?.id} component={RootNavigator} />
    </Wrapper.Navigator>
  );
}

function RootNavigator() {
  const darkToken = useToken("colors", "regularGray.800");
  const lightToken = useToken("colors", "regularGray.200");
  const token = useColorModeValue(lightToken, darkToken);
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: token + (Platform.OS === "ios" ? "88" : ""),
          // @ts-ignore
          height: 48,
        },
        headerTintColor: token === darkToken ? "#ffffff" : undefined,
        headerRight: () => <LoadIcon />,
        headerTransparent: true,
        headerBlurEffect: token === darkToken ? "dark" : "light",
        headerTitle: props => <HeaderTitle title={props.children} />,
      }}>
      <Stack.Screen name="Clan_Bookmarks" component={ClanBookmarksScreen} />
      <Stack.Screen name="Clan_Cuppa" component={CuppaManagerScreen} />
      <Stack.Screen name="Clan_Requirements" component={ClanRequirementsScreen} />
      <Stack.Screen
        getId={({ params }) => params?.clanid.toString()}
        name="Clan_Stats"
        component={ClanStatsScreen}
      />

      <Stack.Screen name="Player_Profile" component={PlayerProfileScreen} />
      <Stack.Screen
        getId={({ params }) => params.date}
        name="Player_Activity"
        component={PlayerActivityScreen}
      />
      <Stack.Screen name="Player_Inventory" component={PlayerInventoryScreen} />
      <Stack.Screen name="Player_ZeeOps" component={PlayerZeeOpsScreen} />
      <Stack.Screen name="Player_Bouncers" component={PlayerBouncersScreen} />
      <Stack.Screen
        getId={({ params }) => params.date}
        name="Player_Challenges"
        component={PlayerChallengesScreen}
      />
      <Stack.Screen
        getId={({ params }) => `${params.date}/${params.challenge}`}
        name="Player_Challenge"
        component={PlayerChallengeScreen}
      />
      <Stack.Screen
        getId={({ params }) => params.category}
        name="Player_Captures"
        component={PlayerCapturesScreen}
      />
      <Stack.Screen name="Player_ClanProgress" component={PlayerClanScreen} />
      <Stack.Screen name="Player_QRew" component={PlayerQRewScreen} />
      <Stack.Screen name="Player_Cubimals" component={PlayerCubimalsScreen} />
      <Stack.Screen name="Player_QRates" component={PlayerQRatesScreen} />
      <Stack.Screen name="Player_Rooms" component={PlayerRoomsScreen} />
      <Stack.Screen name="Player_LotterZee" component={PlayerLotterZeeScreen} />

      <Stack.Screen
        name="Tools_Search"
        component={SearchScreen}
      />

      <Stack.Screen name="Tools_Calendar" component={CalendarScreen} />
      <Stack.Screen name="Tools_EvoPlanner" component={EvoPlannerScreen} />
      <Stack.Screen name="Tools_TestScan" component={TestScanScreen} />
      <Stack.Screen name="Tools_Universal" component={UniversalScreen} />
      <Stack.Screen name="Tools_WidgetConfigureActivityWidget" component={ActivityWidgetScreen} />

      <Stack.Screen name="Tools_Bouncers" component={BouncersScreen} />
      <Stack.Screen name="Tools_BouncersExpiring" component={BouncersExpiringScreen} />
      <Stack.Screen name="Tools_Nearby" component={NearbyScreen} />
      <Stack.Screen name="Tools_BouncersMap" component={BouncersMapScreen} />

      <Stack.Screen name="Tools_Blast" component={BlastScreen} />
      <Stack.Screen name="Tools_POIPlanner" component={POIPlannerScreen} />
      <Stack.Screen name="Tools_DestinationPlanner" component={DestinationPlannerScreen} />

      <Stack.Screen
        getId={({ params }) => `${params.a}/${params.b}`}
        name="Tools_Munzee"
        component={MunzeeScreen}
      />

      <Stack.Screen
        getId={({ params }) => params.category}
        name="Tools_TypeCategory"
        component={TypeCategoryScreen}
      />
      <Stack.Screen
        getId={({ params }) => params.type}
        name="Tools_TypeMunzee"
        component={TypeMunzeeScreen}
      />

      <Stack.Screen name="Tools_Credits" component={CreditsScreen} />
      <Stack.Screen name="Tools_Donate" component={DonateScreen} />
      <Stack.Screen name="Tools_OpenSource" component={OpenSourceScreen} />

      <Stack.Screen name="Settings_Personalisation" component={PersonalisationScreen} />
      <Stack.Screen name="Settings_Accounts" component={AccountsScreen} />
      <Stack.Screen name="Settings_Notifications" component={NotificationScreen} />
      <Stack.Screen name="Settings_Bookmarks" component={BookmarksScreen} />

      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ title: "Welcome" }} />

      <Stack.Screen
        name="somewherewithoutcoffee"
        component={SomewhereWithoutCoffeeScreen}
        options={{ title: "Somewhere without Coffee" }}
      />
    </Stack.Navigator>
  );
}
