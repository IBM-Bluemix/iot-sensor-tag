//THREEJS RELATED VARIABLES 

var scene,
    camera,
    controls,
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane,
    shadowLight,
    backLight,
    light,
    renderer,
    container;

//SCENE
var env, floor, dragon, pepperBottle,
    sneezingRate = 0,
    fireRate = 0,
    maxSneezingRate = 8,
    sneezeDelay = 500,
    awaitingSmokeParticles = [],
    timeSmoke = 0,
    timeFire = 0,
    globalSpeedRate = 1,
    sneezeTimeout,
    powerField;

//SCREEN VARIABLES

var HEIGHT,
    WIDTH,
    windowHalfX,
    windowHalfY,
    mousePos = {
        x: 0,
        y: 0
    };

//INIT THREE JS, SCREEN AND MOUSE EVENTS

function init() {

    powerField = document.getElementById('power');

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x652e37, 350, 500);

    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    aspectRatio = WIDTH / HEIGHT;
    fieldOfView = 60;
    nearPlane = 1;
    farPlane = 2000;
    camera = new THREE.PerspectiveCamera(
        fieldOfView,
        aspectRatio,
        nearPlane,
        farPlane);
    camera.position.x = -400;
    camera.position.z = 100;
    camera.position.y = 0;
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });
    renderer.setSize(WIDTH, HEIGHT);
    renderer.shadowMapEnabled = true;
    container = document.getElementById('world');
    container.appendChild(renderer.domElement);
    windowHalfX = WIDTH / 2;
    windowHalfY = HEIGHT / 2;
    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mouseup', handleMouseUp, false);
    document.addEventListener('touchend', handleTouchEnd, false);
    //*
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.minPolarAngle = -Math.PI / 2;
    controls.maxPolarAngle = Math.PI / 2;
    controls.noZoom = true;
    controls.noPan = true;
    //*/
}

function onWindowResize() {
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    windowHalfX = WIDTH / 2;
    windowHalfY = HEIGHT / 2;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
}

function handleMouseUp(event) {
    if (sneezeTimeout) clearTimeout(sneezeTimeout);
    sneezingRate += (maxSneezingRate - sneezingRate) / 10;
    powerField.innerHTML = parseInt(sneezingRate * 100 / maxSneezingRate);
    dragon.prepareToSneeze(sneezingRate);
    sneezeTimeout = setTimeout(sneeze, sneezeDelay * globalSpeedRate);
    dragon.isSneezing = true;
}

function sneeze() {
    dragon.sneeze(sneezingRate);
    sneezingRate = 0;
    powerField.innerHTML = "00";
}

function handleTouchEnd(event) {
    if (sneezeTimeout) clearTimeout(sneezeTimeout);
    sneezingRate += (maxSneezingRate - sneezingRate) / 10;
    powerField.innerHTML = parseInt(sneezingRate * 100 / maxSneezingRate);
    dragon.prepareToSneeze(sneezingRate);
    sneezeTimeout = setTimeout(sneeze, sneezeDelay * globalSpeedRate);
    dragon.isSneezing = true;
}

function createLights() {
    light = new THREE.HemisphereLight(0xffffff, 0xb3858c, .8);

    shadowLight = new THREE.DirectionalLight(0xffffff, .8);
    shadowLight.position.set(-100, 100, 50);
    shadowLight.castShadow = true;
    shadowLight.shadowDarkness = .15;

    backLight = new THREE.DirectionalLight(0xffffff, .4);
    backLight.position.set(200, 100, 100);
    backLight.shadowDarkness = .1;
    backLight.castShadow = true;

    scene.add(backLight);
    scene.add(light);
    scene.add(shadowLight);
}

