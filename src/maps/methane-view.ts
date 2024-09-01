import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";

export async function createMethaneLayer(): Promise<FeatureLayer> {
    const csvString = await (await fetch('/assets/Methane_Permits.csv')).text()

    const rows = csvString.split("\n");
    const columns = rows.splice(0, 1); //remove header row
    const data: VOCData[] = [];
    rows.forEach(row => {
        const cols = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)
        if (cols) {
            try {
                let attributes = {
                    x: parseFloat(cols[0]),
                    y: parseFloat(cols[1]),
                    objectId: parseInt(cols[2]),
                    company: cols[3],
                    facility: cols[4],
                    permitType: cols[5],
                    vocTonsYear: parseFloat(cols[6]),
                    methane75Voc: parseFloat(cols[7]),
                    latitude: parseFloat(cols[8]),
                    longitude: parseFloat(cols[9])
                };
                if (attributes => attributes.latitude && attributes.longitude && attributes.vocTonsYear && attributes.methane75Voc)
                    data.push(attributes);
            } catch (e) {
                console.log('failed to parse row ', e, cols);
            }
        }
    });

    console.log(data);

    const graphics = data.map((obj) => {
        return new Graphic({
            geometry: new Point({
                latitude: obj.latitude,
                longitude: obj.longitude
            }),
            attributes: obj,
        })
    });

    return new FeatureLayer({
        source: graphics,
        title: 'VOC tons per Year',
        legendEnabled: true,
        popupEnabled: true,
        popupTemplate: {
            title: '{company}',
            content: '{vocTonsYear} VOC tons with {permitType} permit'
        },
        fields: [
            {
                name: 'objectId',
                alias: 'ObjectId',
                type: 'oid'
            },
            {
                name: 'company',
                alias: 'Company',
                type: 'string'
            },
            {
                name: 'facility',
                alias: 'Facility',
                type: 'string'
            },
            {
                name: 'permitType',
                alias: 'Permit Type',
                type: 'string'
            },
            {
                name: 'vocTonsYear',
                alias: 'Voc Tons per Year',
                type: 'double'
            },
            {
                name: 'methane75Voc',
                alias: 'Methane 75 VOC',
                type: 'double'
            }
        ],
        objectIdField: 'objectId',
        renderer: new SimpleRenderer({
            symbol: new SimpleMarkerSymbol({
                outline: {
                    width: 0.5,
                    color: 'light-gray'
                }
            }),
            visualVariables: [{
                type: 'size',
                field: 'vocTonsYear',
                legendOptions: {
                    title: 'VOC Tons per '
                },
                stops: [
                    {value: 1, size: 1, label: '>1 tons'},
                    {value: 50, size: 5, label: '>50 tons'},
                    {value: 100, size: 10, label: '>100 tons'}
                ]
            },
                {
                type: 'color',
                field: 'methane75Voc',
                legendOptions: {
                    showLegend: true,
                    title: 'Methane 75% VOC'
                }, stops: [
                    {
                        value: 1,
                        color: [0, 40, 255],
                        label: '1'
                    },
                    {
                        value: 80,
                        color: [150, 10, 10],
                        label: '80'
                    },
                    {
                        value: 100,
                        color: [50, 0, 0],
                        label: '> 100'
                    }
                ]
            }
            ],
        })
    });
}

interface VOCData {
    x: Number,
    y: Number,
    objectId: Number,
    company: String,
    facility: String,
    permitType: String,
    vocTonsYear: Number,
    methane75Voc: Number,
    latitude: Number,
    longitude: Number
}