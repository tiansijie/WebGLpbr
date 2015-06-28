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

var currentTime = new Date();
var allPbShaders = [];

init();
animate();

var pbShader;

function loader() {

  pbShader = new THREE.ShaderMaterial( {
    uniforms: {
      u_lightColor: { type: "v3", value: new THREE.Vector3(light.color.r, light.color.g, light.color.b)  },
      u_lightDir: { type: "v3", value: camera.lightDir },
      u_lightPos: { type: "v3", value: light.position},
      u_diffuseColor: {type: "v3", value: new THREE.Vector3(0.9, 0.9, 0.9)},
      u_ambientColor: {type: "v3", value: new THREE.Vector3(0.1, 0.1, 0.1)},
      u_roughness: {type: "f", value: propertyGUI.roughness },
      u_fresnel: {type: "f", value: propertyGUI.fresnel },
      u_alpha: {type: "f", value: propertyGUI.roughness * propertyGUI.roughness },
      u_tCube: {type: "t", value: cubeMapTex },
      u_VDC: {type:"fv1", value: [0.0]}
    },
    vertexShader: document.getElementById( 'vertexShader' ).textContent,
    fragmentShader: currentFragShader,
  } );


  var VDC = [0, 0.5, 0.25, 0.75, 0.125, 0.625, 0.375, 0.875, 0.0625, 0.5625, 0.3125, 0.8125, 0.1875, 0.6875, 0.4375, 0.9375, 0.03125, 0.53125, 0.28125, 0.78125, 0.15625, 0.65625, 0.40625, 0.90625, 0.09375, 0.59375, 0.34375, 0.84375, 0.21875, 0.71875, 0.46875, 0.96875, 0.015625, 0.515625, 0.265625, 0.765625, 0.140625, 0.640625, 0.390625, 0.890625, 0.078125, 0.578125, 0.328125, 0.828125, 0.203125, 0.703125, 0.453125, 0.953125, 0.046875, 0.546875, 0.296875, 0.796875, 0.171875, 0.671875, 0.421875, 0.921875, 0.109375, 0.609375, 0.359375, 0.859375, 0.234375, 0.734375, 0.484375, 0.984375, 0.0078125, 0.5078125, 0.2578125, 0.7578125, 0.1328125, 0.6328125, 0.3828125, 0.8828125, 0.0703125, 0.5703125, 0.3203125, 0.8203125, 0.1953125, 0.6953125, 0.4453125, 0.9453125, 0.0390625, 0.5390625, 0.2890625, 0.7890625, 0.1640625, 0.6640625, 0.4140625, 0.9140625, 0.1015625, 0.6015625, 0.3515625, 0.8515625, 0.2265625, 0.7265625, 0.4765625, 0.9765625, 0.0234375, 0.5234375, 0.2734375, 0.7734375, 0.1484375, 0.6484375, 0.3984375, 0.8984375, 0.0859375, 0.5859375, 0.3359375, 0.8359375, 0.2109375, 0.7109375, 0.4609375, 0.9609375, 0.0546875, 0.5546875, 0.3046875, 0.8046875, 0.1796875, 0.6796875, 0.4296875, 0.9296875, 0.1171875, 0.6171875, 0.3671875, 0.8671875, 0.2421875, 0.7421875, 0.4921875, 0.9921875, 0.00390625, 0.50390625, 0.25390625, 0.75390625, 0.12890625, 0.62890625, 0.37890625, 0.87890625, 0.06640625, 0.56640625, 0.31640625, 0.81640625, 0.19140625, 0.69140625, 0.44140625, 0.94140625, 0.03515625, 0.53515625, 0.28515625, 0.78515625, 0.16015625, 0.66015625, 0.41015625, 0.91015625, 0.09765625, 0.59765625, 0.34765625, 0.84765625, 0.22265625, 0.72265625, 0.47265625, 0.97265625, 0.01953125, 0.51953125, 0.26953125, 0.76953125, 0.14453125, 0.64453125, 0.39453125, 0.89453125, 0.08203125, 0.58203125, 0.33203125, 0.83203125, 0.20703125, 0.70703125, 0.45703125, 0.95703125, 0.05078125, 0.55078125, 0.30078125, 0.80078125, 0.17578125, 0.67578125, 0.42578125, 0.92578125, 0.11328125, 0.61328125, 0.36328125, 0.86328125, 0.23828125, 0.73828125, 0.48828125, 0.98828125, 0.01171875, 0.51171875, 0.26171875, 0.76171875, 0.13671875, 0.63671875, 0.38671875, 0.88671875, 0.07421875, 0.57421875, 0.32421875, 0.82421875, 0.19921875, 0.69921875, 0.44921875, 0.94921875, 0.04296875, 0.54296875, 0.29296875, 0.79296875, 0.16796875, 0.66796875, 0.41796875, 0.91796875, 0.10546875, 0.60546875, 0.35546875, 0.85546875, 0.23046875, 0.73046875, 0.48046875, 0.98046875, 0.02734375, 0.52734375, 0.27734375, 0.77734375, 0.15234375, 0.65234375, 0.40234375, 0.90234375, 0.08984375, 0.58984375, 0.33984375, 0.83984375, 0.21484375, 0.71484375, 0.46484375, 0.96484375, 0.05859375, 0.55859375, 0.30859375, 0.80859375, 0.18359375, 0.68359375, 0.43359375, 0.93359375, 0.12109375, 0.62109375, 0.37109375, 0.87109375, 0.24609375, 0.74609375, 0.49609375, 0.99609375];

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
    material.uniforms["u_VDC"].value = VDC;
    if(transparency != 1.0){
      material.transparent = true;
    }
    allPbShaders.push(material);
    return material;
  }



  for(var i = 0; i <= 10; i++) {
    var geometry = new THREE.SphereGeometry( 23, 32, 32 );
    var data = {map:null};
    var material = setPBMaterial(data, i/10, 0.7, [0.5,0.5,0.5], 1);
    var sphere = new THREE.Mesh( geometry, material );
    sphere.position.x = (i-6) * 50;
    scene.add( sphere );
  }

}




function init() {

  propertyGUI = new property();

  initShader();

  container = document.getElementById('container');
  container.appendChild( stats.domElement );
  document.body.appendChild(container);


  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 3500 );
  camera.position.z = 270;
  camera.position.x = 5;
  camera.lightDir = new THREE.Vector3(-1,-1,-1);
  camera.lightDir.normalize();

  scene = new THREE.Scene();

  light = new THREE.PointLight( 0xffffff, 1, 100 );
  light.position.set( 0, 0, 100 );
  scene.add(light);

  cubeMapTex = initiCubeMap();

  boxGeo = new THREE.BoxGeometry(1,1,1);

  loader();

  renderer = new THREE.WebGLRenderer({ antialias: true });
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
    for(var i = 0; i < allPbShaders.length; ++i) {
      allPbShaders[i].uniforms.u_tCube.value = cubeMapTex;
    }

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
  textureCube.generateMipmaps = true;
  textureCube.minFilter = THREE.NearestMipMapNearestFilter;
  textureCube.needsUpdate = true;

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
  skyboxMesh = new THREE.Mesh( new THREE.BoxGeometry( 2000, 2000, 2000 ), material );
  // add it to the scene
  scene.add( skyboxMesh );

  return textureCube;
}
