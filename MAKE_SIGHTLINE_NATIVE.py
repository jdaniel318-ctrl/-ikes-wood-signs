#!/usr/bin/env python3
"""Generate an unsigned Xcode project. Does not compile, sign, install or contact Apple."""
import pathlib, plistlib, shutil, sys

def generate(destination):
    root=pathlib.Path(__file__).resolve().parent
    out=pathlib.Path(destination).resolve()
    if out.exists(): raise SystemExit('Choose a new output directory.')
    app=out/'Sightline'; app.mkdir(parents=True)
    for name in ['SightlineApp.swift','SightlineCaptureController.swift']:
        shutil.copy2(root/name,app/name)
    info={'CFBundleDevelopmentRegion':'en','CFBundleExecutable':'$(EXECUTABLE_NAME)','CFBundleIdentifier':'$(PRODUCT_BUNDLE_IDENTIFIER)','CFBundleInfoDictionaryVersion':'6.0','CFBundleName':'Sightline','CFBundlePackageType':'APPL','CFBundleShortVersionString':'0.1','CFBundleVersion':'882082','LSRequiresIPhoneOS':True,'NSCameraUsageDescription':'Measure a board and save a local trial photo for Carvewright.','UISupportedInterfaceOrientations':['UIInterfaceOrientationPortrait'],'UIRequiresFullScreen':True,'UILaunchScreen':{}}
    (app/'Info.plist').write_bytes(plistlib.dumps(info))
    # Stable, opaque PBX IDs. Project and target settings remain explicit and portable.
    ident=lambda n: f'{n:024X}'
    i=ident
    objects={
      1:f'isa = PBXProject; attributes = {{ LastUpgradeCheck = 1600; }}; buildConfigurationList = {i(20)}; compatibilityVersion = "Xcode 14.0"; developmentRegion = en; knownRegions = (en, Base); mainGroup = {i(2)}; productRefGroup = {i(4)}; projectDirPath = ""; projectRoot = ""; targets = ({i(5)});',
      2:f'isa = PBXGroup; children = ({i(3)}, {i(4)}); sourceTree = "<group>";',
      3:f'isa = PBXGroup; children = ({i(6)}, {i(7)}, {i(8)}); path = Sightline; sourceTree = "<group>";',
      4:f'isa = PBXGroup; children = ({i(9)}); name = Products; sourceTree = "<group>";',
      5:f'isa = PBXNativeTarget; buildConfigurationList = {i(23)}; buildPhases = ({i(12)}, {i(13)}, {i(14)}); buildRules = (); dependencies = (); name = Sightline; productName = Sightline; productReference = {i(9)}; productType = "com.apple.product-type.application";',
      6:'isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = SightlineApp.swift; sourceTree = "<group>";',
      7:'isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = SightlineCaptureController.swift; sourceTree = "<group>";',
      8:'isa = PBXFileReference; lastKnownFileType = text.plist.xml; path = Info.plist; sourceTree = "<group>";',
      9:'isa = PBXFileReference; explicitFileType = wrapper.application; includeInIndex = 0; path = Sightline.app; sourceTree = BUILT_PRODUCTS_DIR;',
      10:f'isa = PBXBuildFile; fileRef = {i(6)};',11:f'isa = PBXBuildFile; fileRef = {i(7)};',
      12:f'isa = PBXSourcesBuildPhase; buildActionMask = 2147483647; files = ({i(10)}, {i(11)}); runOnlyForDeploymentPostprocessing = 0;',
      13:'isa = PBXFrameworksBuildPhase; buildActionMask = 2147483647; files = (); runOnlyForDeploymentPostprocessing = 0;',
      14:'isa = PBXResourcesBuildPhase; buildActionMask = 2147483647; files = (); runOnlyForDeploymentPostprocessing = 0;',
      20:f'isa = XCConfigurationList; buildConfigurations = ({i(21)}, {i(22)}); defaultConfigurationIsVisible = 0; defaultConfigurationName = Release;',
      23:f'isa = XCConfigurationList; buildConfigurations = ({i(24)}, {i(25)}); defaultConfigurationIsVisible = 0; defaultConfigurationName = Release;'
    }
    for n,name in [(21,'Debug'),(22,'Release')]:
        objects[n]=f'isa = XCBuildConfiguration; name = {name}; buildSettings = {{ CLANG_ENABLE_MODULES = YES; SDKROOT = iphoneos; IPHONEOS_DEPLOYMENT_TARGET = 17.0; SWIFT_VERSION = 5.0; }};'
    for n,name in [(24,'Debug'),(25,'Release')]:
        optimize='"-Onone"' if name=='Debug' else '"-O"'
        objects[n]=f'isa = XCBuildConfiguration; name = {name}; buildSettings = {{ CODE_SIGN_STYLE = Automatic; GENERATE_INFOPLIST_FILE = NO; INFOPLIST_FILE = Sightline/Info.plist; PRODUCT_BUNDLE_IDENTIFIER = com.blackflag.carvewright.sightline; PRODUCT_NAME = "$(TARGET_NAME)"; TARGETED_DEVICE_FAMILY = "1,2"; SWIFT_VERSION = 5.0; SWIFT_OPTIMIZATION_LEVEL = {optimize}; IPHONEOS_DEPLOYMENT_TARGET = 17.0; }};'
    project=out/'Sightline.xcodeproj'; project.mkdir()
    text='// !$*UTF8*$!\n{ archiveVersion = 1; classes = {}; objectVersion = 56; objects = {\n'
    text+='\n'.join(f'{i(n)} = {{ {v} }};' for n,v in objects.items())
    text+=f'\n}}; rootObject = {i(1)}; }}\n'
    (project/'project.pbxproj').write_text(text)
    shutil.copy2(root/'SIGHTLINE_NATIVE.md',out/'READ_ME.md')
    return out
if __name__=='__main__': print(generate(sys.argv[1]))
