import { MapBoundingboxV4 } from "@cuppazee/api/map/v4";
import * as React from "react";
import { Pressable, View } from "react-native";
import TypeImage from "../../components/Common/TypeImage";
import useMunzeeRequest from "../../hooks/useMunzeeRequest";
import useTitle from "../../hooks/useTitle";
import * as Clipboard from "expo-clipboard";
import Icon from "../../components/Common/Icon";
import { AutoMap, Icons, Layer, Marker, Source } from "../../components/Map/Map";
import WebMercatorViewport from "viewport-mercator-project";
import circle from "@turf/circle";
import { getExpandedBounds } from "./DestinationPlanner";
import useDB from "../../hooks/useDB";
import { useHeaderHeight } from "@react-navigation/elements";
import { Box, Button, Heading } from "native-base";

export default function BouncersMapScreen() {
  const db = useDB();
  const [selected, setSelected] = React.useState<string>();
  const [markers, setMarkers] = React.useState<{ lat: number; lng: number; type: string }[]>([]);
  const [selectedMarker, setSelectedMarker] = React.useState<number>();
  const center = React.useRef<{ lat: number; lng: number }>();
  useTitle(`POI Planner`);
  const [location, setLocation] = React.useState<
    MapBoundingboxV4["request"]["params"]["points"]["main"]
  >();
  const types = useMunzeeRequest<any>("map/filters/v4", {});
  const pois: { id: string; image: string; name: string }[] | undefined | null = (types.data as any)
    ?.data[2].subcategories.Places.filters;

  const data = useMunzeeRequest(
    "map/boundingbox/v4",
    {
      filters: "13,14," + pois?.map(i => i.id).join(","),
      points: location
        ? {
            main: location,
          }
        : {},
      fields: "latitude,longitude,munzee_id,friendly_name,original_pin_image",
    },
    !!pois && !!location,
    undefined,
    undefined,
    { keepPreviousData: true }
  );

  const munzees = data.data?.data?.[0]?.munzees;

  const headerHeight = useHeaderHeight();

  return (
    <Box
      bg="regularGray.100"
      _dark={{ bg: "regularGray.900" }}
      style={{ flex: 1, paddingTop: headerHeight }}>
      {!location && (
        <Box
          bg="regularGray.200"
          _dark={{ bg: "regularGray.800" }}
          style={{
            padding: 4,
            flexDirection: "row",
            justifyContent: "center",
            flexWrap: "wrap",
            alignItems: "center",
          }}>
          <Heading fontSize="md">Zoom in to load Munzees</Heading>
        </Box>
      )}
      <AutoMap
        onPositionChange={viewport => {
          center.current = {
            lat: viewport.latitude,
            lng: viewport.longitude,
          };
        }}
        onPositionFinishChange={async viewport => {
          if (viewport.zoom > 10) {
            const bounds =
              (await viewport.getBounds?.()) ??
              new WebMercatorViewport(viewport as any).getBoundingRegion();
            setLocation(getExpandedBounds(bounds, 1.8));
          } else {
            setLocation(undefined);
          }
        }}>
        <Icons icons={pois?.map(i => db.strip(i.image.replace("v4pins", "pins"))) ?? []} />
        {!!munzees && (
          <Source
            id="existingDeploy"
            type="geojson"
            data={{
              type: "FeatureCollection",
              features: [
                ...munzees
                  .filter(i => !selected || selected === db.strip(i.original_pin_image ?? ""))
                  .map(i =>
                    circle(
                      [Number(i.longitude), Number(i.latitude)],
                      db.strip(i.original_pin_image ?? "") === "poivirtualgarden" ? 0.5 : 1,
                      {
                        units: "miles",
                        properties: { colour: "#ff0000" },
                      }
                    )
                  ),
                ...markers
                  .filter(i => !selected || selected === i.type)
                  .map(i =>
                    circle([i.lng, i.lat], i.type === "poivirtualgarden" ? 0.5 : 1, {
                      units: "miles",
                      properties: { colour: "#ffaa00" },
                    })
                  ),
              ],
            }}>
            <Layer
              id="existingDeployFill"
              type="fill"
              paint={{
                "fill-color": ["get", "colour"],
                "fill-opacity": 0.1,
              }}
            />
            <Layer
              id="existingDeployStroke"
              type="line"
              paint={{
                "line-color": ["get", "colour"],
              }}
            />
          </Source>
        )}
        {!!munzees && (
          <Source
            id="existingCapture"
            type="geojson"
            data={{
              type: "FeatureCollection",
              features: [
                ...munzees
                  .filter(i => !selected || selected === db.strip(i.original_pin_image ?? ""))
                  .map(i =>
                    circle(
                      [Number(i.longitude), Number(i.latitude)],
                      db.strip(i.original_pin_image ?? "") === "poiairport" ? 5280 : 1000,
                      {
                        units: "feet",
                        properties: { colour: "#00ff00" },
                      }
                    )
                  ),
                ...markers
                  .filter(i => !selected || selected === i.type)
                  .map(i =>
                    circle([i.lng, i.lat], i.type === "poiairport" ? 5280 : 1000, {
                      units: "feet",
                      properties: { colour: "#00ffaa" },
                    })
                  ),
              ],
            }}>
            <Layer
              id="existingCaptureFill"
              type="fill"
              paint={{
                "fill-color": ["get", "colour"],
                "fill-opacity": 0.1,
              }}
            />
            <Layer
              id="existingCaptureStroke"
              type="line"
              paint={{
                "line-color": ["get", "colour"],
              }}
            />
          </Source>
        )}
        {!!munzees && (
          <Source
            id="existingPins"
            type="geojson"
            data={{
              type: "FeatureCollection",
              features: munzees
                .filter(i => !selected || selected === db.strip(i.original_pin_image ?? ""))
                .map(i => ({
                  type: "Feature",
                  geometry: {
                    type: "Point",
                    coordinates: [Number(i.longitude), Number(i.latitude)],
                  },
                  id: i.munzee_id?.toString(),
                  properties: {
                    icon: db.strip(i.original_pin_image ?? ""),
                    munzee_id: i.munzee_id?.toString(),
                  },
                })),
            }}>
            <Layer
              id="existingPinsIcons"
              type="symbol"
              paint={{}}
              filter={["!", ["has", "point_count"]]}
              layout={{
                "icon-allow-overlap": true,
                "icon-anchor": "bottom",
                "icon-size": 0.8,
                "icon-image": ["get", "icon"],
              }}
            />
          </Source>
        )}
        {markers.map((i, n) => (
          <Marker
            id={`marker_${n}`}
            latitude={i.lat}
            longitude={i.lng}
            offsetLeft={-25.6}
            offsetTop={-51.2}
            draggable={true}
            onDragEnd={ev => {
              setMarkers(value =>
                value.map((i2, n2) =>
                  n2 === n
                    ? {
                        ...i2,
                        lat: ev.lngLat[1],
                        lng: ev.lngLat[0],
                      }
                    : i2
                )
              );
            }}
            onPress={() => {
              setSelectedMarker(n);
            }}>
            <Pressable
              onPress={() => {
                setSelectedMarker(n);
              }}>
              <TypeImage icon={i.type} style={{ size: 51.2 }} />
            </Pressable>
          </Marker>
        ))}
      </AutoMap>
      {selectedMarker !== undefined && markers[selectedMarker] && (
        <Box
          bg="regularGray.200"
          _dark={{ bg: "regularGray.800" }}
          style={{
            padding: 4,
            flexDirection: "row",
            justifyContent: "center",
            flexWrap: "wrap",
            alignItems: "center",
          }}>
          <Button
            variant="ghost"
            startIcon={<Icon name="close" style={{ height: 24, width: 24 }} />}
            color="danger.500"
            onPress={() => setMarkers(value => value.filter((_, n) => n !== selectedMarker))}
          />
          <Heading fontSize="md" style={{ flex: 1 }}>
            {markers[selectedMarker].lat} {markers[selectedMarker].lng}
          </Heading>
          <Button
            variant="ghost"
            startIcon={<Icon name="content-copy" style={{ height: 24, width: 24 }} />}
            onPress={() =>
              Clipboard.setString(`${markers[selectedMarker].lat} ${markers[selectedMarker].lng}`)
            }
          />
        </Box>
      )}
      <Box
        bg="regularGray.200"
        _dark={{ bg: "regularGray.800" }}
        style={{
          padding: 4,
          flexDirection: "row",
          alignItems: "center",
          flexWrap: "wrap",
        }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            flexWrap: "wrap",
            alignItems: "center",
            width: 400,
            flexGrow: 100,
            maxWidth: "100%",
          }}>
          {pois?.map(i => (
            <Pressable
              onPress={() => {
                if (selected === db.strip(i.image.replace("v4pins", "pins"))) {
                  setSelected(undefined);
                } else {
                  setSelected(db.strip(i.image.replace("v4pins", "pins")));
                }
              }}>
              <Box
                bg={
                  selected === db.strip(i.image.replace("v4pins", "pins"))
                    ? "regularGray.300"
                    : "regularGray.200"
                }
                _dark={{
                  bg:
                    selected === db.strip(i.image.replace("v4pins", "pins"))
                      ? "regularGray.700"
                      : "regularGray.800",
                }}
                style={{ borderRadius: 8, paddingVertical: 4 }}>
                <TypeImage
                  icon={i.image.replace("v4pins", "pins")}
                  style={{
                    size: 36,
                    opacity: munzees?.some(
                      m =>
                        db.strip(m.original_pin_image ?? "") ===
                        db.strip(i.image.replace("v4pins", "pins"))
                    )
                      ? 1
                      : 0.4,
                  }}
                />
              </Box>
            </Pressable>
          ))}
        </View>
        <Button
          style={{ flexGrow: 1 }}
          disabled={!selected}
          onPress={() => {
            if (!selected) return;
            setMarkers([
              ...markers,
              {
                lat: center.current?.lat ?? 0,
                lng: center.current?.lng ?? 0,
                type: selected,
              },
            ]);
          }}>
          Add Marker
        </Button>
      </Box>
    </Box>
  );
}
