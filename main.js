var container, stats;

var camera, scene, renderer;

var objects, controller;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var time;

var propertyGUI;

var material;

var Hu = [];
var Hv = [];
var SAMPLE = 16;

var BRDFFragmentShader = {};

var currentFragShader;

var startTime = new Date();

var stats = new Stats();
stats.setMode( 0 );
//document.body.appendChild( stats.domElement );

init();
animate();


function init() {

  propertyGUI = new property();

  initShader();

  container = document.getElementById('container');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1500 );
  camera.position.z = 2;
  camera.position.x = 1;
  camera.lightDir = new THREE.Vector3(1,1,1);
  camera.lightDir.normalize();
  updateCamera();

  scene = new THREE.Scene();

  var light = new THREE.PointLight( 0xffffff, 1, 100 );
  light.position.set( 5, 5, 5 );
  scene.add(light);

  var cubeMapTex = initiCubeMap();

  var boxGeo = new THREE.BoxGeometry(1,1,1);


  material = new THREE.ShaderMaterial( {
    uniforms: {
      u_lightColor: { type: "v3", value: new THREE.Vector3(light.color.r, light.color.g, light.color.b)  },
      u_lightDir: { type: "v3", value: camera.lightDir },
      u_viewLightDir: { type: "v3", value: camera.viewLightDir },
      u_lightPos: { type: "v3", value: light.position},
      u_viewPos: {type: "v3", value: camera.position },
      u_diffuseColor: {type: "v3", value: new THREE.Vector3(1.0, 1.0, 1.0)},
      u_ambientColor: {type: "v3", value: new THREE.Vector3(0.1, 0.1, 0.1)},
      u_roughness: {type: "f", value: propertyGUI.roughness },
      u_fresnel: {type: "f", value: propertyGUI.fresnel },
      u_alpha: {type: "f", value: propertyGUI.roughness * propertyGUI.roughness },
      u_tCube: {type: "t", value: cubeMapTex },
      u_time: {type: "f", value: 0.0},
      u_sample: {type: 'i', value: SAMPLE}
    },
    vertexShader: document.getElementById( 'vertexShader' ).textContent,
    fragmentShader: currentFragShader,
  } );



  var loader = new THREE.JSONLoader();

  loader.load('./objects/bunny.json', function(geometry, materials) {
      var mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
  });


  // var sphereMesh = new THREE.Mesh(new THREE.SphereGeometry( 1, 32, 32 ), material);
  // scene.add(sphereMesh);

  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor( 0xffffff, 1 );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  controller = new THREE.OrbitControls(camera, renderer.domElement);

  window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}


function animate() {

  requestAnimationFrame( animate );

  render();
  //stats.update();
  updateCamera();

  material.uniforms['u_viewLightDir'].value = camera.viewLightDir;
  material.uniforms['u_time'].value = (new Date() - startTime) * 0.001;
}

function render() {
  renderer.render( scene, camera );
}

function property() {
  this.roughness = 0.21;
  this.fresnel = 10.0;
  this.Normal_Dirstribution_Function = 'BlinnPhong';
  this.Geometric_Shadowing = 'CookTorrance';
  this.Cube_Map_Name = 'chapel/';
}

