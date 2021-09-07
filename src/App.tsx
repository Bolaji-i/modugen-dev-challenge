/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable no-use-before-define */
// eslint-disable-next-line no-unused-vars
import Rect, { Component } from 'react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry';
// eslint-disable-next-line import/no-named-default
import { default as Polygons } from './polygons.json';
import './App.css';
// eslint-disable-next-line import/order
import {
  Mesh, MeshBasicMaterial, OrthographicCamera, PerspectiveCamera,
  PlaneGeometry, PointsMaterial, Scene, Vector3, WebGLRenderer,
} from 'three';

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

  geometry = new PlaneGeometry();

  constructor(props: any) {
    super(props);

    this.state = {
      z: 0,
      draw: false,
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

    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });

    this.scene = new Scene();

    this.camera = new PerspectiveCamera(
      90,
      this.canvas?.clientWidth / this.canvas?.clientHeight,
      1,
      100000,
    );

    this.camera.position.z = 20;

    this.canvas.onmousedown = this.onMouseDown;
    this.canvas.onmousemove = this.onMouseMove;
    this.canvas.onmouseup = this.onMouseUP;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls?.update();

    this.drawPolygons();
    this.animate();
  }

  onValueChange(e: any) {
    this.setState({ z: e.target.value });
    this.rectangle.position.setZ(Number(e.target.value));
  }

  onMouseDown(e: MouseEvent) {
    const { draw } = this.state;
    this.controls = null;
    if (draw && !this.rectangle) {
      // code to start drawing
      this.startMousePosition = new Vector3(e.pageX, e.pageY, 0);
    }
  }

  onMouseUP() {
    this.startMousePosition = null;
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  }

  onMouseMove(e: MouseEvent) {
    const { draw } = this.state;

    if (draw && this.startMousePosition) {
      const endMousePosition = new Vector3(e.pageX, e.pageY, 0);

      const differenceY = Math.abs(
        this.startMousePosition.y - endMousePosition.y,
      );
      const differenceX = Math.abs(
        this.startMousePosition.x - endMousePosition.x,
      );

      const floorGeometryNew = new PlaneGeometry(differenceX, differenceY);
      floorGeometryNew.rotateX(-Math.PI / 2);

      const tempMaterial = new MeshBasicMaterial({
        color: 'purple',
      });
      this.rectangle = new Mesh(floorGeometryNew, tempMaterial);

      const { x, y, z } = this.startMousePosition;
      this.setState({ z });
      this.rectangle.position.set((x - (this.canvas?.clientWidth / 2)), -y, z);
      this.scene.add(this.rectangle);
    }
  }

  animate() {
    requestAnimationFrame(this.animate);
    // required if controls.enableDamping or controls.autoRotate are set to true
    this.controls?.update();
    this.renderer.render(this.scene, this.camera);
  }

  drawRect() {
    this.camera = new OrthographicCamera(
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
    const material = new PointsMaterial({
      color: 'red',
    });

    Polygons.forEach((polygon) => {
      const points: any = [];
      polygon.bounding_points.forEach((point) => {
        points.push(new Vector3(point.x, point.y, point.z));
      });
      const geometry = new ConvexGeometry(points);
      const polygonObj = new Mesh(geometry, material);
      this.scenePolygons.push(polygonObj);
      this.scene.add(polygonObj);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  projectRect() {
    this.scenePolygons.forEach((polygon) => {
      const rect: any = this.rectangle.clone();
      rect.position.x = polygon.position.x;
      rect.position.y = polygon.position.y;
      rect.position.z = polygon.position.z;
      this.scene.add(rect);
    });
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
