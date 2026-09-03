import 'package:flutter/material.dart';

import 'package:go_router/go_router.dart'; // ✅ Import go_router

class NavigationHelper {
  static void navigateToScreen(BuildContext context, int index) {
    print("Selected Index: $index");

    if (!context.mounted) return; // ✅ Prevents errors if widget is disposed

    switch (index) {
      case 0:
        GoRouter.of(context).go('/home'); // ✅ Corrected `go_router` usage
        break;
      case 1:
        GoRouter.of(context).go('/all_quotation');
        break;
      case 2:
        GoRouter.of(context).go('/appointment');
        break;
      case 3:
        GoRouter.of(context).go('/profile');
        break;
      default:
        print("Invalid index: $index");
    }
  }
}

