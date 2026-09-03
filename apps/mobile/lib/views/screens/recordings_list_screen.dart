// import 'package:flutter/material.dart';
// import 'package:provider/provider.dart';
// import 'package:intl/intl.dart';

// // Provider import (no conflict)
// import 'package:etaxwala/views/modal/call_recording_provider.dart';

// // Import with prefix aliases to avoid class name conflict
// import 'package:etaxwala/views/modal/recording_info.dart' as infoModel;
// import 'package:etaxwala/views/modal/call_recording_servicel.dart' as serviceModel;

// class RecordingsListScreen extends StatelessWidget {
//   const RecordingsListScreen({super.key});

//   @override
//   Widget build(BuildContext context) {
//     return ChangeNotifierProvider(
//       create: (_) => CallRecordingProvider(),
//       child: const _RecordingsListScreenContent(),
//     );
//   }
// }

// class _RecordingsListScreenContent extends StatefulWidget {
//   const _RecordingsListScreenContent();

//   @override
//   State<_RecordingsListScreenContent> createState() =>
//       _RecordingsListScreenContentState();
// }

// class _RecordingsListScreenContentState
//     extends State<_RecordingsListScreenContent> {
//   // Use infoModel.RecordingInfo explicitly here to avoid conflict
//   List<infoModel.RecordingInfo> _filteredRecordings = [];
//   String _searchQuery = '';

//   @override
//   void initState() {
//     super.initState();
//     _loadRecordings();
//   }

//   Future<void> _loadRecordings() async {
//     try {
//       final provider = context.read<CallRecordingProvider>();
//       final recordings = await provider.getAllRecordings();

//       // Cast each recording to infoModel.RecordingInfo if needed
//       // Assuming provider.getAllRecordings() returns List<infoModel.RecordingInfo>
//       setState(() {
//         _filteredRecordings = recordings.cast<infoModel.RecordingInfo>();
//       });
//     } catch (e) {
//       // handle error, e.g. show snackbar or log
//     }
//   }

//   void _filterRecordings(String query) async {
//     final provider = context.read<CallRecordingProvider>();
//     final recordings = await provider.getAllRecordings();

//     setState(() {
//       _searchQuery = query.toLowerCase();
//       _filteredRecordings = recordings.where((recording) {
//         // Cast recording to infoModel.RecordingInfo to avoid errors
//         final infoModel.RecordingInfo rec = recording as infoModel.RecordingInfo;

//         final name = rec.displayName.toLowerCase();
//         final phone = rec.phoneNumber?.toLowerCase() ?? '';
//         return name.contains(_searchQuery) || phone.contains(_searchQuery);
//       }).cast<infoModel.RecordingInfo>().toList();
//     });
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Consumer<CallRecordingProvider>(
//       builder: (context, provider, child) {
//         return Scaffold(
//           appBar: AppBar(
//             title: const Text('Call Recordings'),
//             backgroundColor: Colors.amber,
//             foregroundColor: Colors.black,
//           ),
//           body: Column(
//             children: [
//               Padding(
//                 padding: const EdgeInsets.all(16.0),
//                 child: TextField(
//                   decoration: const InputDecoration(
//                     labelText: 'Search by customer or phone',
//                     prefixIcon: Icon(Icons.search),
//                     border: OutlineInputBorder(),
//                   ),
//                   onChanged: _filterRecordings,
//                 ),
//               ),
//               Expanded(
//                 child: provider.isLoading
//                     ? const Center(child: CircularProgressIndicator())
//                     : _filteredRecordings.isEmpty
//                         ? const Center(
//                             child: Column(
//                               mainAxisAlignment: MainAxisAlignment.center,
//                               children: [
//                                 Icon(Icons.record_voice_over,
//                                     size: 64, color: Colors.grey),
//                                 SizedBox(height: 16),
//                                 Text('No recordings found'),
//                               ],
//                             ),
//                           )
//                         : RefreshIndicator(
//                             onRefresh: _loadRecordings,
//                             child: ListView.builder(
//                               itemCount: _filteredRecordings.length,
//                               itemBuilder: (context, index) {
//                                 final recording = _filteredRecordings[index];
//                                 final isPlaying = provider.isPlaying &&
//                                     provider.currentRecordingPath ==
//                                         recording.filePath;

//                                 return Card(
//                                   margin: const EdgeInsets.symmetric(
//                                       horizontal: 16, vertical: 8),
//                                   child: ListTile(
//                                     leading: CircleAvatar(
//                                       backgroundColor: Colors.amber[100],
//                                       child: const Icon(Icons.record_voice_over,
//                                           color: Colors.black),
//                                     ),
//                                     title: Text(recording.displayName),
//                                     subtitle: Column(
//                                       crossAxisAlignment:
//                                           CrossAxisAlignment.start,
//                                       children: [
//                                         Text(
//                                           DateFormat('MMM dd, yyyy - HH:mm').format(
//                                               recording.dateTime ??
//                                                   DateTime.now()),
//                                           style:
//                                               const TextStyle(fontSize: 12),
//                                         ),
//                                         Text(
//                                           'Size: ${recording.fileSizeFormatted}',
//                                           style:
//                                               const TextStyle(fontSize: 12),
//                                         ),
//                                       ],
//                                     ),
//                                     trailing: Row(
//                                       mainAxisSize: MainAxisSize.min,
//                                       children: [
//                                         IconButton(
//                                           icon: Icon(
//                                             isPlaying
//                                                 ? Icons.stop
//                                                 : Icons.play_arrow,
//                                             color: Colors.green,
//                                           ),
//                                           onPressed: () {
//                                             if (isPlaying) {
//                                               provider.stopPlaying();
//                                             } else {
//                                               provider.playRecording(
//                                                   recording.filePath);
//                                             }
//                                           },
//                                         ),
//                                         IconButton(
//                                           icon: const Icon(Icons.delete,
//                                               color: Colors.red),
//                                           onPressed: () async {
//                                             final confirm = await showDialog<bool>(
//                                               context: context,
//                                               builder: (context) =>
//                                                   AlertDialog(
//                                                 title:
//                                                     const Text('Delete Recording'),
//                                                 content: const Text(
//                                                     'Are you sure you want to delete this recording?'),
//                                                 actions: [
//                                                   TextButton(
//                                                     onPressed: () =>
//                                                         Navigator.pop(context,
//                                                             false),
//                                                     child: const Text('Cancel'),
//                                                   ),
//                                                   TextButton(
//                                                     onPressed: () =>
//                                                         Navigator.pop(context,
//                                                             true),
//                                                     child: const Text('Delete',
//                                                         style: TextStyle(
//                                                             color: Colors.red)),
//                                                   ),
//                                                 ],
//                                               ),
//                                             );
//                                             if (confirm == true) {
//                                               await provider.deleteRecording(
//                                                   recording.filePath);
//                                               _filterRecordings(_searchQuery);
//                                             }
//                                           },
//                                         ),
//                                       ],
//                                     ),
//                                     isThreeLine: true,
//                                   ),
//                                 );
//                               },
//                             ),
//                           ),
//               ),
//             ],
//           ),
//         );
//       },
//     );
//   }
// }
