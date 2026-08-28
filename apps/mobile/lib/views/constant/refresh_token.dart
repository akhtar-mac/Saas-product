import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:etaxwala/views/constant/domain.dart';
import 'package:etaxwala/views/helper/shared_prefs_helper.dart';

Future<void> refreshToken() async {
  String? authToken = await SharedPrefsHelper.getAuthToken();
  print("🔁 Refreshing Token...");
  String? oldToken = authToken; // Store old token for debugging

  final response = await http.post(
    Uri.parse(refreshAuthToken),
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer $authToken",
    },
  );

  if (response.statusCode == 200) {
    final Map<String, dynamic> data = jsonDecode(response.body);
    SharedPrefsHelper.saveAuthToken(data["access_token"]); // ✅ Save new token
    
    String? token22 = await SharedPrefsHelper.getAuthToken();

    print("✅ Token refreshed successfully!");
    print("🆕 New Token: $token22");
    print("🆚 Old Token: $oldToken");
  } else {
    print("❌ Failed to refresh token. Logging out user.");
    // Handle logout (clear token, redirect to login page)
  }
}



