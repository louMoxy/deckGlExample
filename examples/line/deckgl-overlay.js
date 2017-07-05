import React, {Component} from 'react';
import {setParameters} from 'luma.gl';
import DeckGL, {LineLayer, ScatterplotLayer, HexagonLayer} from 'deck.gl';

function getColor(d) {
  if(d == 'TM') {
    return [1, 152, 189];
  }
  else if(d == 'PR') {
    return [73, 227, 206];
  }
  else if(d == 'TR') {
    return [216, 254, 181];
  } else {
    return [254, 173, 84];
  }
}

const elevationScale = {min: 1, max: 50};
function getSize(LinkLengthMi) {
  if (LinkLengthMi >= 3) {
    return 100;
  }
  if (LinkLengthMi >= 2) {
    return 80;
  }
  if (LinkLengthMi >= 1) {
    return 40;
  }
  return 20;
}

export default class DeckGLOverlay extends Component {
  static get defaultColorRange() {
    return colorRange;
  }

  static get defaultViewport() {
    return {
      latitude: 50.7184,
      longitude: -3.5339,
      zoom: 8,
      maxZoom: 16,
      pitch: 50,
      bearing: 0
    };
  }

  _initialize(gl) {
    setParameters(gl, {
      blendFunc: [gl.SRC_ALPHA, gl.ONE, gl.ONE_MINUS_DST_ALPHA, gl.ONE],
      blendEquation: gl.FUNC_ADD
    });
  }
  constructor(props) {
    super(props);
    this.startAnimationTimer = null;
    this.intervalTimer = null;
    this.state = {
      elevationScale: elevationScale.min
    };

    this._startAnimate = this._startAnimate.bind(this);
    this._animateHeight = this._animateHeight.bind(this);

  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.devonData.length !== this.props.devonData.length) {
      this._animate();
    }
  }

   componentDidMount() {
    this._animate();
  }

  componentWillUnmount() {
    this._stopAnimate();
  }

  _animate() {
    this._stopAnimate();
    // wait 3.5 secs to start animation so that all data are loaded
    this.startAnimationTimer = window.setTimeout(this._startAnimate, 3500);
  }

  _startAnimate() {
    this.intervalTimer = window.setInterval(this._animateHeight, 20);
  }

  _stopAnimate() {
    window.clearTimeout(this.startAnimationTimer);
    window.clearTimeout(this.intervalTimer);
  }

  _animateHeight() {
    if (this.state.elevationScale === elevationScale.max) {
      this._stopAnimate();
    } else {
      this.setState({elevationScale: this.state.elevationScale + 1});
    }
  }
  render() {
    const {viewport, flightPaths, airports, strokeWidth, mapboxData, devonData} = this.props;

    const layers = [
      // new ScatterplotLayer({
      //   id: 'paths',
      //   data: devonData,
      //   radiusScale: 80,
      //   getPosition: d => d.Coordinates,
      //   getColor: d => getColor(d.RoadCategory),
      //   getRadius: d => d.LinkLengthMi,
      //   pickable: Boolean(this.props.onHover),
      //   onHover: this.props.onHover
      // }),
      new HexagonLayer({
        id: 'hexagons',
        // getColorValue: d => getColor(d['RoadCategory']),
        data: devonData,
        radius: 1000,
        elevationRange: [0, 500],
        elevationScale: this.state.elevationScale,
        extruded: true,
        getPosition: d => d.Coordinates,
        opacity: 1,
        pickable: true,
        onHover: info => console.log('Hovered:', info),
        onClick: info => console.log('Clicked:', info)
      })
    ];

    return (
      <DeckGL {...viewport} layers={ layers } onWebGLInitialized={this._initialize} />
    );
  }
}
