// GENERATED FILE: DO NOT EDIT. Source: brand/ (run `npm run generate`).
import SwiftUI

public enum HexaBrand {
    public static let version = "2.0.1"
    public static let revision = 1
    public static let descriptor = "servers and workstations"
    public static let primaryTagline = "Supercomputing, On-demand."
    public static let secondaryTagline = "Engineered in India. Built for the World."
}

/// Brand palette (Brand Kit v1.0). Never use any other shade of black, grey or white.
public enum HexaPalette {
    public static let cyan = HexaColor(hex: 0x009BB6)
    public static let deepBlue = HexaColor(hex: 0x046AA7)
    public static let obsidian = HexaColor(hex: 0x121E36)
    public static let vividCerulean = HexaColor(hex: 0x01A3E5)
    public static let midnight = HexaColor(hex: 0x040F49)
    public static let grey = HexaColor(hex: 0xA3B1C6)
    public static let white = HexaColor(hex: 0xF8FAFC)
    public static let crimson = HexaColor(hex: 0xFF3B30)
    public static let copper = HexaColor(hex: 0xF59E0B)
    public static let green = HexaColor(hex: 0x10B981)
}

/// Semantic roles: dynamic colours that follow light/dark automatically. Style with roles, not raw palette.
public enum HexaRole {
    public static let bg = Color.hexaDynamic(light: HexaPalette.white, dark: HexaPalette.obsidian)
    public static let fg = Color.hexaDynamic(light: HexaPalette.obsidian, dark: HexaPalette.white)
    public static let fgStrong = Color.hexaDynamic(light: HexaPalette.midnight, dark: HexaPalette.white)
    public static let fgMuted = Color.hexaDynamic(light: HexaPalette.obsidian, dark: HexaPalette.grey)
    public static let bgAlt = Color.hexaDynamic(light: HexaPalette.grey, dark: HexaPalette.midnight)
    public static let fgOnAlt = Color.hexaDynamic(light: HexaPalette.obsidian, dark: HexaPalette.white)
    public static let accent = Color.hexaDynamic(light: HexaPalette.deepBlue, dark: HexaPalette.vividCerulean)
    public static let borderStrong = Color.hexaDynamic(light: HexaPalette.obsidian, dark: HexaPalette.grey)
    public static let borderSubtle = Color.hexaDynamic(light: HexaPalette.grey, dark: HexaPalette.grey)
    public static let accentFill = Color.hexaDynamic(light: HexaPalette.deepBlue, dark: HexaPalette.vividCerulean)
    public static let onAccentFill = Color.hexaDynamic(light: HexaPalette.white, dark: HexaPalette.obsidian)
    public static let danger = Color.hexaDynamic(light: HexaPalette.crimson, dark: HexaPalette.crimson)
    public static let warning = Color.hexaDynamic(light: HexaPalette.copper, dark: HexaPalette.copper)
    public static let success = Color.hexaDynamic(light: HexaPalette.green, dark: HexaPalette.green)
    public static let onStatus = Color.hexaDynamic(light: HexaPalette.obsidian, dark: HexaPalette.obsidian)
}

public enum HexaSpace {
    public static let s0: CGFloat = 0
    public static let s1: CGFloat = 4
    public static let s2: CGFloat = 8
    public static let s3: CGFloat = 12
    public static let s4: CGFloat = 16
    public static let s5: CGFloat = 20
    public static let s6: CGFloat = 24
    public static let s8: CGFloat = 32
    public static let s10: CGFloat = 40
    public static let s12: CGFloat = 48
    public static let s16: CGFloat = 64
    public static let s20: CGFloat = 80
    public static let s24: CGFloat = 96
    public static let s0_5: CGFloat = 2
}
public enum HexaRadius {
    public static let none: CGFloat = 0
    public static let sm: CGFloat = 4
    public static let md: CGFloat = 8
    public static let lg: CGFloat = 12
    public static let xl: CGFloat = 16
    public static let full: CGFloat = 9999
}
public enum HexaFontSize {
    public static let xs: CGFloat = 12
    public static let sm: CGFloat = 14
    public static let base: CGFloat = 16
    public static let lg: CGFloat = 18
    public static let xl: CGFloat = 20
    public static let s2xl: CGFloat = 24
    public static let s3xl: CGFloat = 30
    public static let s4xl: CGFloat = 36
    public static let s5xl: CGFloat = 48
    public static let s6xl: CGFloat = 60
}
public enum HexaFontName {
    public static let display = "SpaceGrotesk"
    public static let body = "InterTight"
    public static let mono = "JetBrainsMono"
}
