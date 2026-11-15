import SwiftUI
#if canImport(CoreText)
import CoreText
#endif

public enum HexaFonts {
    /// Registers the bundled static TTFs (release builds put them in Resources/). Safe to call more than once.
    public static func register() {
        #if canImport(CoreText)
        let names = ["SpaceGrotesk", "InterTight", "JetBrainsMono"].flatMap { stem in
            ["Regular", "Medium", "SemiBold", "Bold"].map { "\(stem)-\($0)" }
        }
        for name in names {
            guard let url = Bundle.module.url(forResource: name, withExtension: "ttf") else { continue }
            CTFontManagerRegisterFontsForURL(url as CFURL, .process, nil)
        }
        #endif
    }

    /// Display face (Space Grotesk): titles, headings, hero.
    public static func display(_ size: CGFloat, weight: Font.Weight = .bold) -> Font {
        .custom("\(HexaFontName.display)-\(suffix(weight))", size: size)
    }

    /// Body face (Inter Tight): subtitles, body, descriptions.
    public static func body(_ size: CGFloat, weight: Font.Weight = .regular) -> Font {
        .custom("\(HexaFontName.body)-\(suffix(weight))", size: size)
    }

    /// Mono face (JetBrains Mono): detailed descriptions and code.
    public static func mono(_ size: CGFloat, weight: Font.Weight = .regular) -> Font {
        .custom("\(HexaFontName.mono)-\(suffix(weight))", size: size)
    }

    private static func suffix(_ w: Font.Weight) -> String {
        switch w {
        case .bold, .heavy, .black: return "Bold"
        case .semibold: return "SemiBold"
        case .medium: return "Medium"
        default: return "Regular"
        }
    }
}
