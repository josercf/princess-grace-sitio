import { BLOCKING_TILES, type ParsedMap } from './parse';

export const TILE_SIZE = 16;
export const TILE_COUNT = 5;

export interface TiledMap {
  type: 'map';
  version: string;
  tiledversion: string;
  orientation: 'orthogonal';
  renderorder: 'right-down';
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  infinite: false;
  nextlayerid: number;
  nextobjectid: number;
  tilesets: {
    firstgid: number;
    name: string;
    image: string;
    imagewidth: number;
    imageheight: number;
    tilewidth: number;
    tileheight: number;
    tilecount: number;
    columns: number;
    margin: number;
    spacing: number;
    tiles: { id: number; properties: { name: string; type: 'bool'; value: boolean }[] }[];
  }[];
  layers: [
    { id: 1; name: 'ground'; type: 'tilelayer'; width: number; height: number; x: 0; y: 0; opacity: 1; visible: true; data: number[] },
    {
      id: 2;
      name: 'objects';
      type: 'objectgroup';
      x: 0;
      y: 0;
      opacity: 1;
      visible: true;
      draworder: 'topdown';
      objects: { id: number; name: string; type: string; x: number; y: number; width: number; height: number; rotation: 0; visible: true }[];
    },
  ];
}

export function toTiledJson(map: ParsedMap, tileset: { name: string; image: string }): TiledMap {
  return {
    type: 'map',
    version: '1.10',
    tiledversion: '1.10.2',
    orientation: 'orthogonal',
    renderorder: 'right-down',
    width: map.width,
    height: map.height,
    tilewidth: TILE_SIZE,
    tileheight: TILE_SIZE,
    infinite: false,
    nextlayerid: 3,
    nextobjectid: map.objects.length + 1,
    tilesets: [
      {
        firstgid: 1,
        name: tileset.name,
        image: tileset.image,
        imagewidth: TILE_SIZE * TILE_COUNT,
        imageheight: TILE_SIZE,
        tilewidth: TILE_SIZE,
        tileheight: TILE_SIZE,
        tilecount: TILE_COUNT,
        columns: TILE_COUNT,
        margin: 0,
        spacing: 0,
        tiles: [...BLOCKING_TILES].sort().map((id) => ({ id, properties: [{ name: 'blocked', type: 'bool', value: true }] })),
      },
    ],
    layers: [
      { id: 1, name: 'ground', type: 'tilelayer', width: map.width, height: map.height, x: 0, y: 0, opacity: 1, visible: true, data: map.ground.map((tile) => tile + 1) },
      {
        id: 2,
        name: 'objects',
        type: 'objectgroup',
        x: 0,
        y: 0,
        opacity: 1,
        visible: true,
        draworder: 'topdown',
        objects: map.objects.map((o, index) => ({
          id: index + 1,
          name: o.name,
          type: o.type,
          x: o.x * TILE_SIZE,
          y: o.y * TILE_SIZE,
          width: TILE_SIZE,
          height: TILE_SIZE,
          rotation: 0,
          visible: true,
        })),
      },
    ],
  };
}
