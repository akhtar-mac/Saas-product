// import 'package:flutter/material.dart';
// import 'package:http/http.dart' as http;
// import 'dart:convert';

// class CallScreen extends StatefulWidget {
//   const CallScreen({super.key});

//   @override
//   _CallScreenState createState() => _CallScreenState();
// }

// class _CallScreenState extends State<CallScreen> {
//   final String twilioAccountSid = 'your_twilio_account_sid';
//   final String twilioAuthToken = 'your_twilio_auth_token';
//   final String twilioNumber = '+your_twilio_number'; // e.g., +1234567890
//   final String customerNumber = '+customer_number'; // e.g., +919876543210
//   String callStatus = 'Idle';

//   Future<void> initiateCall() async {
//     final String apiUrl = 'https://api.twilio.com/2010-04-01/Accounts/$twilioAccountSid/Calls.json';
    
//     try {
//       final response = await http.post(
//         Uri.parse(apiUrl),
//         headers: {
//           'Authorization': 'Basic ' + base64Encode(utf8.encode('$twilioAccountSid:$twilioAuthToken')),
//           'Content-Type': 'application/x-www-form-urlencoded',
//         },
//         body: {
//           'To': customerNumber,
//           'From': twilioNumber,
//           'Url': 'https://your-server.com/twiml', // TwiML endpoint
//           'Record': 'true', // Enable recording
//           'RecordingStatusCallback': 'https://your-server.com/recording-callback', // Optional: Handle recording status
//         },
//       );

//       if (response.statusCode == 201) {
//         setState(() {
//           callStatus = 'Call Initiated';
//         });
//       } else {
//         setState(() {
//           callStatus = 'Failed: ${response.body}';
//         });
//       }
//     } catch (e) {
//       setState(() {
//         callStatus = 'Error: $e';
//       });
//     }
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(title: const Text('Sales Call')),
//       body: Center(
//         child: Column(
//           mainAxisAlignment: MainAxisAlignment.center,
//           children: [
//             Text('Call Status: $callStatus'),
//             const SizedBox(height: 20),
//             ElevatedButton(
//               onPressed: initiateCall,
//               child: const Text('Call Customer'),
//             ),
//           ],
//         ),
//       ),
//     );
//   }
// }