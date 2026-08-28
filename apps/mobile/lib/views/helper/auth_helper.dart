import 'package:etaxwala/views/helper/shared_prefs_helper.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter/material.dart';


class AuthHelper {
  static Future<void> logout(BuildContext context) async {
    try {
      // Show loading dialog
      showDialog(
        context: context,
        barrierDismissible: false, // Prevent dismissing
        builder: (BuildContext dialogContext) {
          return WillPopScope(  // Prevents back button closing the dialog
            onWillPop: () async => false,
            child: Center(child: CircularProgressIndicator()),
          );
        },
      );

      // Simulate API delay (Replace with actual API call if needed)
      await Future.delayed(Duration(seconds: 2));

      // Clear stored tokens
      await SharedPrefsHelper.logout();

      if (context.mounted) {
        // Ensure the dialog is dismissed
        if (Navigator.canPop(context)) {
          Navigator.pop(context);
        }

        // Replace current screen with login to prevent blank screen
        GoRouter.of(context).go('/login'); 
      }
    } catch (e) {
      debugPrint("Error during logout: $e");

      // Ensure dialog is dismissed in case of error
      if (context.mounted && Navigator.canPop(context)) {
        Navigator.pop(context);
      }
    }
  }
}
