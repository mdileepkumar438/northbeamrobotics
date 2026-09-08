(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  const closeMenu = () => { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); };
  menu.addEventListener('click', () => { const open=nav.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); });
  document.addEventListener('keydown', e => { if(e.key==='Escape' && nav.classList.contains('open')) { closeMenu(); menu.focus(); } });
  document.addEventListener('click', e => { if(!e.target.closest('.site-header')) closeMenu(); });
  matchMedia('(min-width:861px)').addEventListener('change',closeMenu);

  const root = document.querySelector('[data-scene]');
  if(!root) return;
  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  if(!ctx) { root.querySelector('.motion-toggle').hidden=true; return; }
  const reduce = matchMedia('(prefers-reduced-motion:reduce)');
  let paused=reduce.matches, mode=root.dataset.scene, width=1,height=1,t=0,previous=0,frame=0,visible=true;
  let pointerX=0,pointerY=0,turnX=0,turnY=0;
  const motion = root.querySelector('.motion-toggle');
  const motionLabel = () => { motion.textContent=paused?'Play motion':'Pause motion'; motion.setAttribute('aria-pressed',String(paused)); };
  motionLabel();
  const resize = () => { const box=root.getBoundingClientRect(); width=box.width;height=box.height;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw(); };
  // Perspective projection of actual 3D geometry. No external renderer or model download.
  const project = ([x,y,z],rx=.25,ry=-.5,scale=1) => {
    const cy=Math.cos(ry),sy=Math.sin(ry),cx=Math.cos(rx),sx=Math.sin(rx);
    const xx=x*cy+z*sy,zz=-x*sy+z*cy,yy=y*cx-zz*sx,depth=y*sx+zz*cx;
    const perspective=5/(5+depth);
    return [width*.5+xx*scale*perspective,height*.50+yy*scale*perspective,depth];
  };
  const path = (points,close=false) => {ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));if(close)ctx.closePath();};
  const segment = (a,b,color,weight=1) => {path([a,b]);ctx.strokeStyle=color;ctx.lineWidth=weight;ctx.stroke();};
  const brandGeometry = [[-.95,1.15],[-.95,-1.15],[-.48,-1.15],[.48,.35],[.48,-1.15],[.95,-1.15],[.95,1.15],[.48,1.15],[-.48,-.35],[-.48,1.15]];
  function drawBrand(){
    const scale=Math.min(width*.29,height*.28), rx=-.15+turnY*.16,ry=-.48+Math.sin(t*.35)*.15+turnX*.3;
    const p=v=>project(v,rx,ry,scale);
    // A spatial orbit gives the emblem depth without implying a robot product.
    for(let ring=0;ring<2;ring++){
      const pts=[];for(let i=0;i<=128;i++){const a=i/128*Math.PI*2;pts.push(p([Math.cos(a)*1.72,1.28+Math.sin(a)*.16,Math.sin(a)*1.4]));}
      path(pts);ctx.strokeStyle=ring?'#3b8fc040':'#285473';ctx.lineWidth=ring?5:1;ctx.stroke();
    }
    const beam=ctx.createLinearGradient(0,height*.8,width,height*.25);beam.addColorStop(0,'#1597ff00');beam.addColorStop(.5,'#299df088');beam.addColorStop(1,'#77deff00');
    segment([0,height*.84],[width,height*.22],beam,1.5);
    const faces=[];
    for(let i=0;i<brandGeometry.length;i++){const a=brandGeometry[i],b=brandGeometry[(i+1)%brandGeometry.length];faces.push({points:[p([...a,-.22]),p([...b,-.22]),p([...b,.22]),p([...a,.22])],side:true});}
    faces.push({points:brandGeometry.map(a=>p([...a,.22])),side:false,back:true});
    faces.push({points:brandGeometry.map(a=>p([...a,-.22])),side:false});
    faces.sort((a,b)=>b.points.reduce((s,p)=>s+p[2],0)/b.points.length-a.points.reduce((s,p)=>s+p[2],0)/a.points.length);
    for(const face of faces){
      path(face.points,true);
      const metal=ctx.createLinearGradient(width*.23,height*.2,width*.7,height*.77);
      if(face.side){metal.addColorStop(0,'#446a88');metal.addColorStop(.5,'#112d48');metal.addColorStop(1,'#48b0e2');}
      else{metal.addColorStop(0,'#effcff');metal.addColorStop(.2,'#8cbdd6');metal.addColorStop(.42,'#356285');metal.addColorStop(.49,'#c4ecff');metal.addColorStop(.54,'#6ea7c8');metal.addColorStop(.8,'#294f73');metal.addColorStop(1,'#102d4a');}
      ctx.fillStyle=metal;ctx.fill();ctx.strokeStyle=face.side?'#5cb9e588':'#b0e7ffb0';ctx.lineWidth=1.1;ctx.stroke();
    }
    const a=t*.5;const dot=p([Math.cos(a)*1.72,1.28+Math.sin(a)*.16,Math.sin(a)*1.4]);ctx.beginPath();ctx.arc(dot[0],dot[1],3,0,Math.PI*2);ctx.fillStyle='#a4edff';ctx.shadowColor='#29b6ff';ctx.shadowBlur=16;ctx.fill();ctx.shadowBlur=0;
  }
  // Deterministic synthetic data for the educational sensing / mapping / planning demo.
  const obstacles=[[-1.45,-.25,.65,.65],[-.15,.7,.55,.8],[.9,-.8,.8,.55]];
  const route=[[-2,1.4],[-1,1.4],[-.8,1],[-.8,-.6],[-.3,-1.3],[1,-1.3],[2,-1.3]];
  function drawSensor(){
    const scale=Math.min(width*.19,height*.32),ry=-.37+turnX*.22,rx=.83+turnY*.1;
    const p=v=>project(v,rx,ry,scale);
    for(let i=-10;i<=10;i++){const v=i*.23;segment(p([-2.3,.5,v]),p([2.3,.5,v]),'#214566',1);segment(p([v,.5,-2.3]),p([v,.5,2.3]),'#214566',1);}
    for(const [x,z,w,d] of obstacles){
      if(mode==='sense'){
        for(let a=0;a<=9;a++)for(let b=0;b<=8;b++){for(const v of [[x+a*w/9,-.55,z+b*d/8],[x+a*w/9,-.55+b*1.05/8,z],[x,-.55+b*1.05/8,z+a*d/9]]){const q=p(v);ctx.fillStyle=`rgba(104,210,255,${.45+((a+b)%5)/10})`;ctx.fillRect(q[0],q[1],1.8,1.8);}}
      }else{
        const top=[p([x,-.3,z]),p([x+w,-.3,z]),p([x+w,-.3,z+d]),p([x,-.3,z+d])];
        path(top,true);ctx.fillStyle='#19668a99';ctx.fill();ctx.strokeStyle='#62ccef';ctx.stroke();
        for(let i=0;i<4;i++){const corners=[[x,z],[x+w,z],[x+w,z+d],[x,z+d]];segment(top[i],p([corners[i][0],.5,corners[i][1]]),'#4288aa');}
      }
    }
    if(mode==='plan'){
      const pts=route.map(([x,z])=>p([x,.42,z]));path(pts);ctx.lineWidth=3;ctx.strokeStyle='#b5f9ed';ctx.shadowColor='#74e8f5';ctx.shadowBlur=7;ctx.stroke();ctx.shadowBlur=0;
      const progress=(t*.4)%(route.length-1),i=Math.floor(progress),f=progress-i;const a=route[i],b=route[i+1];const dot=p([a[0]+(b[0]-a[0])*f,.38,a[1]+(b[1]-a[1])*f]);ctx.beginPath();ctx.arc(dot[0],dot[1],5,0,Math.PI*2);ctx.fillStyle='#e0fff9';ctx.fill();
    }else{
      const scan=(Math.sin(t*.65)*.5+.5)*4.6-2.3;segment(p([-2.3,.42,scan]),p([2.3,.42,scan]),'#9be9ff99',2);
    }
  }
  function draw(){ctx.clearRect(0,0,width,height);if(mode==='brand')drawBrand();else drawSensor();}
  function tick(now){frame=0;if(paused||!visible||document.hidden)return;t+=Math.min((now-previous)/1000||0,.04);previous=now;turnX+=(pointerX-turnX)*.045;turnY+=(pointerY-turnY)*.045;draw();frame=requestAnimationFrame(tick);}
  function start(){if(!frame&&!paused&&visible&&!document.hidden){previous=performance.now();frame=requestAnimationFrame(tick);}}
  function stop(){cancelAnimationFrame(frame);frame=0;}
  motion.addEventListener('click',()=>{paused=!paused;motionLabel();if(paused)stop();else start();});
  reduce.addEventListener('change',e=>{paused=e.matches;motionLabel();if(paused)stop();else start();});
  root.addEventListener('pointermove',e=>{if(paused||e.pointerType==='touch')return;const r=root.getBoundingClientRect();pointerX=(e.clientX-r.left)/r.width-.5;pointerY=(e.clientY-r.top)/r.height-.5;});
  root.addEventListener('pointerleave',()=>{pointerX=0;pointerY=0;});
  document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;visible?start():stop();},{threshold:.05}).observe(root);
  new ResizeObserver(resize).observe(root);
  const copy={sense:['Sense the surroundings','A synthetic point cloud illustrates how spatial measurements can describe surfaces and obstacles. This is an explanatory visual, not a working perception system.'],map:['Build a spatial representation','The same synthetic scene is simplified into a spatial map. Mapping connects measurements to a useful representation of the environment.'],plan:['Connect a task to motion','A pre-authored illustrative path moves around the displayed obstacles. This is not a live planner or a safety-validated robot trajectory.']};
  document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{mode=button.dataset.mode;document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));document.querySelector('#mode-title').textContent=copy[mode][0];document.querySelector('#mode-description').textContent=copy[mode][1];canvas.setAttribute('aria-label',copy[mode][0]+' — conceptual 3D illustration');draw();}));
  resize();root.classList.add('ready');start();
})();
