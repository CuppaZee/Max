import React from "react";
import { Image } from "react-native";
import { useQuery } from "react-query";
import useSearch from "../../hooks/useSearch";
import { Box, Column, FlatList, Heading, HStack, Input, Text, Pressable } from "native-base";

interface MapSearchModalProps {
  select: (location: { latitude: number; longitude: number; bbox?: [number, number, number, number] }) => void;
}

export function MapSearchModal({ select }: MapSearchModalProps) {
  const [value, search, onValue] = useSearch(500);
  const query = useQuery(["mapSearch", search], async () => {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        search
      )}.json?access_token=pk.eyJ1Ijoic29oY2FoIiwiYSI6ImNqeWVqcm8wdTAxc2MzaXFpa282Yzd2aHEifQ.afYbt2sVMZ-kbwdx5_PekQ`
    );
    return await response.json();
  })
  return (
    <Box bg="regularGray.300" _dark={{ bg: "regularGray.700" }} borderRadius={8}>
      <Column space={2} p={2}>
        <Box>
          <Heading mb={1} size="md">
            Search
          </Heading>
          <Input value={value} onChangeText={onValue} />
        </Box>

        <FlatList
          style={{
            height: 400,
            width: 300,
            margin: 4,
            borderRadius: 8,
            maxWidth: "100%",
            flexShrink: 1,
          }}
          data={query.data?.features ?? []}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                select({
                  latitude: item.center[1],
                  longitude: item.center[0],
                  bbox: item.bbox,
                })
              }>
              <HStack p={1}>
                <Box flex={1}>
                  <Heading fontSize="md">{item.text}</Heading>
                  <Text fontSize="sm">
                    {item.context?.map((i: any) => i.text).join(", ")}
                  </Text>
                </Box>
              </HStack>
            </Pressable>
          )}
        />
      </Column>
    </Box>
  );
}
