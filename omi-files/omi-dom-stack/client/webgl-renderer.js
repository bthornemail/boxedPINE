/**
 * OMI-IMO WebGL perspective renderer — torus / Dali Cross
 */
'use strict';

function createWebGLRenderer(canvas) {
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return null;

  const vsSource = [
    'attribute vec3 aPosition;',
    'attribute vec3 aColor;',
    'uniform mat4 uProjection;',
    'uniform mat4 uModelView;',
    'varying vec3 vColor;',
    'void main() {',
    '  gl_Position = uProjection * uModelView * vec4(aPosition, 1.0);',
    '  gl_PointSize = 5.0;',
    '  vColor = aColor;',
    '}'
  ].join('\n');

  const fsSource = [
    'precision mediump float;',
    'varying vec3 vColor;',
    'void main() { gl_FragColor = vec4(vColor, 1.0); }'
  ].join('\n');

  function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error('Shader: ' + gl.getShaderInfoLog(shader));
    }
    return shader;
  }

  const vs = compileShader(gl.VERTEX_SHADER, vsSource);
  const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error('Link: ' + gl.getProgramInfoLog(program));
  }
  gl.useProgram(program);

  const aPosition = gl.getAttribLocation(program, 'aPosition');
  const aColor = gl.getAttribLocation(program, 'aColor');
  const uProjection = gl.getUniformLocation(program, 'uProjection');
  const uModelView = gl.getUniformLocation(program, 'uModelView');

  function perspective(fov, aspect, near, far) {
    const f = 1.0 / Math.tan(fov / 2);
    const nf = 1.0 / (near - far);
    return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, 2 * far * near * nf, 0
    ]);
  }

  function subtract(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  }
  function normalize(v) {
    const len = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0] / len, v[1] / len, v[2] / len];
  }

  function lookAt(eye, center, up) {
    const z = normalize(subtract(eye, center));
    const x = normalize(cross(up, z));
    const y = cross(z, x);
    return new Float32Array([
      x[0], y[0], z[0], 0,
      x[1], y[1], z[1], 0,
      x[2], y[2], z[2], 0,
      -dot(x, eye), -dot(y, eye), -dot(z, eye), 1
    ]);
  }

  let rot = 0;

  return {
    gl: true,
    render(geometry, options) {
      options = options || {};
      const fov = options.fov != null ? options.fov : Math.PI / 4;
      const aspect = canvas.width / Math.max(canvas.height, 1);
      const near = options.near != null ? options.near : 0.1;
      const far = options.far != null ? options.far : 100;
      const eye = options.eye || [0, 0.4, 3.2];
      const center = options.center || [0, 0, 0];
      const up = options.up || [0, 1, 0];

      if (options.spin) rot += 0.01;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0.05, 0.05, 0.08, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.useProgram(program);

      const n = geometry.length;
      const positions = new Float32Array(n * 3);
      const colors = new Float32Array(n * 3);
      const cosR = Math.cos(rot), sinR = Math.sin(rot);
      for (let i = 0; i < n; i++) {
        let x = geometry[i].x;
        let y = geometry[i].y;
        let z = geometry[i].z || 0;
        if (options.spin) {
          const xr = x * cosR - z * sinR;
          z = x * sinR + z * cosR;
          x = xr;
        }
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        const c = geometry[i].active === false ? 0.35 : 1.0;
        colors[i * 3] = 0.36 * c;
        colors[i * 3 + 1] = 0.55 * c;
        colors[i * 3 + 2] = 0.94 * c;
      }

      const posBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
      gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(aPosition);

      const colBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, colBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, colors, gl.DYNAMIC_DRAW);
      gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(aColor);

      gl.uniformMatrix4fv(uProjection, false, perspective(fov, aspect, near, far));
      gl.uniformMatrix4fv(uModelView, false, lookAt(eye, center, up));

      gl.drawArrays(gl.LINE_LOOP, 0, n);
      gl.drawArrays(gl.POINTS, 0, n);
    }
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createWebGLRenderer };
}
if (typeof window !== 'undefined') {
  window.createWebGLRenderer = createWebGLRenderer;
}
