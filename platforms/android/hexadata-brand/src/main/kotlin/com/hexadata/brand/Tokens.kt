// GENERATED FILE: DO NOT EDIT. Source: brand/ (run `npm run generate`).
package com.hexadata.brand

import androidx.compose.ui.graphics.Color

object HexaBrand {
    const val VERSION = "2.0.0"
    const val REVISION = 1
    const val DESCRIPTOR = "servers and workstations"
    const val PRIMARY_TAGLINE = "Supercomputing, On-demand."
    const val SECONDARY_TAGLINE = "Engineered in India. Built for the World."
}

/** Brand palette (Brand Kit v1.0). Never use any other shade of black, grey or white. */
object HexaPalette {
    val cyan = Color(0xFF009BB6)
    val deepBlue = Color(0xFF046AA7)
    val obsidian = Color(0xFF121E36)
    val vividCerulean = Color(0xFF01A3E5)
    val midnight = Color(0xFF040F49)
    val grey = Color(0xFFA3B1C6)
    val white = Color(0xFFF8FAFC)
    val crimson = Color(0xFFFF3B30)
    val copper = Color(0xFFF59E0B)
    val green = Color(0xFF10B981)
}

data class HexaRoles(
    val bg: Color,
    val fg: Color,
    val fgStrong: Color,
    val fgMuted: Color,
    val bgAlt: Color,
    val fgOnAlt: Color,
    val accent: Color,
    val borderStrong: Color,
    val borderSubtle: Color,
    val accentFill: Color,
    val onAccentFill: Color,
    val danger: Color,
    val warning: Color,
    val success: Color,
    val onStatus: Color,
)

val HexaLightRoles = HexaRoles(
    bg = HexaPalette.white,
    fg = HexaPalette.obsidian,
    fgStrong = HexaPalette.midnight,
    fgMuted = HexaPalette.obsidian,
    bgAlt = HexaPalette.grey,
    fgOnAlt = HexaPalette.obsidian,
    accent = HexaPalette.deepBlue,
    borderStrong = HexaPalette.obsidian,
    borderSubtle = HexaPalette.grey,
    accentFill = HexaPalette.deepBlue,
    onAccentFill = HexaPalette.white,
    danger = HexaPalette.crimson,
    warning = HexaPalette.copper,
    success = HexaPalette.green,
    onStatus = HexaPalette.obsidian,
)
val HexaDarkRoles = HexaRoles(
    bg = HexaPalette.obsidian,
    fg = HexaPalette.white,
    fgStrong = HexaPalette.white,
    fgMuted = HexaPalette.grey,
    bgAlt = HexaPalette.midnight,
    fgOnAlt = HexaPalette.white,
    accent = HexaPalette.vividCerulean,
    borderStrong = HexaPalette.grey,
    borderSubtle = HexaPalette.grey,
    accentFill = HexaPalette.vividCerulean,
    onAccentFill = HexaPalette.obsidian,
    danger = HexaPalette.crimson,
    warning = HexaPalette.copper,
    success = HexaPalette.green,
    onStatus = HexaPalette.obsidian,
)

/** dp values. */
object HexaSpace {
    const val s0 = 0f
    const val s1 = 4f
    const val s2 = 8f
    const val s3 = 12f
    const val s4 = 16f
    const val s5 = 20f
    const val s6 = 24f
    const val s8 = 32f
    const val s10 = 40f
    const val s12 = 48f
    const val s16 = 64f
    const val s20 = 80f
    const val s24 = 96f
    const val s0_5 = 2f
}
object HexaRadius {
    const val none = 0f
    const val sm = 4f
    const val md = 8f
    const val lg = 12f
    const val xl = 16f
    const val full = 9999f
}
/** sp values. */
object HexaFontSize {
    const val xs = 12f
    const val sm = 14f
    const val base = 16f
    const val lg = 18f
    const val xl = 20f
    const val s2xl = 24f
    const val s3xl = 30f
    const val s4xl = 36f
    const val s5xl = 48f
    const val s6xl = 60f
}
