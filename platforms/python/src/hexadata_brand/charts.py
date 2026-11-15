"""Chart themes built only from brand colours. No third-party imports at module load (matplotlib/plotly are optional extras)."""

from .tokens import FONTS, PALETTE, SEMANTIC

# Categorical order chosen so neighbouring series stay distinguishable in light and dark. Never extend it with off-brand colours.
CATEGORICAL = [
    PALETTE["deep_blue"],
    PALETTE["cyan"],
    PALETTE["copper"],
    PALETTE["green"],
    PALETTE["vivid_cerulean"],
    PALETTE["crimson"],
]


def _roles(mode: str) -> dict:
    if mode not in SEMANTIC:
        raise ValueError("mode must be 'light' or 'dark'")
    return SEMANTIC[mode]


def matplotlib_rc(mode: str = "light") -> dict:
    """rcParams for matplotlib: ``plt.rcParams.update(matplotlib_rc('dark'))``."""
    r = _roles(mode)
    rc = {
        "figure.facecolor": r["bg"],
        "axes.facecolor": r["bg"],
        "savefig.facecolor": r["bg"],
        "text.color": r["fg"],
        "axes.labelcolor": r["fg"],
        "axes.edgecolor": r["border_strong"],
        "xtick.color": r["fg"],
        "ytick.color": r["fg"],
        "grid.color": r["border_subtle"],
        "font.family": [FONTS["body"]["family"], "sans-serif"],
        "axes.titleweight": "bold",
    }
    try:  # cycler ships with matplotlib; keep this module importable without it
        from cycler import cycler

        rc["axes.prop_cycle"] = cycler(color=CATEGORICAL)
    except ImportError:
        pass
    return rc


def plotly_template(mode: str = "light") -> dict:
    """A plotly layout template: ``fig.update_layout(template=plotly_template('dark'))``."""
    r = _roles(mode)
    axis = {"gridcolor": r["border_subtle"], "linecolor": r["border_strong"], "zerolinecolor": r["border_strong"]}
    return {
        "layout": {
            "paper_bgcolor": r["bg"],
            "plot_bgcolor": r["bg"],
            "font": {"family": f"{FONTS['body']['family']}, sans-serif", "color": r["fg"]},
            "title": {"font": {"family": f"{FONTS['display']['family']}, sans-serif", "color": r["fg_strong"]}},
            "colorway": CATEGORICAL,
            "xaxis": axis,
            "yaxis": dict(axis),
        }
    }