Dragon = function () {
    this.tailAmplitude = 3;
    this.tailAngle = 0;
    this.tailSpeed = .07;

    this.wingAmplitude = Math.PI / 8;
    this.wingAngle = 0;
    this.wingSpeed = 0.1
    this.isSneezing = false;

    this.threegroup = new THREE.Group(); // this is a sort of container that will hold all the meshes and will be added to the scene;

    // Materials
    var greenMat = new THREE.MeshLambertMaterial({
        color: 0x5da683,
        shading: THREE.FlatShading
    });
    var lightGreenMat = new THREE.MeshLambertMaterial({
        color: 0x95c088,
        shading: THREE.FlatShading
    });

    var yellowMat = new THREE.MeshLambertMaterial({
        color: 0xfdde8c,
        shading: THREE.FlatShading
    });

    var redMat = new THREE.MeshLambertMaterial({
        color: 0xcb3e4c,
        shading: THREE.FlatShading
    });

    var whiteMat = new THREE.MeshLambertMaterial({
        color: 0xfaf3d7,
        shading: THREE.FlatShading
    });

    var brownMat = new THREE.MeshLambertMaterial({
        color: 0x874a5c,
        shading: THREE.FlatShading
    });

    var blackMat = new THREE.MeshLambertMaterial({
        color: 0x403133,
        shading: THREE.FlatShading
    });
    var pinkMat = new THREE.MeshLambertMaterial({
        color: 0xd0838e,
        shading: THREE.FlatShading
    });

    // body
    this.body = new THREE.Group();
    this.belly = makeCube(greenMat, 30, 30, 40, 0, 0, 0, 0, 0, Math.PI / 4);

    // Wings
    this.wingL = makeCube(yellowMat, 5, 30, 20, 15, 15, 0, -Math.PI / 4, 0, -Math.PI / 4);
    this.wingL.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 15, 10));
    this.wingR = this.wingL.clone();
    this.wingR.position.x = -this.wingL.position.x;
    this.wingR.rotation.z = -this.wingL.rotation.z;

    // pike body
    var pikeBodyGeom = new THREE.CylinderGeometry(0, 10, 10, 4, 1);
    this.pikeBody1 = new THREE.Mesh(pikeBodyGeom, greenMat);
    this.pikeBody1.scale.set(.2, 1, 1);
    this.pikeBody1.position.z = 10;
    this.pikeBody1.position.y = 26;

    this.pikeBody2 = this.pikeBody1.clone();
    this.pikeBody2.position.z = 0
    this.pikeBody3 = this.pikeBody1.clone();
    this.pikeBody3.position.z = -10;

    // tail
    this.tail = new THREE.Group();
    this.tail.position.z = -20;
    this.tail.position.y = 10;

    var tailMat = new THREE.LineBasicMaterial({
        color: 0x5da683,
        linewidth: 5
    });

    var tailGeom = new THREE.Geometry();
    tailGeom.vertices.push(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 5, -10),
        new THREE.Vector3(0, -5, -20),
        new THREE.Vector3(0, 0, -30)
    );

    this.tailLine = new THREE.Line(tailGeom, tailMat);

    // pike
    var pikeGeom = new THREE.CylinderGeometry(0, 10, 10, 4, 1);
    pikeGeom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    this.tailPike = new THREE.Mesh(pikeGeom, yellowMat);
    this.tailPike.scale.set(.2, 1, 1);
    this.tailPike.position.z = -35;
    this.tailPike.position.y = 0;

    this.tail.add(this.tailLine);
    this.tail.add(this.tailPike);

    this.body.add(this.belly);
    this.body.add(this.wingL);
    this.body.add(this.wingR);
    this.body.add(this.tail);
    this.body.add(this.pikeBody1);
    this.body.add(this.pikeBody2);
    this.body.add(this.pikeBody3);

    // head
    this.head = new THREE.Group();

    // head face
    this.face = makeCube(greenMat, 60, 50, 80, 0, 25, 40, 0, 0, 0);


    // head horn
    var hornGeom = new THREE.CylinderGeometry(0, 6, 10, 4, 1);
    this.hornL = new THREE.Mesh(hornGeom, yellowMat);
    this.hornL.position.y = 55;
    this.hornL.position.z = 10;
    this.hornL.position.x = 10;

    this.hornR = this.hornL.clone();
    this.hornR.position.x = -10;

    // head ears
    this.earL = makeCube(greenMat, 5, 10, 20, 32, 42, 2, 0, 0, 0);
    this.earL.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 5, -10));
    this.earL.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 4));
    this.earL.geometry.applyMatrix(new THREE.Matrix4().makeRotationY(-Math.PI / 4));

    this.earR = makeCube(greenMat, 5, 10, 20, -32, 42, 2, 0, 0, 0);
    this.earR.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 5, -10));
    this.earR.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 4));
    this.earR.geometry.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI / 4));

    // head mouth
    this.mouth = new THREE.Group();
    this.mouth.position.z = 50;
    this.mouth.position.y = 3;
    this.mouth.rotation.x = 0 //Math.PI / 8;

    // head mouth jaw
    this.jaw = makeCube(greenMat, 30, 10, 30, 0, -5, 15, 0, 0, 0);
    this.mouth.add(this.jaw);

    // head mouth tongue
    this.tongue = makeCube(redMat, 20, 10, 20, 0, -3, 15, 0, 0, 0);
    this.mouth.add(this.tongue);

    // head smile
    var smileGeom = new THREE.TorusGeometry(6, 2, 2, 10, Math.PI);
    this.smile = new THREE.Mesh(smileGeom, blackMat);
    this.smile.position.z = 82;
    this.smile.position.y = 5;
    this.smile.rotation.z = -Math.PI;


    // head cheek
    this.cheekL = makeCube(lightGreenMat, 4, 20, 20, 30, 18, 55, 0, 0, 0);
    this.cheekR = this.cheekL.clone();
    this.cheekR.position.x = -this.cheekL.position.x;

    //head spots
    this.spot1 = makeCube(lightGreenMat, 2, 2, 2, 20, 16, 80, 0, 0, 0);

    this.spot2 = this.spot1.clone();
    this.spot2.position.x = 15;
    this.spot2.position.y = 14;

    this.spot3 = this.spot1.clone();
    this.spot3.position.x = 16;
    this.spot3.position.y = 20;

    this.spot4 = this.spot1.clone();
    this.spot4.position.x = 12;
    this.spot4.position.y = 18;


    this.spot5 = this.spot1.clone();
    this.spot5.position.x = -15;
    this.spot5.position.y = 14;

    this.spot6 = this.spot1.clone();
    this.spot6.position.x = -14;
    this.spot6.position.y = 20;

    this.spot7 = this.spot1.clone();
    this.spot7.position.x = -19;
    this.spot7.position.y = 17;

    this.spot8 = this.spot1.clone();
    this.spot8.position.x = -11;
    this.spot8.position.y = 17;


    // head eye
    this.eyeL = makeCube(whiteMat, 10, 22, 22, 27, 34, 18, 0, 0, 0);
    this.eyeR = this.eyeL.clone();
    this.eyeR.position.x = -27;

    // head iris
    this.irisL = makeCube(brownMat, 10, 12, 12, 28, 30, 24, 0, 0, 0);
    this.irisR = this.irisL.clone();
    this.irisR.position.x = -this.irisL.position.x;

    // head nose
    this.noseL = makeCube(blackMat, 5, 5, 8, 5, 40, 77, 0, 0, 0);
    this.noseR = this.noseL.clone();
    this.noseR.position.x = -this.noseL.position.x;

    this.head.position.z = 30;
    this.head.add(this.face);
    this.head.add(this.hornL);
    this.head.add(this.hornR);
    this.head.add(this.earL);
    this.head.add(this.earR);
    this.head.add(this.mouth);
    this.head.add(this.eyeL);
    this.head.add(this.eyeR);
    this.head.add(this.irisL);
    this.head.add(this.irisR);
    this.head.add(this.noseL);
    this.head.add(this.noseR);
    this.head.add(this.cheekL);
    this.head.add(this.cheekR);
    this.head.add(this.smile);

    this.head.add(this.spot1);
    this.head.add(this.spot2);
    this.head.add(this.spot3);
    this.head.add(this.spot4);
    this.head.add(this.spot5);
    this.head.add(this.spot6);
    this.head.add(this.spot7);
    this.head.add(this.spot8);

    // legs
    this.legFL = makeCube(greenMat, 20, 10, 20, 20, -30, 15, 0, 0, 0);
    this.legFR = this.legFL.clone();
    this.legFR.position.x = -30;
    this.legBL = this.legFL.clone();
    this.legBL.position.z = -15;
    this.legBR = this.legBL.clone();
    this.legBR.position.x = -30;

    this.threegroup.add(this.body);
    this.threegroup.add(this.head);
    this.threegroup.add(this.legFL);
    this.threegroup.add(this.legFR);
    this.threegroup.add(this.legBL);
    this.threegroup.add(this.legBR);
    //this.threegroup.add(this.pike);

    this.threegroup.traverse(function (object) {
        if (object instanceof THREE.Mesh) {
            object.castShadow = true;
            object.receiveShadow = true;
        }
    });
}

