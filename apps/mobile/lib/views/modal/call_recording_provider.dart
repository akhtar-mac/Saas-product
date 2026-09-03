// import 'package:flutter/foundation.dart';
// import 'package:etaxwala/views/modal/call_recording_servicel.dart' hide RecordingInfo;
// import 'package:etaxwala/views/modal/recording_info.dart';



// class CallRecordingProvider with ChangeNotifier {
//   final CallRecordingService _service = CallRecordingService();

//   bool _isInitialized = false;
//   bool _isPlaying = false;
//   bool _isLoading = false;
//   Duration _recordingDuration = Duration.zero;
//   String? _errorMessage;
//   String? _currentRecordingPath;

//   bool get isInitialized => _isInitialized;
//   bool get isPlaying => _isPlaying;
//   bool get isLoading => _isLoading;
//   Duration get recordingDuration => _recordingDuration;
//   String? get errorMessage => _errorMessage;
//   String? get currentRecordingPath => _currentRecordingPath;

//   CallRecordingProvider() {
//     _initialize();
//   }

//   Future<void> _initialize() async {
//     try {
//       await _service.initialize();
//       _isInitialized = true;
//       notifyListeners();
//     } catch (e) {
//       _errorMessage = 'Failed to initialize: $e';
//       notifyListeners();
//     }
//   }

//  Future<List<RecordingInfo>> getAllRecordings() async {
//   _isLoading = true;
//   notifyListeners();

//   try {
//     final recordings = await Future.value(_service.getAllRecordings());
//     return recordings;  
//   } catch (e) {
//     _errorMessage = 'Failed to load recordings: $e';
//     return [];
//   } finally {
//     _isLoading = false;
//     notifyListeners();
//   }
// }


//   Future<void> playRecording(String filePath) async {
//     await _service.playRecording(filePath);
//     _isPlaying = true;
//     _currentRecordingPath = filePath;
//     notifyListeners();
//   }

//   Future<void> stopPlaying() async {
//     await _service.stopPlaying();
//     _isPlaying = false;
//     _currentRecordingPath = null;
//     notifyListeners();
//   }

//   Future<void> deleteRecording(String filePath) async {
//     await _service.deleteRecording(filePath);
//     notifyListeners();
//   }
// }
