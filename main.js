var container, stats;

var camera, scene, renderer;

var objects, controller;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var time;

var propertyGUI;

var material;


var BRDFFragmentShader = {};

var currentFragShader;

init();
animate();


function init() {

  propertyGUI = new property();

  initShader();

  container = document.getElementById('container');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 100 );
  camera.position.z = 2;
  camera.position.x = 1;

  scene = new THREE.Scene();

  var light = new THREE.PointLight( 0xffffff, 1, 100 );
  light.position.set( 5, 5, 5 );
  scene.add(light);

  var boxGeo = new THREE.BoxGeometry(1,1,1);

  material = new THREE.ShaderMaterial( {
    uniforms: {
      u_lightColor: { type: "v3", value: new THREE.Vector3(light.color.r, light.color.g, light.color.b)  },
      u_lightDir: { type: "v3", value: new THREE.Vector3(1,1,1) },
      u_lightPos: { type: "v3", value: light.position},
      u_viewPos: {type: "v3", value: camera.position },
      u_diffuseColor: {type: "v3", value: new THREE.Vector3(0.85, 0.56, 0.34)},
      u_roughness: {type: "f", value: propertyGUI.roughness },
      u_fresnel: {type: "f", value: propertyGUI.fresnel },
    },
    vertexShader: document.getElementById( 'vertexShader' ).textContent,
    fragmentShader: currentFragShader,
  } );



  var loader = new THREE.JSONLoader();

  loader.load('./dragon.json', function(geometry, materials) {
      var mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
  });


  var boxMaterial = new THREE.MeshNormalMaterial( {color:new THREE.Color('rgb(1,0.4,1)'), shading: THREE.SmoothShading } );
  var boxMesh = new THREE.Mesh(boxGeo, boxMaterial);
  //scene.add(boxMesh);

  var mesh = new THREE.Mesh(boxGeo, material);
  //scene.add(mesh);

  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor( 0xffffff, 1 );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  controller = new THREE.OrbitControls(camera, renderer.domElement);
  // stats = new Stats();
  // stats.domElement.style.position = 'absolute';
  // stats.domElement.style.top = '0px';
  // stats.domElement.style.zIndex = 100;
  // container.appendChild( stats.domElement );

  window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function animate() {

  requestAnimationFrame( animate );

  render();
  //stats.update();
  material.uniforms['u_roughness'].value = propertyGUI.roughness;
  material.uniforms['u_fresnel'].value = propertyGUI.fresnel;


  currentFragShader = BRDFFragmentShader.init
  + BRDFFragmentShader.N[propertyGUI.Normal_Dirstribution_Function]
  + BRDFFragmentShader.G[propertyGUI.Geometric_Shadowing]
  + BRDFFragmentShader.main;

  material.fragmentShader = currentFragShader;
  material.needsUpdate = true;
}

function render() {

  renderer.render( scene, camera );

}

function property() {
  this.roughness = 0.21;
  this.fresnel = 10.0;
  this.Normal_Dirstribution_Function = 'BlinnPhong';
  this.Geometric_Shadowing = 'CookTorrance';
}

window.onload = function() {
  var datGui = new dat.GUI();
  datGui.add(propertyGUI, 'roughness', 0.01, 1.0);
  datGui.add(propertyGUI, 'fresnel', 1.0, 20.0);
  datGui.add(propertyGUI, 'Normal_Dirstribution_Function', ['BlinnPhong', 'Beckmann', 'GGX']);
  datGui.add(propertyGUI, 'Geometric_Shadowing', ['Implicit', 'CookTorrance', 'Kelemen', 'Beckmann', 'Schlick_Beckmann']);
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
