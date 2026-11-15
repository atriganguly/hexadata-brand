import 'package:flutter_test/flutter_test.dart';
import 'package:hexadata_brand/hexadata_brand.dart';

void main() {
  test('palette matches the Brand Kit', () {
    expect(HexaPalette.cyan.toARGB32(), 0xFF009BB6);
    expect(HexaPalette.obsidian.toARGB32(), 0xFF121E36);
  });

  test('roles resolve per theme', () {
    expect(hexaLightRoles.bg, HexaPalette.white);
    expect(hexaDarkRoles.bg, HexaPalette.obsidian);
    expect(hexaDarkRoles.fgMuted, HexaPalette.grey);
  });

  test('themes build', () {
    expect(hexaLightTheme().colorScheme.primary, hexaLightRoles.accentFill);
    expect(hexaDarkTheme().colorScheme.primary, hexaDarkRoles.accentFill);
  });
}
