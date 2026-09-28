import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:etaxwala/views/home/home_screen.dart';
import 'package:etaxwala/views/constant/domain.dart';
import 'package:etaxwala/views/helper/shared_prefs_helper.dart';

Future<void> validateToken() async {
  final prefs = await SharedPreferences.getInstance();
  String? oldToken = SharedPrefsHelper.getAuthToken() as String?;

  if (oldToken == null) {
    print("No token found. Please log in.");
    return;
  }

  final response = await http.post(
    Uri.parse(validateAuthToken),
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer $oldToken"
    },
  );

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    String newToken = data["token"];

    // Save the new token
    await prefs.setString('auth_token', newToken);
    print("New Token Stored: $newToken");
  } else {
    print("Token Refresh Failed");
  }
}
