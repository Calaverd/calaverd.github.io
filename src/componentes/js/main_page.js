import { Component, render } from "preact";
import { html } from 'htm/preact';

globalThis.resetIdiom = () => {
  let doc = globalThis.document;
  let idiom = getUseIdiom();
}

globalThis.resetIdiom();

/** A function that takes the position o a grid, and transforms it into
 * a isometric position on the screen. */
const gridToIsoPos = (x,y, x_offset, y_offset)=>( {x: (x-y) * x_offset, y: (x+y) * y_offset} )

// Utility functions to handle 1d array as a 2d matrix.
const posToIndex = (x,y, size_x)=>(size_x*y + x);
const indexToPos = (index, size_x)=> ({x: index%size_x, y: Math.floor(index/size_x)});

/** This function transform the position of tile given in the grid
 * into someting that can be show in the screen */
function tileScreenPos(x,y,z=0){
  const tileCenter = 8;
  const layerOffset = 10 * z
  return {...gridToIsoPos( x, y-layerOffset, 16, tileCenter), z}
}

/** This function takes the list of tiles, and determines
 * the order in witch each tile will start their animation, so
 * it can apaear that they start from top to bottom.
 * start is the point from were the animation will "grow" */
function createTileMapPattern(items, start, size_x) {

  let queue = [ {...start, level:1} ];
  let explored = { [posToIndex(start.x, start.y, size_x)] : 1 };
  let maxLevel = 1;

  const addToQueue = (x,y, level) =>{
    const index = posToIndex(x,y, size_x);
    if ( explored[index] === undefined && items[index] !== undefined ) {
      maxLevel = Math.max(maxLevel, level);
      explored[index] = level;
      items[index].anim = level;
      queue.push( {x,y,level} ); 
    }
  }

  const patternPlus = (px,py, level) => {
    addToQueue(  Math.max(px-1,0), py  , level +1 )
    //addToQueue(  Math.max(px-1,0), py+1  , level +1 )
    //addToQueue(  Math.max(px-1,0), Math.max(py-1,0), level +1)

    addToQueue(  px, Math.max(py-1,0), level +1)
    addToQueue(  px, py+1, level +1)

    addToQueue(  px+1  , py, level +1)
    //addToQueue(  px+1  , py+1, level +1)
    //addToQueue(  px+1  , Math.max(py-1,0), level +1)
  }

  while (queue.length > 0){
    const {x,y,level} = queue.shift();
    patternPlus(x,y,level);
  }

  return maxLevel;
}

const MapLayer1 = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
  2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
  2, 2, 2, 2, 2, 5, 3, 3, 3, 3, 7, 2, 2, 2, 2,
  2, 2, 2, 2, 2, 4, 2, 2, 2, 1, 8, 3, 3, 3, 3,
  3, 3, 3, 3, 3, 6, 2, 2, 2, 1, 1, 1, 1, 1, 2,
  2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1,
  2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1,
  3, 3, 7, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1,
  2, 2, 8, 3, 7, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1,
  2, 2, 2, 2, 4, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1,
  2, 2, 2, 2, 4, 2, 2, 1, 1, 1, 1, 2, 1, 1, 1,
  2, 2, 2, 2, 4, 2, 2, 1, 1, 1, 2, 1, 1, 1, 1,
  2, 2, 2, 2, 4, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1,
  2, 2, 2, 2, 4, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1,
  2, 2, 2, 2, 4, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1];

const Buildings = [
    {tile:2,x:0,y:0},
    {tile:3,x:4,y:0},
    {tile:3,x:8,y:0},
    {tile:3,x:12,y:0},
    {tile:2,x:14,y:0},
    {tile:3,x:0,y:1},
    {tile:2,x:11,y:1},
    {tile:1,x:0,y:2},
    {tile:1,x:3,y:2},
    {tile:3,x:0,y:5},
    {tile:2,x:7,y:6},
    {tile:2,x:0,y:8},
    {tile:1,x:6,y:8},
    {tile:1,x:1,y:10},
    {tile:3,x:5,y:13},
    {tile:1,x:1,y:14}
  ];

// List of the tiles and buildings imge urls to use.

const tileset = [
  new URL('../../rsc/index_tilemap/ocean.gif', import.meta.url).toString(),
  new URL('../../rsc/index_tilemap/tile_grass.png', import.meta.url).toString(),
  new URL('../../rsc/index_tilemap/road_a.png', import.meta.url).toString(),
  new URL('../../rsc/index_tilemap/road_b.png', import.meta.url).toString(),
  new URL('../../rsc/index_tilemap/road_c.png', import.meta.url).toString(),
  new URL('../../rsc/index_tilemap/road_d.png', import.meta.url).toString(),
  new URL('../../rsc/index_tilemap/road_e.png', import.meta.url).toString(),
  new URL('../../rsc/index_tilemap/road_f.png', import.meta.url).toString(),
]

const typeBuildings = [
  [new URL('../../rsc/index_tilemap/building_a.gif', import.meta.url).toString(), 'a'],
  [new URL('../../rsc/index_tilemap/building_b.gif', import.meta.url).toString(), 'b'],
  [new URL('../../rsc/index_tilemap/building_c.gif', import.meta.url).toString(), 'c']
];

class IsoMap extends Component {
  constructor() {
    super();
    this.state = {
      is_active: false,
      is_closing: false
    }

    this.tileMap = MapLayer1.map( (tile, index)=>{
      const {x,y} = indexToPos(index, 15);
      return {tile:tileset[tile-1], ...tileScreenPos(x,y)};
    });

    this.buildAnimOrder = createTileMapPattern(this.tileMap, {x:0,y:0}, 15);
    
    this.buildings =  Buildings
      .map( ({tile, x, y})=>{
        const [url, type] = typeBuildings[tile-1];
        return  {url, type, ...tileScreenPos(x,y) }
        })
      .sort( (a,b)=>a.y-b.y );
  }

  render() {
    const calcStyle = (data,anim) => `left:${data.x}px; top:${data.y}px; --animation-order:${anim || data.anim}; z-index:${data.z}`;
    return html`
    ${this.tileMap.map((tileData,index)=>html`
     <img class="iso tile" src="${tileData.tile}" aria-hidden="true" 
          style="${calcStyle(tileData)}">
     </img>
    `)}
    ${this.buildings.map((build,index)=>html`
      <img class="iso building ${build.type}" src="${build.url}" aria-hidden="true" 
            style="${calcStyle(build, this.buildAnimOrder+index+1 )}">
      </img>`
    )}
    <img class="iso dino" src="${new URL('../../rsc/index_tilemap/dino2.gif', import.meta.url)}" aria-hidden="true" 
            style="${calcStyle(tileScreenPos(4,8), this.buildAnimOrder+this.buildings.length+1 )}">
    </img>`
  }
}


render(html`<${IsoMap} />`, document.getElementById("map-container"));

