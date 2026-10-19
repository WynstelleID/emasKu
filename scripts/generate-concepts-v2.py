# Concept D: CertiVault (Segel Emas CertiCard Antam/Galeri24)
# Form factor: Rounded rectangular security blister with an authentic 3D beveled gold bar and precision hallmark
svg_d = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-d">
  <title id="title-d">emasKu Concept D - CertiVault</title>
  <defs>
    <linearGradient id="gold-d" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE68A"/>
      <stop offset="40%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#B45309"/>
    </linearGradient>
    <linearGradient id="bar-d" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FEF3C7"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
  </defs>
  <!-- Outer CertiCard Shield / Frame -->
  <rect x="44" y="28" width="168" height="200" rx="28" fill="#18181B" stroke="url(#gold-d)" stroke-width="4"/>
  
  <!-- Security Micro-Grid / Seal Background lines -->
  <path d="M 64 68 L 192 68 M 64 188 L 192 188" stroke="#3F3F46" stroke-width="2" stroke-dasharray="4 4"/>
  
  <!-- Embedded Minted Gold Ingot (Beveled 3D bullion) -->
  <!-- Top Face -->
  <polygon points="76,84 180,84 164,104 92,104" fill="#FEF3C7"/>
  <!-- Front Main Face -->
  <polygon points="92,104 164,104 164,164 92,164" fill="url(#gold-d)"/>
  <!-- Right Bevel Face -->
  <polygon points="180,84 164,104 164,164 180,148" fill="#B45309"/>
  <!-- Left Bevel Face -->
  <polygon points="76,84 92,104 92,164 76,148" fill="#D97706"/>
  <!-- Bottom Bevel Face -->
  <polygon points="76,148 92,164 164,164 180,148" fill="#78350F"/>
  
  <!-- 999.9 Purity Hallmark Symbol (Central Diamond Star) -->
  <path d="M 128 122 L 133 134 L 145 134 L 135 141 L 138 153 L 128 145 L 118 153 L 121 141 L 111 134 L 123 134 Z" fill="#FFFBEB"/>
</svg>'''

# Concept E: Bintang Emas 999.9 (Karat Purity Star & Diamond Ingot)
# 4 faceted golden ingots converging into a brilliant luxury star
svg_e = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-e">
  <title id="title-e">emasKu Concept E - Purity Star</title>
  <defs>
    <linearGradient id="gold-top" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF3C7"/>
      <stop offset="100%" stop-color="#F59E0B"/>
    </linearGradient>
    <linearGradient id="gold-right" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FBBF24"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
    <linearGradient id="gold-bottom" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D97706"/>
      <stop offset="100%" stop-color="#78350F"/>
    </linearGradient>
    <linearGradient id="gold-left" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#B45309"/>
    </linearGradient>
  </defs>

  <!-- Top Ingot Petal -->
  <path d="M 128 24 L 148 100 L 128 128 L 108 100 Z" fill="url(#gold-top)"/>

  <!-- Right Ingot Petal -->
  <path d="M 232 128 L 156 148 L 128 128 L 156 108 Z" fill="url(#gold-right)"/>

  <!-- Bottom Ingot Petal -->
  <path d="M 128 232 L 108 156 L 128 128 L 148 156 Z" fill="url(#gold-bottom)"/>

  <!-- Left Ingot Petal -->
  <path d="M 24 128 L 100 108 L 128 128 L 100 148 Z" fill="url(#gold-left)"/>

  <!-- Secondary Corner Highlights (Diamond brilliance) -->
  <polygon points="128,128 156,108 184,80 148,100" fill="#FDE68A" opacity="0.9"/>
  <polygon points="128,128 148,156 184,176 156,148" fill="#D97706" opacity="0.9"/>
  <polygon points="128,128 100,148 72,176 108,156" fill="#92400E" opacity="0.9"/>
  <polygon points="128,128 108,100 72,80 100,108" fill="#FBBF24" opacity="0.9"/>

  <!-- Core Pure White Center Sparkle -->
  <circle cx="128" cy="128" r="7" fill="#FFFFFF"/>
</svg>'''

# Concept F: Aliran Likuiditas (Buy & Buyback Golden Cycle)
# Two interlocking curved gold bullion sweeps forming a closed loop of value
svg_f = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-f">
  <title id="title-f">emasKu Concept F - Golden Liquidity Loop</title>
  <defs>
    <linearGradient id="gold-loop-1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE68A"/>
      <stop offset="50%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#B45309"/>
    </linearGradient>
    <linearGradient id="gold-loop-2" x1="100%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#78350F"/>
      <stop offset="50%" stop-color="#D97706"/>
      <stop offset="100%" stop-color="#FBBF24"/>
    </linearGradient>
  </defs>

  <!-- Upper Gold Bullion Arc (Harga Jual / Acquisition) -->
  <path d="
    M 54 116
    C 62 62 108 30 162 30
    C 198 30 226 50 236 82
    L 204 94
    C 196 74 178 60 158 60
    C 124 60 94 82 86 116
    Z
  " fill="url(#gold-loop-1)"/>

  <!-- Beveled Ingot Head (Upper bar tip) -->
  <polygon points="236,82 204,94 212,126 244,114" fill="#D97706"/>

  <!-- Lower Gold Bullion Arc (Harga Buyback / Liquidation) -->
  <path d="
    M 202 140
    C 194 194 148 226 94 226
    C 58 226 30 206 20 174
    L 52 162
    C 60 182 78 196 98 196
    C 132 196 162 174 170 140
    Z
  " fill="url(#gold-loop-2)"/>

  <!-- Beveled Ingot Head (Lower bar tip) -->
  <polygon points="20,174 52,162 44,130 12,142" fill="#F59E0B"/>

  <!-- Center Floating Gold Coin / Seal -->
  <circle cx="128" cy="128" r="32" fill="#18181B" stroke="#D97706" stroke-width="3"/>
  <!-- Pure Gold Kepingan -->
  <circle cx="128" cy="128" r="22" fill="url(#gold-loop-1)"/>
  <rect x="123" y="116" width="10" height="24" rx="2" fill="#78350F"/>
</svg>'''

with open('design/logo/concept-d.svg', 'w') as f:
    f.write(svg_d)

with open('design/logo/concept-e.svg', 'w') as f:
    f.write(svg_e)

with open('design/logo/concept-f.svg', 'w') as f:
    f.write(svg_f)

print('Generated concepts D, E, F successfully')
