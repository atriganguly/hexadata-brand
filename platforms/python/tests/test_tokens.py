import unittest

from hexadata_brand import LOGOS, PALETTE, SEMANTIC, TAGLINES
from hexadata_brand.charts import matplotlib_rc, plotly_template


class TokenTests(unittest.TestCase):
    def test_palette_matches_brand_kit(self):
        self.assertEqual(PALETTE["cyan"], "#009BB6")
        self.assertEqual(PALETTE["obsidian"], "#121E36")
        self.assertEqual(len(PALETTE), 10)

    def test_roles(self):
        self.assertEqual(SEMANTIC["light"]["bg"], PALETTE["white"])
        self.assertEqual(SEMANTIC["dark"]["bg"], PALETTE["obsidian"])
        self.assertEqual(set(SEMANTIC["light"]), set(SEMANTIC["dark"]))

    def test_taglines_and_logos(self):
        self.assertEqual(TAGLINES["primary"], "Supercomputing, On-demand.")
        self.assertEqual(len(LOGOS), 8)

    def test_chart_themes_use_brand_colours_only(self):
        brand = set(PALETTE.values())
        rc = matplotlib_rc("dark")
        self.assertEqual(rc["figure.facecolor"], PALETTE["obsidian"])
        tpl = plotly_template("light")["layout"]
        self.assertTrue(set(tpl["colorway"]) <= brand)
        self.assertIn(tpl["paper_bgcolor"], brand)


if __name__ == "__main__":
    unittest.main()
