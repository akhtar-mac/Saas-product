import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:etaxwala/views/helper/shared_prefs_helper.dart';
import 'package:etaxwala/views/modal/edit_lead_modal.dart';
import 'package:etaxwala/views/constant/domain.dart';

class LeadDetailsScreen extends StatefulWidget {
  final int leadId;

  const LeadDetailsScreen({super.key, required this.leadId});

  @override
  _LeadDetailsScreenState createState() => _LeadDetailsScreenState();
}

class _LeadDetailsScreenState extends State<LeadDetailsScreen> {
  Map<String, dynamic>? leadDetails;
  bool isLoading = true;
  bool isUpdating = false;
  String? _authToken;

  final TextEditingController nameController = TextEditingController();
  final TextEditingController phoneController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController stateController = TextEditingController();
  final TextEditingController cityController = TextEditingController();
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  Map<String, int> allServices = {};
  int? selectedServiceId;
  String? selectedServiceName;


  @override
  void initState() {
    super.initState();
    _loadAuthToken();
  }

  Future<void> _loadAuthToken() async {
    try {
      final token = await SharedPrefsHelper.getAuthToken();
      print('Auth token: $token');
      if (token == null) {
        print('No auth token found in SharedPreferences');
        _showSnackBar('Authentication token missing. Please log in again.', isError: true);
        setState(() => isLoading = false);
        return;
      }
      setState(() => _authToken = token);
      await Future.wait([
        fetchLeadDetails(),
        fetchAllServices(),
      ]);
    } catch (e) {
      print('Error loading auth token: $e');
      _showSnackBar('Error loading auth token: $e', isError: true);
      setState(() => isLoading = false);
    }
  }

  Future<void> fetchLeadDetails() async {
    if (_authToken == null) return;

    try {
      final apiUrl = "$getLeadDetail?leadId=${widget.leadId}";
      print('Fetching lead details from: $apiUrl');
      
      final response = await http.get(
        Uri.parse(apiUrl),
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer $_authToken",
        },
      ).timeout(const Duration(seconds: 15));

      print('fetchLeadDetails status: ${response.statusCode}');
      print('fetchLeadDetails body: ${response.body}');

      if (response.statusCode == 200) {
        final responseData = json.decode(response.body);
        if (responseData["lead"] is List && responseData["lead"].isNotEmpty) {
          setState(() {
            leadDetails = responseData["lead"][0];
            isLoading = false;
          });
        } else if (responseData["lead"] is Map) {
          setState(() {
            leadDetails = responseData["lead"];
            isLoading = false;
          });
        } else {
          setState(() => isLoading = false);
          _showSnackBar("No lead details available", isError: true);
        }
      } else if (response.statusCode == 401) {
        _showSnackBar("Session expired. Please log in again.", isError: true);
        setState(() => isLoading = false);
      } else {
        setState(() => isLoading = false);
        _showSnackBar("Failed to load details (Status: ${response.statusCode})", isError: true);
      }
    } catch (e) {
      setState(() => isLoading = false);
      print('Network error in fetchLeadDetails: $e');
      _showSnackBar("Network error: Unable to fetch lead details", isError: true);
    }
  }

  Future<void> fetchAllServices() async {
    if (_authToken == null) return;

    try {
      print('Fetching services from: $getAllServices');
      
      final response = await http.get(
        Uri.parse(getAllServices),
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer $_authToken",
        },
      ).timeout(const Duration(seconds: 15));

      print('fetchAllServices status: ${response.statusCode}');
      print('fetchAllServices body: ${response.body}');

      if (response.statusCode == 200) {
        final responseData = json.decode(response.body);
        if (responseData["services"] != null) {
          final List<dynamic> services = responseData["services"];
          if (services.isNotEmpty) {
            setState(() {
              allServices = {
                for (var s in services) 
                  (s["service_name"] ?? s["name"] ?? "Unknown Service"): 
                  (s["service_id"] ?? s["id"] ?? 0)
              };
            });
          } else {
            _showSnackBar("No services available", isError: true);
          }
        } else {
          _showSnackBar("Invalid services response format", isError: true);
        }
      } else if (response.statusCode == 401) {
        _showSnackBar("Session expired. Please log in again.", isError: true);
      } else {
        _showSnackBar("Failed to load services (Status: ${response.statusCode})", isError: true);
      }
    } catch (e) {
      print('Network error in fetchAllServices: $e');
      _showSnackBar("Network error: Unable to fetch services", isError: true);
    }
  }

  Future<void> sendSMSNotification(String phone, String message) async {
    try {
      // Replace with your actual SMS API implementation
      final smsApiUrl = "https://api.smsprovider.com/send";
      print('Sending SMS to: $phone, message: $message');
      
      final response = await http.post(
        Uri.parse(smsApiUrl),
        headers: {"Content-Type": "application/json"},
        body: json.encode({
          "to": phone,
          "message": message,
          "api_key": "your_sms_api_key" // Replace with actual API key
        }),
      ).timeout(const Duration(seconds: 10));

      print('SMS response status: ${response.statusCode}');
      if (response.statusCode != 200) {
        print('SMS send failed: ${response.body}');
      }
    } catch (e) {
      print('Error sending SMS notification: $e');
      // Don't show error to user for SMS failure as it's not critical
    }
  }

