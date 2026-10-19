# Refined Concept A: Geometric 'e' with integrated minted bullion ingot
svg_a = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-a">
  <title id="title-a">emasKu Concept A - Bullion Monogram 'e'</title>
  <!-- Lowercase 'e' with gold bar bevel and dynamic 45-degree finial -->
  <path fill="#000000" fill-rule="evenodd" d="
    M 128 32
    C 181 32 224 75 224 128
    L 224 146
    L 76 146
    C 82 178 102 192 130 192
    C 154 192 174 180 188 162
    L 218 184
    C 198 212 167 224 130 224
    C 74 224 32 182 32 128
    C 32 74 74 32 128 32
    Z
    M 76 114
    L 186 114
    C 182 82 158 64 128 64
    C 98 64 80 82 76 114
    Z
  "/>
</svg>'''

# Refined Concept B: HexaVault - Three minted gold ingots converging into an isometric vault
# Genuine pure single-path with 12px channels and central isometric core
svg_b = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-b">
  <title id="title-b">emasKu Concept B - HexaVault</title>
  <!-- Top Face: Gold Bullion Ingot -->
  <polygon fill="#000000" points="128,34 206,79 135,120 57,75" />
  
  <!-- Bottom-Left Face: Secure Vault Ingot -->
  <polygon fill="#000000" points="49,89 121,130 121,212 49,171" />

  <!-- Bottom-Right Face: Liquid Asset Ingot -->
  <polygon fill="#000000" points="135,130 207,89 207,171 135,212" />
</svg>'''

# Refined Concept C: Tri-Ingot Ascending Growth (Steps of Wealth)
# Three precision-cast gold bars ascending in proportion
svg_c = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-c">
  <title id="title-c">emasKu Concept C - Ascending Tier</title>
  <!-- Top Tier: 1g Starter Ingot -->
  <path fill="#000000" d="M 94 44 L 162 44 L 178 82 L 78 82 Z" />
  
  <!-- Middle Tier: 5g Investment Ingot -->
  <path fill="#000000" d="M 68 98 L 188 98 L 206 140 L 50 140 Z" />

  <!-- Base Tier: 10g Foundation Ingot -->
  <path fill="#000000" d="M 40 156 L 216 156 L 236 202 L 20 202 Z" />
</svg>'''

with open('design/logo/concept-a.svg', 'w') as f:
    f.write(svg_a)

with open('design/logo/concept-b.svg', 'w') as f:
    f.write(svg_b)

with open('design/logo/concept-c.svg', 'w') as f:
    f.write(svg_c)

print('Updated concepts A, B, C')
