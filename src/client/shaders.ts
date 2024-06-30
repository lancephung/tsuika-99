export const chromatic = {
    fragment: `
#version 300 es

precision mediump float;

out vec4 fragColor;

in vec2 vTextureCoord;
in vec2 vScreenCoord;
uniform sampler2D uSampler;

uniform vec2 uResolution;
uniform vec2 uRed;
uniform vec2 uGreen;
uniform vec2 uBlue;

uniform float uPower;
uniform float uOffset;
uniform float uBase;

void main(void) {
  float factor = max(pow(length(vScreenCoord * 2.0 - vec2(1.0, 1.0)), uPower) - uOffset, 0.0) + uBase;

    fragColor = vec4(0.0);

  fragColor.r = texture(uSampler, vTextureCoord + uRed * factor / uResolution).r;
  fragColor.g = texture(uSampler, vTextureCoord + uGreen * factor / uResolution).g;
  fragColor.b = texture(uSampler, vTextureCoord + uBlue * factor / uResolution).b;
  fragColor.a = texture(uSampler, vTextureCoord).a;

  // fragColor = vec4(vScreenCoord.x, vScreenCoord.y, 0, 0);
}
    `,
    vertex: `
#version 300 es

in vec2 aPosition;
out vec2 vTextureCoord;

out vec2 vScreenCoord;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

vec4 filterVertexPosition( void )
{
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
    
    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

vec2 filterTextureCoord( void )
{
    return aPosition * (uOutputFrame.zw * uInputSize.zw);
}

void main(void)
{
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
    vScreenCoord = aPosition;
}
    `
}

// https://github.com/kiwipxl/GLSL-shaders/blob/master/bloom.glsl#L61
export const bloom = {
    fragment: `
#version 300 es

precision mediump float;

in vec2 vTextureCoord;

out vec4 fragColor;

uniform sampler2D uSampler;

uniform float bloom_spread;
uniform float bloom_intensity;

void main() {
    ivec2 size = textureSize(uSampler, 0);

    float uv_x = vTextureCoord.x * float(size.x);
    float uv_y = vTextureCoord.y * float(size.y);

    vec4 sum = vec4(0.0);
    for (int n = 0; n < 9; ++n) {
        uv_y = (vTextureCoord.y * float(size.y)) + (bloom_spread * float(n - 4));
        vec4 h_sum = vec4(0.0);
        h_sum += texelFetch(uSampler, ivec2(uv_x - (4.0 * bloom_spread), uv_y), 0);
        h_sum += texelFetch(uSampler, ivec2(uv_x - (3.0 * bloom_spread), uv_y), 0);
        h_sum += texelFetch(uSampler, ivec2(uv_x - (2.0 * bloom_spread), uv_y), 0);
        h_sum += texelFetch(uSampler, ivec2(uv_x - bloom_spread, uv_y), 0);
        h_sum += texelFetch(uSampler, ivec2(uv_x, uv_y), 0);
        h_sum += texelFetch(uSampler, ivec2(uv_x + bloom_spread, uv_y), 0);
        h_sum += texelFetch(uSampler, ivec2(uv_x + (2.0 * bloom_spread), uv_y), 0);
        h_sum += texelFetch(uSampler, ivec2(uv_x + (3.0 * bloom_spread), uv_y), 0);
        h_sum += texelFetch(uSampler, ivec2(uv_x + (4.0 * bloom_spread), uv_y), 0);
        sum += h_sum / 9.0;
    }

    fragColor = texture(uSampler, vTextureCoord) + vec4(((sum / 9.0) * bloom_intensity).xyz, 0.0);
}
    `,
    vertex: `
#version 300 es

in vec2 aPosition;
out vec2 vTextureCoord;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

vec4 filterVertexPosition( void )
{
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
    
    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

vec2 filterTextureCoord( void )
{
    return aPosition * (uOutputFrame.zw * uInputSize.zw);
}

void main(void)
{
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
}
    `
}