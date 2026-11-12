(()=>{"use strict";(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,54126,t=>{var e=t.i(81107),i=t.i(27076),o=t.i(65654),s=t.i(22558);let n=class t extends o.f{constructor(e){super(e={...t.defaultOptions,...e}),this.enabled=!0,this._state=s.f.for2d(),this.blendMode=e.blendMode,this.padding=e.padding,"boolean"==typeof e.antialias?this.antialias=e.antialias?"on":"off":this.antialias=e.antialias,this.resolution=e.resolution,this.blendRequired=e.blendRequired,this.clipToViewport=e.clipToViewport,this.addResource("uTexture",0,1),e.blendRequired&&this.addResource("uBackTexture",0,3)}apply(t,e,i,o){t.applyFilter(this,e,i,o)}get blendMode(){return this._state.blendMode}set blendMode(t){this._state.blendMode=t}static from(o){let s,n,{gpu:l,gl:r,...a}=o;return l&&(s=i.f.from(l)),r&&(n=e.f.from(r)),new t({gpuProgram:s,glProgram:n,...a})}};n.defaultOptions={blendMode:"normal",resolution:1,padding:0,antialias:"off",blendRequired:!1,clipToViewport:!0},t.s(["f",0,n])},35066,t=>{let e={name:"local-uniform-bit",vertex:{header:`

            struct LocalUniforms {
                uTransformMatrix:mat3x3<f32>,
                uColor:vec4<f32>,
                uRound:f32,
            }

            @group(1) @binding(0) var<uniform> localUniforms : LocalUniforms;
        `,main:`
            vColor *= localUniforms.uColor;
            modelMatrix *= localUniforms.uTransformMatrix;
        `,end:`
            if(localUniforms.uRound == 1)
            {
                vPosition = vec4(roundPixels(vPosition.xy, globalUniforms.uResolution), vPosition.zw);
            }
        `}},i={...e,vertex:{...e.vertex,header:e.vertex.header.replace("group(1)","group(2)")}},o={name:"local-uniform-bit",vertex:{header:`

            uniform mat3 uTransformMatrix;
            uniform vec4 uColor;
            uniform float uRound;
        `,main:`
            vColor *= uColor;
            modelMatrix = uTransformMatrix;
        `,end:`
            if(uRound == 1.)
            {
                gl_Position.xy = roundPixels(gl_Position.xy, uResolution);
            }
        `}};t.s(["q",0,e,"Y",0,o,"M",0,i])},22558,t=>{let e={normal:0,add:1,multiply:2,screen:3,overlay:4,erase:5,"normal-npm":6,"add-npm":7,"screen-npm":8,min:9,max:10},i=class t{constructor(){this.data=0,this.blendMode="normal",this.polygonOffset=0,this.blend=!0,this.depthMask=!0}get blend(){return!!(1&this.data)}set blend(t){!!(1&this.data)!==t&&(this.data^=1)}get offsets(){return!!(2&this.data)}set offsets(t){!!(2&this.data)!==t&&(this.data^=2)}set cullMode(t){if("none"===t){this.culling=!1;return}this.culling=!0,this.clockwiseFrontFace="front"===t}get cullMode(){return this.culling?this.clockwiseFrontFace?"front":"back":"none"}get culling(){return!!(4&this.data)}set culling(t){!!(4&this.data)!==t&&(this.data^=4)}get depthTest(){return!!(8&this.data)}set depthTest(t){!!(8&this.data)!==t&&(this.data^=8)}get depthMask(){return!!(32&this.data)}set depthMask(t){!!(32&this.data)!==t&&(this.data^=32)}get clockwiseFrontFace(){return!!(16&this.data)}set clockwiseFrontFace(t){!!(16&this.data)!==t&&(this.data^=16)}get blendMode(){return this._blendMode}set blendMode(t){this.blend="none"!==t,this._blendMode=t,this._blendModeId=e[t]||0}get polygonOffset(){return this._polygonOffset}set polygonOffset(t){this.offsets=!!t,this._polygonOffset=t}toString(){return`[pixi.js/core:State blendMode=${this.blendMode} clockwiseFrontFace=${this.clockwiseFrontFace} culling=${this.culling} depthMask=${this.depthMask} polygonOffset=${this.polygonOffset}]`}static for2d(){let e=new t;return e.depthTest=!1,e.blend=!0,e}};i.default2d=i.for2d(),t.s(["f",0,i])},89506,t=>{t.s(["f",0,function(t,e,i){let o=(t>>24&255)/255;e[i++]=(255&t)/255*o,e[i++]=(t>>8&255)/255*o,e[i++]=(t>>16&255)/255*o,e[i++]=o}])},40766,t=>{t.s(["f",0,class{constructor(){this.batcherName="default",this.topology="triangle-list",this.attributeSize=4,this.indexSize=6,this.packAsQuad=!0,this.roundPixels=0,this._attributeStart=0,this._batcher=null,this._batch=null}get blendMode(){return this.renderable.groupBlendMode}get color(){return this.renderable.groupColorAlpha}reset(){this.renderable=null,this.texture=null,this._batcher=null,this._batch=null,this.bounds=null}destroy(){}}])}])})();