Dragon.prototype.update = function () {

    this.tailAngle += this.tailSpeed / globalSpeedRate;
    this.wingAngle += this.wingSpeed / globalSpeedRate;
    for (var i = 0; i < this.tailLine.geometry.vertices.length; i++) {
        var v = this.tailLine.geometry.vertices[i];
        v.y = Math.sin(this.tailAngle - (Math.PI / 3) * i) * this.tailAmplitude * i * i;
        v.x = Math.cos(this.tailAngle / 2 + (Math.PI / 10) * i) * this.tailAmplitude * i * i;
        if (i == this.tailLine.geometry.vertices.length - 1) {
            this.tailPike.position.x = v.x;
            this.tailPike.position.y = v.y;
            this.tailPike.rotation.x = (v.y / 30);
        }
    }
    this.tailLine.geometry.verticesNeedUpdate = true;

    this.wingL.rotation.z = -Math.PI / 4 + Math.cos(this.wingAngle) * this.wingAmplitude;
    this.wingR.rotation.z = Math.PI / 4 - Math.cos(this.wingAngle) * this.wingAmplitude;
}

Dragon.prototype.prepareToSneeze = function (s) {
    var _this = this;
    var speed = .7 * globalSpeedRate;
    TweenLite.to(this.head.rotation, speed, {
        x: -s * .12,
        ease: Back.easeOut
    });
    TweenLite.to(this.head.position, speed, {
        z: 30 - s * 2.2,
        y: s * 2.2,
        ease: Back.easeOut
    });
    TweenLite.to(this.mouth.rotation, speed, {
        x: s * .18,
        ease: Back.easeOut
    });

    TweenLite.to(this.smile.position, speed / 2, {
        z: 75,
        y: 10,
        ease: Back.easeOut
    });
    TweenLite.to(this.smile.scale, speed / 2, {
        x: 0,
        y: 0,
        ease: Back.easeOut
    });

    TweenMax.to(this.noseL.scale, speed, {
        x: 1 + s * .1,
        y: 1 + s * .1,
        ease: Back.easeOut
    });
    TweenMax.to(this.noseR.scale, speed, {
        x: 1 + s * .1,
        y: 1 + s * .1,
        ease: Back.easeOut
    });
    TweenMax.to(this.eyeL.scale, speed, {
        y: 1 + s * .01,
        ease: Back.easeOut
    });
    TweenMax.to(this.eyeR.scale, speed, {
        y: 1 + s * .01,
        ease: Back.easeOut
    });
    TweenMax.to(this.irisL.scale, speed, {
        y: 1 + s * .05,
        z: 1 + s * .05,
        ease: Back.easeOut
    });
    TweenMax.to(this.irisR.scale, speed, {
        y: 1 + s * .05,
        z: 1 + s * .05,
        ease: Back.easeOut
    });
    TweenMax.to(this.irisL.position, speed, {
        y: 30 + s * .8,
        z: 24 - s * .4,
        ease: Back.easeOut
    });
    TweenMax.to(this.irisR.position, speed, {
        y: 30 + s * .8,
        z: 24 - s * .4,
        ease: Back.easeOut
    });
    TweenMax.to(this.earL.rotation, speed, {
        x: -s * .1,
        y: -s * .1,
        ease: Back.easeOut
    });
    TweenMax.to(this.earR.rotation, speed, {
        x: -s * .1,
        y: s * .1,
        ease: Back.easeOut
    });
    TweenMax.to(this.wingL.rotation, speed, {
        z: -Math.PI / 4 - s * .1,
        ease: Back.easeOut
    });
    TweenMax.to(this.wingR.rotation, speed, {
        z: Math.PI / 4 + s * .1,
        ease: Back.easeOut
    });
    TweenMax.to(this.body.rotation, speed, {
        x: -s * .05,
        ease: Back.easeOut
    });
    TweenMax.to(this.body.scale, speed, {
        y: 1 + s * .01,
        ease: Back.easeOut
    });
    TweenMax.to(this.body.position, speed, {
        z: -s * 2,
        ease: Back.easeOut
    });

    TweenMax.to(this.tail.rotation, speed, {
        x: s * 0.1,
        ease: Back.easeOut
    });

}

