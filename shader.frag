precision highp float;

uniform float t;
uniform float zoom;
uniform vec2 center;

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
    
    int highest = 20;
    bool found = false;
    for (int i = 0; i < 2; ++i) {
        // complex square and add
        s = complexPow(s, t) + pos;
        
        if (((s.x*s.x + s.y*s.y) > 200.0) && !found) {
            found = true;
            highest = i;
        }
    }

    return cm(float(highest), 20.0);
}

void main(void) {
    gl_FragColor.xyz = func(
        vec2(
            gl_FragCoord.xy - center)*vec2(1.0 / zoom, 1.0 / zoom)

    );
}