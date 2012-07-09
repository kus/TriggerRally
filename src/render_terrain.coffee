###
# Copyright (C) 2012 jareiko / http://www.jareiko.net/
###

render_terrain = exports? and @ or @render_terrain = {}

class render_terrain.RenderTerrain
  constructor: (@scene, @terrain, @gl) ->
    # We currently grab the terrain source directly. This is not very kosher.
    @geom = null
    #console.assert @gl.getExtension('OES_standard_derivatives')
    return

  update: (camera, delta) ->
    if not @hmapTex? and @terrain.source?
      @_setup()
    unless @geom? then return
    @material.uniforms['offset'].value.copy camera.position
    return

  _setup: ->
    tile = @terrain.getTile 0, 0
    @hmapTex = new THREE.DataTexture(
        tile.heightMap,
        tile.size + 1, tile.size + 1,
        THREE.LuminanceFormat, THREE.FloatType,
        null,
        THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping,
        THREE.LinearFilter, THREE.LinearFilter
    )
    @hmapTex.needsUpdate = true
    
    diffuseTex = THREE.ImageUtils.loadTexture("/a/textures/mayang-earth.jpg")
    diffuseTex.wrapS = THREE.RepeatWrapping
    diffuseTex.wrapT = THREE.RepeatWrapping

    @geom = @_createGeom()
    obj = @_createImmediateObject()
    @material = new THREE.ShaderMaterial
      uniforms:
        tHeightMap:
          type: 't'
          value: 0
          texture: @hmapTex
        tDiffuse:
          type: 't'
          value: 1
          texture: diffuseTex
        offset:
          type: 'v2'
          value: new THREE.Vector2(100, 100)

      vertexShader:
        """
        uniform sampler2D tHeightMap;
        uniform vec2 offset;

        varying vec2 vUv;
        varying vec4 eyePosition;
        varying vec3 worldPosition;
        varying vec3 col;

        void main() {
          worldPosition = floor(position * 128.0 * 3.0 + vec3(offset, 0.0));
          vUv = (worldPosition.xy / 128.0 / 3.0 + vec2(0.5) / 128.0) * (128.0 / 129.0);
          //vUv += uv * 0.0;
          worldPosition.z = texture2D(tHeightMap, vUv).r;
          eyePosition = modelViewMatrix * vec4(worldPosition, 1.0);
          gl_Position = projectionMatrix * eyePosition;
          col = vec3(uv.xy, 0.5);
        }
        """
      fragmentShader:
        """
        //uniform sampler2D tHeightMap;
        uniform sampler2D tDiffuse;

        varying vec2 vUv;
        varying vec4 eyePosition;
        varying vec3 worldPosition;
        varying vec3 col;

        void main() {
          float height = worldPosition.z;
          vec3 diffSample = texture2D(tDiffuse, worldPosition.xy / 4.0).rgb;
          gl_FragColor = vec4(diffSample, 1.0);
          gl_FragColor.rg = mix(gl_FragColor.rg, col.rg, 0.2);

          //float heightSample = texture2D(tHeightMap, vUv).r;
          //gl_FragColor.g = fract(heightSample);

          float depth = -eyePosition.z / eyePosition.w;
          vec3 fogCol = vec3(0.8, 0.8, 0.8);
          float clarity = 250.0 / (depth + 250.0);
          gl_FragColor.rgb = mix(fogCol, gl_FragColor.rgb, clarity);
        }
        """
    obj.material = @material
    @scene.add obj
    return

  _createImmediateObject: ->
    class ImmediateObject extends THREE.Object3D
      constructor: (@renderTerrain) ->
        super()
      immediateRenderCallback: (program, gl, frustum) ->
        @renderTerrain._render program, gl, frustum
    return new ImmediateObject @

  _createGeom: ->
    geom = new array_geometry.ArrayGeometry()
    # TODO: Draw innermost grid.
    posn = geom.vertexPositionArray
    uv = geom.vertexUvArray
    #RING_WIDTH = 15
    #for i in RING_WIDTH+1...RING_WIDTH*-2-1]
    #  for j in RING_WIDTH+1...RING_WIDTH*2+1]
    #    posn.push j, i
    SIZE = 256
    for y in [0..SIZE]
      fy = (y / SIZE - 0.5) * 2.0
      fy *= Math.abs(fy)
      for x in [0..SIZE]
        fx = (x / SIZE - 0.5) * 2.0
        fx *= Math.abs(fx)
        posn.push fx, fy, 0
        uv.push 6.0, Math.random()
        #uv.push Math.random(), Math.random()
    idx = geom.vertexIndexArray
    for y in [0...SIZE]
      for x in [0...SIZE]
        start = y * (SIZE + 1) + x
        idx.push start + 0, start + 1, start + SIZE + 1
        idx.push start + 1, start + SIZE + 2, start + SIZE + 1
    geom.updateOffsets()
    geom.createBuffers @gl
    return geom

  _render: (program, gl, frustum) ->
    @geom.render program, gl
    return