Dragon.prototype.sneeze = function (s) {
    var _this = this;
    var sneezeEffect = 1 - (s / maxSneezingRate);
    var speed = .1 * globalSpeedRate;
    timeFire = Math.round(s * 10);

    TweenLite.to(this.head.rotation, speed, {
        x: s * .05,
        ease: Back.easeOut
    });
    TweenLite.to(this.head.position, speed, {
        z: 30 + s * 2.4,
        y: -s * .4,
        ease: Back.easeOut
    });

    TweenLite.to(this.mouth.rotation, speed, {
        x: 0,
        ease: Strong.easeOut
    });

    TweenLite.to(this.smile.position, speed * 2, {
        z: 82,
        y: 5,
        ease: Strong.easeIn
    });

    TweenLite.to(this.smile.scale, speed * 2, {
        x: 1,
        y: 1,
        ease: Strong.easeIn
    });


    TweenMax.to(this.noseL.scale, speed, {
        y: sneezeEffect,
        ease: Strong.easeOut
    });
    TweenMax.to(this.noseR.scale, speed, {
        y: sneezeEffect,
        ease: Strong.easeOut
    });
    TweenMax.to(this.noseL.position, speed, {
        y: 40, // - (sneezeEffect * 5),
        ease: Strong.easeOut
    });
    TweenMax.to(this.noseR.position, speed, {
        y: 40, // - (sneezeEffect * 5),
        ease: Strong.easeOut
    });
    TweenMax.to(this.irisL.scale, speed, {
        y: sneezeEffect / 2,
        z: 1,
        ease: Strong.easeOut
    });
    TweenMax.to(this.irisR.scale, speed, {
        y: sneezeEffect / 2,
        z: 1,
        ease: Strong.easeOut
    });
    TweenMax.to(this.eyeL.scale, speed, {
        y: sneezeEffect / 2,
        ease: Back.easeOut
    });
    TweenMax.to(this.eyeR.scale, speed, {
        y: sneezeEffect / 2,
        ease: Back.easeOut
    });

    TweenMax.to(this.wingL.rotation, speed, {
        z: -Math.PI / 4 + s * .15,
        ease: Back.easeOut
    });
    TweenMax.to(this.wingR.rotation, speed, {
        z: Math.PI / 4 - s * .15,
        ease: Back.easeOut
    });

    TweenMax.to(this.body.rotation, speed, {
        x: s * 0.02,
        ease: Back.easeOut
    });
    TweenMax.to(this.body.scale, speed, {
        y: 1 - s * .03,
        ease: Back.easeOut
    });
    TweenMax.to(this.body.position, speed, {
        z: s * 2,
        ease: Back.easeOut
    });

    TweenMax.to(this.irisL.position, speed * 7, {
        y: 35,
        ease: Back.easeOut
    });
    TweenMax.to(this.irisR.position, speed * 7, {
        y: 35,
        ease: Back.easeOut
    });
    TweenMax.to(this.earR.rotation, speed * 3, {
        x: s * .20,
        y: s * .20,
        ease: Back.easeOut
    });
    TweenMax.to(this.earL.rotation, speed * 3, {
        x: s * .20,
        y: -s * .20,
        ease: Back.easeOut,
        onComplete: function () {
            _this.backToNormal(s);
            fireRate = s;
            console.log(fireRate);
        }
    });

    TweenMax.to(this.tail.rotation, speed * 3, {
        x: -s * 0.1,
        ease: Back.easeOut
    });

}

