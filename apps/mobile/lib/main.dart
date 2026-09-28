import 'package:etaxwala/views/screens/appointment_screen.dart';
import 'package:etaxwala/views/screens/profile_screen.dart';
import 'package:etaxwala/views/screens/all_quotations_screen.dart';
import 'package:flutter/material.dart';

import 'package:go_router/go_router.dart';
import 'package:etaxwala/views/auth/login_screen.dart';
import 'package:etaxwala/views/helper/shared_prefs_helper.dart';
import 'package:etaxwala/views/home/home_screen.dart';
import 'package:etaxwala/views/screens/quotation_screen.dart';
import 'package:etaxwala/views/auth/splash_screen.dart';

void main() async {
  
  WidgetsFlutterBinding.ensureInitialized();
  final bool isLoggedIn = await SharedPrefsHelper.isLoggedIn();

  // ✅ Print before running the app
  debugPrint("--------------------------");
  debugPrint("User Logged In: $isLoggedIn");
  debugPrint("--------------------------");

  runApp(MyApp(isLoggedIn: isLoggedIn));
}
class MyApp extends StatelessWidget {
  final bool isLoggedIn;

  const MyApp({super.key, required this.isLoggedIn});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      title: 'ETaxwala',
      theme: ThemeData(primarySwatch: Colors.blue),
      routerConfig: GoRouter(
        initialLocation: '/splash', // ✅ Set splash as initial route
        routes: [
          GoRoute(
            path: '/splash',
            builder: (context, state) => SplashScreen(isLoggedIn: isLoggedIn),
          ),
          GoRoute(path: '/login', builder: (context, state) => LoginScreen()),
          GoRoute(path: '/home', builder: (context, state) => HomeScreen()),
          GoRoute(path: '/all_quotation', builder: (context, state) => AllQuotationsScreen()),
          GoRoute(path: '/create_quotation', builder: (context, state) => QuotationScreen()),
          GoRoute(path: '/appointment', builder: (context, state) => AppointmentScreen()),
          GoRoute(path: '/profile', builder: (context, state) => ProfileScreen()),
        ],
      ),
    );
  }
}
