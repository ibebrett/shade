attribute vec2 aVertexPosition;
attribute vec4 aVertexColor;
varying lowp vec4 vColor;

void main(void) {
    gl_Position = vec4(aVertexPosition, 0.0, 1.0);
    vColor = aVertexColor;
}