Dragon.prototype.backToNormal = function (s) {
    var _this = this;
    var speed = 1 * globalSpeedRate;
    TweenLite.to(this.head.rotation, speed, {
        x: 0,
        ease: Strong.easeInOut
    });
    TweenLite.to(this.head.position, speed, {
        z: 30,
        y: 0,
        ease: Back.easeOut
    });
    TweenMax.to(this.noseL.scale, speed, {
        x: 1,
        y: 1,
        ease: Strong.easeInOut
    });
    TweenMax.to(this.noseR.scale, speed, {
        x: 1,
        y: 1,
        ease: Strong.easeInOut
    });
    TweenMax.to(this.noseL.position, speed, {
        y: 40,
        ease: Strong.easeInOut
    });
    TweenMax.to(this.noseR.position, speed, {
        y: 40,
        ease: Strong.easeInOut
    });
    TweenMax.to(this.irisL.scale, speed, {
        y: 1,
        z: 1,
        ease: Back.easeOut
    });
    TweenMax.to(this.irisR.scale, speed, {
        y: 1,
        z: 1,
        ease: Back.easeOut
    });
    TweenMax.to(this.irisL.position, speed * .7, {
        y: 30,
        ease: Back.easeOut
    });
    TweenMax.to(this.irisR.position, speed * .7, {
        y: 30,
        ease: Back.easeOut
    });
    TweenMax.to(this.eyeL.scale, speed, {
        y: 1,
        ease: Strong.easeOut
    });
    TweenMax.to(this.eyeR.scale, speed, {
        y: 1,
        ease: Strong.easeOut
    });
    TweenMax.to(this.body.rotation, speed, {
        x: 0,
        ease: Back.easeOut
    });
    TweenMax.to(this.body.scale, speed, {
        y: 1,
        ease: Back.easeOut
    });
    TweenMax.to(this.body.position, speed, {
        z: 0,
        ease: Back.easeOut
    });

    TweenMax.to(this.wingL.rotation, speed * 1.3, {
        z: -Math.PI / 4,
        ease: Back.easeInOut
    });
    TweenMax.to(this.wingR.rotation, speed * 1.3, {
        z: Math.PI / 4,
        ease: Back.easeInOut
    });

    TweenMax.to(this.earL.rotation, speed * 1.3, {
        x: 0,
        y: 0,
        ease: Back.easeInOut
    });
    TweenMax.to(this.earR.rotation, speed * 1.3, {
        x: 0,
        y: 0,
        ease: Back.easeInOut,
        onComplete: function () {
            _this.isSneezing = false;
            timeSmoke = Math.round(s * 5);
        }
    });

    TweenMax.to(this.tail.rotation, speed * 1.3, {
        x: 0,
        ease: Back.easeOut
    });

}

function makeCube(mat, w, h, d, posX, posY, posZ, rotX, rotY, rotZ) {
    var geom = new THREE.BoxGeometry(w, h, d);
    var mesh = new THREE.Mesh(geom, mat);
    mesh.position.x = posX;
    mesh.position.y = posY;
    mesh.position.z = posZ;
    mesh.rotation.x = rotX;
    mesh.rotation.y = rotY;
    mesh.rotation.z = rotZ;
    return mesh;
}

