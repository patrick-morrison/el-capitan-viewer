import './style.css';

import {ModelViewer} from 'belowjs';

import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const $=s=>document.querySelector(s);let root,wreck,selectedPlans=new Set(['HOLD','MAIN_DECK','BRIDGE_DECK','PROFILE']);

const viewer=new ModelViewer($('#view'),{autoLoadFirst:false,showInfo:false,showStatus:false,enableMeasurement:true,enableMeasurementScaleCalibration:false,enableFlyControls:true,enableScreenshot:false,enableFullscreen:false,ktx2TranscoderPath:'./basis/',models:{elcapitan:{url:'./models/el_capitan.glb',name:'El Capitan',measurable:true,initialPositions:{desktop:{camera:{x:31,y:33,z:-73},target:{x:4,y:0,z:0}}}}},viewerConfig:{scene:{background:{type:'color',value:'#061017'}},camera:{fov:38,far:2000,desktop:{maxDistance:250,minDistance:3,enableDamping:true}}}});

window.elCapitan={viewer,ready:false};

function blend(){if(!root)return;const mix=Number($('#blend').value)/100;for(const m of Array.isArray(wreck.material)?wreck.material:[wreck.material]){m.transparent=mix>0;m.opacity=1-.94*mix;m.depthWrite=mix===0;m.needsUpdate=true}root.traverse(o=>{if(o.name.startsWith('Plan_')){o.visible=selectedPlans.has(o.name.replace('Plan_',''))&&mix>0;if(o.isMesh){o.material.opacity=mix;o.material.transparent=true;o.material.depthWrite=false}}});}

$('#blend').oninput=()=>{cancelMove();blend()};