window.onload = function() {

  function roughnessCallback(value) {
    material.uniforms['u_roughness'].value = propertyGUI.roughness;
    material.uniforms['u_alpha'].value = propertyGUI.roughness * propertyGUI.roughness;
  }

  function fresnelCallback(value) {
    material.uniforms['u_fresnel'].value = propertyGUI.fresnel;
  }

  var datGui = new dat.GUI();
  var roughnessController = datGui.add(propertyGUI, 'roughness', 0.01, 1.0);
  roughnessController.onChange(roughnessCallback);
  roughnessController.onFinishChange(roughnessCallback);

  var fresnelController = datGui.add(propertyGUI, 'fresnel', 1.0, 20.0);
  fresnelController.onChange(fresnelCallback);
  fresnelController.onFinishChange(fresnelCallback);

  var NDFController = datGui.add(propertyGUI, 'Normal_Dirstribution_Function', ['BlinnPhong', 'Beckmann', 'GGX']);
  NDFController.onFinishChange(function(value){

    currentFragShader = BRDFFragmentShader.init
    + BRDFFragmentShader.N[propertyGUI.Normal_Dirstribution_Function]
    + BRDFFragmentShader.G[propertyGUI.Geometric_Shadowing]
    + BRDFFragmentShader.main;

    material.fragmentShader = currentFragShader;
    material.needsUpdate = true;

  })

  var GController = datGui.add(propertyGUI, 'Geometric_Shadowing', ['Implicit', 'CookTorrance', 'Kelemen', 'Beckmann', 'Schlick_Beckmann']);
  GController.onFinishChange(function(value){
    currentFragShader = BRDFFragmentShader.init
    + BRDFFragmentShader.N[propertyGUI.Normal_Dirstribution_Function]
    + BRDFFragmentShader.G[propertyGUI.Geometric_Shadowing]
    + BRDFFragmentShader.main;

    material.fragmentShader = currentFragShader;
    material.needsUpdate = true;
  })


  var cubeMapController = datGui.add(propertyGUI, 'Cube_Map_Name', ['chapel', 'beach', 'church']);
  cubeMapController.onFinishChange(function(value) {
    var cubeMapTex = initiCubeMap();
    material.uniforms.u_tCube = cubeMapTex;
  });
}


function initShader() {
  BRDFFragmentShader.init = document.getElementById( 'fragmentShader_param' ).textContent;

  BRDFFragmentShader.N = [];
  BRDFFragmentShader.N['BlinnPhong'] = document.getElementById( 'NDFBlinnPhong' ).textContent;
  BRDFFragmentShader.N['Beckmann'] = document.getElementById( 'NDFBeckmann' ).textContent;
  BRDFFragmentShader.N['GGX'] = document.getElementById( 'NDFGGX' ).textContent;

  BRDFFragmentShader.G = [];
  BRDFFragmentShader.G['Implicit'] = document.getElementById( 'GImplicit' ).textContent;
  BRDFFragmentShader.G['CookTorrance'] = document.getElementById( 'GCookTorrance' ).textContent;
  BRDFFragmentShader.G['Kelemen'] = document.getElementById( 'GKelemen' ).textContent;
  BRDFFragmentShader.G['Beckmann'] = document.getElementById( 'GBeckmann' ).textContent;
  BRDFFragmentShader.G['Schlick_Beckmann'] = document.getElementById( 'GSchlick_Beckmann' ).textContent;

  BRDFFragmentShader.main = document.getElementById( 'fragmentShader_main' ).textContent;

  currentFragShader = BRDFFragmentShader.init
  + BRDFFragmentShader.N['BlinnPhong']
  + BRDFFragmentShader.G['CookTorrance']
  + BRDFFragmentShader.main;
}

function updateCamera() {
  camera.viewLightDir = new THREE.Vector4(camera.lightDir.x, camera.lightDir.y, camera.lightDir.z, 0.0).applyMatrix4(camera.matrixWorldInverse);
  camera.viewLightDir.normalize();
}

function initiCubeMap() {

  var urlPrefix = "./cubemap/";
  urlPrefix += propertyGUI.Cube_Map_Name + '/';

  var urls = [ urlPrefix + "posx.jpg", urlPrefix + "negx.jpg",
    urlPrefix + "posy.jpg", urlPrefix + "negy.jpg",
    urlPrefix + "posz.jpg", urlPrefix + "negz.jpg" ];
  var textureCube = THREE.ImageUtils.loadTextureCube( urls );
  textureCube.format = THREE.RGBFormat;

  var shader = THREE.ShaderLib["cube"];
  shader.uniforms['tCube'].value = textureCube;   // textureCube has been init before
  var material = new THREE.ShaderMaterial({
    fragmentShader    : shader.fragmentShader,
    vertexShader  : shader.vertexShader,
    uniforms  : shader.uniforms,
    depthWrite: false,
		side: THREE.BackSide
  });

  // build the skybox Mesh
  skyboxMesh = new THREE.Mesh( new THREE.BoxGeometry( 200, 200, 200 ), material );
  // add it to the scene
  scene.add( skyboxMesh );

  return textureCube;
}
