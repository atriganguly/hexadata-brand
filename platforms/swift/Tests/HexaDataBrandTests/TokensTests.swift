import XCTest
@testable import HexaDataBrand

final class TokensTests: XCTestCase {
    func testTaglines() {
        XCTAssertEqual(HexaBrand.primaryTagline, "Supercomputing, On-demand.")
        XCTAssertEqual(HexaBrand.secondaryTagline, "Engineered in India. Built for the World.")
    }

    func testScales() {
        XCTAssertEqual(HexaSpace.s4, 16)
        XCTAssertEqual(HexaRadius.md, 4)
    }
}