viewer.on('model-switched',({model})=>{root=model;root.updateMatrixWorld(true);wreck=root.getObjectByName('Wreck_photogrammetry');viewer.measurementSystem?.setRaycastTargets(wreck);root.traverse(o=>{if(o.name.startsWith('Plan_')&&o.isMesh){const map=o.material.map;o.material=new THREE.MeshBasicMaterial({map,color:'#d8d4c9',transparent:true,side:THREE.DoubleSide,depthWrite:false});o.material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\ndiffuseColor.rgb = diffuse;')};o.material.customProgramCacheKey=()=>"neutral-plan-ink"}});root.traverse(o=>{if(o.name.startsWith('Fuel_tank_')){o.visible=false;}});const scene=viewer.getScene();scene.add(new THREE.HemisphereLight(0xc4e4f3,0x233941,.75));const light=new THREE.DirectionalLight(0xd1e5f5,.85);light.position.set(-20,70,-60);scene.add(light);blend();responsiveCamera();$('#status').textContent='Drag to orbit · scroll to move closer';setTimeout(()=>$('#status').classList.add('quiet'),7000);window.elCapitan.ready=true;window.elCapitan.root=root;});

viewer.on('model-load-error',e=>{$('#status').textContent='Could not load model.';console.error(e)});viewer.loadModel('elcapitan').catch(console.error);

const PLAN_VIEWS={"PROFILE": {"right": [0.9999993710204318, 0.0008032335178537045, -0.0007827992441829651], "up": [-0.0008024672564233535, 0.024785113713897126, -0.9996924798079114], "normal": [-0.0007835847390457746, 0.999692479192529, 0.024785742693164345]}, "BRIDGE_DECK": {"right": [0.9999296816027314, 0.0030787064798266433, 0.011452223202122956], "up": [0.003110218550463864, -0.9999914236132493, -0.0027348200151437675], "normal": [0.011443705275325837, 0.0027702466240307803, -0.9999306812690636]}, "MAIN_DECK": {"right": [0.9999809700256771, -0.002272275380003472, 0.005735534073075157], "up": [-0.002283299651578696, -0.9999955571881082, 0.0019162846203213408], "normal": [0.005731154264812336, -0.001929344096424891, -0.9999817155839154]}, "HOLD": {"right": [1.0, -4.151707733165948e-10, -1.526547837085889e-09], "up": [-4.1517076137937216e-10, -1.0, 7.81975008404318e-09], "normal": [-1.5265478403324207e-09, -7.819750083409402e-09, -1.0]}};
let cameraMove=null;let stableUp=new THREE.Vector3(0,1,0);const toggleTimers=new Map();
function orbitControls(){return viewer.belowViewer.cameraManager.getControls()}
function syncOrbitUp(){const c=orbitControls();c._quat.setFromUnitVectors(viewer.getCamera().up,new THREE.Vector3(0,1,0));c._quatInverse.copy(c._quat).invert()}
function flushOrbit(){const c=orbitControls();c._sphericalDelta.set(0,0,0);c._panOffset.set(0,0,0);c._scale=1;c._rotateDelta.set(0,0)}
function cancelMove(){if(!cameraMove)return;cameraMove=null;const c=orbitControls();stableUp.copy(viewer.getCamera().up);flushOrbit();syncOrbitUp();c.enabled=!viewer.flyControls?.pointerLocked;c.enableDamping=true;c.update()}
function beginOrbit(){cancelMove()}
function resetView(){for(const timer of toggleTimers.values())clearTimeout(timer);cameraMove=null;const cam=viewer.getCamera(),c=orbitControls();cam.position.set(31,33,-73);cam.up.set(0,1,0);stableUp.copy(cam.up);c.target.set(4,0,0);cam.lookAt(c.target);flushOrbit();syncOrbitUp();c.enabled=true;c.enableDamping=true;c.update()}
viewer.on('model-switched',()=>{const manager=viewer.belowViewer.cameraManager,old=manager.getControls();const target=old.target.clone();old.dispose();const c=new OrbitControls(viewer.getCamera(),viewer.belowViewer.renderer.domElement);c.target.copy(target);c.rotateSpeed=.8;c.zoomSpeed=1;c.panSpeed=1;c.enableDamping=true;c.dampingFactor=.08;c.minDistance=3;c.maxDistance=250;manager.controls=c;c.addEventListener('change',()=>manager.emit('change'));if(viewer.flyControls)viewer.flyControls.controls=c;if(viewer.measurementSystem)viewer.measurementSystem.controls=c;viewer.belowViewer.vrManager?.setControls(c);const update=c.update.bind(c);c.update=(...args)=>cameraMove||!c.enabled?false:update(...args);c.update()});
function focusDrawing(key){if(!root)return;for(const timer of toggleTimers.values())clearTimeout(timer);cancelMove();flushOrbit();selectedPlans.clear();selectedPlans.add(key);document.querySelectorAll('#drawing-switches button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.plan===key)));$('#blend').value=Math.max(80,Number($('#blend').value));blend();const plane=root.getObjectByName('Plan_'+key);const axes=PLAN_VIEWS[key];const up=new THREE.Vector3(...axes.up),right=new THREE.Vector3(...axes.right),normal=new THREE.Vector3(...axes.normal);const center=new THREE.Box3().setFromObject(plane).getCenter(new THREE.Vector3());let halfW=0,halfH=0;const attr=plane.geometry.attributes.position;for(let i=0;i<attr.count;i++){const point=new THREE.Vector3().fromBufferAttribute(attr,i).applyMatrix4(plane.matrixWorld).sub(center);halfW=Math.max(halfW,Math.abs(point.dot(right)));halfH=Math.max(halfH,Math.abs(point.dot(up)))}const cam=viewer.getCamera();const tan=Math.tan(THREE.MathUtils.degToRad(cam.fov/2));const distance=1.18*Math.max(halfH/tan,halfW/(tan*cam.aspect));const pos=center.clone().addScaledVector(normal,distance);const end=cam.clone();end.position.copy(pos);end.up.copy(up);end.lookAt(center);const controls=orbitControls();controls.enabled=false;controls.enableDamping=false;cameraMove={start:performance.now(),from:cam.position.clone(),to:pos,fromTarget:controls.target.clone(),target:center,fromUp:cam.up.clone(),fromQ:cam.quaternion.clone(),toQ:end.quaternion.clone(),up};}
function animateView(now){requestAnimationFrame(animateView);if(!cameraMove)return;const m=cameraMove;let t=Math.min(1,(now-m.start)/1600);t=t*t*(3-2*t);const cam=viewer.getCamera();const controls=orbitControls();cam.position.lerpVectors(m.from,m.to,t);controls.target.lerpVectors(m.fromTarget,m.target,t);cam.quaternion.slerpQuaternions(m.fromQ,m.toQ,t);cam.up.set(0,1,0).applyQuaternion(cam.quaternion).normalize();syncOrbitUp();cam.lookAt(controls.target);if(t===1){cam.up.copy(m.up);cancelMove(false);controls.update()}}requestAnimationFrame(animateView);
for(const [key,name] of [['HOLD','Hold'],['MAIN_DECK','Main deck'],['BRIDGE_DECK','Bridge deck'],['PROFILE','Profile']]){const button=document.createElement('button');button.dataset.plan=key;button.textContent=name;button.title='Click to toggle · double-click to isolate and frame';button.setAttribute('aria-pressed',String(selectedPlans.has(key)));button.onclick=e=>{cancelMove();clearTimeout(toggleTimers.get(key));if(e.detail>1)return;toggleTimers.set(key,setTimeout(()=>{if(selectedPlans.has(key))selectedPlans.delete(key);else selectedPlans.add(key);button.setAttribute('aria-pressed',String(selectedPlans.has(key)));blend()},220))};button.ondblclick=()=>{clearTimeout(toggleTimers.get(key));focusDrawing(key)};$('#drawing-switches').append(button)}
$('#view').addEventListener('pointerdown',beginOrbit,{capture:true});$('#view').addEventListener('wheel',beginOrbit,{capture:true,passive:true});document.addEventListener('keydown',e=>{if(e.key==='Escape')cancelMove();if(e.key==='Home'){e.preventDefault();resetView()}if(e.code==='KeyF')cancelMove()},{capture:true});viewer.on('fly-mode-change',()=>cancelMove());$('#home').onclick=resetView;


function responsiveCamera(){const cam=viewer.getCamera();if(!cam)return;cam.fov=THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(19))*Math.max(1,1.6/(innerWidth/innerHeight))));cam.updateProjectionMatrix()}window.addEventListener('resize',()=>requestAnimationFrame(responsiveCamera));




// In fly mode the wheel blends overlays; orbit mode retains its normal zoom.
let flyBlend=null;
viewer.on('fly-mode-change',()=>{flyBlend=null});
document.addEventListener('wheel',event=>{
 if(!viewer.flyControls?.pointerLocked)return;
 event.preventDefault();event.stopImmediatePropagation();
 const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
 if(!Number.isFinite(delta)||delta===0)return;
 flyBlend=THREE.MathUtils.clamp((flyBlend??Number($('#blend').value))+THREE.MathUtils.clamp(delta*.06,-8,8),0,100);
 $('#blend').value=String(Math.round(flyBlend));blend();
},{capture:true,passive:false});
