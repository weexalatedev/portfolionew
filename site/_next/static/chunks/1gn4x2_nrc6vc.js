(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,7390,e=>{"use strict";e.i(39936);var t=e.i(50147),o=e.i(94425),i=e.i(59300),l=e.i(40069),n=e.i(31320);let a=null;function r(){let e=new o.f;return e.moveTo(-6,-4),e.lineTo(-2,-4),e.lineTo(2,-8),e.lineTo(2,8),e.lineTo(-2,4),e.lineTo(-6,4),e.closePath(),e.fill(0xffffff),e.arc(2,0,6,-Math.PI/4,Math.PI/4),e.moveTo(5,-8),e.arc(2,0,9,-Math.PI/3,Math.PI/3),e.stroke({width:1.5,color:0xffffff}),e}e.s(["renderVideoPlayer",0,function(e,i,a,d){let c=new t.t;c.x=i.position.x,c.y=i.position.y;let s=new t.t;s.eventMode="static",s.cursor="pointer";let h=new o.f;h.circle(0,0,40),h.fill({color:0,alpha:.6});let f=new o.f;return f.moveTo(-10,-15),f.lineTo(20,0),f.lineTo(-10,15),f.closePath(),f.fill(0xffffff),s.addChild(h),s.addChild(f),c.addChild(s),d.addChild(c),s.on("pointertap",async()=>{if(!e.match(/\.(mp4|webm|ogg)$/i)){console.warn("Source is not a standard video file:",e),alert("Video file not found or format not supported. Please provide an .mp4 file.");return}c.removeChild(s);let d=document.createElement("video");d.src=e,d.crossOrigin="anonymous",d.preload="auto",d.loop=!0;try{await d.play();let e=await n.f.from(d),h=new l.f(e);h.eventMode="static",h.cursor="pointer";let f=i.maxWidth/e.width,p=i.maxHeight/e.height,u=Math.min(f,p,1);h.scale.set(u),h.x=i.position.x,h.y=i.position.y,i.position.anchor?h.anchor.set(i.position.anchor.x,i.position.anchor.y):h.anchor.set(.5),h.on("pointertap",e=>{e.stopPropagation(),d.paused?(d.play(),c.removeChild(s)):(d.pause(),c.children.includes(s)||c.addChildAt(s,0))}),a.addChild(h);let m=new t.t;m.eventMode="static",m.cursor="pointer",m.x=i.maxWidth/2-50,m.y=i.maxHeight/2-50;let x=new o.f;x.circle(0,0,25),x.fill({color:0,alpha:.6});let y=r();m.addChild(x),m.addChild(y),c.addChild(m),m.on("pointertap",e=>{let t;e.stopPropagation(),d.muted=!d.muted,m.removeChild(y),y=d.muted?((t=new o.f).moveTo(-6,-4),t.lineTo(-2,-4),t.lineTo(2,-8),t.lineTo(2,8),t.lineTo(-2,4),t.lineTo(-6,4),t.closePath(),t.fill(0xffffff),t.moveTo(5,-6),t.lineTo(10,6),t.moveTo(10,-6),t.lineTo(5,6),t.stroke({width:2,color:0xffffff}),t):r(),m.addChild(y)})}catch(e){console.error("Failed to play video",e),c.removeChild(s),c.addChild(s),alert("Failed to play video.")}}),c},"renderYouTubePlayer",0,function(e,n,r){let d=new t.t;d.x=n.position.x,d.y=n.position.y;let c=function(e){for(let t of[/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,/youtube\.com\/v\/([^&\n?#]+)/]){let o=e.match(t);if(o)return o[1]}return null}(e),s=new t.t;d.addChild(s);let h=new o.f;h.rect(-n.maxWidth/2,-n.maxHeight/2,n.maxWidth,n.maxHeight),h.fill({color:0xffffff}),d.addChild(h),s.mask=h;let f=new o.f;if(f.rect(-n.maxWidth/2,-n.maxHeight/2,n.maxWidth,n.maxHeight),f.fill({color:1710618}),s.addChild(f),c){let e=`/img/yt/${c}.jpg`;i.f.load(e).then(e=>{let t=new l.f(e),o=Math.max(n.maxWidth/e.width,n.maxHeight/e.height);t.scale.set(o),t.anchor.set(.5),t.alpha=.7,s.addChild(t)}).catch(()=>{})}let p=new t.t;p.eventMode="static",p.cursor="pointer";let u=new o.f;u.circle(0,0,40),u.fill({color:0,alpha:.6});let m=new o.f;return m.moveTo(-10,-15),m.lineTo(20,0),m.lineTo(-10,15),m.closePath(),m.fill(0xffffff),p.addChild(u),p.addChild(m),d.addChild(p),r.addChild(d),p.on("pointerover",()=>{u.scale.set(1.1),m.scale.set(1.1)}),p.on("pointerout",()=>{u.scale.set(1),m.scale.set(1)}),p.on("pointertap",()=>{if(!c)return void console.error("Could not extract YouTube video ID");a&&a.remove();let e=document.createElement("div");e.style.cssText=`
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      cursor: pointer;
    `;let t=document.createElement("div"),o=Math.min(.8*window.innerWidth,1100),i=Math.min(.75*window.innerHeight,620),l=o,n=9/16*l;n>i&&(l=16/9*(n=i)),t.style.cssText=`
      position: relative;
      width: ${l}px;
      height: ${n}px;
      cursor: default;
    `;let r=document.createElement("button");r.style.cssText=`
      position: absolute;
      top: -20px;
      right: -20px;
      width: 40px;
      height: 40px;
      background: rgba(0, 0, 0, 0.8);
      border: 2px solid rgba(255, 255, 255, 0.5);
      border-radius: 50%;
      color: white;
      font-size: 18px;
      font-weight: 300;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      line-height: 1;
      padding: 0;
    `,r.innerHTML="✕",r.addEventListener("mouseenter",()=>{r.style.background="rgba(255, 255, 255, 0.2)",r.style.borderColor="rgba(255, 255, 255, 0.8)",r.style.transform="scale(1.1)"}),r.addEventListener("mouseleave",()=>{r.style.background="rgba(0, 0, 0, 0.8)",r.style.borderColor="rgba(255, 255, 255, 0.5)",r.style.transform="scale(1)"});let d=document.createElement("iframe");d.src=`https://www.youtube.com/embed/${c}?autoplay=1&rel=0`,d.style.cssText=`
      width: 100%;
      height: 100%;
      border: none;
      border-radius: 8px;
    `,d.allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",d.allowFullscreen=!0,t.appendChild(r),t.appendChild(d),e.appendChild(t),document.body.appendChild(e),a=e;let s=()=>{e.remove(),a=null,document.removeEventListener("keydown",h)};e.addEventListener("click",t=>{t.target===e&&s()}),r.addEventListener("click",e=>{e.stopPropagation(),s()});let h=e=>{"Escape"===e.key&&s()};document.addEventListener("keydown",h)}),d}])}]);