import Map from "@arcgis/core/Map"
import MapView from "@arcgis/core/views/MapView";
import * as webMercatorUtils from "@arcgis/core/geometry/support/webMercatorUtils";
import {setArcgisAssetPath as setMapAssetPath} from '@arcgis/map-components/dist/components'
import esriConfig from "@arcgis/core/config"
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import Point from "@arcgis/core/geometry/Point";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import {createMethaneLayer} from "./methane-view.ts";
import Legend from "@arcgis/core/widgets/Legend";

setMapAssetPath("./assets");
esriConfig.assetsPath = "./assets";

export class MapViewer {
    private readonly map: Map;
    public readonly view: MapView;
    public readonly graphicsLayer: GraphicsLayer;
    private methaneLayer: FeatureLayer;
    private readonly legend: Legend;

    constructor(basemap: BASEMAP) {
        this.map = new Map({
            basemap: "dark-gray-vector"
        });

        this.view = new MapView({
            container: document.getElementById("map"),
            map: this.map,
            constraints: {
                rotationEnabled: false,
                snapToZoom: false,
                minZoom: 2
            },
            background: {
                color: [29, 34, 36]
            },
            center: new Point({
                latitude: 34.3727,
                longitude: -105.0324
            }),
            zoom: 6
        })

        this.legend = new Legend({
            view: this.view,
        })

        createMethaneLayer().then((layer) => {
            this.methaneLayer = layer;
            this.view.map.add(layer);

            this.view.when(v => {
               this.view.ui.add(this.legend, 'bottom-right')
            }).catch(err => console.log('failed to add legend', err));
        });

        this.graphicsLayer = new GraphicsLayer();
        this.view.map.add(this.graphicsLayer);



        this.bindVerticalMovement(this.view);
    }

    private bindVerticalMovement(view: MapView) {
        view.when(v => {
            const yMax = 20000000;
            const yMin = -20000000;

            view.watch('extent', (extent) => {
                if (extent.ymax >= yMax) {
                    view.goTo(webMercatorUtils.xyToLngLat(extent.center.x, yMax - ((extent.ymax - extent.ymin) / 2)), {duration: 0}).catch();
                } else if (extent.ymin <= yMin) {
                    view.goTo(webMercatorUtils.xyToLngLat(extent.center.x, yMin + ((extent.ymax - extent.ymin) / 2)), {duration: 0}).catch();
                }
            });

        }).catch(() => console.log("initialization failed"));
    }

}


export enum BASEMAP {
    SATELLITE = 'satellite',
    HYBRID = 'hybrid',
    OCEANS = 'oceans',
    OSM = 'osm',
    TERRAIN = 'terrain',
    DARK_GRAY = 'dark-gray',
    DARK_GRAY_VECTOR = 'dark-gray-vector',
    GRAY = 'gray',
    GRAY_VECTOR = 'gray-vector',
    STREETS = 'streets',
    STREETS_VECTOR = 'streets-vector',
    STREETS_NIGHT_VECTOR = 'streets-night-vector',
    STREETS_NAVIGATION_VECTOR = 'streets-navigation-vector',
    TOPO = 'topo',
    TOPO_VECTOR = 'topo-vector',
    STREETS_RELIEF_VECTOR = 'streets-relief-vector'
}
