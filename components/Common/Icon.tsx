import React, { PropsWithChildren } from "react";
import { loadAsync } from "expo-font";
import { ImageStyle, StyleProp, StyleSheet, TextStyle, View, ViewStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, Icon as NativeBaseIcon } from "native-base";

async function loadIconFont() {
  for (let i = 0; i < 5; i++) {
    try {
      return await loadAsync(MaterialCommunityIcons.font);
    } catch (e) {}
  }
  return false;
}
const iconLoadedRef = { iconLoaded: 0 };
const iconLoaded = loadIconFont();
iconLoaded.then(() => (iconLoadedRef.iconLoaded = 1)).catch(() => (iconLoadedRef.iconLoaded = 2));

function TextWrapper({children, colorBlank}: PropsWithChildren<{colorBlank: boolean}>) {
  if (colorBlank) {
    return <>{children}</>;
  }
  return <Text>{children}</Text>;
}

export type IconName = keyof typeof MaterialCommunityIcons.glyphMap;
export default React.memo(function Icon({
  name,
  style,
  colorBlank,
}: {
  name?: IconName;
  style?: StyleProp<Partial<ImageStyle> & Partial<TextStyle> & Partial<ViewStyle>>;
  colorBlank?: boolean;
}) {
  const { height, marginHorizontal, ...iconStyle } = StyleSheet.flatten(style);
  const [loaded, setLoaded] = React.useState(iconLoadedRef.iconLoaded);
  React.useEffect(() => {
    const unloadedRef = { value: false };
    if (!loaded) {
      (async function () {
        try {
          await iconLoaded;
          if (!unloadedRef.value) {
            setLoaded(1);
          }
        } catch (e) {
          if (!unloadedRef.value) {
            setLoaded(2);
          }
        }
      })();
    }
    return () => {
      unloadedRef.value = true;
    };
  });
  return (
    <View style={{ height }}>
      {loaded === 2 ? (
        <Text
          style={{
            width: Number(height) + 16,
            height,
            fontSize: Number(height),
            textAlign: "center",
          }}>
          ?
        </Text>
      ) : loaded === 1 ? (
        <TextWrapper colorBlank={!!colorBlank}>
          <NativeBaseIcon
            as={
              <MaterialCommunityIcons
                name={name}
                size={Number(height)}
                style={[
                  iconStyle,
                  {
                    marginHorizontal: marginHorizontal === 10 ? 2 : marginHorizontal,
                  },
                ]}
              />
            }
          />
        </TextWrapper>
      ) : (
        <View style={{ width: Number(height) + 16, height }} />
      )}
    </View>
  );
});