Future<void> _updateLead() async {
  if (!_formKey.currentState!.validate()) return;

  if (_authToken == null) {
    _showSnackBar("Authentication token missing. Please log in again.", isError: true);
    return;
  }

  if (selectedServiceId == null) {
    _showSnackBar("Please select a service.", isError: true);
    return;
  }

  setState(() => isUpdating = true);

  try {
    final payload = {
      "lead_id": widget.leadId,
      "name": nameController.text.trim(),
      "contact": phoneController.text.trim(),
      "email": emailController.text.trim(),
      "state": stateController.text.trim(),
      "city": cityController.text.trim(),
      "service": selectedServiceId,
    };

    final response = await http.post(
      Uri.parse(updateLead),
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer $_authToken",
      },
      body: json.encode(payload),
    ).timeout(const Duration(seconds: 15));

    final responseData = json.decode(response.body);

    // ✅ Handle inconsistent API: check both flags & message
    final isSuccess = responseData["success"] == true ||
        (responseData["message"]?.toString().toLowerCase().contains("update lead successfully") ?? false) ||
        (responseData["message"]?.toString().toLowerCase().contains("lead updated successfully") ?? false);

    if (response.statusCode == 200 && isSuccess) {
      setState(() {
        leadDetails = {
          ...?leadDetails,
          "name": nameController.text.trim(),
          "contact": phoneController.text.trim(),
          "email": emailController.text.trim(),
          "state": stateController.text.trim(),
          "city": cityController.text.trim(),
          "service": selectedServiceName ?? selectedServiceId?.toString() ?? "N/A",
        };
      });

      sendSMSNotification(
        phoneController.text.trim(),
        "Your lead details have been successfully updated with eTaxWala.",
      );

      _showSnackBar("Lead updated successfully", isError: false);
      Navigator.pop(context); // Close modal
    } else {
      final errorMsg = responseData["message"] ?? responseData["error"] ?? "Unknown error";
      _showSnackBar("Failed to update lead: $errorMsg", isError: true);
    }
  } catch (e) {
    print('Network error: $e');
    _showSnackBar("Network error: Unable to update lead", isError: true);
  } finally {
    if (mounted) setState(() => isUpdating = false);
  }
}


  void _showEditLeadModal() {
    if (leadDetails == null) {
      _showSnackBar("No lead details available to edit.", isError: true);
      return;
    }

    if (allServices.isEmpty) {
      _showSnackBar("Services not loaded. Please try again.", isError: true);
      return;
    }

    // Populate form fields with current lead details
    nameController.text = leadDetails?["name"]?.toString() ?? "";
    phoneController.text = leadDetails?["contact"]?.toString() ?? "";
    emailController.text = leadDetails?["email"]?.toString() ?? "";
    stateController.text = leadDetails?["state"]?.toString() ?? "";
    cityController.text = leadDetails?["city"]?.toString() ?? "";

    // Handle service selection
    var serviceData = leadDetails?["service"];
    if (serviceData is int) {
      selectedServiceId = serviceData;
      selectedServiceName = allServices.entries
          .firstWhere((entry) => entry.value == serviceData, orElse: () => const MapEntry("Unknown", 0))
          .key;
    } else if (serviceData is String) {
      selectedServiceName = serviceData;
      selectedServiceId = allServices[serviceData];
    } else {
      selectedServiceId = null;
      selectedServiceName = null;
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
        child: StatefulBuilder(
          builder: (BuildContext context, StateSetter setModalState) {
            return EditLeadModal(
              leadId: widget.leadId,
              domain: domain,
              formKey: _formKey,
              fetchAllServices: fetchAllServices,
              nameController: nameController,
              phoneController: phoneController,
              emailController: emailController,
              stateController: stateController,
              cityController: cityController,
              selectedServiceId: selectedServiceId,
              selectedServiceName: selectedServiceName,
              allServices: allServices,
              onServiceChanged: (value) {
                setModalState(() {
                  selectedServiceId = value;
                  selectedServiceName = allServices.entries
                      .firstWhere((entry) => entry.value == value, orElse: () => const MapEntry("Unknown", 0))
                      .key;
                });
              },
              onSaveLead: _updateLead,
              isUpdating: isUpdating,
            );
          },
        ),
      ),
    );
  }

  void _showSnackBar(String message, {required bool isError}) {
    if (!mounted) return;
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? Colors.red.shade600 : Colors.green.shade600,
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 4),
        action: SnackBarAction(
          label: 'Dismiss',
          textColor: Colors.white,
          onPressed: () => ScaffoldMessenger.of(context).hideCurrentSnackBar(),
        ),
      ),
    );
  }

  @override
  void dispose() {
    nameController.dispose();
    phoneController.dispose();
    emailController.dispose();
    stateController.dispose();
    cityController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Lead Details", style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.amberAccent,
        centerTitle: true,
        elevation: 4,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.amber))
          : leadDetails == null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        "Lead details not found",
                        style: TextStyle(fontSize: 18, color: Colors.black54),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                      
                        onPressed: () {
                          setState(() => isLoading = true);
                          _loadAuthToken();
                        },
                        child: const Text("Retry"),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: () async {
                    await Future.wait([
                      fetchLeadDetails(),
                      fetchAllServices(),
                    ]);
                  },
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
                    child: Card(
                      elevation: 6,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      child: Padding(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              "Lead Information",
                              style: TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                                color: Colors.black87,
                              ),
                            ),
                            const SizedBox(height: 16),
                            _buildDetailRow("Name", leadDetails?["name"]),
                            _buildDetailRow("Phone", leadDetails?["contact"]),
                            _buildDetailRow("Email", leadDetails?["email"]),
                            _buildDetailRow("Service", leadDetails?["service"]?.toString()),
                            _buildDetailRow("State", leadDetails?["state"]),
                            _buildDetailRow("City", leadDetails?["city"]),
                            _buildDetailRow("Created At", leadDetails?["created_at"]),
                            const SizedBox(height: 24),
                            Row(
                              children: [
                                Expanded(
                                  child: ElevatedButton(
                                    onPressed: _showEditLeadModal,
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.black,
                                      padding: const EdgeInsets.symmetric(vertical: 16),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                      elevation: 2,
                                    ),
                                    child: const Text(
                                      "Edit Lead",
                                      style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: ElevatedButton(
                                    onPressed: () {
                                      _showSnackBar("Make Quotation functionality to be implemented", isError: false);
                                    },
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.amber,
                                      padding: const EdgeInsets.symmetric(vertical: 16),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                      elevation: 2,
                                    ),
                                    child: const Text(
                                      "Make Quotation",
                                      style: TextStyle(color: Colors.black, fontSize: 16, fontWeight: FontWeight.w600),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
    );
  }

  Widget _buildDetailRow(String title, String? value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "$title:",
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  value?.toString() ?? "N/A",
                  style: const TextStyle(
                    fontSize: 16,
                    color: Colors.black54,
                    height: 1.4,
                  ),
                  overflow: TextOverflow.visible,
                  softWrap: true,
                ),
              ),
            ],
          ),
          const Divider(height: 16, thickness: 1, color: Colors.grey),
        ],
      ),
    );
  }
}