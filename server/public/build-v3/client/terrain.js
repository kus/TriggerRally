// Generated by CoffeeScript 1.7.1

/*
 * Copyright (C) 2012 jareiko / http://www.jareiko.net/
 */

(function() {
  define(['THREE', 'underscore', 'client/array_geometry', 'util/image', 'util/quiver'], function(THREE, _, array_geometry, uImg, quiver) {
    var RenderTerrain, Vec2, Vec3;
    Vec2 = THREE.Vector2;
    Vec3 = THREE.Vector3;
    return {
      RenderTerrain: RenderTerrain = (function() {
        function RenderTerrain(scene, terrain, gl, terrainhq) {
          this.scene = scene;
          this.terrain = terrain;
          this.gl = gl;
          this.geom = null;
          if (terrainhq) {
            this.baseScale = 0.5;
            this.numLayers = 10;
            this.ringWidth = 15;
          } else {
            this.baseScale = 1;
            this.numLayers = 10;
            this.ringWidth = 7;
          }
          this.totalTime = 0;
          this.glDerivs = this.gl.getExtension('OES_standard_derivatives');
          this.glAniso = this.gl.getExtension("EXT_texture_filter_anisotropic") || this.gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
          return;
        }

        RenderTerrain.prototype.update = function(camera, delta) {
          var doubleScale, layer, offset, offsets, scale, scales, _i, _ref;
          this.totalTime += delta;
          if ((this.material == null) && (this.terrain.source != null)) {
            this._setup();
          }
          if (this.geom == null) {
            return;
          }
          offsets = this.material.uniforms['offsets'].value;
          scales = this.material.uniforms['scales'].value;
          scale = this.baseScale * Math.pow(2, Math.floor(Math.log(Math.max(1, camera.position.z / 2000)) / Math.LN2));
          for (layer = _i = 0, _ref = this.numLayers; 0 <= _ref ? _i < _ref : _i > _ref; layer = 0 <= _ref ? ++_i : --_i) {
            offset = offsets[layer] != null ? offsets[layer] : offsets[layer] = new THREE.Vector2();
            doubleScale = scale * 2;
            offset.x = (Math.floor(camera.position.x / doubleScale) + 0.5) * doubleScale;
            offset.y = (Math.floor(camera.position.y / doubleScale) + 0.5) * doubleScale;
            scales[layer] = scale;
            scale *= 2;
          }
        };

        RenderTerrain.prototype._setup = function() {
          var createTexture, detailNode, diffuseDirtTex, diffuseRockTex, heightNode, maps, obj, surfaceNode, threeFmt, threeType, typeScale, uniforms;
          diffuseDirtTex = THREE.ImageUtils.loadTexture('/a/textures/dirt.jpg');
          diffuseDirtTex.wrapS = THREE.RepeatWrapping;
          diffuseDirtTex.wrapT = THREE.RepeatWrapping;
          if (this.glAniso) {
            diffuseDirtTex.onUpdate = (function(_this) {
              return function() {
                return _this.gl.texParameteri(_this.gl.TEXTURE_2D, _this.glAniso.TEXTURE_MAX_ANISOTROPY_EXT, 4);
              };
            })(this);
          }
          diffuseRockTex = THREE.ImageUtils.loadTexture('/a/textures/rock.jpg');
          diffuseRockTex.wrapS = THREE.RepeatWrapping;
          diffuseRockTex.wrapT = THREE.RepeatWrapping;
          this.geom = this._createGeom();
          this.material = new THREE.ShaderMaterial({
            lights: true,
            fog: true,
            uniforms: _.extend(THREE.UniformsUtils.merge([THREE.UniformsLib['lights'], THREE.UniformsLib['shadowmap'], THREE.UniformsLib['fog']]), {
              tHeight: {
                type: 't',
                value: null
              },
              tHeightSize: {
                type: 'v2',
                value: new Vec2(1, 1)
              },
              tHeightScale: {
                type: 'v3',
                value: new Vec3(1, 1, 1)
              },
              tSurface: {
                type: 't',
                value: null
              },
              tSurfaceSize: {
                type: 'v2',
                value: new Vec2(1, 1)
              },
              tSurfaceScale: {
                type: 'v3',
                value: new Vec3(1, 1, 1)
              },
              tDetail: {
                type: 't',
                value: null
              },
              tDetailSize: {
                type: 'v2',
                value: new Vec2(1, 1)
              },
              tDetailScale: {
                type: 'v3',
                value: new Vec3(1, 1, 1)
              },
              tDiffuseDirt: {
                type: 't',
                value: diffuseDirtTex
              },
              tDiffuseRock: {
                type: 't',
                value: diffuseRockTex
              },
              offsets: {
                type: 'v2v',
                value: []
              },
              scales: {
                type: 'fv1',
                value: []
              }
            }),
            vertexShader: THREE.ShaderChunk.shadowmap_pars_vertex + '\n' + ("const int NUM_LAYERS = " + this.numLayers + ";\nconst float RING_WIDTH = " + this.ringWidth + ".0;\n\nuniform sampler2D tHeight;\nuniform vec2 tHeightSize;\nuniform vec3 tHeightScale;\nuniform sampler2D tSurface;\nuniform vec2 tSurfaceSize;\nuniform vec3 tSurfaceScale;\nuniform sampler2D tDetail;\nuniform vec2 tDetailSize;\nuniform vec3 tDetailScale;\nuniform vec2 offsets[NUM_LAYERS];\nuniform float scales[NUM_LAYERS];\n\nvarying vec4 eyePosition;\nvarying vec3 worldPosition;\n\nvec2 worldToMapSpace(vec2 coord, vec2 size, vec2 scale) {\n  return (coord / scale + 0.5) / size;\n}\n\nfloat catmullRom(float pm1, float p0, float p1, float p2, float x) {\n  float x2 = x * x;\n  return 0.5 * (\n    pm1 * x * ((2.0 - x) * x - 1.0) +\n    p0 * (x2 * (3.0 * x - 5.0) + 2.0) +\n    p1 * x * ((4.0 - 3.0 * x) * x + 1.0) +\n    p2 * (x - 1.0) * x2);\n}\n\n// Cubic sampling in one dimension.\nfloat textureCubicU(sampler2D samp, vec2 uv00, float texel, float offsetV, float frac) {\n  return catmullRom(\n      texture2D(samp, uv00 + vec2(-texel, offsetV)).r,\n      texture2D(samp, uv00 + vec2(0.0, offsetV)).r,\n      texture2D(samp, uv00 + vec2(texel, offsetV)).r,\n      texture2D(samp, uv00 + vec2(texel * 2.0, offsetV)).r,\n      frac);\n}\n\n// Cubic sampling in two dimensions, taking advantage of separability.\nfloat textureBicubic(sampler2D samp, vec2 uv00, vec2 texel, vec2 frac) {\n  return catmullRom(\n      textureCubicU(samp, uv00, texel.x, -texel.y, frac.x),\n      textureCubicU(samp, uv00, texel.x, 0.0, frac.x),\n      textureCubicU(samp, uv00, texel.x, texel.y, frac.x),\n      textureCubicU(samp, uv00, texel.x, texel.y * 2.0, frac.x),\n      frac.y);\n}\n\nfloat getHeight(vec2 worldPosition) {\n  vec2 heightUv = worldToMapSpace(worldPosition, tHeightSize, tHeightScale.xy);\n  vec2 texel = 1.0 / tHeightSize;\n\n  // Find the bottom-left texel we need to sample.\n  vec2 heightUv00 = (floor(heightUv * tHeightSize + 0.5) - 0.5) / tHeightSize;\n\n  // Determine the fraction across the 4-texel quad we need to compute.\n  vec2 frac = (heightUv - heightUv00) * tHeightSize;\n\n  // Compute an interpolated coarse height value.\n  float coarseHeight = textureBicubic(tHeight, heightUv00, texel, frac) * tHeightScale.z;\n\n  // Take a surface texture sample.\n  vec2 surfaceUv = worldToMapSpace(worldPosition, tSurfaceSize, tSurfaceScale.xy);\n  vec4 surfaceSample = texture2D(tSurface, surfaceUv - 0.5 / tSurfaceSize);\n\n  // Use the surface type to work out how much detail noise to add.\n  float detailHeightMultiplier = surfaceSample.a;\n  vec2 detailHeightUv = worldToMapSpace(worldPosition.xy, tDetailSize, tDetailScale.xy);\n  vec4 detailSample = texture2D(tDetail, detailHeightUv);\n  float detailHeightSample = detailSample.z - 0.5;\n  float detailHeight = detailHeightSample * tDetailScale.z * detailHeightMultiplier;\n\n  return coarseHeight + detailHeight;\n}\n\nvoid main() {\n  int layer = int(position.z);\n  vec2 layerOffset = offsets[layer];\n  float layerScale = scales[layer];\n\n  worldPosition = position * layerScale + vec3(layerOffset, 0.0);\n\n  // Work out how much morphing we need to do.\n  vec3 manhattan = abs(worldPosition - cameraPosition);\n  float morphDist = max(manhattan.x, manhattan.y) / layerScale;\n  float morph = min(1.0, max(0.0, morphDist / (RING_WIDTH / 2.0) - 3.0));\n\n  // Compute the morph direction vector.\n  vec2 layerPosition = worldPosition.xy / layerScale;\n  vec2 morphVector = mod(layerPosition.xy, 2.0) * (mod(layerPosition.xy, 4.0) - 2.0);\n  vec3 morphTargetPosition = vec3(worldPosition.xy + layerScale * morphVector, 0.0);\n\n  // Get the unmorphed and fully morphed terrain heights.\n  worldPosition.z = getHeight(worldPosition.xy);\n  morphTargetPosition.z = getHeight(morphTargetPosition.xy);\n\n  // Apply the morphing.\n  worldPosition = mix(worldPosition, morphTargetPosition, morph);\n\n  eyePosition = modelViewMatrix * vec4(worldPosition, 1.0);\n  gl_Position = projectionMatrix * eyePosition;\n\n  #ifdef USE_SHADOWMAP\n  for( int i = 0; i < MAX_SHADOWS; i ++ ) {\n    vShadowCoord[ i ] = shadowMatrix[ i ] * vec4( worldPosition, 1.0 );\n  }\n  #endif\n}"),
            fragmentShader: THREE.ShaderChunk.fog_pars_fragment + '\n' + THREE.ShaderChunk.lights_phong_pars_fragment + '\n' + THREE.ShaderChunk.shadowmap_pars_fragment + '\n' + "#extension GL_OES_standard_derivatives : enable\n\nuniform sampler2D tSurface;\n\nuniform vec2 tSurfaceSize;\nuniform vec3 tSurfaceScale;\nuniform sampler2D tDetail;\nuniform vec2 tDetailSize;\nuniform vec3 tDetailScale;\nuniform sampler2D tDiffuseDirt;\nuniform sampler2D tDiffuseRock;\n\nvarying vec4 eyePosition;\nvarying vec3 worldPosition;\n\nvec2 worldToMapSpace(vec2 coord, vec2 size, vec2 scale) {\n  return (coord / scale + 0.5) / size;\n}\n\nmat2 inverse(mat2 m) {\n  float det = m[0][0] * m[1][1] - m[0][1] * m[1][0];\n  return mat2(m[1][1], -m[1][0], -m[0][1], m[0][0]) / det;\n}\n\nfloat bias_fast(float a, float b) {\n  return b / ((1.0/a - 2.0) * (1.0-b) + 1.0);\n}\n\nfloat gain_fast(float a, float b) {\n  return (b < 0.5) ?\n    (bias_fast(1.0 - a, 2.0 * b) / 2.0) :\n    (1.0 - bias_fast(1.0 - a, 2.0 - 2.0 * b) / 2.0);\n}\n\nvoid main() {\n  gl_FragColor.a = 1.0;\n  float height = worldPosition.z;\n  float depth = length(eyePosition.xyz);\n  vec2 diffUv = worldPosition.xy / 4.0;\n  vec3 diffDirtSample = texture2D(tDiffuseDirt, diffUv).rgb;\n  vec3 diffRockSample = texture2D(tDiffuseRock, diffUv / 8.0).rgb;\n  vec2 surfaceUv = worldToMapSpace(worldPosition.xy, tSurfaceSize, tSurfaceScale.xy);\n  vec4 surfaceSample = texture2D(tSurface, surfaceUv - 0.5 / tSurfaceSize);\n\n  vec2 surfaceDerivs = 255.0 * tSurfaceScale.z / tSurfaceScale.xy * (surfaceSample.xy - 0.5);\n\n  float surfaceType = surfaceSample.b;\n  float detailHeightAmount = surfaceSample.a;\n\n  vec2 detailUv = worldToMapSpace(worldPosition.xy, tDetailSize, tDetailScale.xy);\n  vec4 detailSample = texture2D(tDetail, detailUv) - vec4(0.5, 0.5, 0.0, 0.0);\n  float detailHeight = detailSample.z;\n  vec2 detailDerivs = vec2(tDetailScale.z / tDetailScale.xy * detailSample.xy) * detailHeightAmount;\n\n  vec2 epsilon = 1.0 / tDetailSize;\n\n  vec3 normalDetail = normalize(vec3(- surfaceDerivs - detailDerivs, 1.0));\n  vec3 normalRegion = normalize(vec3(- surfaceDerivs, 1.0));\n\n  vec3 tangentU = vec3(1.0 - normalDetail.x * normalDetail.x, 0.0, -normalDetail.x);\n  vec3 tangentV = vec3(0.0, 1.0 - normalDetail.y * normalDetail.y, -normalDetail.y);\n\n  // Add another layer of high-detail noise.\n  vec3 normalSq = normalDetail * normalDetail;\n  vec2 detail2SampleX = texture2D(tDetail, worldToMapSpace(worldPosition.zy, tDetailSize, tDetailScale.xy / 37.3)).xy;\n  vec2 detail2SampleY = texture2D(tDetail, worldToMapSpace(worldPosition.xz, tDetailSize, tDetailScale.xy / 37.3)).xy;\n  vec2 detail2SampleZ = texture2D(tDetail, worldToMapSpace(worldPosition.yx, tDetailSize, tDetailScale.xy / 37.3)).xy;\n  vec2 detail2Sample = detail2SampleX * normalSq.x +\n                       detail2SampleY * normalSq.y +\n                       detail2SampleZ * normalSq.z;\n  vec2 detail2Derivs = vec2(2.0 / tDetailScale.xy * (detail2Sample.xy - 0.5));\n  vec3 normalDetail2 = normalize(vec3(- detail2Derivs, 1.0));\n  normalDetail2 = normalDetail2.x * tangentU +\n                  normalDetail2.y * tangentV +\n                  normalDetail2.z * normalDetail;\n\n  float noiseSample = texture2D(tDetail, worldPosition.yx / 512.0).b;\n  vec3 veggieColor1 = vec3(0.43, 0.45, 0.25);\n  vec3 veggieColor2 = vec3(0.14, 0.18, 0.05);\n  vec3 eyeVec = normalize(cameraPosition - worldPosition);\n  float veggieMix = dot(eyeVec, normalDetail);\n  veggieMix = bias_fast(veggieMix * 0.7 + 0.3, 0.7);\n  vec3 veggieColor = mix(veggieColor1, veggieColor2, veggieMix);\n  float rockMix = 1.0 - smoothstep(1.5*0.71, 1.5*0.74,\n      normalRegion.z + normalDetail.z * 0.5 + (noiseSample - 0.5) * 0.3 - height * 0.0002);\n\n  float trackMix = 1.0 - smoothstep(0.02, 0.04,\n      surfaceType + (diffRockSample.b - 0.5) * 0.15);\n\n  gl_FragColor.rgb = veggieColor;\n  gl_FragColor.rgb = mix(gl_FragColor.rgb, diffRockSample, rockMix);\n  gl_FragColor.rgb = mix(gl_FragColor.rgb, diffDirtSample, trackMix);\n\n  vec3 specular = vec3(0.0);\n  specular = mix(specular, vec3(0.20, 0.21, 0.22), rockMix);\n  specular = mix(specular, vec3(0.0), trackMix);\n" + "\n  float fDepth;\n  vec3 shadowColor = vec3(1.0);\n  #ifdef USE_SHADOWMAP\n  for( int i = 0; i < MAX_SHADOWS; i ++ ) {\n    vec3 shadowCoord = vShadowCoord[ i ].xyz / vShadowCoord[ i ].w;\n    bvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 );\n    bool inFrustum = all( inFrustumVec );\n    bvec2 frustumTestVec = bvec2( inFrustum, shadowCoord.z <= 1.0 );\n    bool frustumTest = all( frustumTestVec );\n    if ( frustumTest ) {\n      shadowCoord.z += shadowBias[ i ];\n      float shadow = 0.0;\n      const float shadowDelta = 1.0 / 9.0;\n      float xPixelOffset = 1.0 / shadowMapSize[ i ].x;\n      float yPixelOffset = 1.0 / shadowMapSize[ i ].y;\n      float dx0 = -1.25 * xPixelOffset;\n      float dy0 = -1.25 * yPixelOffset;\n      float dx1 = 1.25 * xPixelOffset;\n      float dy1 = 1.25 * yPixelOffset;\n      fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy0 ) ) );\n      if ( fDepth < shadowCoord.z ) shadow += shadowDelta;\n      fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy0 ) ) );\n      if ( fDepth < shadowCoord.z ) shadow += shadowDelta;\n      fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy0 ) ) );\n      if ( fDepth < shadowCoord.z ) shadow += shadowDelta;\n      fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, 0.0 ) ) );\n      if ( fDepth < shadowCoord.z ) shadow += shadowDelta;\n      fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy ) );\n      if ( fDepth < shadowCoord.z ) shadow += shadowDelta;\n      fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy1 ) ) );\n      if ( fDepth < shadowCoord.z ) shadow += shadowDelta;\n      fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy1 ) ) );\n      if ( fDepth < shadowCoord.z ) shadow += shadowDelta;\n      fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy1 ) ) );\n      if ( fDepth < shadowCoord.z ) shadow += shadowDelta;\n\n      // Fade out the edges of the shadow.\n      const float edgeSize = 0.05;\n      float falloff =\n          smoothstep(0.0, edgeSize, shadowCoord.x) *\n          smoothstep(-1.0, edgeSize - 1.0, -shadowCoord.x) *\n          smoothstep(0.0, edgeSize, shadowCoord.y) *\n          smoothstep(-1.0, edgeSize - 1.0, -shadowCoord.y);\n      shadow *= falloff;\n      shadowColor = shadowColor * vec3((1.0 - shadow));\n    }\n  }\n  #endif\n\n  vec3 directIllum = vec3(0.0);\n  vec3 specularIllum = vec3(0.0);\n  #if MAX_DIR_LIGHTS > 0\n  for (int i = 0; i < MAX_DIR_LIGHTS; ++i) {\n    vec4 lDirection = viewMatrix * vec4(directionalLightDirection[i], 0.0);\n    vec3 dirVector = normalize(lDirection.xyz);\n    directIllum += max(dot(normalDetail2, directionalLightDirection[i]), 0.0);\n    specularIllum += specular *\n        pow(max(0.0, dot(normalDetail2,\n                         normalize(eyeVec + directionalLightDirection[i]))),\n            20.0);\n    directIllum *= directionalLightColor[i];\n    float mask = step(0.0, dot(normalDetail, directionalLightDirection[i])) *\n                 step(0.0, dot(normalRegion, directionalLightDirection[i]));\n    //directIllum *= mask;\n    specularIllum *= mask;\n  }\n  #endif\n  vec3 totalIllum = ambientLightColor + directIllum * shadowColor;\n  gl_FragColor.rgb = gl_FragColor.rgb * totalIllum + specularIllum * shadowColor;\n\n  const float LOG2 = 1.442695;\n  float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );\n  fogFactor = clamp( 1.0 - fogFactor, 0.0, 1.0 );\n  gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, fogFactor);\n}"
          });
          obj = new THREE.Mesh(this.geom, this.material);
          obj.frustumCulled = false;
          obj.receiveShadow = true;
          this.scene.add(obj);
          threeFmt = function(channels) {
            switch (channels) {
              case 1:
                return THREE.LuminanceFormat;
              case 2:
                return THREE.LuminanceAlphaFormat;
              case 3:
                return THREE.RGBFormat;
              case 4:
                return THREE.RGBAFormat;
              default:
                throw 'Unknown format';
            }
          };
          threeType = function(data) {
            switch (data.constructor) {
              case Uint8Array:
                return THREE.UnsignedByteType;
              case Uint8ClampedArray:
                return THREE.UnsignedByteType;
              case Uint16Array:
                return THREE.UnsignedShortType;
              case Float32Array:
                return THREE.FloatType;
              default:
                throw 'Unknown type';
            }
          };
          typeScale = function(data) {
            switch (data.constructor) {
              case Uint8Array:
                return 255;
              case Uint8ClampedArray:
                return 255;
              case Uint16Array:
                return 65535;
              case Float32Array:
                return 1;
              default:
                throw 'Unknown type';
            }
          };
          createTexture = (function(_this) {
            return function(buffer, mipmap) {
              var tex;
              tex = new THREE.DataTexture(buffer.data, buffer.width, buffer.height, threeFmt(uImg.channels(buffer)), threeType(buffer.data), null, THREE.RepeatWrapping, THREE.RepeatWrapping, mipmap ? THREE.LinearFilter : THREE.NearestFilter, mipmap ? THREE.LinearMipMapLinearFilter : THREE.NearestFilter);
              tex.generateMipmaps = mipmap;
              tex.needsUpdate = true;
              tex.flipY = false;
              return tex;
            };
          })(this);
          maps = this.terrain.source.maps;
          uniforms = this.material.uniforms;
          quiver.connect(maps.height.q_map, heightNode = new quiver.Node(function(ins, outs, done) {
            var buffer;
            buffer = ins[0];
            uniforms.tHeight.value = createTexture(buffer, false);
            uniforms.tHeightSize.value.set(buffer.width, buffer.height);
            uniforms.tHeightScale.value.copy(maps.height.scale);
            uniforms.tHeightScale.value.z *= typeScale(buffer.data);
            return done();
          }));
          quiver.connect(maps.surface.q_map, surfaceNode = new quiver.Node(function(ins, outs, done) {
            var buffer;
            buffer = ins[0];
            uniforms.tSurface.value = createTexture(buffer, true);
            uniforms.tSurfaceSize.value.set(buffer.width, buffer.height);
            uniforms.tSurfaceScale.value.copy(maps.surface.scale);
            return done();
          }));
          quiver.connect(maps.detail.q_map, detailNode = new quiver.Node(function(ins, outs, done) {
            var buffer;
            buffer = ins[0];
            uniforms.tDetail.value = createTexture(buffer, true);
            uniforms.tDetailSize.value.set(buffer.width, buffer.height);
            uniforms.tDetailScale.value.copy(maps.detail.scale);
            uniforms.tDetailScale.value.z *= typeScale(buffer.data);
            return done();
          }));
          if (maps.height.q_map.updated) {
            quiver.pull(heightNode);
          }
          if (maps.surface.q_map.updated) {
            quiver.pull(surfaceNode);
          }
          if (maps.detail.q_map.updated) {
            quiver.pull(detailNode);
          }
        };

        RenderTerrain.prototype._createGeom = function() {
          var RING_WIDTH, geom, i, idx, j, layer, m, modeli, modelj, nextLayer, posn, ringSegments, rowStart, scale, segLength, segNumber, segStart, segWidth, segi, segj, segment, start0, start1, _i, _j, _k, _l, _len, _ref;
          geom = new array_geometry.ArrayGeometry();
          geom.wireframe = false;
          geom.attributes = {
            "index": {
              array: []
            },
            "position": {
              array: [],
              itemSize: 3
            }
          };
          idx = geom.attributes["index"].array;
          posn = geom.attributes["position"].array;
          RING_WIDTH = this.ringWidth;
          ringSegments = [[1, 0, 0, 1], [0, -1, 1, 0], [-1, 0, 0, -1], [0, 1, -1, 0]];
          scale = this.baseScale;
          for (layer = _i = 0, _ref = this.numLayers; 0 <= _ref ? _i < _ref : _i > _ref; layer = 0 <= _ref ? ++_i : --_i) {
            nextLayer = Math.min(layer + 1, this.numLayers - 1);
            for (segNumber = _j = 0, _len = ringSegments.length; _j < _len; segNumber = ++_j) {
              segment = ringSegments[segNumber];
              rowStart = [];
              segStart = layer > 0 ? RING_WIDTH + 0 : 0;
              segWidth = layer > 0 ? RING_WIDTH + 1 : RING_WIDTH * 2 + 1;
              segLength = layer > 0 ? RING_WIDTH * 3 + 1 : RING_WIDTH * 2 + 1;
              for (i = _k = 0; 0 <= segLength ? _k <= segLength : _k >= segLength; i = 0 <= segLength ? ++_k : --_k) {
                rowStart.push(posn.length / 3);
                modeli = segStart - i;
                for (j = _l = 0; 0 <= segWidth ? _l <= segWidth : _l >= segWidth; j = 0 <= segWidth ? ++_l : --_l) {
                  modelj = segStart + j;
                  segi = segment[0] * modeli + segment[1] * modelj;
                  segj = segment[2] * modeli + segment[3] * modelj;
                  posn.push(segj, segi, layer);
                  m = [0, 0, 0, 0];
                  if (i > 0 && j > 0) {
                    start0 = rowStart[i - 1] + (j - 1);
                    start1 = rowStart[i] + (j - 1);
                    if ((i + j) % 2 === 1) {
                      idx.push(start0 + 1, start0 + 0, start1 + 0);
                      idx.push(start0 + 1, start1 + 0, start1 + 1);
                    } else {
                      idx.push(start0 + 0, start1 + 0, start1 + 1);
                      idx.push(start0 + 0, start1 + 1, start0 + 1);
                    }
                  }
                }
              }
            }
            scale *= 2;
          }
          geom.updateOffsets();
          return geom;
        };

        return RenderTerrain;

      })()
    };
  });

}).call(this);