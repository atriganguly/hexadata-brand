package com.hexadata.brand

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.staticCompositionLocalOf

val LocalHexaRoles = staticCompositionLocalOf { HexaLightRoles }

private fun scheme(r: HexaRoles, dark: Boolean): ColorScheme {
    val base = if (dark) darkColorScheme() else lightColorScheme()
    return base.copy(
        primary = r.accentFill,
        onPrimary = r.onAccentFill,
        secondary = r.accentFill,
        onSecondary = r.onAccentFill,
        error = r.danger,
        onError = r.onStatus,
        background = r.bg,
        onBackground = r.fg,
        surface = r.bg,
        onSurface = r.fg,
        onSurfaceVariant = r.fgMuted,
        surfaceVariant = r.bgAlt,
        outline = r.borderStrong,
        outlineVariant = r.borderSubtle,
    )
}

/** Wrap your app: `HexaTheme { ... }`. Read roles with `LocalHexaRoles.current` (use roles, not raw HexaPalette). */
@Composable
fun HexaTheme(darkTheme: Boolean = isSystemInDarkTheme(), content: @Composable () -> Unit) {
    val roles = if (darkTheme) HexaDarkRoles else HexaLightRoles
    CompositionLocalProvider(LocalHexaRoles provides roles) {
        MaterialTheme(colorScheme = scheme(roles, darkTheme), content = content)
    }
}
