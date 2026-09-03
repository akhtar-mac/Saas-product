// import 'dart:io';
// import 'package:intl/intl.dart';

// class RecordingInfo {
//   final String filePath;
//   final String fileName;
//   final DateTime dateTime;
//   final int fileSizeBytes;
//   final String? customerName;
//   final String? phoneNumber;

//   RecordingInfo({
//     required this.filePath,
//     required this.fileName,
//     required this.dateTime,
//     required this.fileSizeBytes,
//     this.customerName,
//     this.phoneNumber,
//   });

//   factory RecordingInfo.fromFile(File file, FileStat stat) {
//     final fileName = file.path.split('/').last;
//     final dateTime = stat.modified;
//     final fileSize = stat.size;

//     String? customerName;
//     String? phoneNumber;

//     final parts = fileName.replaceAll('.wav', '').split('_');
//     if (parts.length >= 3) {
//       customerName = parts.sublist(2, parts.length - 1).join(' ').replaceAll('_', ' ');
//     }
//     if (parts.length >= 4) {
//       phoneNumber = parts.last;
//     }

//     return RecordingInfo(
//       filePath: file.path,
//       fileName: fileName,
//       dateTime: dateTime,
//       fileSizeBytes: fileSize,
//       customerName: customerName,
//       phoneNumber: phoneNumber,
//     );
//   }

//   String get displayName {
//     return customerName ?? phoneNumber ?? DateFormat('MMM dd, yyyy - HH:mm').format(dateTime);
//   }

//   String get fileSizeFormatted {
//     if (fileSizeBytes < 1024) {
//       return '$fileSizeBytes B';
//     } else if (fileSizeBytes < 1024 * 1024) {
//       return '${(fileSizeBytes / 1024).toStringAsFixed(1)} KB';
//     } else {
//       return '${(fileSizeBytes / (1024 * 1024)).toStringAsFixed(1)} MB';
//     }
//   }
// }