// Sightline 8.8.20.82: native device-trial source, not a machining instrument.
// Camera frames and exports stay on this device until the owner chooses Share.
import UIKit
import ARKit
import Vision
import CoreImage
import simd

final class SightlineCaptureController: UIViewController, ARSessionDelegate {
    private let scene = ARSCNView(frame: .zero)
    private let outline = CAShapeLayer()
    private let message = UILabel()
    private let capture = UIButton(type: .system)
    private let again = UIButton(type: .system)
    private let context = CIContext()
    private var lastAnalysis: TimeInterval = 0
    private var observations: [[SIMD3<Float>]] = []
    private var anchorID: UUID?
    private var candidate: Candidate?
    private var frozen = false
    private var exportURL: URL?
    private struct Candidate {
        let frame: ARFrame
        let corners: [CGPoint] // Raw camera image, normalized top-left origin.
        let world: [SIMD3<Float>]
        let spread: Float
        let count: Int
    }
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 0.02, green: 0.09, blue: 0.12, alpha: 1)
        scene.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(scene)
        outline.strokeColor = UIColor.systemYellow.cgColor
        outline.fillColor = UIColor.clear.cgColor
        outline.lineWidth = 3
        scene.layer.addSublayer(outline)
        message.textColor = .white
        message.numberOfLines = 0
        message.font = .preferredFont(forTextStyle: .body)
        message.text = "Sightline camera trial. Slowly sweep around one rectangular board on a flat surface. Keep all four corners visible."
        capture.setTitle("Save highlighted board", for: .normal)
        capture.isEnabled = false
        capture.addTarget(self, action: #selector(saveCapture), for: .touchUpInside)
        again.setTitle("Start a new capture", for: .normal)
        again.addTarget(self, action: #selector(restart), for: .touchUpInside)
        for button in [capture, again] {
            button.configuration = .filled()
            button.heightAnchor.constraint(greaterThanOrEqualToConstant: 50).isActive = true
        }
        let stack = UIStackView(arrangedSubviews: [message, capture, again])
        stack.axis = .vertical; stack.spacing = 12; stack.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(stack)
        NSLayoutConstraint.activate([
            scene.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            scene.leadingAnchor.constraint(equalTo: view.leadingAnchor), scene.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            scene.bottomAnchor.constraint(equalTo: stack.topAnchor, constant: -16),
            stack.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            stack.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            stack.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -12),
            scene.heightAnchor.constraint(greaterThanOrEqualToConstant: 180)
        ])
        // Serialize Vision, raycasts and UI with the AR delegate to keep the packet/frame paired.
        scene.session.delegate = self
        scene.session.delegateQueue = .main
    }
    override func viewWillAppear(_ animated: Bool) { super.viewWillAppear(animated); if !frozen { restart() } }
    override func viewWillDisappear(_ animated: Bool) { super.viewWillDisappear(animated); scene.session.pause() }
    @objc private func restart() {
        guard ARWorldTrackingConfiguration.isSupported else { message.text = "World tracking is unavailable on this device. Use the fleet photo-reference test."; return }
        frozen = false; observations = []; anchorID = nil; candidate = nil
        capture.isEnabled = false; outline.path = nil; lastAnalysis = 0
        let configuration = ARWorldTrackingConfiguration()
        configuration.planeDetection = [.horizontal]
        scene.session.run(configuration, options: [.resetTracking, .removeExistingAnchors])
        message.text = "Move slowly around one flat rectangular board. The highlighted rectangle must match the board, not the table. No LiDAR is required."
    }
    private func reject(_ text: String) {
        candidate = nil; observations = []; anchorID = nil
        capture.isEnabled = false; outline.path = nil; message.text = text
    }
    func session(_ session: ARSession, didUpdate frame: ARFrame) {
        guard !frozen else { return }
        guard case .normal = frame.camera.trackingState else { reject("Move slowly in good light while the camera establishes tracking."); return }
        guard frame.timestamp - lastAnalysis > 0.4 else { return }
        lastAnalysis = frame.timestamp
        let request = VNDetectRectanglesRequest()
        request.maximumObservations = 5; request.minimumConfidence = 0.75
        request.minimumAspectRatio = 0.08; request.maximumAspectRatio = 1
        request.minimumSize = 0.15; request.quadratureTolerance = 25
        do {
            // No orientation transform: JPEG and normalized rectangle use this same raw image.
            try VNImageRequestHandler(cvPixelBuffer: frame.capturedImage, orientation: .up).perform([request])
            guard let rect = request.results?.max(by: { $0.boundingBox.width * $0.boundingBox.height < $1.boundingBox.width * $1.boundingBox.height }) else { reject("Keep the whole rectangular board visible against a contrasting background."); return }
            let points = [rect.topLeft, rect.topRight, rect.bottomRight, rect.bottomLeft].map { CGPoint(x: $0.x, y: 1 - $0.y) }
            var hits: [ARRaycastResult] = []
            for point in points {
                let query = frame.raycastQuery(from: point, allowing: .existingPlaneGeometry, alignment: .horizontal)
                guard let hit = session.raycast(query).first, hit.anchor != nil else { reject("Sweep a little farther to establish the flat surface beneath all four corners."); return }
                hits.append(hit)
            }
            guard let firstAnchor = hits.first?.anchor?.identifier,
                  hits.allSatisfy({ $0.anchor?.identifier == firstAnchor }) else { reject("Corners are on different detected surfaces. Reframe the board."); return }
            let world = hits.map { SIMD3<Float>($0.worldTransform.columns.3.x, $0.worldTransform.columns.3.y, $0.worldTransform.columns.3.z) }
            let lengths = (0..<4).map { simd_distance(world[$0], world[($0 + 1) % 4]) }
            guard lengths.allSatisfy({ $0 >= 0.0254 && $0 <= 3.048 }) else { reject("Board measurement is outside this trial’s 1–120 inch range."); return }
            if anchorID != firstAnchor || observations.last.map({ previous in zip(previous, world).contains { simd_distance($0.0, $0.1) > 0.025 } }) == true { observations = [] }
            anchorID = firstAnchor
            observations.append(world)
            if observations.count > 8 { observations.removeFirst() }
            let spread = observations.flatMap { old in zip(old, world).map { simd_distance($0.0, $0.1) * 1000 } }.max() ?? 0
            guard spread <= 8 else { observations = [world]; candidate = nil; capture.isEnabled = false; message.text = "Hold the highlighted board steady. Measurement is still moving."; outline.path = nil; return }
            let transform = frame.displayTransform(for: .portrait, viewportSize: scene.bounds.size)
            let path = UIBezierPath()
            for (index, point) in points.enumerated() {
                let p = point.applying(transform)
                let screen = CGPoint(x: p.x * scene.bounds.width, y: p.y * scene.bounds.height)
                if index == 0 { path.move(to: screen) } else { path.addLine(to: screen) }
            }
            path.close(); outline.path = path.cgPath
            candidate = Candidate(frame: frame, corners: points, world: world, spread: spread, count: observations.count)
            capture.isEnabled = observations.count >= 5
            message.text = observations.count >= 5
                ? "Check the yellow outline matches the board. Ready for a trial capture. Repeatability is not accuracy; compare the result with a ruler."
                : "Finding a stable outline… \(observations.count)/5 observations."
        } catch { reject("The camera could not inspect this frame. Reframe in good light.") }
    }
    @objc private func saveCapture() {
        guard let c = candidate, c.count >= 5, !frozen,
              let current = scene.session.currentFrame, current.timestamp - c.frame.timestamp < 0.75,
              case .normal = current.camera.trackingState else { reject("Capture expired. Move slowly until the outline is stable again."); return }
        let ci = CIImage(cvPixelBuffer: c.frame.capturedImage)
        let scale = min(1, 1600 / max(ci.extent.width, ci.extent.height))
        let scaled = ci.transformed(by: CGAffineTransform(scaleX: scale, y: scale))
        let extent = CGRect(x: 0, y: 0, width: floor(scaled.extent.width), height: floor(scaled.extent.height))
        guard let cg = context.createCGImage(scaled, from: extent), let jpeg = UIImage(cgImage: cg).jpegData(compressionQuality: 0.9) else { reject("This frame could not be saved. Please capture again."); return }
        let id = UUID().uuidString
        let packet: [String: Any] = [
            "schema": "carvewright-native-capture-v1", "id": id,
            "createdAt": ISO8601DateFormatter().string(from: Date()), "units": "m",
            "tracking": "normal", "planeSource": "existingPlaneGeometry",
            "sampleCount": c.count, "spreadMm": Double(c.spread),
            "imageWidth": cg.width, "imageHeight": cg.height, "imageJpegBase64": jpeg.base64EncodedString(),
            "corners": c.corners.map { [Double($0.x), Double($0.y)] },
            "worldCornersMetres": c.world.map { [Double($0.x), Double($0.y), Double($0.z)] }
        ]
        do {
            let data = try JSONSerialization.data(withJSONObject: packet, options: [.sortedKeys])
            guard data.count <= 9 * 1024 * 1024 else { reject("Capture file is too large. Try again."); return }
            let url = FileManager.default.temporaryDirectory.appendingPathComponent("Sightline-\(id).json")
            try data.write(to: url, options: [.atomic, .completeFileProtection])
            if let previous = exportURL { try? FileManager.default.removeItem(at: previous) }
            exportURL = url; frozen = true; scene.session.pause(); capture.isEnabled = false
            message.text = "Save to Files, then open this JSON in Carvewright’s camera trial. This is an unverified flat-surface estimate. Species and thickness are not identified."
            let share = UIActivityViewController(activityItems: [url], applicationActivities: nil)
            share.popoverPresentationController?.sourceView = capture
            share.popoverPresentationController?.sourceRect = capture.bounds
            present(share, animated: true)
        } catch { reject("The capture file could not be prepared: \(error.localizedDescription)") }
    }
    func session(_ session: ARSession, didFailWithError error: Error) { reject("Camera tracking stopped. Tap Start a new capture to retry.") }
    func sessionWasInterrupted(_ session: ARSession) { reject("Camera session interrupted. Tap Start a new capture when you return.") }
    func sessionInterruptionEnded(_ session: ARSession) { restart() }
    override var supportedInterfaceOrientations: UIInterfaceOrientationMask { .portrait }
}
