import clamp from 'clamp';
import GraphSegment, { GraphSegmentSettings } from './GraphSegment';
import Station from './Station';

export const SegmentManagerSettings = {
    maxHeight: 400,
    paddingTop: 0.1,
    paddingBottom: -0.0,
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
        // Init stations
        this.stations = [];
        this.data.metaData.forEach((md) => {
            const station = new Station(this.scene, this.events, md.location, md.filename, md.x, md.y);
            station.setScale(0);
            station.setVisible(false);
            this.stations.push(station);
        });

        // Init segments
        this.segments = [];
        const graphSegmentSettings = GraphSegmentSettings;
        graphSegmentSettings.segmentStepDistance = this.segmentStepDist;
        this.data.dataSegments.forEach((ds, i) => {
            const segment = new GraphSegment(this.scene, this.events, ds.utc, ds.temperature, graphSegmentSettings);
            segment.setY(-i * this.segmentStepDist);
            this.data.metaData.forEach((station) => {
                segment.addPollutionBlob(station.location, ds.stations[station.location], station.x, station.y);
            });
            if (ds.text) {
                segment.addSegmentTextDisk(ds.text);
            }
            this.segments.push(segment);
        });
    }

    update(progress) {
        const offsetProgress = clamp(progress - this.settings.paddingTop, 0, 1.0 - this.settings.paddingTop);
        const { segmentStepDist, scrollMultiplier } = this;
        this.segments.forEach((segment, i) => {
            const y = -i * segmentStepDist + offsetProgress * scrollMultiplier;
            segment.setY(y);
        });
    }


    showBlobsAsGraph() {
        console.log('showBlobsAsGraph')
        const newPositions = [];
        const lineDistance = 50;
        const offset = -((this.data.metaData.length - 1) / 2) * lineDistance;
        this.data.metaData.forEach((station, i) => {
            const newX = (offset) + i * lineDistance;
            newPositions.push({ name: station.location, x: newX, z: 0 });
            const stationObject = this.stations.find(obj => obj.name === station.location);
            stationObject.tweenToPosition(newX, 1, 0);
        });
        this.segments.forEach((s) => {
            if (s.textDisk) {
                s.textDisk.animateTextPosition(offset * 1.25, 0, 0);
                s.textDisk.animateTextSize(7);
            }
        })
        this.mapBlobsToNewPosition(newPositions);
    }

    showBlobsOnMap() {
        console.log('showBlobsOnMap')
        const newPositions = [];
        console.log(this.data.metaData);
        this.data.metaData.forEach((station) => {
            newPositions.push({ name: station.location, x: station.x, z: station.y });
            const stationObject = this.stations.find(obj => obj.name === station.location);
            stationObject.tweenToPosition(station.x, 1, station.y);
        });
        this.segments.forEach((s) => {
            if (s.textDisk) {
                s.textDisk.setTextPositionToDefault();
                s.textDisk.setTextSizeToDefault();
            }
        })
        this.mapBlobsToNewPosition(newPositions);
    }

    mapBlobsToNewPosition(newPositions) {
        this.segments.forEach((segment, i) => {
            setTimeout(() => {
                newPositions.forEach((station) => {
                    segment.updatePollutionBlobPosition(station.name, station.x, station.z);
                })
            }, (this.segments.length - i) * 50)
        });
    }
    setVisibleOnStations = visible => this.stations.forEach((station) => { station.setVisible(visible); });
    setOpacityOnStations = opacity => this.stations.forEach((station) => { station.setOpacity(opacity); });
    setScaleOnStations = (x, y, z) => this.stations.forEach((station) => { station.setScale(x, y, z); });
    setVisibleOnTextDisksCircle = visible => this.segments.forEach((s) => { s.setTextCircleVisible(visible) });
    setScaleOnTextDisks = (x, y, z) => this.segments.forEach((s) => { s.setTextScale(x, y, z) });
    showStationsText = (visible) => {
        console.log(visible)
        this.stations.forEach((s) => { s.showText(visible) })
    };
    getTotalBlobHeight = () => this.settings.maxHeight;

    animateOpacityOnBlobs = opacity => this.segments.forEach((segment) => { segment.animateOpacityOnBlobs(opacity); });
    animateScaleOnStations = (x, y, z) => this.stations.forEach((station) => { station.animateScale(x, y, z); });
    animateScaleOnTextDiskCircles = (x, y, z) => this.segments.forEach(s => s.animateScaleOnTextDiskCircle(x, y, z));
}
