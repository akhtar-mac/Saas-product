// import 'dart:async';
// import 'dart:io';
// import 'package:flutter_sound/flutter_sound.dart';
// import 'package:permission_handler/permission_handler.dart';
// import 'package:path_provider/path_provider.dart';
// import 'package:intl/intl.dart';
// import 'package:flutter/services.dart' show MethodChannel;

// class CallRecordingService {
//   static final CallRecordingService _instance = CallRecordingService._internal();
//   factory CallRecordingService() => _instance;
//   CallRecordingService._internal();

//   FlutterSoundRecorder? _recorder;
//   FlutterSoundPlayer? _player;
//   bool _isRecording = false;
//   bool _isPaused = false;
//   bool _isPlaying = false;
//   String? _currentRecordingPath;
//   final StreamController<Duration> _recordingDurationController = StreamController.broadcast();
//   Stream<Duration> get recordingDurationStream => _recordingDurationController.stream;
//   Timer? _durationTimer;

//   Future<void> initialize() async {
//     try {
//       _recorder = FlutterSoundRecorder();
//       _player = FlutterSoundPlayer();
//       await _recorder!.openRecorder();
//       await _player!.openPlayer();
//       // await _recorder!.setAudioFocus(
//       //   focus: AudioFocus.requestFocusAndKeepOthers,
//       //   category: SessionCategory.record,
//       //   mode: SessionMode.modeSpoken,
//       // );
//     } catch (e) {
//       throw Exception('Failed to initialize recorder: $e');
//     }
//   }

//   Future<void> dispose() async {
//     _durationTimer?.cancel();
//     _recordingDurationController.close();
//     await _recorder?.stopRecorder();
//     await _player?.stopPlayer();
//     await _recorder?.closeRecorder();
//     await _player?.closePlayer();
//     _recorder = null;
//     _player = null;
//   }

//   Future<bool> checkPermissions() async {
//     final permissions = await [
//       Permission.microphone,
//       if (Platform.isAndroid && await _getAndroidSdkVersion() >= 33)
//         Permission.audio
//       else
//         Permission.storage,
//     ].request();

//     final allGranted = permissions.values.every((status) => status.isGranted);
//     if (!allGranted) {
//       final deniedPermanently = permissions.values.any((status) => status.isPermanentlyDenied);
//       if (deniedPermanently) {
//         throw Exception('Permissions permanently denied. Please enable in settings.');
//       }
//       throw Exception('Microphone and storage/audio permissions required.');
//     }
//     return true;
//   }

//   Future<int> _getAndroidSdkVersion() async {
//     if (Platform.isAndroid) {
//       final version = await const MethodChannel('com.example.etaxwala').invokeMethod('getSdkVersion');
//       return int.tryParse(version ?? '0') ?? 0;
//     }
//     return 0;
//   }

//   Future<bool> startRecording({String? customerName, String? phoneNumber}) async {
//     if (_isRecording) return false;
//     try {
//       await checkPermissions();
//       final directory = await getApplicationDocumentsDirectory();
//       final recordingsDir = Directory('${directory.path}/call_recordings');
//       if (!await recordingsDir.exists()) {
//         await recordingsDir.create(recursive: true);
//       }

//       final timestamp = DateFormat('yyyyMMdd_HHmmss').format(DateTime.now());
//       final customerInfo = customerName != null ? '_${customerName.replaceAll(RegExp(r'[^a-zA-Z0-9]'), '_')}' : '';
//       final phoneInfo = phoneNumber != null ? '_$phoneNumber' : '';
//       final filename = 'call_${timestamp}${customerInfo}${phoneInfo}.wav';
//       _currentRecordingPath = '${recordingsDir.path}/$filename';

//       await _recorder!.startRecorder(
//         toFile: _currentRecordingPath,
//         codec: Codec.pcm16WAV,
//         sampleRate: 16000,
//         numChannels: 1,
//       );

//       _isRecording = true;
//       _startDurationTimer();
//       return true;
//     } catch (e) {
//       print('Error starting recording: $e');
//       return false;
//     }
//   }

//   Future<bool> pauseRecording() async {
//     if (!_isRecording || _isPaused) return false;
//     try {
//       await _recorder!.pauseRecorder();
//       _isPaused = true;
//       _durationTimer?.cancel();
//       return true;
//     } catch (e) {
//       print('Error pausing recording: $e');
//       return false;
//     }
//   }

//   Future<bool> resumeRecording() async {
//     if (!_isRecording || !_isPaused) return false;
//     try {
//       await _recorder!.resumeRecorder();
//       _isPaused = false;
//       _startDurationTimer();
//       return true;
//     } catch (e) {
//       print('Error resuming recording: $e');
//       return false;
//     }
//   }

//   Future<String?> stopRecording() async {
//     if (!_isRecording) return null;
//     try {
//       await _recorder!.stopRecorder();
//       _isRecording = false;
//       _isPaused = false;
//       _durationTimer?.cancel();
//       _recordingDurationController.add(Duration.zero);
//       return _currentRecordingPath;
//     } catch (e) {
//       print('Error stopping recording: $e');
//       return null;
//     }
//   }

//   Future<bool> playRecording(String filePath) async {
//     if (_isPlaying) await stopPlaying();
//     try {
//       await _player!.startPlayer(
//         fromURI: filePath,
//         codec: Codec.pcm16WAV,
//         whenFinished: () {
//           _isPlaying = false;
//         },
//       );
//       _isPlaying = true;
//       return true;
//     } catch (e) {
//       print('Error playing recording: $e');
//       return false;
//     }
//   }

//   Future<void> stopPlaying() async {
//     if (_isPlaying) {
//       await _player!.stopPlayer();
//       _isPlaying = false;
//     }
//   }

//   Future<List<RecordingInfo>> getAllRecordings() async {
//     try {
//       final directory = await getApplicationDocumentsDirectory();
//       final recordingsDir = Directory('${directory.path}/call_recordings');
//       if (!await recordingsDir.exists()) return [];

//       final files = await recordingsDir
//           .list()
//           .where((file) => file.path.endsWith('.wav'))
//           .toList();

//       final recordings = await Future.wait(
//         files.map((file) async {
//           final stat = await file.stat();
//           return RecordingInfo.fromFile(File(file.path), stat);
//         }),
//       );

//       recordings.sort((a, b) {
//         final aTime = a.dateTime ?? DateTime.fromMillisecondsSinceEpoch(0);
//         final bTime = b.dateTime ?? DateTime.fromMillisecondsSinceEpoch(0);
//         return bTime.compareTo(aTime);
//       });

//       return recordings;
//     } catch (e) {
//       print('Error getting recordings: $e');
//       return [];
//     }
//   }

//   Future<bool> deleteRecording(String filePath) async {
//     try {
//       final file = File(filePath);
//       if (await file.exists()) {
//         await file.delete();
//         return true;
//       }
//       return false;
//     } catch (e) {
//       print('Error deleting recording: $e');
//       return false;
//     }
//   }

//   void _startDurationTimer() {
//     int seconds = 0;
//     _durationTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
//       seconds++;
//       _recordingDurationController.add(Duration(seconds: seconds));
//     });
//   }

//   bool get isRecording => _isRecording;
//   bool get isPaused => _isPaused;
//   bool get isPlaying => _isPlaying;
//   String? get currentRecordingPath => _currentRecordingPath;
// }

// class RecordingInfo {
//   final File file;
//   final DateTime? dateTime;

//   RecordingInfo({required this.file, required this.dateTime});

//   factory RecordingInfo.fromFile(File file, FileStat stat) {
//     return RecordingInfo(file: file, dateTime: stat.modified);
//   }
// }
