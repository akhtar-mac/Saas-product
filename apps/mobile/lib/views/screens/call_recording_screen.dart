// import 'package:flutter/material.dart';
// import 'package:etaxwala/views/modal/call_recording_servicel.dart';
// import 'package:etaxwala/views/modal/recording_info.dart';

// class CallRecordingProvider with ChangeNotifier {
//   final CallRecordingService _service = CallRecordingService();

//   bool _isInitialized = false;
//   bool _isRecording = false;
//   bool _isPaused = false;
//   bool _isPlaying = false;
//   bool _isLoading = false;

//   Duration _recordingDuration = Duration.zero;
//   String? _errorMessage;
//   String? _currentRecordingPath;

//   bool get isInitialized => _isInitialized;
//   bool get isRecording => _isRecording;
//   bool get isPaused => _isPaused;
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
//       _service.recordingDurationStream.listen((duration) {
//         _recordingDuration = duration;
//         notifyListeners();
//       });
//     } catch (e) {
//       _errorMessage = 'Failed to initialize recording: $e';
//     }
//     notifyListeners();
//   }

//   Future<void> toggleRecording({String? customerName, String? phoneNumber}) async {
//     _errorMessage = null;
//     try {
//       if (_isRecording) {
//         final filePath = await _service.stopRecording();
//         _isRecording = false;
//         _isPaused = false;
//         if (filePath == null) {
//           _errorMessage = 'Failed to save recording';
//         }
//       } else {
//         final success = await _service.startRecording(
//           customerName: customerName,
//           phoneNumber: phoneNumber,
//         );
//         if (success) {
//           _isRecording = true;
//         } else {
//           _errorMessage = 'Failed to start recording';
//         }
//       }
//     } catch (e) {
//       _errorMessage = e.toString();
//     }
//     notifyListeners();
//   }

//   Future<void> togglePause() async {
//     _errorMessage = null;
//     try {
//       if (_isPaused) {
//         final success = await _service.resumeRecording();
//         if (success) {
//           _isPaused = false;
//         } else {
//           _errorMessage = 'Failed to resume recording';
//         }
//       } else {
//         final success = await _service.pauseRecording();
//         if (success) {
//           _isPaused = true;
//         } else {
//           _errorMessage = 'Failed to pause recording';
//         }
//       }
//     } catch (e) {
//       _errorMessage = e.toString();
//     }
//     notifyListeners();
//   }

//   Future<void> playRecording(String filePath) async {
//     _errorMessage = null;
//     try {
//       final success = await _service.playRecording(filePath);
//       if (success) {
//         _isPlaying = true;
//         _currentRecordingPath = filePath;
//       } else {
//         _errorMessage = 'Failed to play recording';
//       }
//     } catch (e) {
//       _errorMessage = e.toString();
//     }
//     notifyListeners();
//   }

//   Future<void> stopPlaying() async {
//     _errorMessage = null;
//     try {
//       await _service.stopPlaying();
//       _isPlaying = false;
//       _currentRecordingPath = null;
//     } catch (e) {
//       _errorMessage = e.toString();
//     }
//     notifyListeners();
//   }

//   // Future<List<RecordingInfo>> getAllRecordings() async {
//   //   _errorMessage = null;
//   //   _isLoading = true;
//   //   notifyListeners();

//   //   try {
//   //     final recordings = await _service.getAllRecordings();
//   //     return recordings;
//   //   } catch (e) {
//   //     _errorMessage = 'Failed to load recordings: $e';
//   //     return [];
//   //   } finally {
//   //     _isLoading = false;
//   //     notifyListeners();
//   //   }
//   // }

//   Future<void> deleteRecording(String filePath) async {
//     _errorMessage = null;
//     try {
//       final success = await _service.deleteRecording(filePath);
//       if (!success) {
//         _errorMessage = 'Failed to delete recording';
//       }
//     } catch (e) {
//       _errorMessage = e.toString();
//     }
//     notifyListeners();
//   }

//   void clearError() {
//     _errorMessage = null;
//     notifyListeners();
//   }

//   @override
//   void dispose() {
//     _service.dispose();
//     super.dispose();
//   }
// }
