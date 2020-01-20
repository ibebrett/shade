precision highp float;

varying mediump vec4 vColor;

uniform float t;
uniform highp vec2 offset;
uniform int top;


vec2 complexPow(highp vec2 a, float p) {
    float r = sqrt(a.x*a.x + a.y*a.y);
    float angle = atan(a.y / a.x);

    return pow(r, p) * vec2(cos(p * angle), sin(p * angle));
}

vec3 cm(float c, float range) {
    float gamma = 2.2;
    return vec3(pow(c / range, 1.0 / gamma), 0.0, 0.0);
}

vec3 func(highp vec2 pos) {
    mediump vec2 s = vec2(0.0, 0.0);
    
    int highest = top;
    bool found = false;
    for (int i = 0; i < 10000; ++i) {
        // complex square and add
        s = complexPow(s, t) + pos;
        
        if (((s.x*s.x + s.y*s.y) > offset.y) && !found) {
            found = true;
            highest = i;
        }
    }
    if (highest > top) {
        highest = top;
    }

    return cm(float(highest), float(top));
}

void main(void) {
    gl_FragColor.xyz = func(vec2(gl_FragCoord.xy + vec2(-100.0, -100.0))*vec2(offset.x, offset.x));
}