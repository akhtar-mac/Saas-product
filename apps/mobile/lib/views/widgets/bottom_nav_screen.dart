import 'package:flutter/material.dart';
import 'package:etaxwala/views/screens/appointment_screen.dart';
import 'package:etaxwala/views/screens/profile_screen.dart';
import 'package:etaxwala/views/screens/quotation_screen.dart';
import 'package:etaxwala/views/home/home_screen.dart';
import 'package:etaxwala/views/widgets/bottom_navigation.dart'; // Import your new widget

class BottomNavScreen extends StatefulWidget {
  @override
  _BottomNavScreenState createState() => _BottomNavScreenState();
}

class _BottomNavScreenState extends State<BottomNavScreen> {
  int _selectedIndex = 0; // Active Tab Index

  // Define All Pages
  final List<Widget> _screens = [
    HomeScreen(),         // 🏠 Home
    QuotationScreen(),    // 📄 Quotations
    AppointmentScreen(),  // 📅 Appointments
    ProfileScreen(),      // 👤 Profile
  ];

  // Update Selected Tab
  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: IndexedStack(
            index: _selectedIndex,
            children: _screens,
          ),
        ),
        BottomNavBar( // ✅ Use the custom Bottom Navigation Bar
          currentIndex: _selectedIndex,
          onTap: _onItemTapped,
        ),
      ],
    );
  }
}
