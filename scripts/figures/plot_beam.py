"""Optional figure regeneration: requires matplotlib and Pillow, not site-build dependencies."""
import json
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from PIL import Image
ROOT = Path(__file__).resolve().parents[2]
data = json.loads((ROOT/'content/figures/feascript-cantilever.json').read_text())
x = [p['x'] for p in data['points']]
y = [p['w'] * 1000 for p in data['points']]
exact = [p['exact'] * 1000 for p in data['points']]
plt.rcParams.update({'font.family':'DejaVu Sans', 'text.color':'#011c40', 'axes.labelcolor':'#011c40', 'xtick.color':'#295773', 'ytick.color':'#295773', 'font.size':12})
fig, ax = plt.subplots(figsize=(10,6),layout='constrained')
fig.set_facecolor('white');ax.set_facecolor('#f4f7fa')
ax.plot(x,exact,color='#a60d0d',linewidth=2,label='Classical cantilever solution')
ax.plot(x,y,'o',color='#295773',markersize=5,markerfacecolor='white',label='FEAScript · 20 Hermite elements')
ax.set(xlabel='Position along beam (m)',ylabel='Vertical deflection (mm)',xlim=(0,4))
ax.set_title('A beam model, checked against a known solution',loc='left',fontweight='bold',pad=24,fontsize=16)
ax.grid(color='#d5dfe7',linewidth=.7);ax.set_axisbelow(True)
for spine in ax.spines.values():spine.set_color('#d5dfe7')
ax.legend(loc='lower left',framealpha=1,facecolor='white',edgecolor='#d5dfe7',fontsize=10)
fig.savefig(ROOT/'images/optimized/feascript-beam.svg')
fig.savefig('/tmp/feascript-beam.png',dpi=130)
Image.open('/tmp/feascript-beam.png').convert('RGB').save(ROOT/'images/optimized/feascript-beam.webp','WEBP',quality=90,method=6)
