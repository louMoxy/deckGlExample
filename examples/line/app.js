/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGLOverlay from './deckgl-overlay.js';

import {json as requestJson} from 'd3-request';
import {csv as requestCsv} from 'd3-request';

// Set your mapbox token here
const MAPBOX_TOKEN ='pk.eyJ1IjoibG1veGhheSIsImEiOiJjajB0YzM0cXIwMDF6MzNtZHdyZ3J4anFhIn0.FSi3dh1eb4vVOGMtI9ONJA'; // eslint-disable-line

class Root extends Component {

  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        ...DeckGLOverlay.defaultViewport,
        width: 500,
        height: 500
      },
      flightPaths: null,
      airports: null,
      mapboxData: null,
      devonData: null
    };

    requestJson('./data/mapboxData.json', (error, response) => {
      if (!error) {
        this.setState({mapboxData: response});
      }
    });
    requestCsv('./data/devonTrafficData.csv', (error, response) => {
      if (!error) {
        const data = response.map(d => ({Coordinates : [Number(d['Lng']), Number(d['Lat'])], RoadCategory: d['RoadCategory'], LinkLengthMi: Number(d['LinkLengthMi'])}));
        this.setState({devonData: data});
      }
    });
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
  }

  _resize() {
    this._onViewportChange({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _onViewportChange(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport}
    });
  }

  render() {
    const {viewport, flightPaths, airports, mapboxData, devonData} = this.state;

    return (
      <MapGL
        {...viewport}
        mapStyle="mapbox://styles/mapbox/dark-v9"
        onViewportChange={this._onViewportChange.bind(this)}
        mapboxApiAccessToken={MAPBOX_TOKEN}>
        <DeckGLOverlay viewport={viewport}
          strokeWidth={3}
          flightPaths={flightPaths}
          mapboxData={mapboxData}
          airports={airports}
          devonData={devonData} />
      </MapGL>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
