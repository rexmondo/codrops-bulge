precision highp float;
uniform float uTime;
uniform sampler2D uTexture;
varying vec2 vUv;

void main() {
  vec4 tex = texture2D(uTexture, vUv);
  gl_FragColor.rgb = tex.rgb;
  gl_FragColor.a = 1.0;
}