// swift-tools-version:5.9
// GENERATED FILE: DO NOT EDIT. Source: brand/ (run `npm run generate`).
import PackageDescription

let package = Package(
    name: "HexaDataBrand",
    platforms: [.iOS(.v15), .macOS(.v12), .tvOS(.v15), .watchOS(.v8)],
    products: [.library(name: "HexaDataBrand", targets: ["HexaDataBrand"])],
    targets: [
        .target(
            name: "HexaDataBrand",
            path: "platforms/swift/Sources/HexaDataBrand",
            resources: [.process("Resources")]
        ),
        .testTarget(name: "HexaDataBrandTests", dependencies: ["HexaDataBrand"], path: "platforms/swift/Tests/HexaDataBrandTests"),
    ]
)
