import re

with open('/home/user/freelance-marketplace-platform-copy/frontend/src/pages/HomePage.jsx', 'r') as f:
    content = f.read()

# 1. Hero background
new_content = re.sub(
    r'\{/\* ─── HERO BACKGROUND — photo layer, sits on top of global canvas ─── \*/\}.*?</div\>',
    '{/* ─── HERO BACKGROUND REMOVED FOR CONTINUOUS FLOW ─── */}',
    content, flags=re.DOTALL
)

# 2. Freelancer features
new_content = re.sub(
    r'\{/\* Background photo — premium focused freelancer at workstation, distinct from hero \*/\}.*?</div\>',
    '{/* ─── FREELANCER BACKGROUND REMOVED FOR CONTINUOUS FLOW ─── */}',
    new_content, flags=re.DOTALL
)

# 3. Client Stories
new_content = re.sub(
    r'\{/\* ── Glassmorphism veil over global canvas — no photo, uses canvas glow ── \*/\}.*?</div\>',
    '{/* ─── CLIENT STORIES BACKGROUND ELEMENTS REMOVED ─── */}',
    new_content, flags=re.DOTALL
)

# 4. Advantages
new_content = re.sub(
    r'\{/\* ── Uses global canvas — just a thin emerald veil \+ pulse lines ── \*/\}.*?</div\>',
    '{/* ─── ADVANTAGES BACKGROUND ELEMENTS REMOVED ─── */}',
    new_content, flags=re.DOTALL
)

# 5. CTA
new_content = re.sub(
    r'\{/\* ── CTA uses global canvas — deep glassmorphism veil, strong center focus ── \*/\}.*?</div\>',
    '{/* ─── CTA BACKGROUND ELEMENTS REMOVED ─── */}',
    new_content, flags=re.DOTALL
)

# 6. Stats Bar glassmorphism update (to remove sharp border top/bottom)
new_content = new_content.replace(
    'className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/30 backdrop-blur-xl"',
    'className="absolute bottom-0 left-0 right-0 border-t border-white/5 bg-transparent backdrop-blur-md"'
)

# 7. Footer Solid BG
new_content = new_content.replace(
    "background: 'rgba(2,3,10,0.70)', borderTop: '1px solid rgba(255,255,255,0.07)'",
    "background: 'transparent', borderTop: '1px solid rgba(255,255,255,0.05)'"
)

with open('/home/user/freelance-marketplace-platform-copy/frontend/src/pages/HomePage.jsx', 'w') as f:
    f.write(new_content)

print("Done replacing.")
