# hexadata-brand (Python)

HexaData brand tokens, chart themes and assets for Python: reports, dashboards, Streamlit, notebooks, e-mail generation.

```python
from hexadata_brand import PALETTE, SEMANTIC, TAGLINES
from hexadata_brand.charts import matplotlib_rc, plotly_template

plt.rcParams.update(matplotlib_rc("dark"))
fig.update_layout(template=plotly_template("light"))
SEMANTIC["light"]["accent_fill"]   # '#046AA7'
```

Everything is generated from the repository's `brand/` directory, so it always matches the web, mobile and Office outputs. Style
with the semantic roles, not raw palette colours.

Release wheels also bundle the official logos (`logo_path("horizontal-primary-on-light")`) and static fonts (`font_path("SpaceGrotesk-Bold.ttf")`).

**Licence:** software Apache-2.0. The HexaData name, logos and taglines are trademarks of Esconet Technologies Limited, usable only as
permitted by `BRAND-LICENSE.md` in the repository. Fonts are SIL OFL 1.1.
