/* ASTRA v8.5 — in-place finale refinement. No renderer or imagery replacement.
 * Aladin Lite remains the sole sky renderer. Only its sky surface is transformed;
 * every label, hit target, credit and piece of interface text stays in screen space.
 */
(function(root){
  'use strict';
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const mix=(a,b,t)=>a+(b-a)*t;
  const smooth=t=>{t=clamp(t,0,1);return t*t*t*(t*(t*6-15)+10)};
  const radians=d=>d*Math.PI/180;
  const degrees=r=>r*180/Math.PI;
  const wrap=d=>((d%360)+360)%360;
  const vector=([ra,dec])=>{ra=radians(ra);dec=radians(dec);return[Math.cos(dec)*Math.cos(ra),Math.cos(dec)*Math.sin(ra),Math.sin(dec)]};
  const coordinate=v=>[wrap(degrees(Math.atan2(v[1],v[0]))),degrees(Math.atan2(v[2],Math.hypot(v[0],v[1])))];
  function slerpRaDec(from,to,t){
    const a=vector(from),b=vector(to),angle=Math.acos(clamp(a.reduce((s,v,i)=>s+v*b[i],0),-1,1));
    if(angle<1e-7)return from.slice();
    const sine=Math.sin(angle);
    if(Math.abs(sine)<1e-7)return[mix(from[0],from[0]+((to[0]-from[0]+540)%360-180),t),mix(from[1],to[1],t)];
    const x=Math.sin((1-t)*angle)/sine,y=Math.sin(t*angle)/sine;
    return coordinate(a.map((v,i)=>v*x+b[i]*y));
  }

  // One C2-continuous, monotone logarithmic lens curve. No intermediate stops,
  // reversals, piecewise speed resets, or late projection switch.
  function sampleCamera(t,start,layout){
    t=clamp(t,0,1);
    const q=smooth(t);
    // A single optical scale drives BOTH the lens and the final framing. Keep
    // the overscan surface at full size until the complete ellipse fits inside
    // its canvas; shrinking it earlier exposes rotating rectangular corners.
    // At the native 360-degree limit, CSS continues the exact same zoom curve.
    const opticalFov=Math.exp(mix(Math.log(start.fov),Math.log(360/layout.scale),q));
    const fov=Math.min(360,opticalFov);
    // Keep the renderer at full overscan until Aladin reaches the native 360° AIT
    // ellipse. After that point CSS continues the exact same optical zoom curve,
    // so the only boundary that can be exposed is the natural celestial ellipse.
    const surfaceScale=Math.min(1,360/opticalFov);
    const galacticCenter=[266.4051,-28.936175],finalCenter=[0,0];
    const a=slerpRaDec(start.center,galacticCenter,q),b=slerpRaDec(galacticCenter,finalCenter,q);
    const center=slerpRaDec(a,b,q);
    const fullTurn=layout.portrait?450:360;
    return{
      fov,center,
      rotation:fullTurn*q,
      scale:surfaceScale,
      cx:layout.cx,cy:layout.cy,
      side:layout.side,progress:t
    };
  }

  function getLayout(width,height,cardWidth,cardHeight){
    const portrait=width<height*.95,gutter=width<720?18:32,top=width<720?64:72;
    // Map framing uses the full viewport. The end card overlays it rather than
    // reducing the celestial canvas; labels use a separately protected area.
    const mapBounds={left:gutter,top:gutter,right:width-gutter,bottom:height-gutter};
    const labelBottom=Math.max(top+120,height-cardHeight-(width>=720?32:0)-18);
    const labelBounds={left:gutter,top,right:width-gutter,bottom:Math.min(height-gutter,labelBottom)};
    const bw=mapBounds.right-mapBounds.left,bh=mapBounds.bottom-mapBounds.top;
    // Cover the viewport instead of fitting fully inside it. This removes the
    // black bars on both desktop and portrait mobile while keeping the same finale.
    const major=Math.ceil(Math.max(bw,bh*2,portrait?bw*2:0)*1.02);
    const cx=width/2,cy=height/2;
    // A square with side >= viewport diagonal covers every rectangular corner
    // through a full rotation. Extra overscan protects browser rounding/resize.
    const side=Math.ceil(Math.hypot(width,height)*1.08)+8;
    return{width,height,side,portrait,bounds:labelBounds,mapBounds,major,scale:major/side,cx,cy};
  }

  function toScreen(point,state){
    const a=radians(state.rotation),x=(point[0]-state.side/2)*state.scale,y=(point[1]-state.side/2)*state.scale;
    return[state.cx+x*Math.cos(a)-y*Math.sin(a),state.cy+x*Math.sin(a)+y*Math.cos(a)];
  }
  function toSkyPixel(point,state){
    const a=radians(-state.rotation),x=point[0]-state.cx,y=point[1]-state.cy;
    return[state.side/2+(x*Math.cos(a)-y*Math.sin(a))/state.scale,state.side/2+(x*Math.sin(a)+y*Math.cos(a))/state.scale];
  }

  // Five labels, two screen-space lanes. Keep 44px targets separated even when
  // Sirius, Rigel and Aldebaran are close together on the astronomical map.
  function packLabels(points,bounds){
    const mid=(bounds.left+bounds.right)/2,gap=12,height=44,pitch=48;
    const lanes=[[],[]];
    points.forEach(p=>lanes[p.x<mid?0:1].push({...p}));
    // Balance an unusually crowded lane (e.g. after panning) without moving stars.
    if(lanes[0].length>3||lanes[1].length>3){
      const busy=lanes[0].length>3?0:1;
      lanes[busy].sort((a,b)=>Math.abs(a.x-mid)-Math.abs(b.x-mid));
      while(lanes[busy].length>3)lanes[1-busy].push(lanes[busy].shift());
    }
    const result=[];
    lanes.forEach((items,lane)=>{
      items.sort((a,b)=>a.y-b.y);
      items.forEach((p,i)=>{p.top=Math.max(clamp(p.y-height/2,bounds.top,bounds.bottom-height),i?items[i-1].top+pitch:bounds.top)});
      if(items.length){
        const excess=Math.max(0,items[items.length-1].top+height-bounds.bottom);
        items.forEach(p=>{p.top-=excess});
      }
      for(const p of items){
        const width=Math.min(p.width,(bounds.right-bounds.left)/2-gap);
        const left=lane===0?clamp(p.x-width-18,bounds.left,mid-gap-width):clamp(p.x+18,mid+gap,bounds.right-width);
        result.push({...p,left,width,height,lane,endX:lane===0?left+width:left,endY:p.top+height/2});
      }
    });
    // Also protect the actual source circles, not just neighboring labels.
    // Short landscape views can cluster Sirius under Rigel's label. Search
    // nearby vertical slots while retaining the two collision-free lanes.
    for(let lane=0;lane<2;lane++){
      const labels=result.filter(p=>p.lane===lane).sort((a,b)=>a.top-b.top);
      const placed=[];
      for(const label of labels){
        const initial=label.top,candidates=[initial];
        for(let d=4;d<=bounds.bottom-bounds.top;d+=4)candidates.push(initial+d,initial-d);
        const found=candidates.find(top=>{
          if(top<bounds.top||top+height>bounds.bottom)return false;
          if(placed.some(other=>top<other.top+height+4&&top+height+4>other.top))return false;
          return !points.some(point=>point.x>label.left-10&&point.x<label.left+label.width+10&&point.y>top-10&&point.y<top+height+10);
        });
        if(found!==undefined)label.top=found;
        label.endY=label.top+height/2;placed.push(label);
      }
    }
    return result;
  }

  class Controller{
    constructor(options){
      Object.assign(this,options);
      this.app=this.stage.parentElement;
      this.ui=document.getElementById('finaleMapUi');
      this.gestures=document.getElementById('finaleMapGestures');
      this.leaders=document.getElementById('finaleMapLeaders');
      this.dots=document.getElementById('finaleMapDots');
      this.labels=document.getElementById('finaleMapLabels');
      this.details=document.getElementById('finaleMapDetails');
      this.carry=document.getElementById('finaleCarry');
      this.credit=document.getElementById('surveyCredit');
      this.card=document.getElementById('endcard');
      this.originalStyle=this.stage.getAttribute('style');
      this.frame=0;this.redrawFrame=0;this.elapsed=0;this.lastTime=0;
      this.exploring=false;this.destroyed=false;this.points=new Map();this.removers=[];
      this.labelItems=[];this.titleShown=false;this.titleOut=false;this.labelsShown=false;
      this.resizeListener=()=>{
        if(this.destroyed)return;
        this.measure();
        if(this.exploring){
          // Orientation changes preserve the sky, not a sideways text layer.
          this.state={...this.state,...sampleCamera(1,this.start,this.layout),center:this.viewer.getRaDec(),fov:this.viewer.getFov()[0]};
          this.applySurface();this.scheduleLabels();
        }
      };
    }
    listen(el,type,fn,opts){el.addEventListener(type,fn,opts);this.removers.push(()=>el.removeEventListener(type,fn,opts))}
    measure(){
      const rect=this.app.getBoundingClientRect();
      this.card.classList.add('measure');
      const card=this.card.getBoundingClientRect();
      this.card.classList.remove('measure');
      this.layout=getLayout(rect.width,rect.height,card.width,card.height);
      this.stage.style.inset='auto';
      this.stage.style.width=`${this.layout.side}px`;
      this.stage.style.height=`${this.layout.side}px`;
      this.ui.style.setProperty('--map-bottom',`${rect.height-this.layout.bounds.bottom}px`);
      this.ui.style.setProperty('--map-top',`${this.layout.bounds.top}px`);
      this.leaders.setAttribute('viewBox',`0 0 ${rect.width} ${rect.height}`);
    }
    buildLabels(){
      this.labels.replaceChildren();this.dots.replaceChildren();this.leaders.replaceChildren();
      this.labelItems=this.stars.map((star,index)=>{
        const button=document.createElement('button');button.type='button';button.className='sky-label';
        const text=document.createElement('span');text.textContent=`${star.letter} · ${star.name}`;button.append(text);
        button.setAttribute('aria-label',`${star.name}: ${star.type}. Show details.`);
        const dot=document.createElement('span');dot.className='sky-map-dot';dot.setAttribute('aria-hidden','true');
        const line=document.createElementNS('http://www.w3.org/2000/svg','path');
        this.labels.append(button);this.dots.append(dot);this.leaders.append(line);
        this.listen(button,'click',()=>this.showDetails(index,button));
        return{star,index,button,dot,line};
      });
      this.listen(document.getElementById('closeSkyDetails'),'click',()=>this.hideDetails());
    }
    applySurface(){
      const s=this.state;
      this.stage.style.left=`${s.cx}px`;this.stage.style.top=`${s.cy}px`;
      this.stage.style.transform=`translate(-50%,-50%) rotate(${s.rotation}deg) scale(${s.scale})`;
    }
    applyCamera(t){
      this.state=sampleCamera(t,this.start,this.layout);
      this.applySurface();
      this.viewer.gotoRaDec(...this.state.center);
      this.viewer.setFoV(this.state.fov);
      // Native rotation stays zero. Text is never placed in this transformed layer.
    }
    play({duration=44000,hold=0,isCurrent=()=>true,reduced=false,titleAt=10000,titleOutAt=24400}={}){
      this.reduced=reduced;this.duration=reduced?Math.min(12000,duration):duration;this.hold=0;
      this.isCurrent=isCurrent;
      const size=this.viewer.getSize(),center=this.viewer.getRaDec(),fov=this.viewer.getFov()[0];
      // v8.5: the carry frame is captured while the last stop is already stationary.
      // Avoiding a synchronous PNG readback on Finish removes a measurable click-time stall.
      if(typeof this.carryImage==='string'&&this.carryImage.startsWith('data:image/')){
        this.carry.src=this.carryImage;this.carry.hidden=false;this.carry.style.opacity='1';
      }else{this.carry.hidden=true;this.carry.removeAttribute('src')}
      this.markers?.hide?.();
      this.app.classList.add('finale-mode');this.ui.classList.remove('on','interactive');
      this.ui.inert=true;this.ui.setAttribute('aria-hidden','true');
      this.listen(window,'resize',this.resizeListener,{passive:true});
      this.listen(document,'visibilitychange',()=>{this.lastTime=0});
      this.bindGestures();
      return new Promise(resolve=>{
        this.resolve=resolve;
        const tick=now=>{
          if(this.destroyed||!isCurrent()){this.cancel();return}
          // No time jump on tab return or a stalled frame; the move resumes gently.
          if(this.lastTime&&!document.hidden)this.elapsed+=Math.min(80,Math.max(0,now-this.lastTime));
          this.lastTime=now;
          const t=clamp(this.elapsed/this.duration,0,1);
          if(!reduced)this.applyCamera(t);
          if(!this.carry.hidden){
            // The quintic camera curve barely moves during these first seconds.
            // Hold the real narrow-field frame while AIT resizes/redraws, then dissolve it.
            const holdMs=reduced?260:650,fadeMs=reduced?1150:2700;
            const alpha=1-smooth((this.elapsed-holdMs)/fadeMs);
            this.carry.style.opacity=String(alpha);
            if(alpha===0){this.carry.hidden=true;this.carry.removeAttribute('src')}
          }
          if(!this.titleShown&&this.elapsed>=titleAt){this.titleShown=true;this.onTitle?.()}
          if(!this.titleOut&&this.elapsed>=titleOutAt){this.titleOut=true;this.onTitleOut?.()}
          if(!this.revealAnnounced&&this.elapsed>=this.duration*.66){this.revealAnnounced=true;this.onTravel?.('Revealing the full sky')}
          if(this.elapsed>=this.duration-6000){
            if(!this.labelsShown){this.labelsShown=true;this.ui.classList.add('on');this.credit.classList.add('on')}
            this.drawLabels();
          }
          if(this.elapsed<this.duration+this.hold){this.frame=requestAnimationFrame(tick)}
          else{
            this.frame=0;this.state.progress=1;this.drawLabels();
            const done=this.resolve;this.resolve=null;done?.();
          }
        };
        // Spread resize, projection switch and first camera write across separate
        // frames. The carried image masks the renderer warm-up without freezing UI.
        this.frame=requestAnimationFrame(()=>{
          if(this.destroyed||!isCurrent()){this.cancel();return}
          this.measure();
          this.start={center,fov:clamp(fov*this.layout.side/Math.max(1,size[0]),.01,359)};
          this.frame=requestAnimationFrame(()=>{
            if(this.destroyed||!isCurrent()){this.cancel();return}
            try{this.viewer.setProjection('AIT');this.viewer.setRotation(0)}catch(_){}
            this.buildLabels();this.applyCamera(reduced?1:0);
            this.frame=requestAnimationFrame(()=>{
              this.lastTime=0;
              this.frame=requestAnimationFrame(tick);
            });
          });
        });
      });
    }
    enableExploration(){
      if(this.destroyed)return;
      this.exploring=true;this.ui.inert=false;this.ui.setAttribute('aria-hidden','false');
      this.ui.classList.add('on','interactive');this.credit.classList.add('on');
      this.drawLabels();
    }
    drawLabels(){
      if(this.destroyed||!this.state)return;
      const visible=[];
      for(const item of this.labelItems){
        const xy=this.viewer.world2pix(item.star.ra,item.star.dec);
        const p=xy&&toScreen(xy,this.state),b=this.layout.mapBounds;
        const show=p&&Number.isFinite(p[0])&&Number.isFinite(p[1])&&p[0]>=b.left&&p[0]<=b.right&&p[1]>=b.top&&p[1]<=b.bottom;
        item.button.hidden=!show;item.dot.hidden=!show;item.line.style.display=show?'':'none';
        if(!show)continue;
        item.dot.style.transform=`translate(${p[0]}px,${p[1]}px)`;
        visible.push({id:item.index,x:p[0],y:p[1],width:item.button.firstElementChild.offsetWidth+4});
      }
      const packed=packLabels(visible,this.layout.bounds);
      for(const label of packed){
        const item=this.labelItems[label.id];
        item.button.style.left=`${label.left}px`;item.button.style.top=`${label.top}px`;
        item.button.style.width=`${label.width}px`;
        item.line.setAttribute('d',`M ${label.x} ${label.y} L ${label.endX} ${label.endY}`);
      }
    }
    scheduleLabels(){
      if(this.redrawFrame)return;
      this.redrawFrame=requestAnimationFrame(()=>{this.redrawFrame=0;this.drawLabels()});
    }
    localPoint(event){const rect=this.app.getBoundingClientRect();return[event.clientX-rect.left,event.clientY-rect.top]}
    skyAt(point){
      const p=toSkyPixel(point,this.state);
      try{const w=this.viewer.pix2world(...p);return w&&Number.isFinite(w[0])&&Number.isFinite(w[1])?w:null}catch(_){return null}
    }
    moveAnchor(anchor,point){
      // Use the actual Aladin inverse projection. Two corrections preserve the
      // grabbed sky position without assuming CSS-rotated browser coordinates.
      if(!anchor)return;
      for(let n=0;n<2;n++){
        const under=this.skyAt(point);if(!under)break;
        const center=this.viewer.getRaDec();
        const dx=((anchor[0]-under[0]+540)%360)-180;
        const dy=anchor[1]-under[1];
        this.viewer.gotoRaDec(wrap(center[0]+dx),clamp(center[1]+dy,-89.5,89.5));
      }
      this.state.center=this.viewer.getRaDec();this.scheduleLabels();
    }
    zoom(ratio,point){
      const anchor=this.skyAt(point),current=this.viewer.getFov()[0];
      this.viewer.setFoV(clamp(current*ratio,.05,360));this.state.fov=this.viewer.getFov()[0];
      this.moveAnchor(anchor,point);this.scheduleLabels();
    }
    bindGestures(){
      const el=this.gestures;
      const snapshot=()=>{
        const points=[...this.points.values()];
        if(points.length===1)this.drag={point:points[0],anchor:this.skyAt(points[0])};
        if(points.length>=2){
          const a=points[0],b=points[1];
          this.pinch={distance:Math.hypot(a[0]-b[0],a[1]-b[1]),point:[(a[0]+b[0])/2,(a[1]+b[1])/2]};
        }else this.pinch=null;
      };
      this.listen(el,'pointerdown',event=>{
        if(!this.exploring||event.button>0)return;
        event.preventDefault();el.setPointerCapture(event.pointerId);this.hideDetails(false);
        this.points.set(event.pointerId,this.localPoint(event));snapshot();
      });
      this.listen(el,'pointermove',event=>{
        if(!this.exploring||!this.points.has(event.pointerId))return;
        const point=this.localPoint(event);this.points.set(event.pointerId,point);
        const points=[...this.points.values()];
        if(points.length>1&&this.pinch){
          const a=points[0],b=points[1],distance=Math.hypot(a[0]-b[0],a[1]-b[1]),mid=[(a[0]+b[0])/2,(a[1]+b[1])/2];
          if(distance>8&&this.pinch.distance>8)this.zoom(this.pinch.distance/distance,mid);
          snapshot();
        }else if(this.drag){
          if(this.drag.anchor)this.moveAnchor(this.drag.anchor,point);
          else{
            // A drag may start in the black outside the AIT ellipse. Map its
            // screen-space direction through the inverse transform as well.
            const previous=toSkyPixel(this.drag.point,this.state),next=toSkyPixel(point,this.state),center=this.viewer.getRaDec();
            const perPixel=this.viewer.getFov()[0]/this.state.side;
            this.viewer.gotoRaDec(wrap(center[0]+(next[0]-previous[0])*perPixel),clamp(center[1]+(next[1]-previous[1])*perPixel,-89.5,89.5));
            this.drag.point=point;this.scheduleLabels();
          }
        }
      });
      const release=event=>{this.points.delete(event.pointerId);snapshot()};
      this.listen(el,'pointerup',release);this.listen(el,'pointercancel',release);this.listen(el,'lostpointercapture',release);
      this.listen(el,'wheel',event=>{
        if(!this.exploring)return;
        event.preventDefault();this.hideDetails(false);
        const unit=event.deltaMode===1?16:event.deltaMode===2?this.layout.height:1;
        const normalized=clamp(event.deltaY*unit,-72,72);
        this.zoom(Math.exp(normalized*.0009),this.localPoint(event));
      },{passive:false});
      this.listen(el,'keydown',event=>{
        if(!this.exploring)return;
        const point=[this.state.cx,this.state.cy];
        if(['+','=','-','_'].includes(event.key)){event.preventDefault();this.zoom(event.key==='-'||event.key==='_'?1.2:1/1.2,point)}
        else if(event.key==='Home'){
          event.preventDefault();this.viewer.gotoRaDec(0,0);this.viewer.setFoV(360);this.scheduleLabels();
        }else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){
          event.preventDefault();const anchor=this.skyAt(point);
          const delta={ArrowLeft:[-24,0],ArrowRight:[24,0],ArrowUp:[0,-24],ArrowDown:[0,24]}[event.key];
          this.moveAnchor(anchor,[point[0]+delta[0],point[1]+delta[1]]);
        }
      });
      this.listen(this.ui,'keydown',event=>{if(event.key==='Escape')this.hideDetails()});
    }
    showDetails(index,trigger){
      if(!this.exploring)return;
      const star=this.stars[index];this.detailTrigger=trigger;
      document.getElementById('skyDetailName').textContent=star.name;
      document.getElementById('skyDetailType').textContent=star.type;
      document.getElementById('skyDetailCoords').textContent=star.coords;
      document.getElementById('skyDetailFacts').textContent=`${star.fact1[0]} · ${star.fact1[1]} — ${star.fact2[0]} · ${star.fact2[1]}`;
      this.details.hidden=false;
      document.getElementById('closeSkyDetails').focus({preventScroll:true});
    }
    hideDetails(restore=true){
      const wasOpen=!this.details.hidden;this.details.hidden=true;
      if(wasOpen&&restore)this.detailTrigger?.focus({preventScroll:true});
    }
    cancel(){if(this.frame)cancelAnimationFrame(this.frame);this.frame=0;const done=this.resolve;this.resolve=null;done?.()}
    destroy(){
      if(this.destroyed)return;
      this.destroyed=true;this.cancel();
      if(this.redrawFrame)cancelAnimationFrame(this.redrawFrame);
      this.removers.forEach(remove=>remove());this.removers=[];this.points.clear();
      this.ui.classList.remove('on','interactive');this.ui.inert=true;this.ui.setAttribute('aria-hidden','true');
      this.credit.classList.remove('on');this.hideDetails(false);this.carry.hidden=true;this.carry.removeAttribute('src');
      this.app.classList.remove('finale-mode');
      if(this.originalStyle===null)this.stage.removeAttribute('style');else this.stage.setAttribute('style',this.originalStyle);
      this.markers?.show?.();
      this.viewer.setRotation(0);
    }
  }
  root.AstraFinale={Controller,sampleCamera,getLayout,toScreen,toSkyPixel,packLabels,slerpRaDec};
})(typeof window==='undefined'?globalThis:window);
