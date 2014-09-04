var container, stats;

var camera, scene, renderer;

var objects, controller;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var time;

var propertyGUI = {};

var material, mats;


var BRDFFragmentShader = {};

var currentFragShader;

init();
animate();


function init() {

  initShader();

  container = document.getElementById('container');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 500 );
  camera.position.z = 2;
  camera.position.x = 1;
  camera.lightDir = new THREE.Vector3(0,1,0);
  camera.lightDir.normalize();
  updateCamera();

  scene = new THREE.Scene();

  var light = new THREE.PointLight( 0xffffff, 1, 1000 );
  light.position.set( 0, 500, 0 );
  scene.add(light);

  var boxGeo = new THREE.BoxGeometry(1,1,1);

  material = new THREE.ShaderMaterial( {
    uniforms: {
      u_lightColor: { type: "v3", value: new THREE.Vector3(light.color.r, light.color.g, light.color.b)  },
      u_lightPos: { type: "v3", value: light.position},
      u_ambientColor: {type: "v3", value: new THREE.Vector3(0.1, 0.1, 0.1)},
      u_diffuseColor: {type: 'v3', value: new THREE.Vector3(1,1,1) },
      u_roughness: {type: "f", value: 0.0 },
      u_fresnel: {type: "f", value: 0.0 },
      u_alpha: {type: "f", value: 0.0 },
      u_texture: {type: "t", value: null },
      u_isTexture: {type: "i", value: 0 },
    },
    vertexShader: document.getElementById( 'vertexShader' ).textContent,
    fragmentShader: currentFragShader,
  } );



  var loader = new THREE.JSONLoader();

  loader.load('./objects/woodchair.json', function(geometry, materials) {

      for(var i = 0; i < materials.length; ++i) {
        var mat = materials[i];
        materials[i] = material.clone();
        if(mat.map) {
          materials[i].uniforms['u_texture'].value = mat.map;
          materials[i].uniforms['u_isTexture'].value = 1;
        }
        materials[i].uniforms['u_diffuseColor'].value = mat.color;
        //materials[i] = new THREE.MeshPhongMaterial({map: mat.map, shininess: 150});
      }

      mats = materials;
      addUI();
      var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
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
  //controller.update();

  render();
  //stats.update();
  updateCamera();

  if(mats) {
    for(var i = 0; i < mats.length; ++i) {
      mats[i].uniforms['u_roughness'].value = propertyGUI[i].roughness;
      mats[i].uniforms['u_alpha'].value = propertyGUI[i].roughness * propertyGUI[i].roughness;
      mats[i].uniforms['u_fresnel'].value = propertyGUI[i].fresnel;
      //mats[i].uniforms['u_viewLightDir'].value = camera.viewLightDir;

      currentFragShader = BRDFFragmentShader.init
      + BRDFFragmentShader.N[propertyGUI[i].Normal_Dirstribution_Function]
      + BRDFFragmentShader.G[propertyGUI[i].Geometric_Shadowing]
      + BRDFFragmentShader.main;

      mats[i].fragmentShader = currentFragShader;
      mats[i].needsUpdate = true;
    }
  }
}

function render() {

  renderer.render( scene, camera );
  //debugger;
}

function property() {
  this.roughness = 0.21;
  this.fresnel = 10.0;
  this.Normal_Dirstribution_Function = 'BlinnPhong';
  this.Geometric_Shadowing = 'CookTorrance';
}


function addUI() {
  var datGui = new dat.GUI();
  for(var i = 0; i < mats.length; ++i) {
    propertyGUI[i] = new property();
    datGui.add(propertyGUI[i], 'roughness', 0.01, 1.0);
    datGui.add(propertyGUI[i], 'fresnel', 1.0, 20.0);
    datGui.add(propertyGUI[i], 'Normal_Dirstribution_Function', ['BlinnPhong', 'Beckmann', 'GGX']);
    datGui.add(propertyGUI[i], 'Geometric_Shadowing', ['Implicit', 'CookTorrance', 'Kelemen', 'Beckmann', 'Schlick_Beckmann']);
  }
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
