import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:etaxwala/views/helper/navigation_helper.dart';
import 'package:etaxwala/views/constant/domain.dart';
import 'package:etaxwala/views/helper/shared_prefs_helper.dart';
import 'package:go_router/go_router.dart';

// const String getAllAppointmentsApi = "${domain}appointments";
// const String getAppointmentByIdApi = "${domain}appointments/";
// const String refreshTokenApi = "${domain}refresh";
// const String sendSmsApi = "${domain}send_sms"; // Hypothetical SMS endpoint

class AppointmentScreen extends StatefulWidget {
  const AppointmentScreen({super.key});

  @override
  State<AppointmentScreen> createState() => _AppointmentScreenState();
}

class _AppointmentScreenState extends State<AppointmentScreen>
    with TickerProviderStateMixin {
  List<Map<String, String>> appointments = [];
  int _selectedIndex = 2;
  late final AnimationController _animationController;
  late final Animation<double> _scaleAnimation;
  String _selectedFilter = "All";
  bool isUpdating = false;
  bool isLoading = true;
  bool isRefreshingToken = false;
  int _currentPage = 1;
  final int _pageSize = 20;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOut),
    );
    _fetchAppointments();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<String?> _refreshToken() async {
    if (!mounted) return null;

    final refreshToken = await SharedPrefsHelper.getRefreshToken();
    if (refreshToken == null) {
      print('No refresh token available. Redirecting to login.');
      _showSnackBar("Session expired. Please log in again.", isError: true);
      if (mounted) {
        await SharedPrefsHelper.logout();
        context.go('/login');
      }
      return null;
    }

    try {
      final uri = Uri.parse(refreshToken); // Note: Should be a proper endpoint, e.g., refreshTokenApi
      final headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer $refreshToken",
      };

      print('API Request: POST $uri');
      print('Request Headers: $headers');

      final response = await http.post(
        uri,
        headers: headers,
      ).timeout(const Duration(seconds: 15));

      print('Refresh Token Response Status: ${response.statusCode}');
      print('Refresh Token Response Body: ${response.body}');

      if (response.statusCode == 200) {
        final responseData = json.decode(response.body);
        final newToken = responseData['access_token']?.toString();
        if (newToken != null) {
          await SharedPrefsHelper.saveAuthToken(newToken);
          print('New token saved: $newToken');
          return newToken;
        } else {
          print('No access token in refresh response');
          _showSnackBar("Failed to refresh session. Please log in again.", isError: true);
          if (mounted) {
            await SharedPrefsHelper.logout();
            context.go('/login');
          }
          return null;
        }
      } else {
        print('Failed to refresh token: ${response.statusCode} - ${response.body}');
        _showSnackBar("Failed to refresh session. Please log in again.", isError: true);
        if (mounted) {
          await SharedPrefsHelper.logout();
          context.go('/login');
        }
        return null;
      }
    } catch (e) {
      print('Network error during token refresh: $e');
      _showSnackBar("Network error: Unable to refresh session. Please log in again.", isError: true);
      if (mounted) {
        await SharedPrefsHelper.logout();
        context.go('/login');
      }
      return null;
    }
  }

  Future<void> _fetchAppointments({int retryCount = 0}) async {
    if (!mounted) return;

    setState(() => isLoading = true);

    String? token = await SharedPrefsHelper.getAuthToken();
    if (token == null) {
      _showSnackBar("Authentication token missing. Please log in again.", isError: true);
      if (mounted) {
        await SharedPrefsHelper.logout();
        context.go('/login');
      }
      setState(() => isLoading = false);
      return;
    }

    if (SharedPrefsHelper.isTokenExpired(token) && retryCount == 0 && !isRefreshingToken) {
      setState(() => isRefreshingToken = true);
      print('Token expired, attempting to refresh token');
      final newToken = await _refreshToken();
      setState(() => isRefreshingToken = false);
      if (newToken != null) {
        token = newToken;
      } else {
        setState(() => isLoading = false);
        return;
      }
    }

    try {
      final uri = Uri.parse('$getAllAppointmentsApi?page=$_currentPage&limit=$_pageSize'); // Commented out, will cause runtime error
      final headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer $token",
      };

      print('API Request: GET $uri');
      print('Request Headers: $headers');

      final response = await http.get(
        uri,
        headers: headers,
      ).timeout(const Duration(seconds: 15));

      print('Response Status: ${response.statusCode}');
      print('Response Body: ${response.body}');

      if (response.statusCode == 200) {
        final responseData = json.decode(response.body);
        if (responseData is Map && responseData['data'] is List) {
          setState(() {
            appointments = (responseData['data'] as List).map((item) {
              final mappedItem = <String, String>{};
              item.forEach((key, value) {
                mappedItem[key] = value?.toString() ?? '';
              });
              // Map is_complete to status
              mappedItem['status'] = (mappedItem['is_complete'] == '1' ? 'Completed' : 'Pending');
              // Rename ap_date and ap_time to date and time
              mappedItem['date'] = mappedItem['ap_date'] ?? '';
              mappedItem['time'] = mappedItem['ap_time'] ?? '';
              // Validate and log missing ID
              if (!mappedItem.containsKey('id') || mappedItem['id']!.isEmpty) {
                print('Warning: Appointment missing ID: $mappedItem');
              }
              return mappedItem;
            }).toList();
            isLoading = false;
          });
        } else {
          _showSnackBar("Invalid response format from server", isError: true);
          setState(() => isLoading = false);
        }
      } else if (response.statusCode == 401) {
        if (retryCount == 0 && !isRefreshingToken) {
          setState(() => isRefreshingToken = true);
          print('Token expired or invalid, attempting to refresh token');
          final newToken = await _refreshToken();
          setState(() => isRefreshingToken = false);
          if (newToken != null) {
            print('Retrying with new token');
            return _fetchAppointments(retryCount: retryCount + 1);
          } else {
            setState(() => isLoading = false);
            return;
          }
        } else {
          _showSnackBar("Unauthorized: Invalid token. Please log in again.", isError: true);
          if (mounted) {
            await SharedPrefsHelper.logout();
            context.go('/login');
          }
          setState(() => isLoading = false);
        }
      } else if (retryCount < 2) {
        print('Retrying API call (attempt ${retryCount + 1})');
        await Future.delayed(const Duration(seconds: 2));
        return _fetchAppointments(retryCount: retryCount + 1);
      } else {
        final responseData = json.decode(response.body);
        final errorMsg = responseData["error"] ?? responseData["message"] ?? "Unknown error";
        _showSnackBar("Failed to fetch appointments: $errorMsg", isError: true);
        setState(() => isLoading = false);
      }
    } catch (e) {
      print('Network error: $e');
      if (retryCount < 2) {
        print('Retrying API call (attempt ${retryCount + 1})');
        await Future.delayed(const Duration(seconds: 2));
        return _fetchAppointments(retryCount: retryCount + 1);
      }
      _showSnackBar("Network error: Unable to fetch appointments", isError: true);
      setState(() => isLoading = false);
    }
  }

  Future<Map<String, String>?> _fetchAppointmentById(String id, {int retryCount = 0}) async {
    if (!mounted) return null;

    String? token = await SharedPrefsHelper.getAuthToken();
    if (token == null) {
      _showSnackBar("Authentication token missing. Please log in again.", isError: true);
      if (mounted) {
        await SharedPrefsHelper.logout();
        context.go('/login');
      }
      return null;
    }

    if (SharedPrefsHelper.isTokenExpired(token) && retryCount == 0 && !isRefreshingToken) {
      setState(() => isRefreshingToken = true);
      print('Token expired, attempting to refresh token');
      final newToken = await _refreshToken();
      setState(() => isRefreshingToken = false);
      if (newToken != null) {
        token = newToken;
      } else {
        return null;
      }
    }

    try {
      final uri = Uri.parse('$getAppointmentByIdApi$id'); // Commented out, will cause runtime error
      final headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer $token",
      };

      print('API Request: GET $uri');
      print('Request Headers: $headers');

      final response = await http.get(
        uri,
        headers: headers,
      ).timeout(const Duration(seconds: 15));

      print('Response Status: ${response.statusCode}');
      print('Response Body: ${response.body}');

      if (response.statusCode == 200) {
        final responseData = json.decode(response.body);
        final mappedItem = <String, String>{};
        responseData.forEach((key, value) {
          mappedItem[key] = value?.toString() ?? '';
        });
        mappedItem['status'] = (mappedItem['is_complete'] == '1' ? 'Completed' : 'Pending');
        mappedItem['date'] = mappedItem['ap_date'] ?? '';
        mappedItem['time'] = mappedItem['ap_time'] ?? '';
        if (!mappedItem.containsKey('id') || mappedItem['id']!.isEmpty) {
          print('Warning: Fetched appointment missing ID: $mappedItem');
        }
        return mappedItem;
      } else if (response.statusCode == 401) {
        if (retryCount == 0 && !isRefreshingToken) {
          setState(() => isRefreshingToken = true);
          print('Token expired or invalid, attempting to refresh token');
          final newToken = await _refreshToken();
          setState(() => isRefreshingToken = false);
          if (newToken != null) {
            print('Retrying with new token');
            return _fetchAppointmentById(id, retryCount: retryCount + 1);
          } else {
            return null;
          }
        } else {
          _showSnackBar("Unauthorized: Invalid token. Please log in again.", isError: true);
          if (mounted) {
            await SharedPrefsHelper.logout();
            context.go('/login');
          }
          return null;
        }
      } else if (retryCount < 2) {
        print('Retrying API call (attempt ${retryCount + 1})');
        await Future.delayed(const Duration(seconds: 2));
        return _fetchAppointmentById(id, retryCount: retryCount + 1);
      } else {
        final responseData = json.decode(response.body);
        final errorMsg = responseData["error"] ?? responseData["message"] ?? "Unknown error";
        _showSnackBar("Failed to fetch appointment: $errorMsg", isError: true);
        return null;
      }
    } catch (e) {
      print('Network error: $e');
      if (retryCount < 2) {
        print('Retrying API call (attempt ${retryCount + 1})');
        await Future.delayed(const Duration(seconds: 2));
        return _fetchAppointmentById(id, retryCount: retryCount + 1);
      }
      _showSnackBar("Network error: Unable to fetch appointment", isError: true);
      return null;
    }
  }

  Future<bool> _apiRequest(String endpoint, Map<String, String> data, {bool isUpdate = false}) async {
    if (!mounted) return false;

    String? token = await SharedPrefsHelper.getAuthToken();
    if (token == null) {
      _showSnackBar("Authentication token missing. Please log in again.", isError: true);
      if (mounted) {
        await SharedPrefsHelper.logout();
        context.go('/login');
      }
      return false;
    }

    if (SharedPrefsHelper.isTokenExpired(token) && !isRefreshingToken) {
      setState(() => isRefreshingToken = true);
      print('Token expired, attempting to refresh token');
      final newToken = await _refreshToken();
      setState(() => isRefreshingToken = false);
      if (newToken != null) {
        token = newToken;
      } else {
        return false;
      }
    }

    setState(() => isUpdating = true);

    try {
      String normalizedDomain = domain.endsWith('/') ? domain.substring(0, domain.length - 1) : domain;
      String endpointPath = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
      final uri = Uri.parse('$normalizedDomain/$endpointPath'); // Commented out constants may cause runtime error

      final headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer $token",
      };

      // Map UI fields to API fields
      final requestData = Map<String, String>.from(data.map((key, value) => MapEntry(key, value ?? '')));
      if (requestData.containsKey('date')) {
        requestData['date'] = requestData['date'] ?? '';
        requestData.remove('ap_date');
      }
      if (requestData.containsKey('time')) {
        requestData['time'] = requestData['time'] ?? ''; // Changed from ap_time to time
        requestData.remove('ap_time');
      }
      if (requestData.containsKey('status')) {
        requestData['is_complete'] = (requestData['status'] == 'Completed' ? '1' : '0') ?? '0';
        requestData.remove('status');
      }
      if (isUpdate && requestData.containsKey('appo_id')) {
        requestData['appo_id'] = requestData['appo_id'] ?? '';
      }

      print('API Request: POST $uri');
      print('Request Headers: $headers');
      print('Request Body: ${json.encode(requestData)}');

      final response = await http.post(
        uri,
        headers: headers,
        body: json.encode(requestData),
      ).timeout(const Duration(seconds: 15));

      print('Response Status: ${response.statusCode}');
      print('Response Body: ${response.body}');

      Map<String, dynamic> responseData;
      try {
        responseData = json.decode(response.body);
      } catch (e) {
        print('Network error: Failed to parse response as JSON - $e');
        _showSnackBar("Server error: Invalid response format", isError: true);
        return false;
      }

      final isSuccess = responseData["success"] == true ||
          (responseData["message"]?.toString().toLowerCase().contains(isUpdate ? "appointment updated successfully" : "appointment created successfully") ?? false);

      if (response.statusCode == 200 && isSuccess) {
        if (!isUpdate) {
          if (responseData['id'] != null) {
            data['id'] = responseData['id'].toString();
          } else {
            print('API Warning: No ID returned in response');
          }
        }
        return true;
      } else if (response.statusCode == 401) {
        if (!isRefreshingToken) {
          setState(() => isRefreshingToken = true);
          print('Token expired or invalid, attempting to refresh token');
          final newToken = await _refreshToken();
          setState(() => isRefreshingToken = false);
          if (newToken != null) {
            print('Retrying with new token');
            return _apiRequest(endpoint, data, isUpdate: isUpdate);
          } else {
            return false;
          }
        } else {
          _showSnackBar("Unauthorized: Invalid token. Please log in again.", isError: true);
          if (mounted) {
            await SharedPrefsHelper.logout();
            context.go('/login');
          }
          return false;
        }
      } else {
        final errorMsg = responseData["error"] ?? responseData["message"] ?? "Unknown error";
        _showSnackBar("Failed to ${isUpdate ? 'update' : 'create'} appointment: $errorMsg", isError: true);
        return false;
      }
    } catch (e) {
      print('Network error: $e');
      _showSnackBar("Network error: Unable to ${isUpdate ? 'update' : 'create'} appointment", isError: true);
      return false;
    } finally {
      if (mounted) setState(() => isUpdating = false);
    }
  }

  // Future<bool> sendSMSNotification(String phone, String message, {int retryCount = 0}) async {
  //   if (!mounted) return false;

  //   String? token = await SharedPrefsHelper.getAuthToken();
  //   if (token == null) {
  //     print('No auth token available for SMS notification');
  //     _showSnackBar("Authentication token missing. Unable to send SMS.", isError: true);
  //     return false;
  //   }

  //   if (SharedPrefsHelper.isTokenExpired(token) && retryCount == 0 && !isRefreshingToken) {
  //     setState(() => isRefreshingToken = true);
  //     print('Token expired, attempting to refresh token for SMS');
  //     final newToken = await _refreshToken();
  //     setState(() => isRefreshingToken = false);
  //     if (newToken != null) {
  //       token = newToken;
  //     } else {
  //       return false;
  //     }
  //   }

  //   try {
  //     final uri = Uri.parse(sendSmsApi);
  //     final headers = {
  //       "Content-Type": "application/json",
  //       "Authorization": "Bearer $token",
  //     };
  //     final body = json.encode({
  //       "phone": phone,
  //       "message": message,
  //     });

  //     print('SMS API Request: POST $uri');
  //     print('Request Headers: $headers');
  //     print('Request Body: $body');

  //     final response = await http.post(
  //       uri,
  //       headers: headers,
  //       body: body,
  //     ).timeout(const Duration(seconds: 15));

  //     print('SMS Response Status: ${response.statusCode}');
  //     print('SMS Response Body: ${response.body}');

  //     if (response.statusCode == 200) {
  //       final responseData = json.decode(response.body);
  //       final isSuccess = responseData["success"] == true ||
  //           (responseData["message"]?.toString().toLowerCase().contains("sms sent successfully") ?? false);
  //       if (isSuccess) {
  //         print('SMS sent successfully to $phone');
  //         return true;
  //       } else {
  //         _showSnackBar("Failed to send SMS: ${responseData["error"] ?? responseData["message"] ?? "Unknown error"}", isError: true);
  //         return false;
  //       }
  //     } else if (response.statusCode == 401) {
  //       if (retryCount == 0 && !isRefreshingToken) {
  //         setState(() => isRefreshingToken = true);
  //         print('Token expired or invalid for SMS, attempting to refresh token');
  //         final newToken = await _refreshToken();
  //         setState(() => isRefreshingToken = false);
  //         if (newToken != null) {
  //           print('Retrying SMS with new token');
  //           return sendSMSNotification(phone, message, retryCount: retryCount + 1);
  //         } else {
  //           return false;
  //         }
  //       } else {
  //         _showSnackBar("Unauthorized: Unable to send SMS. Please log in again.", isError: true);
  //         if (mounted) {
  //           await SharedPrefsHelper.logout();
  //           context.go('/login');
  //         }
  //         return false;
  //       }
  //     } else if (retryCount < 2) {
  //       print('Retrying SMS API call (attempt ${retryCount + 1})');
  //       await Future.delayed(const Duration(seconds: 2));
  //       return sendSMSNotification(phone, message, retryCount: retryCount + 1);
  //     } else {
  //       final responseData = json.decode(response.body);
  //       final errorMsg = responseData["error"] ?? responseData["message"] ?? "Unknown error";
  //       _showSnackBar("Failed to send SMS: $errorMsg", isError: true);
  //       return false;
  //     }
  //   } catch (e) {
  //     print('Network error during SMS: $e');
  //     if (retryCount < 2) {
  //       print('Retrying SMS API call (attempt ${retryCount + 1})');
  //       await Future.delayed(const Duration(seconds: 2));
  //       return sendSMSNotification(phone, message, retryCount: retryCount + 1);
  //     }
  //     _showSnackBar("Network error: Unable to send SMS", isError: true);
  //     return false;
  //   }
  // }

  void _addAppointment() {
    showDialog(
      context: context,
      builder: (_) => AppointmentDialog(
        type: DialogType.add,
        onSave: (appointment) async {
          appointment.remove('appo_id');
          final success = await _apiRequest('new_appointment', appointment);
          if (success) {
            _updateAppointmentList(appointment);
            // SMS logic commented out as per requirement
            // final smsSuccess = await sendSMSNotification(
            //   appointment['mobile']!,
            //   "Your appointment has been successfully created with eTaxWala.",
            // );
            // if (smsSuccess) {
            //   _showSnackBar("Appointment created and SMS sent successfully", isError: false);
            // } else {
            //   _showSnackBar("Appointment created, but SMS failed to send", isError: true);
            // }
            Navigator.pop(context);
            _fetchAppointments();
          }
        },
      ),
    );
  }

  void _editAppointment(Map<String, String> appointment, int index) {
    final appointmentId = appointment['id'];
    if (appointmentId == null || appointmentId.isEmpty) {
      print('Error: Attempted to edit appointment with missing or empty id: $appointment');
      _showSnackBar("Cannot edit appointment: Missing ID", isError: true);
      return;
    }

    showDialog(
      context: context,
      builder: (_) => AppointmentDialog(
        type: DialogType.edit,
        appointment: Map<String, String>.from(appointment), // Create a copy to avoid mutation
        onSave: (updatedAppointment) async {
          final success = await _apiRequest('update_appointment', updatedAppointment, isUpdate: true);
          if (success) {
            setState(() {
              appointments[index] = updatedAppointment;
            });
            // SMS logic commented out as per requirement
            // final smsSuccess = await sendSMSNotification(
            //   updatedAppointment['mobile']!,
            //   "Your appointment details have been successfully updated with eTaxWala.",
            // );
            // if (smsSuccess) {
            //   _showSnackBar("Appointment updated and SMS sent successfully", isError: false);
            // } else {
            //   _showSnackBar("Appointment updated, but SMS failed to send", isError: true);
            // }
            Navigator.pop(context);
            _fetchAppointments();
          }
        },
      ),
    );
  }

  void _updateAppointmentList(Map<String, String> appointment) {
    setState(() {
      appointments.add(appointment);
      Future.delayed(Duration.zero, () {
        _animationController.forward().then((_) => _animationController.reset());
      });
    });
  }

  void _showSnackBar(String message, {required bool isError}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? Colors.red : Colors.green,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case "Completed":
        return Colors.green;
      case "Pending":
        return Colors.orange;
      case "Cancelled":
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  List<Map<String, String>> _getFilteredAppointments() =>
      _selectedFilter == "All"
          ? appointments
          : appointments.where((apt) => apt["status"] == _selectedFilter).toList();

  void _onItemTapped(int index) {
    if (index == _selectedIndex) return;
    setState(() => _selectedIndex = index);
    NavigationHelper.navigateToScreen(context, index);
  }

  @override
  Widget build(BuildContext context) {
    final filteredAppointments = _getFilteredAppointments();

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text(
          "📅 Appointments",
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.amber,
        elevation: 0,
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 15),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                "${filteredAppointments.length} appointments",
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
              ),
            ),
          ),
        ],
      ),
      body: Stack(
        children: [
          Column(
            children: [
              _buildFilterChips(),
              Expanded(
                child: isLoading || isRefreshingToken
                    ? const Center(child: CircularProgressIndicator())
                    : filteredAppointments.isEmpty
                        ? _buildEmptyState()
                        : AnimatedBuilder(
                            animation: _scaleAnimation,
                            builder: (context, _) => Transform.scale(
                              scale: _scaleAnimation.value,
                              child: ListView.builder(
                                physics: const ClampingScrollPhysics(),
                                itemCount: filteredAppointments.length,
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                                cacheExtent: 1000.0,
                                itemBuilder: (context, index) {
                                  final appointment = filteredAppointments[index];
                                  final originalIndex = appointments.indexOf(appointment);
                                  return _buildAppointmentCard(appointment, originalIndex);
                                },
                              ),
                            ),
                          ),
              ),
            ],
          ),
          if (isUpdating)
            Container(
              color: Colors.black.withOpacity(0.5),
              child: const Center(child: CircularProgressIndicator()),
            ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: (isUpdating || isLoading || isRefreshingToken) ? null : _addAppointment,
        backgroundColor: Colors.amber,
        foregroundColor: Colors.black,
        icon: const Icon(Icons.add),
        label: const Text(
          "New Appointment",
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
      bottomNavigationBar: _buildBottomNavBar(),
    );
  }

  Widget _buildFilterChips() {
    return SizedBox(
      height: 60,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 10),
        children: ["All", "Completed", "Pending", "Cancelled"].map((filter) {
          final isSelected = _selectedFilter == filter;
          return GestureDetector(
            onTap: () => setState(() => _selectedFilter = filter),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              margin: const EdgeInsets.only(right: 10),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              decoration: BoxDecoration(
                color: isSelected ? Colors.amber : Colors.white,
                borderRadius: BorderRadius.circular(25),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Text(
                filter,
                style: TextStyle(
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  color: isSelected ? Colors.black : Colors.grey[600],
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildEmptyState() => const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircleAvatar(
              radius: 50,
              backgroundColor: Colors.amber,
              child: Icon(Icons.event_busy, size: 60, color: Colors.white),
            ),
            SizedBox(height: 20),
            Text(
              "No Appointments Found",
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: Colors.grey,
              ),
            ),
            SizedBox(height: 10),
            Text(
              "Tap the + button to add your first appointment",
              style: TextStyle(fontSize: 16, color: Colors.grey),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );

  Widget _buildAppointmentCard(Map<String, String> appointment, int index) => Container(
        margin: const EdgeInsets.only(bottom: 16),
        child: Card(
          elevation: 8,
          shadowColor: Colors.black.withOpacity(0.15),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              color: Colors.grey[200],
            ),
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.grey[600]!.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(15),
                      ),
                      child: Icon(
                        Icons.person,
                        color: Colors.grey[700],
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 15),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            appointment["name"]!,
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.grey[800],
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            appointment["email"]!,
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[600],
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: _getStatusColor(appointment["status"]!).withOpacity(0.2),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        appointment["status"]!,
                        style: TextStyle(
                          color: _getStatusColor(appointment["status"]!),
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 15),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(15),
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildDetailRow(Icons.access_time, "${appointment["date"]} at ${appointment["time"]}"),
                      const SizedBox(height: 8),
                      _buildDetailRow(Icons.location_city, appointment["city"]!),
                      const SizedBox(height: 8),
                      _buildDetailRow(Icons.phone, appointment["mobile"]!),
                      const SizedBox(height: 8),
                      _buildDetailRow(Icons.message, appointment["message"]!),
                      const SizedBox(height: 8),
                      _buildDetailRow(Icons.supervisor_account, appointment["conduct_by"]!),
                    ],
                  ),
                ),
                const SizedBox(height: 15),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton.icon(
                      onPressed: isUpdating ? null : () => _editAppointment(appointment, index),
                      icon: Icon(Icons.edit, size: 18, color: Colors.blue[700]),
                      label: Text("Edit", style: TextStyle(color: Colors.blue[700])),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      );

  Widget _buildDetailRow(IconData icon, String text) => Row(
        children: [
          Icon(icon, size: 18, color: Colors.grey[600]),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[700],
              ),
            ),
          ),
        ],
      );

  Widget _buildBottomNavBar() => BottomNavigationBar(
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

enum DialogType { add, edit }

class AppointmentDialog extends StatefulWidget {
  final DialogType type;
  final Map<String, String>? appointment;
  final Function(Map<String, String>) onSave;

  const AppointmentDialog({
    super.key,
    required this.type,
    this.appointment,
    required this.onSave,
  });

  @override
  State<AppointmentDialog> createState() => _AppointmentDialogState();
}

class _AppointmentDialogState extends State<AppointmentDialog> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nameController;
  late final TextEditingController _emailController;
  late final TextEditingController _mobileController;
  late final TextEditingController _cityController;
  late final TextEditingController _messageController;
  late final TextEditingController _conductByController;
  late DateTime _selectedDate;
  late TimeOfDay _selectedTime;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.appointment?["name"] ?? "");
    _emailController = TextEditingController(text: widget.appointment?["email"] ?? "");
    _mobileController = TextEditingController(text: widget.appointment?["mobile"] ?? "");
    _cityController = TextEditingController(text: widget.appointment?["city"] ?? "");
    _messageController = TextEditingController(text: widget.appointment?["message"] ?? "");
    _conductByController = TextEditingController(text: widget.appointment?["conduct_by"] ?? "");

    if (widget.type == DialogType.edit) {
      _selectedDate = DateTime.parse(widget.appointment!["date"]!);
      _selectedTime = _parseTime(widget.appointment!["time"]!);
      print('Editing appointment: ${widget.appointment}');
    } else {
      _selectedDate = DateTime.now();
      _selectedTime = TimeOfDay.now();
    }
  }

  TimeOfDay _parseTime(String timeStr) {
    try {
      final timeParts = timeStr.split(RegExp(r'[: ]'));
      int hour = int.parse(timeParts[0]);
      int minute = int.parse(timeParts[1]);

      if (timeStr.contains("PM") && hour != 12) hour += 12;
      if (timeStr.contains("AM") && hour == 12) hour = 0;

      return TimeOfDay(hour: hour, minute: minute);
    } catch (e) {
      print('Error parsing time: $timeStr - $e');
      return TimeOfDay.now();
    }
  }

  Future<void> _selectDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (date != null) setState(() => _selectedDate = date);
  }

  Future<void> _selectTime() async {
    final time = await showTimePicker(
      context: context,
      initialTime: _selectedTime,
    );
    if (time != null) setState(() => _selectedTime = time);
  }

  void _submitForm() {
    if (_formKey.currentState!.validate()) {
      final appointment = <String, String>{

        "name": _nameController.text.trim(),
        "email": _emailController.text.isNotEmpty ? _emailController.text.trim() : "Not specified",
        "mobile": _mobileController.text.isNotEmpty ? _mobileController.text.trim() : "Not specified",
        "city": _cityController.text.isNotEmpty ? _cityController.text.trim() : "Not specified",
        "date": "${_selectedDate.year}-${_selectedDate.month.toString().padLeft(2, '0')}-${_selectedDate.day.toString().padLeft(2, '0')}",
        "time": _selectedTime.format(context),
        "message": _messageController.text.isNotEmpty ? _messageController.text.trim() : "No message",
        "conduct_by": _conductByController.text.isNotEmpty ? _conductByController.text.trim() : "Not specified",
        "status": widget.type == DialogType.edit ? widget.appointment!["status"] ?? "Pending" : "Pending",
        if (widget.type == DialogType.edit) "appo_id": widget.appointment!["id"] ?? "",
        if (widget.type == DialogType.edit) "order_id": widget.appointment!["order_id"] ?? "",
        if (widget.type == DialogType.edit) "payment_id": widget.appointment!["payment_id"] ?? "",
        if (widget.type == DialogType.edit) "amount": widget.appointment!["amount"] ?? "",
      };

      print('Submitting appointment: $appointment');
      widget.onSave(appointment);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Container(
        padding: const EdgeInsets.all(20),
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: widget.type == DialogType.add
                            ? Colors.amber.withOpacity(0.2)
                            : Colors.blue.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        widget.type == DialogType.add ? Icons.event_note : Icons.edit_calendar,
                        color: widget.type == DialogType.add ? Colors.amber[700] : Colors.blue[700],
                      ),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      widget.type == DialogType.add ? "New Appointment" : "Edit Appointment",
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                _buildTextFormField(
                  controller: _nameController,
                  label: "Name",
                  icon: Icons.person,
                  validator: (value) => value!.isEmpty ? 'Please enter name' : null,
                ),
                const SizedBox(height: 15),
                _buildTextFormField(
                  controller: _emailController,
                  label: "Email",
                  icon: Icons.email,
                  keyboardType: TextInputType.emailAddress,
                ),
                const SizedBox(height: 15),
                _buildTextFormField(
                  controller: _mobileController,
                  label: "Mobile No",
                  icon: Icons.phone,
                  keyboardType: TextInputType.phone,
                ),
                const SizedBox(height: 15),
                _buildTextFormField(
                  controller: _cityController,
                  label: "City",
                  icon: Icons.location_city,
                ),
                const SizedBox(height: 15),
                _buildDateTimeSelectors(),
                const SizedBox(height: 15),
                _buildTextFormField(
                  controller: _messageController,
                  label: "Message",
                  icon: Icons.message,
                  maxLines: 3,
                ),
                const SizedBox(height: 15),
                _buildTextFormField(
                  controller: _conductByController,
                  label: "Conducted By",
                  icon: Icons.supervisor_account,
                  validator: (value) => value!.isEmpty ? 'Please enter conducted by' : null,
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(
                      child: TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text("Cancel"),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: _submitForm,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: widget.type == DialogType.add ? Colors.amber : Colors.blue,
                          foregroundColor: widget.type == DialogType.add ? Colors.black : Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: Text(widget.type == DialogType.add ? "Add" : "Update"),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTextFormField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    TextInputType? keyboardType,
    int? maxLines,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      maxLines: maxLines,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      ),
      validator: validator,
    );
  }

  Widget _buildDateTimeSelectors() => Row(
        children: [
          Expanded(
            child: InkWell(
              onTap: _selectDate,
              child: Container(
                padding: const EdgeInsets.all(15),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Icon(Icons.calendar_today, color: Colors.grey[600]),
                    const SizedBox(width: 10),
                    Flexible(
                      child: Text(
                        "${_selectedDate.day}/${_selectedDate.month}/${_selectedDate.year}",
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: InkWell(
              onTap: _selectTime,
              child: Container(
                padding: const EdgeInsets.all(15),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Icon(Icons.access_time, color: Colors.grey[600]),
                    const SizedBox(width: 10),
                    Flexible(
                      child: Text(
                        _selectedTime.format(context),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      );
}