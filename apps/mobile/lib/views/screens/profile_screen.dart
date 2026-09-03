import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:etaxwala/views/helper/shared_prefs_helper.dart';
import 'package:etaxwala/views/helper/auth_helper.dart';
import 'package:etaxwala/views/helper/navigation_helper.dart';
import 'package:go_router/go_router.dart';
import 'package:etaxwala/views/constant/domain.dart';

class ProfileScreen extends StatefulWidget {

  @override
  _ProfileScreenState createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  int _selectedIndex = 3;
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  Map<String, String> _currentUserData = {};

  Future<Map<String, String>> _loadUserProfile() async {
    String name = await SharedPrefsHelper.getUserName() ?? "Guest User";
    String email = await SharedPrefsHelper.getUserEmail() ?? "user@example.com";
    String phone = await SharedPrefsHelper.getUserPhone() ?? "1234567890";

    _currentUserData = {"username": name, "email": email, "contact": phone};
    return _currentUserData;
  }

  void _editProfile() {
    _nameController.text = _currentUserData["username"] ?? "";
    _emailController.text = _currentUserData["email"] ?? "";
    _phoneController.text = _currentUserData["contact"] ?? "";

    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Row(
          children: [
            Icon(Icons.edit, color: Colors.amber),
            SizedBox(width: 8),
            Text("Update Profile"),
          ],
        ),
        content: Form(
          key: _formKey,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildTextField(_nameController, "Full Name", Icons.person),
                SizedBox(height: 16),
                _buildTextField(_emailController, "Email Address", Icons.email,
                    type: TextInputType.emailAddress,
                    validator: (value) {
                      if (value == null || value.isEmpty) return "Enter email";
                      if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) return "Invalid email";
                      return null;
                    }),
                SizedBox(height: 16),
                _buildTextField(_phoneController, "Phone Number", Icons.phone,
                    type: TextInputType.phone,
                    validator: (value) {
                      if (value == null || value.isEmpty) return "Enter phone";
                      if (value.length < 10) return "Invalid phone number";
                      return null;
                    }),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text("Cancel", style: TextStyle(color: Colors.grey))),
          ElevatedButton(
            onPressed: () async {
              if (_formKey.currentState!.validate()) {
                await _updateProfile();
                Navigator.pop(context);
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.amber,
              foregroundColor: Colors.black,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: Text("Update"),
          )
        ],
      ),
    );
  }

  Future<void> _updateProfile() async {
    final name = _nameController.text.trim();
    final email = _emailController.text.trim();
    final phone = _phoneController.text.trim();
    final token = await SharedPrefsHelper.getAuthToken();

    if (token == null) {
      _showSnackbar("Session expired. Please login again.", isError: true);
      return;
    }

    final payload = {
      "username": name,
      "email": email,
      "contact": phone,
    };

    print("Sending update profile request...");
    print("Payload: $payload");

    try {
      final response = await http.post(
        Uri.parse(updateProfileu),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode(payload),
      );

      final data = jsonDecode(response.body);
      print("Status Code: ${response.statusCode}");
      print("Response Body: ${response.body}");

      if (response.statusCode == 200 && data['status'] == true) {
        await SharedPrefsHelper.saveUserName(name);
        await SharedPrefsHelper.saveUserEmail(email);
        await SharedPrefsHelper.saveUserPhone(phone);

        setState(() {
          _currentUserData = payload;
        });

        _showSnackbar("Profile updated successfully!");
      } else {
        _showSnackbar(data['error'] ?? "Failed to update profile", isError: true);
      }
    } catch (e) {
      _showSnackbar("Error: ${e.toString()}", isError: true);
    }
  }

  void _showSnackbar(String msg, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Row(children: [
        Icon(isError ? Icons.error : Icons.check_circle, color: Colors.white),
        SizedBox(width: 8),
        Expanded(child: Text(msg)),
      ]),
      backgroundColor: isError ? Colors.red : Colors.green,
      duration: Duration(seconds: 2),
    ));
  }

  void _logout() {
    AuthHelper.logout(context);
  }

  void _onItemTapped(int index) {
    if (index == _selectedIndex) return;
    setState(() => _selectedIndex = index);
    NavigationHelper.navigateToScreen(context, index);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Profile"),
        backgroundColor: Colors.amber,
        leading: IconButton(
          icon: Icon(Icons.arrow_back),
          onPressed: () {
            if (GoRouter.of(context).canPop()) {
              context.pop();
            } else {
              context.go('/home');
            }
          },
        ),
      ),
      body: FutureBuilder<Map<String, String>>(
        future: _loadUserProfile(),
        builder: (context, snapshot) {
          if (!snapshot.hasData) return Center(child: CircularProgressIndicator());
          final user = snapshot.data!;
          return Padding(
            padding: EdgeInsets.all(16),
            child: Column(
              children: [
                CircleAvatar(
                  radius: 50,
                  backgroundColor: Colors.grey[300],
                  child: Icon(Icons.person, size: 50, color: Colors.black54),
                ),
                SizedBox(height: 10),
                Text(user["username"] ?? '', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                SizedBox(height: 5),
                Text(user["email"] ?? '', style: TextStyle(fontSize: 16)),
                SizedBox(height: 5),
                Text(user["contact"] ?? '', style: TextStyle(fontSize: 16)),
                SizedBox(height: 20),
                _buildButton(Icons.edit, "Edit Profile", Colors.amber, _editProfile),
                SizedBox(height: 10),
                _buildButton(Icons.logout, "Logout", Colors.black, _logout, textColor: Colors.white),
              ],
            ),
          );
        },
      ),
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  Widget _buildTextField(
    TextEditingController controller,
    String label,
    IconData icon, {
    TextInputType type = TextInputType.text,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: type,
      validator: validator ??
          (value) {
            if (value == null || value.isEmpty) return "Enter $label";
            return null;
          },
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: Colors.amber),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: Colors.amber, width: 2),
        ),
      ),
    );
  }

  Widget _buildButton(IconData icon, String text, Color color, VoidCallback onPressed, {Color textColor = Colors.black}) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: onPressed,
        icon: Icon(icon, color: textColor),
        label: Text(text, style: TextStyle(color: textColor)),
        style: ElevatedButton.styleFrom(
          backgroundColor: color,
          padding: EdgeInsets.symmetric(vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
      ),
    );
  }

  Widget _buildBottomNav() {
    return BottomNavigationBar(
      currentIndex: _selectedIndex,
      onTap: _onItemTapped,
      selectedItemColor: Colors.black,
      unselectedItemColor: Colors.grey,
      backgroundColor: Colors.amber,
      elevation: 10,
      type: BottomNavigationBarType.fixed,
      items: const [
        BottomNavigationBarItem(icon: Icon(Icons.home), label: "Home"),
        BottomNavigationBarItem(icon: Icon(Icons.description), label: "Quotations"),
        BottomNavigationBarItem(icon: Icon(Icons.calendar_today), label: "Appointments"),
        BottomNavigationBarItem(icon: Icon(Icons.person), label: "Profile"),
      ],
    );
  }
}
