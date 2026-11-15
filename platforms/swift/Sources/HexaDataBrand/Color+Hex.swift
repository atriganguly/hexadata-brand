import SwiftUI

public typealias HexaColor = Color

extension Color {
    /// 0xRRGGBB, sRGB.
    public init(hex: UInt32) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255,
            opacity: 1
        )
    }

    /// A colour that switches with the system appearance (light/dark) with no extra code in the app.
    public static func hexaDynamic(light: Color, dark: Color) -> Color {
        #if canImport(UIKit)
        return Color(UIColor { $0.userInterfaceStyle == .dark ? UIColor(dark) : UIColor(light) })
        #elseif canImport(AppKit)
        return Color(NSColor(name: nil) { $0.bestMatch(from: [.darkAqua, .aqua]) == .darkAqua ? NSColor(dark) : NSColor(light) })
        #else
        return light
        #endif
    }
}
