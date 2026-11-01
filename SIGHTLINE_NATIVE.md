# Sightline native capture — developer trial source

This source is **not compiled, signed or device-tested**. It is not an installable iPad/iPhone app. The build environment has no Mac/Xcode. Browser photo-reference capture is available in the fleet release now.

On a Mac with Xcode and the iOS SDK:

1. Open the supplied `Sightline.xcodeproj` (or generate it with `python3 MAKE_SIGHTLINE_NATIVE.py /new/output/folder`).
2. Select the Sightline target, choose your own Signing Team and a unique bundle identifier. Connect the iPhone/iPad, select it as the destination, and Build/Run. Deployment target: iOS/iPadOS 17.0; portrait, full-screen.
3. Allow camera access. Use a flat rectangular board against a contrasting surface. Sweep slowly until the yellow outline stabilizes. Confirm it follows the actual board before tapping **Save highlighted board**. Save the JSON to Files.
4. In fleet **Carvewright → Try camera measurement → Open native sweep file**, select that JSON. Compare the result with a ruler before judging it. Export the photo proof, SVG and DXF for inspection in VCarve.

No LiDAR requirement: ARKit visual/inertial tracking provides a scale estimate and Vision finds rectangles. Standard iPhone 16 and ARKit-capable iPad Pro models can attempt this trial. LiDAR is not used in this source. Camera permission and usable AR tracking are required.

Known limitations: only flat rectangular faces, no live edges, no thickness, no automatic species identification. Detected planes may represent the table beneath a board rather than the top face. Grain, glare, similar backgrounds and short camera sweeps can mislead detection. Stable repeated observations do not establish dimensional accuracy. Do not cut from these measurements until they are independently checked. Wood identity and machining setup stay unconfirmed.

The JSON pairs a raw camera JPEG and normalized rectangle coordinates with world corners from that exact ARFrame. The web importer bounds file size, verifies schema, checks tracking and sample spread, rejects non-planar/invalid geometry and decodes the JPEG. The photograph is exported only when the owner invokes the system share sheet. The app has no network client, authentication or access to fleet orders.

Tests still required on a physical iPhone and iPad: Xcode compilation, camera permission denial/retry, portrait raw-image orientation, detected surface selection, repeated measurement against a ruler, background interruption, Save to Files and web import.

Apple APIs: [ARFrame raycast query](https://developer.apple.com/documentation/arkit/arframe/raycastquery(from:allowing:alignment:)), [Vision rectangle detection](https://developer.apple.com/documentation/vision/vndetectrectanglesrequest). Apple frameworks are provided by the SDK; no third-party classifier or dataset is included.
