/* eslint-disable no-use-before-define */
import React, { Component } from 'react';
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// eslint-disable-next-line import/no-named-default
import { default as Polygons } from './polygons.json';
import './App.css';
// eslint-disable-next-line import/order
import * as THREE from 'three';

type state = {
  z: number;
  draw: boolean;
};

class App extends Component<{}, state> {
  private canvas: any;

  private scene: any;

  private camera: any;

  private renderer: any;

  private controls: any;

  private startMousePosition: any;

  private rectangle: any;

  private scenePolygons : any[] = [];

  geometry = new THREE.PlaneGeometry();

  constructor(props: any) {
    super(props);

    this.state = {
      z: 0,
      draw: true,
    };

    this.onValueChange = this.onValueChange.bind(this);
    this.drawRect = this.drawRect.bind(this);
    this.projectRect = this.projectRect.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUP = this.onMouseUP.bind(this);
    this.animate = this.animate.bind(this);
  }

  componentDidMount() {
    this.canvas = document.getElementById('canvas');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight - 50;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
    });

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      45,
      this.canvas?.clientWidth / this.canvas?.clientHeight,
      1,
      100000,
    );
    this.camera.position.z = 400;

    this.canvas.onmousedown = this.onMouseDown;
    this.canvas.onmousemove = this.onMouseMove;
    this.canvas.onmouseup = this.onMouseUP;

    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // this.controls.update();

    this.drawPolygons();
    this.animate();
  }

  onValueChange(e: any) {
    this.setState({ z: e.target.value });
    this.rectangle.position.setZ(Number(e.target.value));
  }

  onMouseDown(e: MouseEvent) {
    const { draw } = this.state;

    if (draw && !this.rectangle) {
      // code to start drawing
      this.startMousePosition = new THREE.Vector3(e.pageX, e.pageY, 0);
    }
  }

  onMouseUP() {
    this.startMousePosition = null;
  }

  onMouseMove(e: MouseEvent) {
    const { draw } = this.state;

    if (draw && this.startMousePosition) {
      const endMousePosition = new THREE.Vector3(e.pageX, e.pageY, 0);

      const differenceY = Math.abs(
        this.startMousePosition.y - endMousePosition.y,
      );
      const differenceX = Math.abs(
        this.startMousePosition.x - endMousePosition.x,
      );

      const floorGeometryNew = new THREE.PlaneGeometry(differenceX, differenceY);
      floorGeometryNew.rotateX(-Math.PI / 2);

      const tempMaterial = new THREE.MeshBasicMaterial({
        color: 'purple',
      });
      this.rectangle = new THREE.Mesh(floorGeometryNew, tempMaterial);
      // var x = this.startMousePosition.x;
      // var y = this.startMousePosition.y;
      const { z } = this.startMousePosition;
      this.setState({ z });
      this.rectangle.position.set(0, 0, 0);
      this.scene.add(this.rectangle);
    }
  }

  animate() {
    requestAnimationFrame(this.animate);
    // required if controls.enableDamping or controls.autoRotate are set to true
    // this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  drawRect() {
    this.camera = new THREE.OrthographicCamera(
      this.canvas?.clientWidth / -2,
      this.canvas?.clientWidth / 2,
      this.canvas?.clientHeight / -2,
      this.canvas?.clientHeight / 2,
      1,
      1000,
    );
    this.setState({ draw: true });
  }

  drawPolygons() {
    Polygons.forEach((polygon) => {
      const material = new THREE.LineBasicMaterial({
        color: 'red',
      });

      const shape = new THREE.Shape();
      polygon.bounding_points.forEach((point, index) => {
        if (index === 0) {
          shape.moveTo(20 * point.x, point.y * 20);
        } else {
          shape.lineTo(20 * point.x, point.y * 20);
        }
      });
      const geometry = new THREE.ShapeGeometry(shape);
      const polygonObj = new THREE.Mesh(geometry, material);
      this.scenePolygons.push(polygonObj);
      this.scene.add(polygonObj);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  projectRect() {
    // this.scenePolygons.forEach((polygon) => {  });
  }

  render() {
    const { z } = this.state;
    return (
      // eslint-disable-next-line react/jsx-filename-extension
      <div className="container">
        <canvas id="canvas" />
        <input onChange={this.onValueChange} name="z" value={z} type="number" />
        <button onClick={this.drawRect} type="button">Draw Rectangle</button>
        <button onClick={this.projectRect} type="button">Project Rectangle</button>
      </div>
    );
  }
}

export default App;