function createFloor() {
    env = new THREE.Group();

    floor = new THREE.Mesh(new THREE.PlaneBufferGeometry(2000, 2000), new THREE.MeshBasicMaterial({
        color: 0X652e37
    }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -36;
    floor.receiveShadow = true;

    env.add(floor);
    scene.add(env);
}

function createDragon() {
    dragon = new Dragon();
    scene.add(dragon.threegroup);
}

SmokeParticle = function () {
    this.color = {
        r: 0,
        g: 0,
        b: 0
    };
    var particleMat = new THREE.MeshLambertMaterial({
        transparent: true,
        opacity: .5,
        shading: THREE.FlatShading
    });
    this.mesh = makeCube(particleMat, 4, 4, 4, 0, 0, 0, 0, 0, 0);
    awaitingSmokeParticles.push(this);
}

SmokeParticle.prototype.initialize = function () {
    this.mesh.rotation.x = 0;
    this.mesh.rotation.y = 0;
    this.mesh.rotation.z = 0;

    this.mesh.position.x = 0;
    this.mesh.position.y = 0;
    this.mesh.position.z = 0;

    this.mesh.scale.x = 1;
    this.mesh.scale.y = 1;
    this.mesh.scale.z = 1;

    this.mesh.material.opacity = .5;
    awaitingSmokeParticles.push(this);
}

SmokeParticle.prototype.updateColor = function () {
    this.mesh.material.color.setRGB(this.color.r, this.color.g, this.color.b);
}

SmokeParticle.prototype.fly = function () {
    var _this = this;
    var speed = 10 * globalSpeedRate;
    var ease = Strong.easeOut;
    var initX = this.mesh.position.x;
    var initY = this.mesh.position.y;
    var initZ = this.mesh.position.z;
    var bezier = {
        type: "cubic",
        values: [{
            x: initX,
            y: initY,
            z: initZ
    }, {
            x: initX + 30 - Math.random() * 10,
            y: initY + 20 + Math.random() * 2,
            z: initZ + 20
    }, {
            x: initX + 10 + Math.random() * 20,
            y: initY + 40 + Math.random() * 5,
            z: initZ - 30
    }, {
            x: initX + 50 - Math.random() * 20,
            y: initY + 70 + Math.random() * 10,
            z: initZ + 20
    }]
    };
    TweenMax.to(this.mesh.position, speed, {
        bezier: bezier,
        ease: ease
    });
    TweenMax.to(this.mesh.rotation, speed, {
        x: Math.random() * Math.PI * 3,
        y: Math.random() * Math.PI * 3,
        ease: ease
    });
    TweenMax.to(this.mesh.scale, speed, {
        x: 5 + Math.random() * 5,
        y: 5 + Math.random() * 5,
        z: 5 + Math.random() * 5,
        ease: ease
    });
    //*
    TweenMax.to(this.mesh.material, speed, {
        opacity: 0,
        ease: ease,
        onComplete: function () {
            _this.initialize();
        }
    });
    //*/
}

SmokeParticle.prototype.fire = function (f) {
    var _this = this;
    var speed = 1 * globalSpeedRate;
    var ease = Strong.easeOut;
    var initX = this.mesh.position.x;
    var initY = this.mesh.position.y;
    var initZ = this.mesh.position.z;

    TweenMax.to(this.mesh.position, speed, {
        x: 0,
        y: initY - 2 * f,
        z: Math.max(initZ + 15 * f, initZ + 40),
        ease: ease
    });
    TweenMax.to(this.mesh.rotation, speed, {
        x: Math.random() * Math.PI * 3,
        y: Math.random() * Math.PI * 3,
        ease: ease
    });

    var bezierScale = [{
        x: 1,
        y: 1,
        z: 1
    }, {
        x: f / maxSneezingRate + Math.random() * .3,
        y: f / maxSneezingRate + Math.random() * .3,
        z: f * 2 / maxSneezingRate + Math.random() * .3
    }, {
        x: f / maxSneezingRate + Math.random() * .5,
        y: f / maxSneezingRate + Math.random() * .5,
        z: f * 2 / maxSneezingRate + Math.random() * .5
    }, {
        x: f * 2 / maxSneezingRate + Math.random() * .5,
        y: f * 2 / maxSneezingRate + Math.random() * .5,
        z: f * 4 / maxSneezingRate + Math.random() * .5
    }, {
        x: f * 2 + Math.random() * 5,
        y: f * 2 + Math.random() * 5,
        z: f * 2 + Math.random() * 5
    }];

    TweenMax.to(this.mesh.scale, speed * 2, {
        bezier: bezierScale,
        ease: ease,
        onComplete: function () {
            _this.initialize();
        }
    });

    TweenMax.to(this.mesh.material, speed, {
        opacity: 0,
        ease: ease
    });
    //*

    var bezierColor = [{
        r: 255 / 255,
        g: 205 / 255,
        b: 74 / 255
    }, {
        r: 255 / 255,
        g: 205 / 255,
        b: 74 / 255
    }, {
        r: 255 / 255,
        g: 205 / 255,
        b: 74 / 255
    }, {
        r: 247 / 255,
        g: 34 / 255,
        b: 50 / 255
    }, {
        r: 0 / 255,
        g: 0 / 255,
        b: 0 / 255
    }];


    TweenMax.to(this.color, speed, {
        bezier: bezierColor,
        ease: Strong.easeOut,
        onUpdate: function () {
            _this.updateColor();
        }
    });
    //*/
}

function getSmokeParticle() {
    var p;
    if (!awaitingSmokeParticles.length) {
        p = new SmokeParticle();
    }
    p = awaitingSmokeParticles.pop();
    return p;
}

function loop() {
    render();
    if (!dragon.isSneezing) {
        dragon.update();
    }

    if (timeSmoke > 0) {
        //if (timeSmoke%2==0){
        var noseTarget = (Math.random() > .5) ? dragon.noseL : dragon.noseR;
        var p = getSmokeParticle();
        var pos = noseTarget.localToWorld(new THREE.Vector3(0, 0, 2));

        p.mesh.position.x = pos.x;
        p.mesh.position.y = pos.y;
        p.mesh.position.z = pos.z;
        p.mesh.material.color.setHex(0x555555);
        p.mesh.material.opacity = .2;

        scene.add(p.mesh);
        p.fly();
        //}
        timeSmoke--;
    }

    if (timeFire > 0) {
        var noseTarget = (Math.random() > .5) ? dragon.noseL : dragon.noseR;
        var colTarget = (Math.random() > .5) ? 0xfdde8c : 0xcb3e4c;
        var f = getSmokeParticle();
        var posF = noseTarget.localToWorld(new THREE.Vector3(0, 0, 2));

        f.mesh.position.x = posF.x;
        f.mesh.position.y = posF.y;
        f.mesh.position.z = posF.z;
        f.color = {
            r: 255 / 255,
            g: 205 / 255,
            b: 74 / 255
        };
        f.mesh.material.color.setRGB(f.color.r, f.color.g, f.color.b);
        f.mesh.material.opacity = 1;

        scene.add(f.mesh);
        f.fire(fireRate);
        timeFire--;
    }

    //    console.log(camera.position.x);

    requestAnimationFrame(loop);

    //    this.controls.rotateLeft(0.15);
}

function render() {
    if (controls) controls.update();
    renderer.render(scene, camera);
}

init();
createLights();
createFloor();
createDragon();
loop();

//dragon.threegroup.rotation.y = Math.PI/4;

function clamp(v, min, max) {
    return Math.min(Math.max(v, min), max);
}

function rule3(v, vmin, vmax, tmin, tmax) {
    var nv = Math.max(Math.min(v, vmax), vmin);
    var dv = vmax - vmin;
    var pc = (nv - vmin) / dv;
    var dt = tmax - tmin;
    var tv = tmin + (pc * dt);
    return tv;

}

/* - - - - - - - - - - - - - - - - - - */

//------------------------------------------------------------------------------
// Copyright IBM Corp. 2014
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//------------------------------------------------------------------------------
var sockjs_url = '/sensortag';
var sockjs = new SockJS(sockjs_url);

var multiplexer = new WebSocketMultiplex(sockjs);

var accel = multiplexer.channel('accel');

accel.onopen = function () {
    //    console.log("accel open");
};
accel.onclose = function (e) {
    //    console.log("accel closed");
}
accel.onmessage = function (e) {
    var data = jQuery.parseJSON(e.data);
    var value = data.d;
    value.x = parseFloat(value.accelX);
    value.y = parseFloat(value.accelY);
    value.z = parseFloat(value.accelZ);
    $("#accelerometerPayload").html("accel<br> {x: " + value.accelX + ", y: " + value.accelY + ", z: " + value.accelZ + "}");
    sensorData.setReading("accelerometer", value);
};

var gyro = multiplexer.channel('gyro');
gyro.onopen = function () {
    console.log("gyro open");
};
gyro.onmessage = function (e) {
    var data = jQuery.parseJSON(e.data);
    var value = data.d;
    value.x = parseFloat(value.gyroX);
    value.y = parseFloat(value.gyroY);
    value.z = parseFloat(value.gyroZ);
    $("#gyroscopePayload").html("gyro<br> {x: " + value.gyroX + ", y: " + value.gyroY + ", z: " + value.gyroZ + "}");
    sensorData.setReading("gyroscope", value);
};

//var mag = multiplexer.channel('mag');
//mag.onopen = function () {
//    //    console.log("mag open");
//};
//mag.onmessage = function (e) {
//    var data = jQuery.parseJSON(e.data);
//    var value = data.d;
//    value.x = parseFloat(value.magX);
//    value.y = parseFloat(value.magY);
//    value.z = parseFloat(value.magZ);
//    $("#magnetometerPayload").html("mag<br> {x: " + value.magX + ", y: " + value.magY + ", z: " + value.magZ + "}");
//    sensorData.setReading("magnetometer", value);
//};
//var air = multiplexer.channel('air');
//air.onopen = function () {
//    //    console.log("air open");
//};
//air.onmessage = function (e) {
//    var data = jQuery.parseJSON(e.data);
//    sensorData.setReading("barometer", parseFloat(data.d.pressure));
//    $("#barometerPayload").html("air/barometer :: " + data.d.pressure);
//    sensorData.setReading("humidity", parseFloat(data.d.humidity));
//    $("#humidityPayload").html("air/humidity :: " + data.d.humidity);
//    sensorData.setReading("ambientTemp", parseFloat(data.d.ambientTemp));
//    $("#ambientTemp").html("air/ambientTemp :: " + data.d.ambientTemp);
//    sensorData.setReading("objectTemp", parseFloat(data.d.objTemp));
//    $("#objectTemp").html("air/objectTemp :: " + data.d.objTemp);
//
//};


var click = multiplexer.channel('click');

click.onopen = function () {};

click.onmessage = function (e) {
    var data = jQuery.parseJSON(e.data);
    if (data.d.left && !data.d.right) {}
    if (data.d.right && !data.d.left) {
        handleMouseUp(data);
    }
};

function connectOnClick() {
    var uuid = document.getElementById('uuid').value;
    var data = JSON.stringify({
        "deviceId": uuid
    });
    accel.send(data);
    click.send(data);
    $('#uuid').hide();
    $('#uuidConfirm').hide();

    localStorage.setItem("sensortag", uuid);
}

function SensorData() {
    this.accelerometer = {
        x: null,
        y: null,
        z: null
    };
    this.gyroscope = {
        x: null,
        y: null,
        z: null
    };
    this.magnetometer = {
        x: null,
        y: null,
        z: null
    };
    this.humidity = null;

    this.objectTemp = [];
    this.ambientTemp = [];
}
SensorData.prototype.setReading = function (type, value) {
    console.log('dragon');
    console.log("new value for " + type, value);

    switch (type) {
    case "ambientTemp":
    case "objectTemp":
        var data = {
            time: (new Date()), //Math.round((new Date()).getTime() / 1000) * 1000,
            //time: (new Date()).toTimeString().substring(0, 8),
            value: value
        };
        console.log("data: " + JSON.stringify(data));
        this[type].push(data);
        break;
    case "humidity":
        this[type] = value;
        break;
    case "barometer":
        this[type] = value;
        break;
    case "accelerometer":
        this[type] = value;
        break;
    case "gyroscope":
        this[type] = value;

        if (value.x > 1) {
            controls.rotateLeft(-0.5);
        }

        if (value.x < -1) {
            controls.rotateLeft(0.5);
        }

        break;
    case "magnetometer":
        this[type] = value;
        break;
    default:
        this[type] = value;
        break;
    }
}
SensorData.prototype.getTempGraphData = function () {
    var availableData = Math.min(sensorData.ambientTemp.length, sensorData.objectTemp.length);
    var values = [];

    for (var i = 0; i < availableData; i++) {
        values.push({
            x: sensorData.ambientTemp[i].time,
            //x: 0,
            y: sensorData.ambientTemp[i].value,
            z: sensorData.objectTemp[i].value
        });
    }

    if (availableData < 30) {
        for (var i = 0; i < 30 - availableData; i++) {
            values.splice(0, 0, {
                x: 0,
                y: 0,
                z: 0
            });
        }
    }
    if (availableData > 30) {
        values.splice(0, availableData - 30);
    }

    // fill in x values
    for (var i = 0; i < values.length; i++) {
        if (values[i].x == 0) {
            values[i].x = new Date((new Date()).getTime() - (values.length - i) * 1000);
        }
    }

    return values;
}

var sensorData = new SensorData();

function onMessage(msg) {
    var topic = msg.destinationName;
    var tagData = JSON.parse(msg.payloadString);

    try {
        for (var count in tagData.d) {
            prop = tagData.d[count];
            var type = prop.p;
            var value = prop.v;

            console.log(type);
            switch (type) {
            case "accelerometer":
                //            case "magnetometer":
                break;
            case "gyroscope":
                value.x = parseFloat(value.x);
                value.y = parseFloat(value.y);
                value.z = parseFloat(value.z);

                //                $("#" + type + "Payload").html(topic + "<br>" + JSON.stringify(value));
                break;
            case "humidity":
            case "ambientTemp":
            case "objectTemp":
            case "barometer":
                value = parseFloat(value);
            default:
                $("#" + type + "Payload").html(topic + "/" + type + " :: " + value);
                break;
            }
            console.log(type, value);
            sensorData.setReading(type, value);
        }
    } catch (e) {
        console.error(e.stack, e.message);
    }
}

function connectFromLocalStorage() {
    setTimeout(function () {
        var macaddress = localStorage.getItem("sensortag");

        if (macaddress) {

            var data = JSON.stringify({
                "deviceId": macaddress
            });
            //            air.send(data);
            //            mag.send(data);
            gyro.send(data);
            accel.send(data);
            click.send(data);
            $('#uuid').hide();
            $('#uuidConfirm').hide();

        }
    }, 5000);
}