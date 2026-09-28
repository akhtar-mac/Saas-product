import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:go_router/go_router.dart';
import 'package:etaxwala/views/constant/domain.dart';
import 'package:etaxwala/views/helper/navigation_helper.dart';
import 'package:intl/intl.dart';


class AllQuotationsScreen extends StatefulWidget {
  const AllQuotationsScreen({super.key});

  @override
  _AllQuotationsScreenState createState() => _AllQuotationsScreenState();
}

class _AllQuotationsScreenState extends State<AllQuotationsScreen> {
  int _selectedIndex = 1;
  List<dynamic> allQuotations = [];
  List<dynamic> filteredQuotations = [];
  bool isLoading = false;
  String searchQuery = "";
  String authToken = "";

  @override
  void initState() {
    super.initState();
    _loadAuthTokenAndFetchQuotations();
  }

  void _onItemTapped(int index) {
    if (index == _selectedIndex) return;
    setState(() => _selectedIndex = index);
    NavigationHelper.navigateToScreen(context, index);
  }

  Future<void> _loadAuthTokenAndFetchQuotations() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token') ?? '';

    setState(() => authToken = token);

    if (token.isEmpty) {
      _showError('Auth token missing. Please log in again.');
      if (context.mounted) context.go('/login');
      return;
    }

    await fetchQuotations();
  }

  Future<void> fetchQuotations() async {
    setState(() => isLoading = true);

    final url = Uri.parse(getAllQuotationsApi);
    print("📡 API URL: $url");
    print("🔐 Token: $authToken");

    try {
      final response = await http.get(
        url,
        headers: {
          "Authorization": "Bearer $authToken",
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      ).timeout(const Duration(seconds: 8));

      print("📋 Response Status: ${response.statusCode}");
      print("📄 Response Body: ${response.body}");

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = json.decode(response.body);
        final List quotations = responseData["data"] ?? [];
        setState(() {
          allQuotations = quotations;
          filteredQuotations = quotations;
        });
      } else if (response.statusCode == 401) {
        _showError('Session expired. Please log in again.');
        final prefs = await SharedPreferences.getInstance();
        await prefs.remove('auth_token');
        if (context.mounted) context.go('/login');
      } else {
        _showError('Failed to load quotations: ${response.statusCode}');
      }
    } catch (e) {
      print(" Exception: $e");
      _showError('Network error: Unable to fetch quotations');
    } finally {
      setState(() => isLoading = false);
    }
  }

  void searchQuotations(String query) {
    setState(() {
      searchQuery = query;
      filteredQuotations = allQuotations
          .where((quote) =>
              (quote["created_by"]?.toString() ?? "")
                  .toLowerCase()
                  .contains(query.toLowerCase()) ||
              (quote["lead_id"]?.toString() ?? "")
                  .toLowerCase()
                  .contains(query.toLowerCase()))
          .toList();
    });
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null) return "N/A";
    try {
      final date = DateTime.parse(dateStr);
      return DateFormat('MMM dd, yyyy').format(date);
    } catch (_) {
      return "Invalid Date";
    }
  }

  void _showError(String message) {
    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red.shade600,
        behavior: SnackBarBehavior.floating,
        action: SnackBarAction(
          label: 'Dismiss',
          textColor: Colors.white,
          onPressed: () => ScaffoldMessenger.of(context).hideCurrentSnackBar(),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Manage Quotations"),
        backgroundColor: Colors.amber,
        centerTitle: true,
        elevation: 4,
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications, color: Colors.black),
            onPressed: () {
              // Notification logic placeholder
            },
            tooltip: 'Notifications',
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(14.0),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                SizedBox(
                  width: 200,
                  height: 40,
                  child: TextField(
                    onChanged: searchQuotations,
                    decoration: InputDecoration(
                      prefixIcon: const Icon(Icons.search),
                      hintText: "Search by creator or lead ID...",
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 8),
                    ),
                  ),
                ),
                ElevatedButton(
                  onPressed: () => context.go('/create_quotation'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.amber,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  ),
                  child: const Text(
                    "Create New",
                    style: TextStyle(color: Colors.black),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Expanded(
              child: isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : filteredQuotations.isEmpty
                      ? const Center(child: Text("No quotations found."))
                      : ListView.builder(
                          itemCount: filteredQuotations.length,
                          itemBuilder: (context, index) {
                            final quote = filteredQuotations[index];
                            return Card(
                              margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                              elevation: 2,
                              child: ListTile(
                                title: Text(
                                  "Quotation #${quote["id"]?.toString() ?? "N/A"}",
                                  style: const TextStyle(fontWeight: FontWeight.bold),
                                ),
                                subtitle: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text("Lead ID: ${quote["lead_id"]?.toString() ?? "N/A"}"),
                                    Text("Created By: ${quote["created_by"]?.toString() ?? "Unknown"}"),
                                    Text("Date: ${_formatDate(quote["created_at"])}"),
                                  ],
                                ),
                                // trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                                // onTap: () {
                                //   // context.go('/quotation/${quote["id"]}');
                                // },
                              ),
                            );
                          },
                        ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: _buildBottomNav(),
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