import * as THREE from 'three';
import GraphSegment from './DataSegment';
import Station from './Station';

export const SegmentManagerSettings = {
    maxHeight: 400,
    paddingTop: 0.05,
    paddingBottom: 0.05,
}

export default class SegmentManager {
    constructor(scene, camera, events, data, settings = SegmentManagerSettings) {
        this.scene = scene;
        this.camera = camera;
        this.events = events;

        console.log(data);
        this.data = data;
        this.data.length = data.dataSegments.length;
        this.settings = settings;

        this.segmentStepDist = this.settings.maxHeight / this.data.length;
        this.scrollMultiplier = this.settings.maxHeight / (1.0 - settings.paddingBottom - settings.paddingTop);

        this.init();
    }

    init() {
        this.stations = [];
        this.segments = [];

        this.data.metaData.forEach((md) => {
            const station = new Station(this.scene, this.events, md.location, md.x, md.y);
            this.stations.push(station);
        })

        this.data.dataSegments.forEach((ds, i) => {
            const segment = new GraphSegment(this.scene, this.events, ds.utc, ds.temperature);

            this.data.metaData.forEach((station) => {
                segment.addStationBlob(station.location, ds.stations[station.location], station.x, station.y);
            });

            segment.setY(-i * this.settings.segmentStepDistance);

            this.segments.push(segment);
        });
    }

    update(progress) {
        const { segmentStepDist, scrollMultiplier } = this;
        this.segments.forEach((segment, i) => {
            const y = -i * segmentStepDist + progress * scrollMultiplier;
            console.log(y);
            segment.setY(y);
        });
    }
}
