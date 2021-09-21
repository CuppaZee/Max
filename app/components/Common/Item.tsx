import {
  useLinkBuilder,
  useLinkProps,
  useLinkTo,
  useNavigation,
  useNavigationState,
} from "@react-navigation/native";
import { Box, Heading, HStack, Image, Link, Pressable, VStack } from "native-base";
import React, { useCallback, useMemo } from "react";
import { NavProp } from "../../navigation";
import { RootStackParamList } from "../../types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Icon from "./Icon";
import TypeImage from "./TypeImage";
import { Platform } from "react-native";

export interface ItemProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  image?: string;
  typeImage?: string;
  imageRounded?: boolean;
  link: [name: keyof RootStackParamList, params?: any];
  checkMatch?: boolean;
  chevron?: boolean;
  navMethod?: "push" | "reset";
  collapsed?: boolean;
}

function checkMatch([aa, [name, params]]: [any, [name: any, params?: any]]) {
  const a = aa?.state?.routes?.[aa?.state?.index ?? 0] ?? aa;
  let x = a.name === name;
  for (const key in params ?? {}) {
    x = x && a.params?.[key] === params[key];
  }
  return x;
}

export function Item(props: ItemProps) {
  const buildLink = useLinkBuilder();
  const link = buildLink(props.link[0], props.link[1]);
  const nav = useNavigation<NavProp>();
  const state = useNavigationState(state => state?.routes?.[(state?.routes?.length ?? 0) - 1]);
  const matches = props.checkMatch && checkMatch([state ?? {}, props.link]);
  return useMemo(
    () => (
      <Link
        // @ts-expect-error
        onClick={ev => {
          ev?.preventDefault?.();
          if (props.navMethod === "reset" && Platform.OS !== "web") {
            nav.reset({
              routes: [
                {
                  name: props.link[0],
                  params: props.link[1],
                },
              ],
            });
          } else {
            nav.navigate(props.link[0], props.link[1]);
          }
        }}
        onPress={() => {
          if (props.navMethod === "reset") {
            nav.reset({
              routes: [
                {
                  name: props.link[0],
                  params: props.link[1],
                },
              ],
            });
          } else {
            nav.push(props.link[0], props.link[1]);
          }
        }}
        _hover={{ opacity: 0.8 }}
        bg={matches ? "blue.500" : undefined}
        borderRadius={4}
        href={Platform.OS === "web" ? (props.link as any) : undefined}>
        <HStack w="100%" alignItems="center" space={3} p={2}>
          {!!props.icon && (
            <Icon
              name={props.icon}
              style={[{ height: 24, width: 24 }, matches ? { color: "white" } : undefined]}
            />
          )}
          {!!props.image && (
            <Image
              source={{ uri: props.image }}
              alt={props.title}
              style={{
                height: 32,
                width: 32,
                maxWidth: 100,
                margin: -4,
                borderRadius: props.imageRounded ? 16 : 0,
              }}
            />
          )}
          {!!props.typeImage && (
            <TypeImage
              icon={props.typeImage}
              style={{
                size: 32,
                margin: -4,
                borderRadius: props.imageRounded ? 16 : 0,
              }}
            />
          )}
          {!props.collapsed && (
            <Box flex={1}>
              <Heading numberOfLines={1} color={matches ? "white" : undefined} fontSize="md">
                {props.title}
              </Heading>
              {!!props.subtitle && (
                <Heading numberOfLines={1} color={matches ? "white" : undefined} fontSize="sm">
                  {props.subtitle}
                </Heading>
              )}
            </Box>
          )}
          {!!props.chevron && !props.collapsed && (
            <Icon
              name="chevron-right"
              style={[{ height: 24, width: 24 }, matches ? { color: "white" } : undefined]}
            />
          )}
        </HStack>
      </Link>
    ),
    [link, matches, props.collapsed]
  );
}

export function TabItem(props: ItemProps) {
  const buildLink = useLinkBuilder();
  const link = buildLink(props.link[0], props.link[1]);
  const nav = useNavigation<any>();
  const state = useNavigationState(state => state?.routes?.[(state?.routes?.length ?? 0) - 1]);
  const matches = props.checkMatch && checkMatch([state ?? {}, props.link]);
  const n = useCallback(() => {
    if (props.navMethod === "reset" && Platform.OS !== "web") {
      nav.reset({
        routes: [
          {
            name: "__root",
            state: {
              routes: [
                {
                  name: props.link[0],
                  params: props.link[1],
                },
              ],
            },
          },
        ],
      });
    } else {
      nav.navigate(props.link[0], props.link[1]);
    }
  }, [link]);
  return useMemo(
    () => (
      <Pressable
        flex={1}
        // @ts-expect-error
        onClick={ev => {
          ev?.preventDefault?.();
          n();
        }}
        onPress={n}
        _hover={{ opacity: 0.8 }}
        bg={matches ? "blue.500" : "regularGray.200"}
        _dark={{ bg: matches ? "blue.500" : "regularGray.800" }}
        href={Platform.OS === "web" ? link : undefined}>
        <VStack flex={1} justifyContent="center" alignItems="center" space={1}>
          {!!props.icon && (
            <Icon
              name={props.icon}
              style={[{ height: 24, width: 24 }, matches ? { color: "white" } : undefined]}
            />
          )}
          {!!props.image && (
            <Image
              source={{ uri: props.image }}
              alt={props.title}
              style={{
                height: 32,
                width: 32,
                maxWidth: 100,
                margin: -4,
                borderRadius: props.imageRounded ? 16 : 0,
              }}
            />
          )}
          {!!props.typeImage && (
            <TypeImage
              icon={props.typeImage}
              style={{
                size: 32,
                margin: -4,
                borderRadius: props.imageRounded ? 16 : 0,
              }}
            />
          )}
          <Heading numberOfLines={1} color={matches ? "white" : undefined} fontSize="sm">
            {props.title}
          </Heading>
        </VStack>
      </Pressable>
    ),
    [link, matches]
  );
}
