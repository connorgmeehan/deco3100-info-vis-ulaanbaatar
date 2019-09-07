import GraphSegment, { GraphSegmentSettings } from './GraphSegment';
import Station from './Station';

export const SegmentManagerSettings = {
    maxHeight: 400,
    paddingTop: 0.3,
    paddingBottom: -0.25,
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
            const station = new Station(this.scene, this.events, md.location, md.filename, md.x, md.y);
            station.setScale(0);
            station.setVisible(false);
            this.stations.push(station);
        })
        const graphSegmentSettings = GraphSegmentSettings;
        graphSegmentSettings.segmentStepDistance = this.segmentStepDist;
        this.data.dataSegments.forEach((ds, i) => {
            const segment = new GraphSegment(this.scene, this.events, ds.utc, ds.temperature, graphSegmentSettings);
            this.data.metaData.forEach((station) => {
                segment.addPollutionBlob(station.location, ds.stations[station.location], station.x, station.y);
            });

            segment.setY(-i * this.segmentStepDist);

            this.segments.push(segment);
        });
    }

    update(progress) {
        console.log(progress);
        const offsetProgress = progress - this.settings.paddingTop;
        const { segmentStepDist, scrollMultiplier } = this;
        this.segments.forEach((segment, i) => {
            const y = -i * segmentStepDist + offsetProgress * scrollMultiplier;
            segment.setY(y);
        });
    }

    setScale(x, y, z) {
        this.stations.forEach((station) => {
            station.setScale(x, y, z);
        })
    }

    setVisible(visible) {
        this.stations.forEach((station) => {
            station.setVisible(visible);
        })
    }

    setOpacityOnSegments(opacity) {
        this.segments.forEach((segment) => {
            segment.setOpacityWithTransition(opacity);
        })
    }

    showBlobsAsGraph() {
        console.log('showBlobsAsGraph')
        const newPositions = [];
        const lineDistance = 15;
        const offset = -this.data.metaData.length / 2;
        this.data.metaData.forEach((station, i) => {
            newPositions.push({ name: station.location, x: (offset + i) * lineDistance, z: 0 });
            const stationObject = this.stations.find(obj => obj.name === station.location);
            stationObject.tweenToPosition((offset + i) * lineDistance, 1, 0);
        });

        this.segments.forEach((segment, i) => {
            setTimeout(() => {
                newPositions.forEach((station) => {
                    segment.updatePollutionBlobPosition(station.name, station.x, station.z);
                })
            }, (this.segments.length - i) * 50)
        });
    }

    showBlobsOnMap() {
        console.log('showBlobsOnMap')
        const newPositions = [];
        this.data.metaData.forEach((station) => {
            newPositions.push({ name: station.location, x: station.x, z: station.y });
            const stationObject = this.stations.find(obj => obj.name === station.location);
            stationObject.tweenToPosition(station.x, 1, station.y);
        });

        this.segments.forEach((segment, i) => {
            setTimeout(() => {
                newPositions.forEach((station) => {
                    segment.updatePollutionBlobPosition(station.name, station.x, station.z);
                })
            }, (this.segments.length - i) * 50)
        });
    }

    getTotalBlobHeight() {
        return this.settings.maxHeight;
    }
}
