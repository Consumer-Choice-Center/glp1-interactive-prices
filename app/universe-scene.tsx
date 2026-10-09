"use client";
    import { useEffect, useRef } from "react";
import * as THREE from "three";
import { productDoseColor } from "./dose-colors";
import ZepboundVial from "./ZepboundVial";

type Product={id:string;name:string;accent:string;maker:"Novo Nordisk"|"Eli Lilly";model:"pen"|"vial"|"bottle";doses:string[]};
const makeLabel=(title:string,detail:string,accent:string)=>{const c=document.createElement("canvas");c.width=1024;c.height=512;const ctx=c.getContext("2d")!;ctx.fillStyle="#f8fbff";ctx.fillRect(0,0,1024,512);ctx.fillStyle=accent;ctx.fillRect(0,0,1024,60);ctx.fillStyle="#07142a";ctx.font="bold 106px Arial";ctx.fillText(title,54,232);ctx.font="42px Arial";ctx.fillStyle="#52627c";ctx.fillText(detail,58,315);ctx.fillStyle=accent;ctx.fillRect(56,358,320,12);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t};
const makePenLabel=(title:string,detail:string,dose:string,accent:string)=>{const c=document.createElement("canvas");c.width=768;c.height=1000;const ctx=c.getContext("2d")!;ctx.fillStyle="#f8fbff";ctx.fillRect(0,0,768,1000);ctx.fillStyle=accent;ctx.fillRect(0,0,768,74);ctx.fillRect(0,946,768,54);ctx.fillRect(540,74,228,872);ctx.save();ctx.translate(210,860);ctx.rotate(-Math.PI/2);ctx.fillStyle="#102445";ctx.font="bold 110px Arial";ctx.fillText(title,0,0,720);ctx.fillStyle="#5d6e83";ctx.font="39px Arial";ctx.fillText(detail,0,77,720);ctx.fillStyle=accent;ctx.fillRect(0,105,330,15);ctx.fillStyle=accent;ctx.font="bold 74px Arial";ctx.fillText(`${dose} mg`,0,195,600);ctx.restore();const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t};
function buildProduct(p:Product,dose:string){const g=new THREE.Group();g.userData.dose=dose;const doseAccent=productDoseColor(p.id,dose,p.accent);const displayAccent=p.id==="wegovy"&&dose==="2.4"?"#b9c6cf":doseAccent;const white=new THREE.MeshPhysicalMaterial({color:0xf1f7ff,metalness:.16,roughness:.25,clearcoat:.8});const silver=new THREE.MeshStandardMaterial({color:0x9aa6b7,metalness:.8,roughness:.24});const dark=new THREE.MeshStandardMaterial({color:0x111e34,metalness:.65,roughness:.3});const accent=new THREE.MeshStandardMaterial({color:new THREE.Color(displayAccent),metalness:.12,roughness:.42,emissive:new THREE.Color(displayAccent),emissiveIntensity:.06});const cylinder=(r1:number,r2:number,h:number,y:number,mat:THREE.Material)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,48),mat);m.position.y=y;g.add(m);return m};
 if(p.model==="pen"){
  cylinder(.35,.35,3.05,0,white);cylinder(.39,.39,.52,1.78,silver);cylinder(.37,.37,.15,2.12,dark);cylinder(.38,.38,.29,-1.66,dark);cylinder(.375,.375,.16,-1.53,accent);
  // The colour sleeve is a substantial part of the pen, matching each labeled strength.
  cylinder(.36,.36,1.25,-.67,accent);cylinder(.365,.365,.045,.32,accent);
  const label=new THREE.Mesh(new THREE.CylinderGeometry(.371,.371,1.18,64,1,true,-1.03,2.06),new THREE.MeshBasicMaterial({map:makePenLabel(p.name,p.id==="zepbound"?"tirzepatide injection":p.id==="wegovy-hd"?"7.2 mg · semaglutide":"semaglutide injection",dose,displayAccent),side:THREE.DoubleSide}));label.position.set(0,-.69,0);g.add(label);
  g.rotation.z=-.72;
 }else if(p.model==="vial"){
  const vial=ZepboundVial({position:[0,0,0],scale:.8,autoRotate:true,rotationSpeed:.22,dose,accent:doseAccent});
  g.add(vial);g.userData.vial=vial;
 }else{
  cylinder(.78,.78,2.05,-.17,white);cylinder(.84,.84,.16,-1.23,white);cylinder(.86,.86,.56,1.16,white);for(let i=0;i<24;i++){const x=Math.sin(i*Math.PI/12)*.856,z=Math.cos(i*Math.PI/12)*.856;const ridge=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.5,8),silver);ridge.position.set(x,1.16,z);g.add(ridge)}const label=new THREE.Mesh(new THREE.CylinderGeometry(.795,.795,1.12,64,1,true,-1.23,2.46),new THREE.MeshBasicMaterial({map:makeLabel(p.name,`${dose} mg · ${p.id==="foundayo"?"orforglipron":"semaglutide"} tablets`,doseAccent),side:THREE.DoubleSide}));label.position.set(0,-.25,0);g.add(label);g.rotation.z=.13;
 }
 g.traverse(o=>{if(o instanceof THREE.Mesh){o.castShadow=true;o.receiveShadow=true}});return g}
