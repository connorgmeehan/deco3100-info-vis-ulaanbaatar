import * as THREE from 'three';
import GraphSegment from './DataSegment';

export const SegmentManagerSettings = {
    segmentStepDistance: 2,
}

export default class SegmentManager {
    constructor(scene, camera, events, data, settings = SegmentManagerSettings) {
        this.scene = scene;
        this.camera = camera;
        this.events = events;

        this.data = data;
        this.settings = settings;

        this.segments = [];

        this.data.dataSegments.forEach((ds, i) => {
            const segment = new GraphSegment(this.scene, this.events, ds.utc, ds.temperature);

            this.data.metaData.forEach((station) => {
                segment.addStationBlob(station.location, ds.stations[station.location], station.x, station.y);
            });

            segment.setY(i * this.settings.segmentStepDistance);

            this.segments.push(segment);
        });
    }
}
