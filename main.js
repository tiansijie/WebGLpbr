var container, stats;

var camera, scene, renderer;

var objects, controller;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var time;

var propertyGUI;

var material;

var light;
var cubeMapTex;
var boxGeo;


var BRDFFragmentShader = {};

var currentFragShader;

var startTime = new Date();

var stats = new Stats();
stats.setMode( 0 );
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';

init();
animate();







var pbShader;
function loader() {

  pbShader = new THREE.ShaderMaterial( {
    uniforms: {
      u_lightColor: { type: "v3", value: new THREE.Vector3(light.color.r, light.color.g, light.color.b)  },
      u_lightDir: { type: "v3", value: camera.lightDir },
      u_lightPos: { type: "v3", value: light.position},
      u_viewPos: {type: "v3", value: camera.position },
      u_diffuseColor: {type: "v3", value: new THREE.Vector3(0.9, 0.9, 0.9)},
      u_ambientColor: {type: "v3", value: new THREE.Vector3(0.1, 0.1, 0.1)},
      u_roughness: {type: "f", value: propertyGUI.roughness },
      u_fresnel: {type: "f", value: propertyGUI.fresnel },
      u_alpha: {type: "f", value: propertyGUI.roughness * propertyGUI.roughness },
      u_tCube: {type: "t", value: cubeMapTex },
      u_time: {type: "f", value: 0.0}
    },
    vertexShader: document.getElementById( 'vertexShader' ).textContent,
    fragmentShader: currentFragShader,
  } );


  function setPBMaterial(material, roughness, fresnel, diffuseColor, transparency) {
    var alpha = roughness * roughness;
    material = pbShader.clone();
    material.uniforms['u_lightColor'].value = new THREE.Vector3(0.90, 0.90, 0.90);
    material.uniforms['u_lightPos'].value = new THREE.Vector3(-10.0, 10.0, 100.0);
    material.uniforms['u_ambientColor'].value = new THREE.Vector3(34 / 255.0, 34 / 255.0, 34 / 255.0);
    material.uniforms['u_roughness'].value = roughness;
    material.uniforms['u_fresnel'].value = fresnel;
    material.uniforms['u_alpha'].value = alpha;
    material.uniforms['u_diffuseColor'].value = new THREE.Vector3(diffuseColor[0], diffuseColor[1], diffuseColor[2]);
    if(transparency != 1.0){
      material.transparent = true;
    }
    return material;
  }



  for(var i = 1; i <= 10; i++) {
    var geometry = new THREE.SphereGeometry( 8, 32, 32 );
    var data = {map:null};
    var material = setPBMaterial(data, i/10, 0.5, [0.9,0.2,0.2], 1);
    var sphere = new THREE.Mesh( geometry, material );
    sphere.position.x = (i-6) * 20;
    scene.add( sphere );
  }

  // for(var i = 1; i <= 10; i++) {
  //   var geometry = new THREE.SphereGeometry( 8, 32, 32 );
  //   var data = {map:null};
  //   var material = setPBMaterial(data, 0.5, i*2, [0.9,0.2,0.5], 1);
  //   var sphere = new THREE.Mesh( geometry, material );
  //   sphere.position.x = (i-6) * 20;
  //   sphere.position.y = 20;
  //   scene.add( sphere );
  // }
}




function init() {

  propertyGUI = new property();

  initShader();

  container = document.getElementById('container');
  container.appendChild( stats.domElement );
  document.body.appendChild(container);


  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1500 );
  camera.position.z = 170;
  camera.position.x = 1;
  camera.lightDir = new THREE.Vector3(-1,-1,-1);
  camera.lightDir.normalize();

  scene = new THREE.Scene();

  light = new THREE.PointLight( 0xffffff, 1, 100 );
  light.position.set( 0, 0, 100 );
  scene.add(light);

  cubeMapTex = initiCubeMap();

  boxGeo = new THREE.BoxGeometry(1,1,1); 

  loader();
  // var loader = new THREE.JSONLoader();

  // loader.load('./objects/bunny.json', function(geometry, materials) {
  //     var mesh = new THREE.Mesh(geometry, material);
  //     scene.add(mesh);
  // });


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
  stats.update();

  pbShader.uniforms['u_time'].value = (new Date() - startTime) * 0.001;
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
    material.uniforms.u_tCube.value = cubeMapTex;
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
  skyboxMesh = new THREE.Mesh( new THREE.BoxGeometry( 500, 500, 500 ), material );
  // add it to the scene
  scene.add( skyboxMesh );

  return textureCube;
}