export default function UniverseScene({selected,dose,drugs,onSelect,focused=false}:{selected:string;dose:string|null;drugs:Product[];onSelect:(id:string)=>void;focused?:boolean}){
 const mount=useRef<HTMLDivElement>(null), live=useRef<{scene:THREE.Scene;groups:Map<string,THREE.Group>}|null>(null), state=useRef({selected,onSelect,focused,dose});
 useEffect(()=>{state.current={selected,onSelect,focused,dose};},[selected,onSelect,focused,dose]);
 useEffect(()=>{const host=mount.current;if(!host)return;let w=host.clientWidth,h=host.clientHeight;let renderer:THREE.WebGLRenderer;try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:"high-performance"})}catch{host.dataset.rendering="unavailable";return}renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.7));renderer.setSize(w,h);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;host.appendChild(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,w/h,.1,100);camera.position.set(0,0,18);scene.add(new THREE.AmbientLight(0xb5d2ff,2.2));const key=new THREE.PointLight(0x9cd7ff,95,30);key.position.set(-4,6,7);scene.add(key);const rim=new THREE.PointLight(0xffb471,75,30);rim.position.set(6,-3,3);scene.add(rim);
 const starPos=new Float32Array(1400*3),starCols=new Float32Array(1400*3);for(let i=0;i<1400;i++){starPos[i*3]=(Math.random()-.5)*42;starPos[i*3+1]=(Math.random()-.5)*25;starPos[i*3+2]=-6-Math.random()*16;const c=new THREE.Color(Math.random()>.85?0xffc99d:0x80bdf5);starCols[i*3]=c.r;starCols[i*3+1]=c.g;starCols[i*3+2]=c.b}const sg=new THREE.BufferGeometry();sg.setAttribute("position",new THREE.BufferAttribute(starPos,3));sg.setAttribute("color",new THREE.BufferAttribute(starCols,3));const stars=new THREE.Points(sg,new THREE.PointsMaterial({size:.035,vertexColors:true,transparent:true,opacity:.78}));scene.add(stars);
 const tracks={
  "Novo Nordisk":{color:0x4bbdff,rx:5.8,ry:2.65,z:-2.8,tilt:-.13,speed:.00013},
  "Eli Lilly":{color:0xff796d,rx:4.3,ry:1.9,z:-3.7,tilt:.16,speed:-.00017}
    } as const;
 const orbitStart=performance.now();
 const orbitAt=(d:Product,time:number)=>{
  const members=drugs.filter(x=>x.maker===d.maker);
  const spec=tracks[d.maker];
  const angle=members.findIndex(x=>x.id===d.id)*Math.PI*2/members.length+Math.max(0,time-orbitStart)*spec.speed+(d.maker==="Eli Lilly"?Math.PI+.7:.28);
  const x=Math.cos(angle)*spec.rx;
  return new THREE.Vector3(x,Math.sin(angle)*spec.ry+x*spec.tilt,spec.z+Math.sin(angle)*.34)
 };
 const trackMaterials:{maker:Product["maker"];core:THREE.MeshBasicMaterial;glow:THREE.MeshBasicMaterial}[]=[];
 (Object.keys(tracks) as Product["maker"][]).forEach(maker=>{
  const spec=tracks[maker];
  const points=Array.from({length:241},(_,i)=>{const a=i/240*Math.PI*2;const x=Math.cos(a)*spec.rx;return new THREE.Vector3(x,Math.sin(a)*spec.ry+x*spec.tilt,spec.z+Math.sin(a)*.34)});
  const curve=new THREE.CatmullRomCurve3(points,true);
  const core=new THREE.MeshBasicMaterial({color:spec.color,transparent:true,opacity:.66,depthWrite:false,blending:THREE.AdditiveBlending});
  const glow=new THREE.MeshBasicMaterial({color:spec.color,transparent:true,opacity:.14,depthWrite:false,blending:THREE.AdditiveBlending});
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve,300,.018,6,true),core));
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve,300,.105,6,true),glow));
  trackMaterials.push({maker,core,glow})
 });
 const orbitMarkers=(Object.keys(tracks) as Product["maker"][]).map(maker=>{
  const marker=new THREE.Mesh(new THREE.SphereGeometry(.10,16,16),new THREE.MeshBasicMaterial({color:tracks[maker].color,transparent:true,opacity:.9}));
  scene.add(marker);return {maker,marker}
 });
 const glowTexture=(()=>{const c=document.createElement("canvas");c.width=c.height=128;const ctx=c.getContext("2d")!;const gr=ctx.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,"rgba(255,255,255,.9)");gr.addColorStop(.18,"rgba(145,208,255,.35)");gr.addColorStop(1,"rgba(145,208,255,0)");ctx.fillStyle=gr;ctx.fillRect(0,0,128,128);return new THREE.CanvasTexture(c)})();for(let i=0;i<20;i++){const a=i*2.4,r=4+(i%4)*1.4;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture,color:i%3?0x8acaff:0xffb56c,transparent:true,opacity:.45}));sp.position.set(Math.cos(a)*r,Math.sin(a)*r*.58,-2-(i%3));sp.scale.setScalar(i%5===0?.6:.26);scene.add(sp)}
 const groupMap=new Map<string,THREE.Group>();drugs.forEach(d=>{const g=buildProduct(d,d.id===state.current.selected&&state.current.dose?state.current.dose:d.doses[d.doses.length-1]);const selectedAtStart=d.id===(state.current.focused?state.current.selected:"wegovy");g.position.copy(selectedAtStart?new THREE.Vector3(0,.22,2):orbitAt(d,performance.now()));g.scale.setScalar(selectedAtStart?.91:.48);scene.add(g);groupMap.set(d.id,g)});live.current={scene,groups:groupMap};
 let pointer={x:9,y:9},dragging=false,downX=0,downY=0,spin=0,frame=0;const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;const onMove=(e:PointerEvent)=>{const b=host.getBoundingClientRect();pointer={x:(e.clientX-b.left)/b.width*2-1,y:(e.clientY-b.top)/b.height*2-1};if(dragging)spin+=(e.movementX||0)*.007};const onDown=(e:PointerEvent)=>{onMove(e);dragging=true;downX=e.clientX;downY=e.clientY;host.setPointerCapture(e.pointerId)};const onUp=(e:PointerEvent)=>{dragging=false;if(Math.hypot(e.clientX-downX,e.clientY-downY)<8){const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(pointer.x,-pointer.y),camera);const hits=ray.intersectObjects([...groupMap.values()],true);if(hits.length){let obj:THREE.Object3D|null=hits[0].object;while(obj?.parent && ![...groupMap.values()].includes(obj as THREE.Group))obj=obj.parent;const entry=[...groupMap.entries()].find(([,g])=>g===obj);if(entry)state.current.onSelect(entry[0])}}};const onCancel=()=>{dragging=false;};const onLeave=()=>{pointer={x:9,y:9};host.style.cursor="default"};host.addEventListener("pointermove",onMove);host.addEventListener("pointerdown",onDown);host.addEventListener("pointerup",onUp);host.addEventListener("pointerleave",onLeave);host.addEventListener("pointercancel",onCancel);
 const resize=()=>{w=host.clientWidth;h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.position.z=w<700?23:18;camera.updateProjectionMatrix()};window.addEventListener("resize",resize);resize();const baseRot=new Map([...groupMap.entries()].map(([id,g])=>[id,g.rotation.z]));
 const projected=new THREE.Vector3();
 const tick=(t:number)=>{
  frame=requestAnimationFrame(tick);
  const active=state.current.focused?state.current.selected:"wegovy",order=drugs.map(x=>x.id);
  const time=reduced?0:t;
  let nearAny=false;
  groupMap.forEach((g,id)=>{
   const i=order.indexOf(id),isActive=id===active;
   const trackPosition=orbitAt(drugs[i],time);
   let targetX=isActive?0:trackPosition.x;
   let targetY=isActive?.22:trackPosition.y;
   const targetZ=isActive?2:trackPosition.z;
   if(isActive)targetY+=Math.sin(time*.0015+i*1.7)*.20;
   projected.copy(g.position).project(camera);
   const distance=Math.hypot((pointer.x-projected.x)*.9,pointer.y+projected.y);
   const proximity=Math.max(0,1-distance/(isActive?.48:.30));
   if(proximity>.22)nearAny=true;
   if(!reduced){targetX+=pointer.x*.38*proximity;targetY-=pointer.y*.32*proximity}
   const targetScale=(isActive?.91:.48)+(reduced?0:.12*proximity);
   g.position.x+=(targetX-g.position.x)*.055;
   g.position.y+=(targetY-g.position.y)*.055;
   g.position.z+=(targetZ-g.position.z)*.055;
   const scale=g.scale.x+(targetScale-g.scale.x)*.07;g.scale.setScalar(scale);
   const yaw=spin+Math.sin(time*.00055+i)*.22+pointer.x*.55*proximity;
   g.rotation.y+=(yaw-g.rotation.y)*.055;
   g.rotation.x+=((-pointer.y*.24*proximity)-g.rotation.x)*.06;
   g.rotation.z=(baseRot.get(id)||0)+Math.sin(time*.001+i)*.085;
   const vial=g.userData.vial as THREE.Group|undefined;
   if(vial&&vial.userData.autoRotate)vial.rotation.y=reduced?0:Math.max(0,time-orbitStart)*.001*vial.userData.rotationSpeed;
  });
  host.style.cursor=nearAny?"pointer":"grab";
  stars.rotation.z=time*.000008;
  (stars.material as THREE.PointsMaterial).opacity=.65+Math.sin(time*.0012)*.12;
  const activeProduct=drugs.find(d=>d.id===active)!;
  trackMaterials.forEach(track=>{const highlighted=track.maker===activeProduct.maker;track.core.opacity=highlighted?.78:.48;track.glow.opacity=highlighted?.20:.10});
  orbitMarkers.forEach(({maker,marker})=>{const product=drugs.find(d=>d.id===active&&d.maker===maker);marker.visible=!!product;if(product)marker.position.copy(orbitAt(product,time));});
  const targetCameraZ=w<700?(state.current.focused?20:23):(state.current.focused?14:18);
  camera.position.z=reduced?targetCameraZ:camera.position.z+(targetCameraZ-camera.position.z)*.045;
  renderer.render(scene,camera)
 };frame=requestAnimationFrame(tick);
 return()=>{live.current=null;cancelAnimationFrame(frame);window.removeEventListener("resize",resize);host.removeEventListener("pointermove",onMove);host.removeEventListener("pointerdown",onDown);host.removeEventListener("pointerup",onUp);host.removeEventListener("pointerleave",onLeave);host.removeEventListener("pointercancel",onCancel);renderer.dispose();renderer.domElement.remove();scene.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.Points||o instanceof THREE.Line){o.geometry?.dispose();const mat=o.material as THREE.Material|THREE.Material[];if(Array.isArray(mat))mat.forEach(x=>x.dispose());else mat?.dispose()}})};
 },[drugs]);
 useEffect(()=>{const current=live.current,product=drugs.find(x=>x.id===selected);if(!current||!product||!dose)return;
  const prior=current.groups.get(selected);if(!prior||prior.userData.dose===dose)return;
  const next=buildProduct(product,dose);next.position.copy(prior.position);next.rotation.copy(prior.rotation);next.scale.copy(prior.scale);
  current.scene.remove(prior);current.scene.add(next);current.groups.set(selected,next);
  prior.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>{if(m instanceof THREE.MeshBasicMaterial&&m.map)m.map.dispose();m.dispose()})}})
 },[selected,dose,drugs]);
 return <div className="universe-canvas" ref={mount} aria-hidden="true"/>}
